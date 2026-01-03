// src/domain/SimulationService.js

class SimulationService {
    simulate(stats) {
        const MAX_SIMULATION_TIME = 60;
        const dt = 0.01;
        const p = stats.basePassiveSkills;
        let finalHealth = stats.totalHealth * (1 + p.sante / 100);
        let finalDamage = stats.totalDamage * (1 + p.degats / 100);
        if (stats.weaponType === 'corp-a-corp') finalDamage *= (1 + p['degats-corps-a-corps'] / 100);
        if (stats.weaponType === 'a-distance') finalDamage *= (1 + p['degats-a-distance'] / 100);
        const attackSpeedBonus = p['vitesse-attaque'] / 100;
        const timePerPlayerAttack = 1 / (1 / Math.pow(0.5, attackSpeedBonus));
        const critChance = p['chance-critique'] / 100;
        const critDamage = 1.5 + p['degats-critiques'] / 100;
        const blockChance = p['chance-blocage'] / 100;
        const healthRegenPerSec = finalHealth * (p['regeneration-sante'] / 100);
        const lifesteal = p['vol-de-vie'] / 100;
        const doubleChance = p['double-chance'] / 100;
        let currentHealth = finalHealth;
        let time = 0;
        let playerAttackTimer = stats.weaponType === 'corp-a-corp' ? 2.0 : 0.0;
        let enemyAttackTimer = stats.enemy.weaponType === 'corp-a-corp' ? 2.0 : 0.0;
        const timePerEnemyAttack = 1.0;
        let critCounter = 0;
        let doubleChanceCounter = 0;
        let blockCounter = 0;
        let totalDamageDealt = 0;

        while (currentHealth > 0 && time < MAX_SIMULATION_TIME) {
            time += dt;
            currentHealth += healthRegenPerSec * dt;
            playerAttackTimer -= dt;
            while (playerAttackTimer <= 0) {
                let mainAttackDamage = finalDamage;
                critCounter += critChance;
                if (critCounter >= 1) { mainAttackDamage *= critDamage; critCounter--; }
                currentHealth += mainAttackDamage * lifesteal;
                totalDamageDealt += mainAttackDamage;
                doubleChanceCounter += doubleChance;
                if (doubleChanceCounter >= 1) {
                    let secondAttackDamage = finalDamage;
                    critCounter += critChance;
                    if (critCounter >= 1) { secondAttackDamage *= critDamage; critCounter--; }
                    currentHealth += secondAttackDamage * lifesteal;
                    totalDamageDealt += secondAttackDamage;
                    doubleChanceCounter--;
                }
                playerAttackTimer += timePerPlayerAttack;
            }
            stats.activeSkills.forEach(skill => {
                skill.timer -= dt;
                if (skill.timer <= 0) {
                    if (skill.type === 'damage') {
                        const skillDamage = skill.value * (1 + p['competence-degats'] / 100);
                        totalDamageDealt += skillDamage;
                    } else if (skill.type === 'healing') {
                        currentHealth += skill.value;
                    }
                    const cooldown = skill.cooldown * (1 - p['competences-temps-recharge'] / 100);
                    skill.timer += cooldown;
                }
            });
            enemyAttackTimer -= dt;
            while (enemyAttackTimer <= 0) {
                blockCounter += blockChance;
                if (blockCounter < 1) {
                    currentHealth -= stats.enemy.dps * timePerEnemyAttack;
                } else {
                    blockCounter--;
                }
                enemyAttackTimer += timePerEnemyAttack;
            }
            if (currentHealth > finalHealth) currentHealth = finalHealth;
        }
        const survivalTime = time >= MAX_SIMULATION_TIME ? Infinity : time;
        return { survivalTime, totalDamageDealt };
    }

    simulatePvp(player, opponent) {
        const MAX_SIMULATION_TIME = 60;
        const dt = 0.01;

        function calculateFinalStats(character) {
            const p = character.basePassiveSkills;
            const finalHealth = character.totalHealth * (1 + p.sante / 100);
            let finalDamage = character.totalDamage * (1 + p.degats / 100);
            if (character.weaponType === 'corp-a-corp') finalDamage *= (1 + p['degats-corps-a-corps'] / 100);
            if (character.weaponType === 'a-distance') finalDamage *= (1 + p['degats-a-distance'] / 100);
            const attackSpeedBonus = p['vitesse-attaque'] / 100;
            const timePerAttack = 1 / (1 / Math.pow(0.5, attackSpeedBonus));

            return {
                ...character,
                finalHealth,
                currentHealth: finalHealth,
                finalDamage,
                timePerAttack,
                attackTimer: character.weaponType === 'corp-a-corp' ? 2.0 : 0.0,
                critChance: p['chance-critique'] / 100,
                critDamage: 1.5 + p['degats-critiques'] / 100,
                blockChance: p['chance-blocage'] / 100,
                healthRegenPerSec: finalHealth * (p['regeneration-sante'] / 100),
                lifesteal: p['vol-de-vie'] / 100,
                doubleChance: p['double-chance'] / 100,
                critCounter: 0,
                doubleChanceCounter: 0,
                blockCounter: 0,
                totalDamageDealt: 0
            };
        }

        let p1 = calculateFinalStats(player);
        let p2 = calculateFinalStats(opponent);
        let time = 0;

        while (p1.currentHealth > 0 && p2.currentHealth > 0 && time < MAX_SIMULATION_TIME) {
            time += dt;

            function processTick(attacker, defender) {
                attacker.currentHealth += attacker.healthRegenPerSec * dt;
                attacker.activeSkills.forEach(skill => {
                    skill.timer -= dt;
                    if (skill.timer <= 0) {
                        const p = attacker.basePassiveSkills;
                        if (skill.type === 'damage') {
                            const skillDamage = skill.value * (1 + p['competence-degats'] / 100);
                            defender.blockCounter += defender.blockChance;
                            if (defender.blockCounter < 1) {
                                defender.currentHealth -= skillDamage;
                            } else {
                                defender.blockCounter--;
                            }
                            attacker.totalDamageDealt += skillDamage;
                        } else if (skill.type === 'healing') {
                            attacker.currentHealth += skill.value;
                        }
                        const cooldown = skill.cooldown * (1 - p['competences-temps-recharge'] / 100);
                        skill.timer += cooldown;
                    }
                });
                attacker.attackTimer -= dt;
                while (attacker.attackTimer <= 0) {
                    function performAttack(baseDamage) {
                        let damage = baseDamage;
                        attacker.critCounter += attacker.critChance;
                        if (attacker.critCounter >= 1) { damage *= attacker.critDamage; attacker.critCounter--; }
                        defender.blockCounter += defender.blockChance;
                        if (defender.blockCounter < 1) {
                            defender.currentHealth -= damage;
                        } else {
                            defender.blockCounter--;
                        }
                        attacker.currentHealth += damage * attacker.lifesteal;
                        attacker.totalDamageDealt += damage;
                    }
                    performAttack(attacker.finalDamage);
                    attacker.doubleChanceCounter += attacker.doubleChance;
                    if (attacker.doubleChanceCounter >= 1) {
                        performAttack(attacker.finalDamage);
                        attacker.doubleChanceCounter--;
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
