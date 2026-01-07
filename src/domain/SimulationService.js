// src/domain/SimulationService.js

import { PassiveSkillFactory } from './passives/PassiveSkillFactory.js';
import { DamageSkill, BuffSkill } from './Skills.js';

export class SimulationService {
    constructor(loggerService) {
        this.logger = loggerService;
    }

    _calculateCharacterStats(character) {
        const passiveSkills = Object.entries(character.basePassiveSkills)
            .map(([id, value]) => PassiveSkillFactory.create(id, value))
            .filter(Boolean);

        // The totalDamage and totalHealth are now pre-calculated by CharacterService.
        // The simulation service will use them directly as the final base stats for combat.
        const calculatedStats = {
            ...character,
            passiveSkills,
            activeSkills: character.activeSkills.map(skill => {
                if (skill.type === 'damage') {
                    return new DamageSkill(skill);
                } else if (skill.type === 'buff') {
                    return new BuffSkill(skill);
                }
                return skill;
            }),
            finalHealth: character.totalHealth,
            finalDamage: character.totalDamage,
            timePerAttack: 1.0,
            critChance: 0,
            critDamage: 1.5,
            blockChance: 0,
            healthRegenPerSec: 0,
            lifesteal: 0,
            doubleChance: 0,
            competenceDegatsMod: 1.0,
            competenceCooldownMod: 1.0,
            totalDamageDealt: 0,
            activeBuffs: []
        };

        // onCalculateStats will now only handle secondary stats like crit, attack speed, etc.
        passiveSkills.forEach(skill => skill.onCalculateStats(calculatedStats));
        passiveSkills.forEach(skill => skill.onInitialize(calculatedStats));

        calculatedStats.currentHealth = calculatedStats.finalHealth;
        calculatedStats.attackTimer = character.weaponType === 'corp-a-corp' ? 2.0 : calculatedStats.timePerAttack;

        return calculatedStats;
    }

    simulate(stats) {
        const MAX_SIMULATION_TIME = 60;
        const dt = 0.01;

        const player = this._calculateCharacterStats(stats);
        this.logger.log(`[0.00] Player starts with ${player.currentHealth.toFixed(0)} health.`);

        let time = 0;
        let enemyAttackTimer = stats.enemy.weaponType === 'corp-a-corp' ? 2.0 : 0.0;
        const timePerEnemyAttack = 1.0;

        while (player.currentHealth > 0 && time < MAX_SIMULATION_TIME) {
            time += dt;
            player.passiveSkills.forEach(skill => skill.onTick(player, dt));
            player.attackTimer -= dt;

            while (player.attackTimer <= 0) {
                let performExtraAttack = this._performAttack(player, null, player.finalDamage, time);
                if (performExtraAttack) {
                    this.logger.log(`[${time.toFixed(2)}] Player performs an extra attack.`);
                    this._performAttack(player, null, player.finalDamage, time);
                }
                player.attackTimer += player.timePerAttack;
            }

            enemyAttackTimer -= dt;
            while (enemyAttackTimer <= 0) {
                let incomingDamage = stats.enemy.dps * timePerEnemyAttack;
                player.passiveSkills.forEach(skill => {
                    incomingDamage = skill.onModifyIncomingDamage(player, null, incomingDamage);
                });
                player.currentHealth -= incomingDamage;
                this.logger.log(`[${time.toFixed(2)}] Enemy attacks for ${incomingDamage.toFixed(0)} damage. Player health is now ${player.currentHealth.toFixed(0)}.`);
                enemyAttackTimer += timePerEnemyAttack;
            }

            if (player.currentHealth > player.finalHealth) player.currentHealth = player.finalHealth;
        }

        const survivalTime = time >= MAX_SIMULATION_TIME ? Infinity : time;
        this.logger.log(`[${time.toFixed(2)}] Simulation ended. Survival time: ${isFinite(survivalTime) ? survivalTime.toFixed(2) : 'Infinite'}.`);
        return { survivalTime, totalDamageDealt: player.totalDamageDealt, log: this.logger.getLogs() };
    }

    simulatePvp(player, opponent) {
        this.logger.clear();
        const MAX_SIMULATION_TIME = 60;
        const dt = 0.01;

        let p1 = this._calculateCharacterStats(player);
        let p2 = this._calculateCharacterStats(opponent);
        this.logger.log(`[0.00] ${p1.name} starts with ${p1.currentHealth.toFixed(0)} health.`);
        this.logger.log(`[0.00] ${p2.name} starts with ${p2.currentHealth.toFixed(0)} health.`);

        let time = 0;

        while (p1.currentHealth > 0 && p2.currentHealth > 0 && time < MAX_SIMULATION_TIME) {
            time += dt;

            this._processTick(p1, p2, dt, time);
            if (p2.currentHealth <= 0) break;
            this._processTick(p2, p1, dt, time);
        }

        let winner = null;
        if (p1.currentHealth <= 0 && p2.currentHealth > 0) winner = p2.name;
        else if (p2.currentHealth <= 0 && p1.currentHealth > 0) winner = p1.name;
        else winner = p1.currentHealth > p2.currentHealth ? p1.name : p2.name;

        this.logger.log(`[${time.toFixed(2)}] Simulation ended. Winner: ${winner}.`);

        return {
            winner, time,
            player1: { name: p1.name, totalDamageDealt: p1.totalDamageDealt, healthRemaining: p1.currentHealth, maxHealth: p1.finalHealth },
            player2: { name: p2.name, totalDamageDealt: p2.totalDamageDealt, healthRemaining: p2.currentHealth, maxHealth: p2.finalHealth },
            log: this.logger.getLogs()
        };
    }

    _applyBuffs(character, buff) {
        character.activeBuffs.push(buff);
        character.finalDamage += buff.damageBuff;
        character.finalHealth += buff.healthBuff;
        character.currentHealth += buff.healthBuff;
    }

    _revertBuffs(character, buff) {
        character.activeBuffs = character.activeBuffs.filter(b => b !== buff);
        character.finalDamage -= buff.damageBuff;
        character.finalHealth -= buff.healthBuff;
        if (character.currentHealth > character.finalHealth) {
            character.currentHealth = character.finalHealth;
        }
    }

    _processActiveSkills(character, opponent, dt, time) {
        character.activeSkills.forEach(skill => {
            skill.tick(dt);

            if (skill.isReady()) {
                if (skill instanceof DamageSkill) {
                    this.logger.log(`[${time.toFixed(2)}] ${character.name} uses a damage skill.`);
                    for (let i = 0; i < skill.hits; i++) {
                        let skillDamage = skill.value * character.competenceDegatsMod;
                        if (opponent) {
                            opponent.passiveSkills.forEach(s => {
                                skillDamage = s.onModifyIncomingDamage(opponent, character, skillDamage);
                            });
                            opponent.currentHealth -= skillDamage;
                            this.logger.log(`[${time.toFixed(2)}]   ... deals ${skillDamage.toFixed(0)} damage to ${opponent.name}. ${opponent.name}'s health is now ${opponent.currentHealth.toFixed(0)}.`);
                        }
                        character.totalDamageDealt += skillDamage;
                    }
                    skill.reset();
                } else if (skill instanceof BuffSkill) {
                    this._applyBuffs(character, skill);
                    skill.trigger();
                    this.logger.log(`[${time.toFixed(2)}] ${character.name} uses a buff skill. Damage: +${skill.damageBuff}, Health: +${skill.healthBuff}, Duration: ${skill.duration}s.`);
                }
            }

            if (skill instanceof BuffSkill && skill.isActive() && skill.durationTimer <= 0) {
                this._revertBuffs(character, skill);
                this.logger.log(`[${time.toFixed(2)}] ${character.name}'s buff has expired.`);
            }
        });
    }

    _processTick(attacker, defender, dt, time) {
        attacker.passiveSkills.forEach(skill => skill.onTick(attacker, dt));
        this._processActiveSkills(attacker, defender, dt, time);

        attacker.attackTimer -= dt;
        while (attacker.attackTimer <= 0) {
            if (this._performAttack(attacker, defender, attacker.finalDamage, time)) {
                this.logger.log(`[${time.toFixed(2)}] ${attacker.name} performs an extra attack.`);
                this._performAttack(attacker, defender, attacker.finalDamage, time);
            }

            attacker.attackTimer += attacker.timePerAttack;
        }

        if (attacker.currentHealth > attacker.finalHealth) attacker.currentHealth = attacker.finalHealth;
    }

    _performAttack(attacker, defender, baseDamage, time) {
        let damage = baseDamage;

        attacker.passiveSkills.forEach(s => {
            damage = s.onModifyOutgoingDamage(attacker, defender, damage);
        });

        if (defender) {
            defender.passiveSkills.forEach(s => {
                damage = s.onModifyIncomingDamage(defender, attacker, damage);
            });
            defender.currentHealth -= damage;
            this.logger.log(`[${time.toFixed(2)}] ${attacker.name} attacks ${defender.name} for ${damage.toFixed(0)} damage. ${defender.name}'s health is now ${defender.currentHealth.toFixed(0)}.`);
        } else {
            this.logger.log(`[${time.toFixed(2)}] Player attacks for ${damage.toFixed(0)} damage.`);
        }


        attacker.totalDamageDealt += damage;

        attacker.passiveSkills.forEach(s => s.onAfterAttackDealt(attacker, defender, damage));

        let performExtra = false;
        attacker.passiveSkills.forEach(s => {
            if (s.onAfterAttackProcessed(attacker, defender)) {
                performExtra = true;
            }
        });
        return performExtra;
    }
}
