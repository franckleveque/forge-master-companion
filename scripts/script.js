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

    const equip1PassiveSkill = document.getElementById('equip1-passive-skill');
    const equip2PassiveSkill = document.getElementById('equip2-passive-skill');
    const compareButton = document.getElementById('compare-button');
    const equip1Category = document.getElementById('equip1-category');
    const equip2Category = document.getElementById('equip2-category');
    const equip1WeaponTypeContainer = document.getElementById('equip1-weapon-type-container');
    const equip2WeaponTypeContainer = document.getElementById('equip2-weapon-type-container');

    equip1Category.addEventListener('change', () => {
        equip2Category.value = equip1Category.value;
        toggleWeaponTypeDisplay();
    });

    equip2Category.addEventListener('change', () => {
        equip1Category.value = equip2Category.value;
        toggleWeaponTypeDisplay();
    });

    function toggleWeaponTypeDisplay() {
        equip1WeaponTypeContainer.style.display = equip1Category.value === 'weapon' ? 'block' : 'none';
        equip2WeaponTypeContainer.style.display = equip2Category.value === 'weapon' ? 'block' : 'none';
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
        const category = document.getElementById(`equip${index}-category`).value;
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

        if (equipment.category === 'weapon') {
            stats.weaponType = equipment.weaponType;
        }

        stats.totalDamage += equipment.damage;
        stats.totalHealth += equipment.health;

        const passive = passiveSkills.find(p => p.name === equipment.passiveSkill);
        if (passive) {
            stats.basePassiveSkills[passive.id] += equipment.passiveSkillValue;
        }

        return stats;
    }

    function unequipEquipment(baseStats, equipment) {
        let stats = JSON.parse(JSON.stringify(baseStats));

        stats.totalDamage -= equipment.damage;
        stats.totalHealth -= equipment.health;

        const passive = passiveSkills.find(p => p.name === equipment.passiveSkill);
        if (passive) {
            stats.basePassiveSkills[passive.id] -= equipment.passiveSkillValue;
        }

        return stats;
    }

    function simulate(stats) {
        const MAX_SIMULATION_TIME = 60; // 60 seconds for PvP
        const dt = 0.01; // High-precision time step
        const p = stats.basePassiveSkills;

        // Calculate final stats
        let finalHealth = stats.totalHealth * (1 + p.sante / 100);
        let finalDamage = stats.totalDamage * (1 + p.degats / 100);
        if (stats.weaponType === 'corp-a-corp') finalDamage *= (1 + p['degats-corps-a-corps'] / 100);
        if (stats.weaponType === 'a-distance') finalDamage *= (1 + p['degats-a-distance'] / 100);

        const attackSpeedBonus = p['vitesse-attaque'] / 100;
        const attackSpeed = 1 / Math.pow(0.5, attackSpeedBonus);
        const timePerPlayerAttack = 1 / attackSpeed;

        const critChance = p['chance-critique'] / 100;
        const critDamage = 1.5 + p['degats-critiques'] / 100;
        const blockChance = p['chance-blocage'] / 100;
        const healthRegenPerSec = finalHealth * (p['regeneration-sante'] / 100);
        const lifesteal = p['vol-de-vie'] / 100;
        const doubleChance = p['double-chance'] / 100;

        let currentHealth = finalHealth;
        let time = 0;

        // Timers represent the countdown to the next event
        let playerAttackTimer = stats.weaponType === 'corp-a-corp' ? 2.0 : 0.0;
        let enemyAttackTimer = stats.enemy.weaponType === 'corp-a-corp' ? 2.0 : 0.0;
        const timePerEnemyAttack = 1.0; // Assuming enemy attack speed is 1 attack/sec

        // Deterministic counters
        let critCounter = 0;
        let doubleChanceCounter = 0;
        let blockCounter = 0;
        let totalDamageDealt = 0;

        while (currentHealth > 0 && time < MAX_SIMULATION_TIME) {
            time += dt;

            // Healing
            currentHealth += healthRegenPerSec * dt;

            // Player attacks
            playerAttackTimer -= dt;
            while(playerAttackTimer <= 0) {
                // --- Main Attack ---
                let mainAttackDamage = finalDamage;

                critCounter += critChance;
                if (critCounter >= 1) {
                    mainAttackDamage *= critDamage;
                    critCounter--;
                }

                currentHealth += mainAttackDamage * lifesteal;
                totalDamageDealt += mainAttackDamage;

                // --- Double Chance Attack ---
                doubleChanceCounter += doubleChance;
                if (doubleChanceCounter >= 1) {
                    let secondAttackDamage = finalDamage;

                    // The second attack can also crit
                    critCounter += critChance;
                    if (critCounter >= 1) {
                        secondAttackDamage *= critDamage;
                        critCounter--;
                    }

                    currentHealth += secondAttackDamage * lifesteal;
                    totalDamageDealt += secondAttackDamage;

                    doubleChanceCounter--;
                }

                playerAttackTimer += timePerPlayerAttack;
            }

            // Active skills
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

            // Enemy attacks
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

            // Cap health
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

        if (unequipCheckbox.checked) {
            baseStats = unequipEquipment(baseStats, equipOld);
        }

        const statsOld = applyEquipment(baseStats, equipOld);
        const statsNew = applyEquipment(baseStats, equipNew);

        const resultOld = simulate(statsOld);
        const resultNew = simulate(statsNew);

        document.getElementById('survival-time-1').textContent = isFinite(resultNew.survivalTime) ? resultNew.survivalTime.toFixed(2) : "Infinite";
        document.getElementById('total-damage-1').textContent = resultNew.totalDamageDealt.toLocaleString();

        document.getElementById('survival-time-2').textContent = isFinite(resultOld.survivalTime) ? resultOld.survivalTime.toFixed(2) : "Infinite";
        document.getElementById('total-damage-2').textContent = resultOld.totalDamageDealt.toLocaleString();
    }

    compareButton.addEventListener('click', compare);
    populatePassiveSkills();
});
