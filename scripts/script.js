document.addEventListener('DOMContentLoaded', () => {
    const passiveSkills = [
        { id: 'chance-critique', name: "Chance critique" },
        { id: 'degats-critiques', name: "Dégâts critiques" },
        { id: 'chance-blocage', name: "Chance de blocage" },
        { id: 'regeneration-sante', name: "Régénération santé" },
        { id: 'vol-de-vie', name: "Vol de vie" },
        { id: 'double-chance', name: "Double chance" },
        { id: 'degats', name: "Dégâts" },
        { id: 'degats-corps-a-corps', name: "Dégâts corps à corps" },
        { id: 'degats-a-distance', name: "Dégâts à distance" },
        { id: 'vitesse-attaque', name: "Vitesse d'attaque" },
        { id: 'competence-degats', name: "Compétence dégâts" },
        { id: 'competences-temps-recharge', name: "Compétences temps de recharge" },
        { id: 'sante', name: "Santé" }
    ];

    const simulateButton = document.getElementById('simulate-button');

    function getCharacterStats(prefix) {
        const basePassiveSkills = {};
        passiveSkills.forEach(skill => {
            basePassiveSkills[skill.id] = parseFloat(document.getElementById(`${prefix}-${skill.id}`).value) || 0;
        });

        const activeSkills = [];
        for (let i = 1; i <= 3; i++) {
            const type = document.getElementById(`${prefix}-active${i}-type`).value;
            const value = parseFloat(document.getElementById(`${prefix}-active${i}-value`).value);
            const cooldown = parseFloat(document.getElementById(`${prefix}-active${i}-cooldown`).value);
            if (value && cooldown) {
                activeSkills.push({ type, value, cooldown, timer: 0 });
            }
        }

        return {
            name: prefix.charAt(0).toUpperCase() + prefix.slice(1),
            totalDamage: parseFloat(document.getElementById(`${prefix}-total-damage`).value) || 0,
            totalHealth: parseFloat(document.getElementById(`${prefix}-total-health`).value) || 0,
            weaponType: document.getElementById(`${prefix}-weapon-type`).value,
            basePassiveSkills: basePassiveSkills,
            activeSkills: activeSkills
        };
    }

    function simulate(player, opponent) {
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

            // Process one tick for a character
            function processTick(attacker, defender) {
                // Healing
                attacker.currentHealth += attacker.healthRegenPerSec * dt;

                // Active skills
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

                // Player attacks
                attacker.attackTimer -= dt;
                while (attacker.attackTimer <= 0) {
                    function performAttack(baseDamage) {
                        let damage = baseDamage;
                        attacker.critCounter += attacker.critChance;
                        if (attacker.critCounter >= 1) {
                            damage *= attacker.critDamage;
                            attacker.critCounter--;
                        }

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

                // Cap health
                if (attacker.currentHealth > attacker.finalHealth) {
                    attacker.currentHealth = attacker.finalHealth;
                }
            }

            processTick(p1, p2);
            if (p2.currentHealth <= 0) break;

            processTick(p2, p1);
            if (p1.currentHealth <= 0) break;
        }

        let winner = null;
        if (p1.currentHealth > 0 && p2.currentHealth <= 0) {
            winner = p1.name;
        } else if (p2.currentHealth > 0 && p1.currentHealth <= 0) {
            winner = p2.name;
        } else { // Draw or time ran out
            winner = p1.currentHealth > p2.currentHealth ? p1.name : p2.name;
        }

        return {
            winner,
            time,
            player1: { name: p1.name, totalDamageDealt: p1.totalDamageDealt, healthRemaining: p1.currentHealth, maxHealth: p1.finalHealth },
            player2: { name: p2.name, totalDamageDealt: p2.totalDamageDealt, healthRemaining: p2.currentHealth, maxHealth: p2.finalHealth }
        };
    }

    function runSimulation() {
        const player = getCharacterStats('player');
        const opponent = getCharacterStats('opponent');
        const result = simulate(player, opponent);

        const resultsOutput = document.getElementById('results-output');
        resultsOutput.innerHTML = `
            <h3>Simulation Result</h3>
            <p><strong>Winner:</strong> ${result.winner}</p>
            <p><strong>Fight Duration:</strong> ${result.time.toFixed(2)}s</p>
            <hr>
            <div class="result-details">
                <h4>${result.player1.name}</h4>
                <p>Total Damage Dealt: ${result.player1.totalDamageDealt.toLocaleString()}</p>
                <p>Health Remaining: ${result.player1.healthRemaining.toLocaleString()} / ${result.player1.maxHealth.toLocaleString()}</p>
            </div>
            <div class="result-details">
                <h4>${result.player2.name}</h4>
                <p>Total Damage Dealt: ${result.player2.totalDamageDealt.toLocaleString()}</p>
                <p>Health Remaining: ${result.player2.healthRemaining.toLocaleString()} / ${result.player2.maxHealth.toLocaleString()}</p>
            </div>
        `;
    }

    simulateButton.addEventListener('click', runSimulation);
});
