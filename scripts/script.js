document.addEventListener('DOMContentLoaded', () => {
    const passiveSkills = [
        "Chance critique", "Dégâts critiques", "chance de blocage",
        "régénération santé", "vol de vie", "double chance", "dégâts",
        "Dégâts corps à corps", "dégâts à distance", "Vitesse d'attaque",
        "compétence dégâts", "compétences temps de recharge", "santé"
    ];

    const equip1PassiveSkill = document.getElementById('equip1-passive-skill');
    const equip2PassiveSkill = document.getElementById('equip2-passive-skill');
    const passiveSkillsList = document.getElementById('passive-skills-list');
    const addPassiveSkillButton = document.getElementById('add-passive-skill');
    const compareButton = document.getElementById('compare-button');
    const resultsOutput = document.getElementById('results-output');

    function populatePassiveSkills() {
        passiveSkills.forEach(skill => {
            const option1 = document.createElement('option');
            option1.value = skill;
            option1.textContent = skill;
            equip1PassiveSkill.appendChild(option1);

            const option2 = document.createElement('option');
            option2.value = skill;
            option2.textContent = skill;
            equip2PassiveSkill.appendChild(option2);
        });
    }

    function addPassiveSkill() {
        const skillContainer = document.createElement('div');
        skillContainer.classList.add('passive-skill-item');

        const skillSelect = document.createElement('select');
        passiveSkills.forEach(skill => {
            const option = document.createElement('option');
            option.value = skill;
            option.textContent = skill;
            skillSelect.appendChild(option);
        });

        const valueInput = document.createElement('input');
        valueInput.type = 'number';
        valueInput.value = '10';

        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.addEventListener('click', () => {
            skillContainer.remove();
        });

        skillContainer.appendChild(skillSelect);
        skillContainer.appendChild(valueInput);
        skillContainer.appendChild(removeButton);
        passiveSkillsList.appendChild(skillContainer);
    }

    function getCharacterStats() {
        const passiveSkills = [];
        document.querySelectorAll('.passive-skill-item').forEach(item => {
            const skill = item.querySelector('select').value.toLowerCase();
            const value = parseFloat(item.querySelector('input').value);
            passiveSkills.push({ skill, value });
        });

        return {
            totalDamage: parseFloat(document.getElementById('total-damage').value),
            totalHealth: parseFloat(document.getElementById('total-health').value),
            weaponType: document.getElementById('weapon-type').value,
            passiveSkills: passiveSkills,
            enemyDps: parseFloat(document.getElementById('enemy-dps').value)
        };
    }

    function getEquipment(index) {
        return {
            mainCarac: document.getElementById(`equip${index}-main-carac`).value,
            mainCaracValue: parseFloat(document.getElementById(`equip${index}-main-carac-value`).value),
            passiveSkill: document.getElementById(`equip${index}-passive-skill`).value.toLowerCase(),
            passiveSkillValue: parseFloat(document.getElementById(`equip${index}-passive-skill-value`).value)
        };
    }

    function calculate(baseStats, equipment) {
        let stats = JSON.parse(JSON.stringify(baseStats)); // Deep copy

        if (equipment.mainCarac === 'damage') {
            stats.totalDamage += equipment.mainCaracValue;
        } else {
            stats.totalHealth += equipment.mainCaracValue;
        }

        stats.passiveSkills.push({
            skill: equipment.passiveSkill,
            value: equipment.passiveSkillValue
        });

        return stats;
    }

    function simulate(stats) {
        // First, apply passive skills that modify base stats like health.
        stats.passiveSkills.forEach(({ skill, value }) => {
            if (skill.toLowerCase() === 'santé') {
                stats.totalHealth *= (1 + value / 100);
            }
        });

        // Next, calculate total damage, including passive skill effects.
        let totalDamage = stats.totalDamage;
        stats.passiveSkills.forEach(({ skill, value }) => {
            switch (skill.toLowerCase()) {
                case 'dégâts':
                    totalDamage *= (1 + value / 100);
                    break;
                case 'dégâts corps à corps':
                    if (stats.weaponType === 'corp-a-corp') totalDamage *= (1 + value / 100);
                    break;
                case 'dégâts à distance':
                    if (stats.weaponType === 'a-distance') totalDamage *= (1 + value / 100);
                    break;
            }
        });

        // Now, calculate combat variables based on the final stats.
        let critChance = 0;
        let critDamage = 1.5; // Base crit damage multiplier
        let blockChance = 0;
        let healthRegen = 0;
        let lifesteal = 0;
        let attackSpeed = 1; // attacks per second

        stats.passiveSkills.forEach(({ skill, value }) => {
            switch (skill.toLowerCase()) {
                case 'chance critique': critChance = value / 100; break;
                case 'dégâts critiques': critDamage += value / 100; break;
                case 'chance de blocage': blockChance = value / 100; break;
                case 'régénération santé': healthRegen = stats.totalHealth * (value / 100); break; // Correctly uses modified health
                case 'vol de vie': lifesteal = value / 100; break;
                case 'vitesse d\'attaque': attackSpeed += value / 100; break;
            }
        });

        const timeframes = [10, 20, 30, 40];
        const results = {};

        timeframes.forEach(time => {
            let totalDamageDealt = 0;
            const hits = Math.floor(time * attackSpeed);
            const weaponDelay = stats.weaponType === 'corp-a-corp' ? 2 : 0;

            for (let i = 1; i <= hits; i++) {
                const hitTime = i / attackSpeed;
                if (hitTime < weaponDelay) continue;

                let damage = totalDamage;
                if (Math.random() < critChance) {
                    damage *= critDamage;
                }
                totalDamageDealt += damage;
            }

            const totalDamageTaken = stats.enemyDps * time * (1 - blockChance);

            results[time] = {
                totalDamageDealt: totalDamageDealt.toFixed(2),
                healthRegen: (healthRegen * time).toFixed(2),
                lifesteal: (totalDamageDealt * lifesteal).toFixed(2),
                totalDamageTaken: totalDamageTaken.toFixed(2)
            };
        });

        return results;
    }

    function compare() {
        const baseStats = getCharacterStats();
        const equip1 = getEquipment(1);
        const equip2 = getEquipment(2);

        const stats1 = calculate(baseStats, equip1);
        const stats2 = calculate(baseStats, equip2);

        const results1 = simulate(stats1);
        const results2 = simulate(stats2);

        let output = '<h3>Equipment 1 vs Equipment 2</h3>';
        output += '<table>';
        output += '<tr><th>Time</th><th>Equip 1 Damage</th><th>Equip 2 Damage</th><th>Equip 1 Regen</th><th>Equip 2 Regen</th><th>Equip 1 Lifesteal</th><th>Equip 2 Lifesteal</th><th>Equip 1 Dmg Taken</th><th>Equip 2 Dmg Taken</th></tr>';

        [10, 20, 30, 40].forEach(time => {
            output += `<tr>
                <td>${time}s</td>
                <td>${results1[time].totalDamageDealt}</td>
                <td>${results2[time].totalDamageDealt}</td>
                <td>${results1[time].healthRegen}</td>
                <td>${results2[time].healthRegen}</td>
                <td>${results1[time].lifesteal}</td>
                <td>${results2[time].lifesteal}</td>
                <td>${results1[time].totalDamageTaken}</td>
                <td>${results2[time].totalDamageTaken}</td>
            </tr>`;
        });
        output += '</table>';
        resultsOutput.innerHTML = output;
    }

    addPassiveSkillButton.addEventListener('click', addPassiveSkill);
    compareButton.addEventListener('click', compare);

    populatePassiveSkills();
});
