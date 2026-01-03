// src/domain/SimulationService.js

import { PassiveSkillFactory } from './passives/PassiveSkillFactory.js';
import { DamageSkill, BuffSkill } from './Skills.js';

export class SimulationService {
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

        let time = 0;
        let enemyAttackTimer = stats.enemy.weaponType === 'corp-a-corp' ? 2.0 : 0.0;
        const timePerEnemyAttack = 1.0;

        while (player.currentHealth > 0 && time < MAX_SIMULATION_TIME) {
            time += dt;
            player.passiveSkills.forEach(skill => skill.onTick(player, dt));
            player.attackTimer -= dt;

            while (player.attackTimer <= 0) {
                function performAttack(baseDamage) {
                    let damage = baseDamage;

                    player.passiveSkills.forEach(skill => {
                        damage = skill.onModifyOutgoingDamage(player, null, damage);
                    });

                    player.totalDamageDealt += damage;

                    player.passiveSkills.forEach(skill => skill.onAfterAttackDealt(player, null, damage));

                    let performExtraAttack = false;
                    player.passiveSkills.forEach(skill => {
                        if (skill.onAfterAttackProcessed(player, null)) {
                            performExtraAttack = true;
                        }
                    });

                    return performExtraAttack;
                }

                if (performAttack(player.finalDamage)) {
                    performAttack(player.finalDamage);
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
                enemyAttackTimer += timePerEnemyAttack;
            }

            if (player.currentHealth > player.finalHealth) player.currentHealth = player.finalHealth;
        }

        const survivalTime = time >= MAX_SIMULATION_TIME ? Infinity : time;
        return { survivalTime, totalDamageDealt: player.totalDamageDealt };
    }

    simulatePvp(player, opponent) {
        const MAX_SIMULATION_TIME = 60;
        const dt = 0.01;

        let p1 = this._calculateCharacterStats(player);
        let p2 = this._calculateCharacterStats(opponent);
        let time = 0;

        while (p1.currentHealth > 0 && p2.currentHealth > 0 && time < MAX_SIMULATION_TIME) {
            time += dt;

            this._processTick(p1, p2, dt);
            if (p2.currentHealth <= 0) break;
            this._processTick(p2, p1, dt);
        }

        let winner = null;
        if (p1.currentHealth <= 0 && p2.currentHealth > 0) winner = p2.name;
        else if (p2.currentHealth <= 0 && p1.currentHealth > 0) winner = p1.name;
        else winner = p1.currentHealth > p2.currentHealth ? p1.name : p2.name;

        return {
            winner, time,
            player1: { name: p1.name, totalDamageDealt: p1.totalDamageDealt, healthRemaining: p1.currentHealth, maxHealth: p1.finalHealth },
            player2: { name: p2.name, totalDamageDealt: p2.totalDamageDealt, healthRemaining: p2.currentHealth, maxHealth: p2.finalHealth }
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

    _processActiveSkills(character, opponent, dt) {
        character.activeSkills.forEach(skill => {
            skill.tick(dt);

            if (skill.isReady()) {
                if (skill instanceof DamageSkill) {
                    for (let i = 0; i < skill.hits; i++) {
                        let skillDamage = skill.value * character.competenceDegatsMod;
                        if (opponent) {
                            opponent.passiveSkills.forEach(s => {
                                skillDamage = s.onModifyIncomingDamage(opponent, character, skillDamage);
                            });
                            opponent.currentHealth -= skillDamage;
                        }
                        character.totalDamageDealt += skillDamage;
                    }
                    skill.reset();
                } else if (skill instanceof BuffSkill) {
                    this._applyBuffs(character, skill);
                    skill.trigger();
                }
            }

            if (skill instanceof BuffSkill && skill.isActive() && skill.durationTimer <= 0) {
                this._revertBuffs(character, skill);
            }
        });
    }

    _processTick(attacker, defender, dt) {
        attacker.passiveSkills.forEach(skill => skill.onTick(attacker, dt));
        this._processActiveSkills(attacker, defender, dt);

        attacker.attackTimer -= dt;
        while (attacker.attackTimer <= 0) {
            if (this._performAttack(attacker, defender, attacker.finalDamage)) {
                this._performAttack(attacker, defender, attacker.finalDamage);
            }

            attacker.attackTimer += attacker.timePerAttack;
        }

        if (attacker.currentHealth > attacker.finalHealth) attacker.currentHealth = attacker.finalHealth;
    }

    _performAttack(attacker, defender, baseDamage) {
        let damage = baseDamage;

        attacker.passiveSkills.forEach(s => {
            damage = s.onModifyOutgoingDamage(attacker, defender, damage);
        });

        defender.passiveSkills.forEach(s => {
            damage = s.onModifyIncomingDamage(defender, attacker, damage);
        });

        defender.currentHealth -= damage;
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
