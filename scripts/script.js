document.addEventListener('DOMContentLoaded', () => {
    // --- MODE SWITCHING ---
    const modeEquipmentButton = document.getElementById('mode-equipment');
    const modePvpButton = document.getElementById('mode-pvp');
    const equipmentSection = document.getElementById('equipment-comparison-section');
    const pvpSection = document.getElementById('pvp-simulation-section');

    modeEquipmentButton.addEventListener('click', () => {
        modeEquipmentButton.classList.add('active');
        modePvpButton.classList.remove('active');
        equipmentSection.style.display = 'block';
        pvpSection.style.display = 'none';
    });

    modePvpButton.addEventListener('click', () => {
        modePvpButton.classList.add('active');
        modeEquipmentButton.classList.remove('active');
        pvpSection.style.display = 'block';
        equipmentSection.style.display = 'none';
    });

    // --- SHARED DATA ---
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

    // --- EQUIPMENT COMPARISON LOGIC ---
    const equip1PassiveSkill = document.getElementById('equip1-passive-skill');
    const equip2PassiveSkill = document.getElementById('equip2-passive-skill');
    const compareButton = document.getElementById('compare-button');
    const equipmentCategory = document.getElementById('equipment-category');
    const equip1WeaponTypeContainer = document.getElementById('equip1-weapon-type-container');
    const equip2WeaponTypeContainer = document.getElementById('equip2-weapon-type-container');

    function toggleWeaponTypeDisplay() {
        const isWeapon = equipmentCategory.value === 'weapon';
        equip1WeaponTypeContainer.style.display = isWeapon ? 'block' : 'none';
        equip2WeaponTypeContainer.style.display = isWeapon ? 'block' : 'none';
    }

    function populatePassiveSkills() {
        passiveSkills.forEach(skill => {
            const option1 = document.createElement('option');
            option1.value = skill.name;
            option1.textContent = skill.name;
            equip1PassiveSkill.appendChild(option1);

            const option2 = document.createElement('option');
            option2.value = skill.name;
            option2.textContent = skill.name;
            equip2PassiveSkill.appendChild(option2);
        });
    }

    function getCharacterStats() {
        const basePassiveSkills = {};
        passiveSkills.forEach(skill => {
            basePassiveSkills[skill.id] = parseFloat(document.getElementById(skill.id).value) || 0;
        });

        const activeSkills = [];
        for (let i = 1; i <= 3; i++) {
            const type = document.getElementById(`active${i}-type`).value;
            const value = parseFloat(document.getElementById(`active${i}-value`).value);
            const cooldown = parseFloat(document.getElementById(`active${i}-cooldown`).value);
            if (value && cooldown) {
                activeSkills.push({ type, value, cooldown, timer: 0 });
            }
        }

        return {
            totalDamage: parseFloat(document.getElementById('total-damage').value) || 0,
            totalHealth: parseFloat(document.getElementById('total-health').value) || 0,
            weaponType: document.getElementById('weapon-type').value,
            basePassiveSkills: basePassiveSkills,
            activeSkills: activeSkills,
            enemy: {
                dps: parseFloat(document.getElementById('enemy-dps').value) || 0,
                weaponType: document.getElementById('enemy-weapon-type').value
            }
        };
    }

    function getEquipment(index, baseStats) {
        const category = document.getElementById('equipment-category').value;
        const weaponType = category === 'weapon' ? document.getElementById(`equip${index}-weapon-type`).value : baseStats.weaponType;

        return {
            category: category,
            weaponType: weaponType,
            damage: parseFloat(document.getElementById(`equip${index}-damage-value`).value) || 0,
            health: parseFloat(document.getElementById(`equip${index}-health-value`).value) || 0,
            passiveSkill: document.getElementById(`equip${index}-passive-skill`).value,
            passiveSkillValue: parseFloat(document.getElementById(`equip${index}-passive-skill-value`).value) || 0
        };
    }

    function applyEquipment(baseStats, equipment) {
        let stats = JSON.parse(JSON.stringify(baseStats));
        if (equipment.category === 'weapon') stats.weaponType = equipment.weaponType;
        stats.totalDamage += equipment.damage;
        stats.totalHealth += equipment.health;
        const passive = passiveSkills.find(p => p.name === equipment.passiveSkill);
        if (passive) stats.basePassiveSkills[passive.id] += equipment.passiveSkillValue;
        return stats;
    }

    function unequipEquipment(baseStats, equipment) {
        let stats = JSON.parse(JSON.stringify(baseStats));
        stats.totalDamage -= equipment.damage;
        stats.totalHealth -= equipment.health;
        const passive = passiveSkills.find(p => p.name === equipment.passiveSkill);
        if (passive) stats.basePassiveSkills[passive.id] -= equipment.passiveSkillValue;
        return stats;
    }

    function simulate(stats) {
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

    function compare() {
        let baseStats = getCharacterStats();
        const equipNew = getEquipment(1, baseStats);
        const equipOld = getEquipment(2, baseStats);
        const unequipCheckbox = document.getElementById('equip2-unequip');
        if (unequipCheckbox.checked) baseStats = unequipEquipment(baseStats, equipOld);
        const statsOld = applyEquipment(baseStats, equipOld);
        const statsNew = applyEquipment(baseStats, equipNew);
        const resultOld = simulate(statsOld);
        const resultNew = simulate(statsNew);
        document.getElementById('survival-time-1').textContent = isFinite(resultNew.survivalTime) ? resultNew.survivalTime.toFixed(2) : "Infinite";
        document.getElementById('total-damage-1').textContent = resultNew.totalDamageDealt.toLocaleString();
        document.getElementById('survival-time-2').textContent = isFinite(resultOld.survivalTime) ? resultOld.survivalTime.toFixed(2) : "Infinite";
        document.getElementById('total-damage-2').textContent = resultOld.totalDamageDealt.toLocaleString();
    }

    equipmentCategory.addEventListener('change', toggleWeaponTypeDisplay);
    compareButton.addEventListener('click', compare);
    populatePassiveSkills();

    // --- PVP SIMULATION LOGIC ---
    const simulateButton = document.getElementById('simulate-button');

    function getCharacterStatsPvp(prefix) {
        if (prefix === 'player') {
            return getCharacterStats();
        }

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

    function simulatePvp(player, opponent) {
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

    function runPvpSimulation() {
        const player = getCharacterStatsPvp('player');
        const opponent = getCharacterStatsPvp('opponent');
        const result = simulatePvp(player, opponent);
        const resultsOutput = document.getElementById('pvp-results-output');
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
            </div>`;
    }

    simulateButton.addEventListener('click', runPvpSimulation);
});
