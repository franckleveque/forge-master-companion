// src/adapters/DomAdapter.js

import { PassiveSkillService } from '../domain/PassiveSkillService.js';

class DomAdapter {
    constructor(characterService, passiveSkillService) {
        this.characterService = characterService;
        this.passiveSkillService = passiveSkillService;
    }

    getCharacterStats() {
        const basePassiveSkills = {};
        this.passiveSkillService.getPassiveSkillIds().forEach(skillId => {
            basePassiveSkills[skillId] = parseFloat(document.getElementById(skillId).value) || 0;
        });

        const activeSkills = [];
        for (let i = 1; i <= 3; i++) {
            const type = document.getElementById(`active${i}-type`).value;
            const value = parseFloat(document.getElementById(`active${i}-value`).value);
            const cooldown = parseFloat(document.getElementById(`active${i}-cooldown`).value);
            if (value && cooldown) {
                activeSkills.push(new ActiveSkill(type, value, cooldown));
            }
        }

        return new Character({
            totalDamage: parseFloat(document.getElementById('total-damage').value) || 0,
            totalHealth: parseFloat(document.getElementById('total-health').value) || 0,
            weaponType: document.getElementById('weapon-type').value,
            basePassiveSkills: basePassiveSkills,
            activeSkills: activeSkills,
            enemy: {
                dps: parseFloat(document.getElementById('enemy-dps').value) || 0,
                weaponType: document.getElementById('enemy-weapon-type').value
            }
        });
    }

    getEquipment(index, baseStats) {
        const category = document.getElementById('equipment-category').value;
        const weaponType = category === 'weapon' ? document.getElementById(`equip${index}-weapon-type`).value : baseStats.weaponType;

        return new Equipment({
            category: category,
            weaponType: weaponType,
            damage: parseFloat(document.getElementById(`equip${index}-damage-value`).value) || 0,
            health: parseFloat(document.getElementById(`equip${index}-health-value`).value) || 0,
            passiveSkill: document.getElementById(`equip${index}-passive-skill`).value,
            passiveSkillValue: parseFloat(document.getElementById(`equip${index}-passive-skill-value`).value) || 0
        });
    }

    isUnequipChecked() {
        return document.getElementById('equip2-unequip').checked;
    }

    displayComparisonResults(resultNew, resultOld) {
        document.getElementById('survival-time-1').textContent = isFinite(resultNew.survivalTime) ? resultNew.survivalTime.toFixed(2) : "Infinite";
        document.getElementById('total-damage-1').textContent = resultNew.totalDamageDealt.toLocaleString();
        document.getElementById('survival-time-2').textContent = isFinite(resultOld.survivalTime) ? resultOld.survivalTime.toFixed(2) : "Infinite";
        document.getElementById('total-damage-2').textContent = resultOld.totalDamageDealt.toLocaleString();

        const resultItem1 = document.getElementById('result-item-1');
        const resultItem2 = document.getElementById('result-item-2');

        resultItem1.className = 'result-item';
        resultItem2.className = 'result-item';

        if (resultNew.survivalTime > resultOld.survivalTime) {
            resultItem1.classList.add('best-equipment');
        } else if (resultOld.survivalTime > resultNew.survivalTime) {
            resultItem2.classList.add('best-equipment');
        } else {
            if (resultNew.totalDamageDealt >= resultOld.totalDamageDealt) {
                resultItem1.classList.add('best-equipment');
            } else {
                resultItem2.classList.add('best-equipment');
            }
        }
    }

    getCharacterStatsPvp(prefix) {
        const id_prefix = prefix === 'player' ? '' : `${prefix}-`;

        const basePassiveSkills = {};
        this.passiveSkillService.getPassiveSkillIds().forEach(skillId => {
            basePassiveSkills[skillId] = parseFloat(document.getElementById(`${id_prefix}${skillId}`).value) || 0;
        });

        const activeSkills = [];
        for (let i = 1; i <= 3; i++) {
            const type = document.getElementById(`${id_prefix}active${i}-type`).value;
            const value = parseFloat(document.getElementById(`${id_prefix}active${i}-value`).value);
            const cooldown = parseFloat(document.getElementById(`${id_prefix}active${i}-cooldown`).value);
            if (value && cooldown) {
                activeSkills.push(new ActiveSkill(type, value, cooldown));
            }
        }

        return new Character({
            name: prefix.charAt(0).toUpperCase() + prefix.slice(1),
            totalDamage: parseFloat(document.getElementById(`${id_prefix}total-damage`).value) || 0,
            totalHealth: parseFloat(document.getElementById(`${id_prefix}total-health`).value) || 0,
            weaponType: document.getElementById(`${id_prefix}weapon-type`).value,
            basePassiveSkills: basePassiveSkills,
            activeSkills: activeSkills
        });
    }

    displayPvpResults(result) {
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

    getElementValue(id) {
        const element = document.getElementById(id);
        if (!element) return null;
        if (element.type === 'checkbox') return element.checked;
        return element.value;
    }

    setElementValue(id, value) {
        const element = document.getElementById(id);
        if (!element) return;
        if (element.type === 'checkbox') {
            element.checked = value;
        } else {
            element.value = value;
        }
    }

    getEquipmentComparisonData() {
        const data = {
            type: 'equipment_comparison',
            character_stats: {},
            passive_skills: {},
            active_skills: [],
            enemy_stats: {},
            equipment: {
                equip1: {},
                equip2: {}
            }
        };

        data.character_stats.total_damage = this.getElementValue('total-damage');
        data.character_stats.total_health = this.getElementValue('total-health');
        data.character_stats.weapon_type = this.getElementValue('weapon-type');

        this.passiveSkillService.getPassiveSkillIds().forEach(skillId => {
            data.passive_skills[skillId] = this.getElementValue(skillId);
        });

        for (let i = 1; i <= 3; i++) {
            data.active_skills.push({
                type: this.getElementValue(`active${i}-type`),
                value: this.getElementValue(`active${i}-value`),
                cooldown: this.getElementValue(`active${i}-cooldown`)
            });
        }

        data.enemy_stats.dps = this.getElementValue('enemy-dps');
        data.enemy_stats.weapon_type = this.getElementValue('enemy-weapon-type');

        data.equipment.category = this.getElementValue('equipment-category');
        data.equipment.equip1.weapon_type = this.getElementValue('equip1-weapon-type');
        data.equipment.equip1.damage = this.getElementValue('equip1-damage-value');
        data.equipment.equip1.health = this.getElementValue('equip1-health-value');
        data.equipment.equip1.passive_skill = this.getElementValue('equip1-passive-skill');
        data.equipment.equip1.passive_skill_value = this.getElementValue('equip1-passive-skill-value');
        data.equipment.equip2.unequip = this.getElementValue('equip2-unequip');
        data.equipment.equip2.weapon_type = this.getElementValue('equip2-weapon-type');
        data.equipment.equip2.damage = this.getElementValue('equip2-damage-value');
        data.equipment.equip2.health = this.getElementValue('equip2-health-value');
        data.equipment.equip2.passive_skill = this.getElementValue('equip2-passive-skill');
        data.equipment.equip2.passive_skill_value = this.getElementValue('equip2-passive-skill-value');

        return data;
    }

    getPvpData() {
        const data = {
            type: 'pvp_simulation',
            player: {
                character_stats: {},
                passive_skills: {},
                active_skills: []
            },
            opponent: {
                character_stats: {},
                passive_skills: {},
                active_skills: []
            }
        };

        ['player', 'opponent'].forEach(prefix => {
            const charData = data[prefix];
            const id_prefix = prefix === 'player' ? '' : `${prefix}-`;

            charData.character_stats.total_damage = this.getElementValue(`${id_prefix}total-damage`);
            charData.character_stats.total_health = this.getElementValue(`${id_prefix}total-health`);
            charData.character_stats.weapon_type = this.getElementValue(`${id_prefix}weapon-type`);

            this.passiveSkillService.getPassiveSkillIds().forEach(skillId => {
                charData.passive_skills[skillId] = this.getElementValue(`${id_prefix}${skillId}`);
            });

            for (let i = 1; i <= 3; i++) {
                charData.active_skills.push({
                    type: this.getElementValue(`${id_prefix}active${i}-type`),
                    value: this.getElementValue(`${id_prefix}active${i}-value`),
                    cooldown: this.getElementValue(`${id_prefix}active${i}-cooldown`)
                });
            }
        });

        return data;
    }

    importEquipmentComparisonData(data) {
        this.setElementValue('total-damage', data.character_stats.total_damage);
        this.setElementValue('total-health', data.character_stats.total_health);
        this.setElementValue('weapon-type', data.character_stats.weapon_type);

        this.passiveSkillService.getPassiveSkillIds().forEach(skillId => {
            this.setElementValue(skillId, data.passive_skills[skillId]);
        });

        for (let i = 1; i <= 3; i++) {
            this.setElementValue(`active${i}-type`, data.active_skills[i - 1].type);
            this.setElementValue(`active${i}-value`, data.active_skills[i - 1].value);
            this.setElementValue(`active${i}-cooldown`, data.active_skills[i - 1].cooldown);
        }

        this.setElementValue('enemy-dps', data.enemy_stats.dps);
        this.setElementValue('enemy-weapon-type', data.enemy_stats.weapon_type);

        this.setElementValue('equipment-category', data.equipment.category);
        this.setElementValue('equip1-weapon-type', data.equipment.equip1.weapon_type);
        this.setElementValue('equip1-damage-value', data.equipment.equip1.damage);
        this.setElementValue('equip1-health-value', data.equipment.equip1.health);
        this.setElementValue('equip1-passive-skill', data.equipment.equip1.passive_skill);
        this.setElementValue('equip1-passive-skill-value', data.equipment.equip1.passive_skill_value);
        this.setElementValue('equip2-unequip', data.equipment.equip2.unequip);
        this.setElementValue('equip2-weapon-type', data.equipment.equip2.weapon_type);
        this.setElementValue('equip2-damage-value', data.equipment.equip2.damage);
        this.setElementValue('equip2-health-value', data.equipment.equip2.health);
        this.setElementValue('equip2-passive-skill', data.equipment.equip2.passive_skill);
        this.setElementValue('equip2-passive-skill-value', data.equipment.equip2.passive_skill_value);
    }

    importPvpData(data) {
        const playerData = data.player;
        this.setElementValue('total-damage', playerData.character_stats.total_damage);
        this.setElementValue('total-health', playerData.character_stats.total_health);
        this.setElementValue('weapon-type', playerData.character_stats.weapon_type);
        this.passiveSkillService.getPassiveSkillIds().forEach(skillId => {
            this.setElementValue(skillId, playerData.passive_skills[skillId]);
        });
        for (let i = 1; i <= 3; i++) {
            this.setElementValue(`active${i}-type`, playerData.active_skills[i - 1].type);
            this.setElementValue(`active${i}-value`, playerData.active_skills[i - 1].value);
            this.setElementValue(`active${i}-cooldown`, playerData.active_skills[i - 1].cooldown);
        }

        const opponentData = data.opponent;
        this.setElementValue('opponent-total-damage', opponentData.character_stats.total_damage);
        this.setElementValue('opponent-total-health', opponentData.character_stats.total_health);
        this.setElementValue('opponent-weapon-type', opponentData.character_stats.weapon_type);
        this.characterService.getPassiveSkills().forEach(skill => {
            this.setElementValue(`opponent-${skill.id}`, opponentData.passive_skills[skill.id]);
        });
        for (let i = 1; i <= 3; i++) {
            this.setElementValue(`opponent-active${i}-type`, opponentData.active_skills[i - 1].type);
            this.setElementValue(`opponent-active${i}-value`, opponentData.active_skills[i - 1].value);
            this.setElementValue(`opponent-active${i}-cooldown`, opponentData.active_skills[i - 1].cooldown);
        }
    }
}
