// src/domain/SimulationService.js

import { PassiveSkillFactory } from './passives/PassiveSkillFactory.js';

class SimulationService {
    _calculateCharacterStats(character) {
        const passiveSkills = Object.entries(character.basePassiveSkills)
            .map(([id, value]) => PassiveSkillFactory.create(id, value))
            .filter(Boolean);

        const calculatedStats = {
            ...character,
            passiveSkills,
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
            totalDamageDealt: 0
        };

        passiveSkills.forEach(skill => skill.onCalculateStats(calculatedStats));
        passiveSkills.forEach(skill => skill.onInitialize(calculatedStats));

        calculatedStats.currentHealth = calculatedStats.finalHealth;
        calculatedStats.attackTimer = character.weaponType === 'corp-a-corp' ? 2.0 : 0.0;

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

                    // Outgoing damage modifications (e.g., crit)
                    player.passiveSkills.forEach(skill => {
                        damage = skill.onModifyOutgoingDamage(player, null, damage);
                    });

                    // Note: Incoming damage modification (block) is handled by the enemy,
                    // but since the enemy is simplified in this simulation, we check the player's block.
                    // A full implementation would have the enemy's skills handle this.

                    player.totalDamageDealt += damage;

                    // Post-attack effects (e.g., lifesteal)
                    player.passiveSkills.forEach(skill => skill.onAfterAttackDealt(player, null, damage));

                    // Check for follow-up actions (e.g., double chance)
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

            stats.activeSkills.forEach(skill => {
                skill.timer -= dt;
                if (skill.timer <= 0) {
                    if (skill.type === 'damage') {
                        const skillDamage = skill.value * player.competenceDegatsMod;
                        player.totalDamageDealt += skillDamage;
                    } else if (skill.type === 'healing') {
                        player.currentHealth += skill.value;
                    }
                    skill.timer += skill.cooldown * player.competenceCooldownMod;
                }
            });

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

            function processTick(attacker, defender) {
                attacker.passiveSkills.forEach(skill => skill.onTick(attacker, dt));
                attacker.activeSkills.forEach(skill => {
                    skill.timer -= dt;
                    if (skill.timer <= 0) {
                        if (skill.type === 'damage') {
                            let skillDamage = skill.value * attacker.competenceDegatsMod;
                            defender.passiveSkills.forEach(s => {
                                skillDamage = s.onModifyIncomingDamage(defender, attacker, skillDamage);
                            });
                            defender.currentHealth -= skillDamage;
                            attacker.totalDamageDealt += skillDamage;
                        } else if (skill.type === 'healing') {
                            attacker.currentHealth += skill.value;
                        }
                        skill.timer += skill.cooldown * attacker.competenceCooldownMod;
                    }
                });

                attacker.attackTimer -= dt;
                while (attacker.attackTimer <= 0) {
                    function performAttack(baseDamage) {
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
                            if(s.onAfterAttackProcessed(attacker, defender)) {
                                performExtra = true;
                            }
                        });
                        return performExtra;
                    }

                    if (performAttack(attacker.finalDamage)) {
                        performAttack(attacker.finalDamage);
                    }

                    attacker.attackTimer += attacker.timePerAttack;
                }

                if (attacker.currentHealth > attacker.finalHealth) attacker.currentHealth = attacker.finalHealth;
            }

            processTick(p1, p2);
            if (p2.currentHealth <= 0) break;
            processTick(p2, p1);
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
}
