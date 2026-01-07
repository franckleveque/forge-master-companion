// src/adapters/DomAdapter.js

import { PassiveSkillService } from '../domain/PassiveSkillService.js';
import { Character } from '../domain/Character.js';
import { Equipment } from '../domain/Equipment.js';
import { DamageSkill } from '../domain/skills/DamageSkill.js';
import { BuffSkill } from '../domain/skills/BuffSkill.js';

export class DomAdapter {
    constructor(characterService, passiveSkillService, uiService) {
        this.characterService = characterService;
        this.passiveSkillService = passiveSkillService;
        this.uiService = uiService;
    }

    getActiveSkills(prefix) {
        const activeSkills = [];
        for (let i = 1; i <= 3; i++) {
            const id_prefix = prefix ? `${prefix}-` : '';
            const skillId = `${id_prefix}active${i}`;
            const type = this.getElementValue(`${skillId}-type`);
            if (!type) continue;

            const baseDamage = parseFloat(this.getElementValue(`${skillId}-baseDamage`)) || 0;
            const baseHealth = parseFloat(this.getElementValue(`${skillId}-baseHealth`)) || 0;
            const cooldown = parseFloat(this.getElementValue(`${skillId}-cooldown`)) || 0;

            if (type === 'damage') {
                const value = parseFloat(this.getElementValue(`${skillId}-value`)) || 0;
                const hits = parseFloat(this.getElementValue(`${skillId}-hits`)) || 1;
                if (value && cooldown) {
                    activeSkills.push(new DamageSkill({ baseDamage, baseHealth, cooldown, value, hits }));
                }
            } else if (type === 'buff') {
                const damageBuff = parseFloat(this.getElementValue(`${skillId}-damageBuff`)) || 0;
                const healthBuff = parseFloat(this.getElementValue(`${skillId}-healthBuff`)) || 0;
                const duration = parseFloat(this.getElementValue(`${skillId}-duration`)) || 0;
                if (duration && cooldown) {
                    activeSkills.push(new BuffSkill({ baseDamage, baseHealth, cooldown, damageBuff, healthBuff, duration }));
                }
            }
        }
        return activeSkills;
    }

    getCharacterStats() {
        const basePassiveSkills = {};
        this.passiveSkillService.getPassiveSkillIds().forEach(skillId => {
            basePassiveSkills[skillId] = parseFloat(document.getElementById(skillId).value) || 0;
        });

        return new Character({
            totalDamage: parseFloat(document.getElementById('total-damage').value) || 0,
            totalHealth: parseFloat(document.getElementById('total-health').value) || 0,
            weaponType: document.getElementById('weapon-type').value,
            basePassiveSkills: basePassiveSkills,
            activeSkills: this.getActiveSkills('player')
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

    displayComparisonResults(resultNew, resultOld) {
        document.getElementById('survival-time-1').textContent = isFinite(resultNew.survivalTime) ? resultNew.survivalTime.toFixed(2) : "Infinity";
        document.getElementById('health-remaining-1').textContent = resultNew.healthRemaining.toLocaleString();
        document.getElementById('total-damage-1').textContent = resultNew.totalDamageDealt.toLocaleString();

        document.getElementById('survival-time-2').textContent = isFinite(resultOld.survivalTime) ? resultOld.survivalTime.toFixed(2) : "Infinity";
        document.getElementById('health-remaining-2').textContent = resultOld.healthRemaining.toLocaleString();
        document.getElementById('total-damage-2').textContent = resultOld.totalDamageDealt.toLocaleString();

        const resultItem1 = document.getElementById('result-item-1');
        const resultItem2 = document.getElementById('result-item-2');

        resultItem1.className = 'result-item';
        resultItem2.className = 'result-item';

        // Tie-breaker logic:
        // 1. Higher survival time wins.
        // 2. If survival time is equal, higher max health wins.
        // 3. If max health is also equal, higher total damage wins.
        // 4. If all are equal, new equipment wins by default.
        if (resultNew.survivalTime > resultOld.survivalTime) {
            resultItem1.classList.add('best-equipment');
        } else if (resultOld.survivalTime > resultNew.survivalTime) {
            resultItem2.classList.add('best-equipment');
        } else {
            // Survival times are equal, check max health
            if (resultNew.maxHealth > resultOld.maxHealth) {
                resultItem1.classList.add('best-equipment');
            } else if (resultOld.maxHealth > resultNew.maxHealth) {
                resultItem2.classList.add('best-equipment');
            } else {
                // Max health is equal, check total damage
                if (resultNew.totalDamageDealt >= resultOld.totalDamageDealt) {
                    resultItem1.classList.add('best-equipment');
                } else {
                    resultItem2.classList.add('best-equipment');
                }
            }
        }

        this.displayLogs('equipment', `--- Simulation with New Equip ---\n${resultNew.log.join('\n')}\n\n--- Simulation with Old Equip ---\n${resultOld.log.join('\n')}`);
        document.querySelector('[data-testid="equipment-log-controls"]').style.display = 'block';
    }

    getCharacterStatsPvp(prefix) {
        const id_prefix = prefix === 'player' ? '' : `${prefix}-`;

        const basePassiveSkills = {};
        this.passiveSkillService.getPassiveSkillIds().forEach(skillId => {
            basePassiveSkills[skillId] = parseFloat(document.getElementById(`${id_prefix}${skillId}`).value) || 0;
        });

        return new Character({
            name: prefix.charAt(0).toUpperCase() + prefix.slice(1),
            totalDamage: parseFloat(document.getElementById(`${id_prefix}total-damage`).value) || 0,
            totalHealth: parseFloat(document.getElementById(`${id_prefix}total-health`).value) || 0,
            weaponType: document.getElementById(`${id_prefix}weapon-type`).value,
            basePassiveSkills: basePassiveSkills,
            activeSkills: this.getActiveSkills(prefix)
        });
    }

    displayPvpResults(result) {
        this.displayLogs('pvp', result.log);

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

        document.querySelector('[data-testid="pvp-log-controls"]').style.display = 'block';
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
            const skillId = `player-active${i}`;
            data.active_skills.push({
                type: this.getElementValue(`${skillId}-type`),
                baseDamage: this.getElementValue(`${skillId}-baseDamage`),
                baseHealth: this.getElementValue(`${skillId}-baseHealth`),
                cooldown: this.getElementValue(`${skillId}-cooldown`),
                value: this.getElementValue(`${skillId}-value`),
                hits: this.getElementValue(`${skillId}-hits`),
                damageBuff: this.getElementValue(`${skillId}-damageBuff`),
                healthBuff: this.getElementValue(`${skillId}-healthBuff`),
                duration: this.getElementValue(`${skillId}-duration`)
            });
        }

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
            player: this.getCharacterStatsPvp('player'),
            opponent: this.getCharacterStatsPvp('opponent')
        };
        return data;
    }

    importEquipmentComparisonData(data) {
        this.setElementValue('total-damage', data.character_stats.total_damage);
        this.setElementValue('total-health', data.character_stats.total_health);
        this.setElementValue('weapon-type', data.character_stats.weaponType);

        this.passiveSkillService.getPassiveSkillIds().forEach(skillId => {
            this.setElementValue(skillId, data.passive_skills[skillId]);
        });

        for (let i = 1; i <= 3; i++) {
            const skillId = `player-active${i}`;
            const skillData = data.active_skills[i - 1];
            this.setElementValue(`${skillId}-type`, skillData.type);
            this.setElementValue(`${skillId}-baseDamage`, skillData.baseDamage);
            this.setElementValue(`${skillId}-baseHealth`, skillData.baseHealth);
            this.setElementValue(`${skillId}-cooldown`, skillData.cooldown);
            this.setElementValue(`${skillId}-value`, skillData.value);
            this.setElementValue(`${skillId}-hits`, skillData.hits);
            this.setElementValue(`${skillId}-damageBuff`, skillData.damageBuff);
            this.setElementValue(`${skillId}-healthBuff`, skillData.healthBuff);
            this.setElementValue(`${skillId}-duration`, skillData.duration);
            this.uiService.toggleSkillParams(skillId);
        }

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
        // Player Data
        const playerData = data.player;
        this.setElementValue('total-damage', playerData.totalDamage);
        this.setElementValue('total-health', playerData.totalHealth);
        this.setElementValue('weapon-type', playerData.weaponType);
        this.passiveSkillService.getPassiveSkillIds().forEach(skillId => {
            this.setElementValue(skillId, playerData.basePassiveSkills[skillId]);
        });
        for (let i = 1; i <= 3; i++) {
            const skillId = `player-active${i}`;
            const skillData = playerData.activeSkills[i - 1] || {};
            this.setElementValue(`${skillId}-type`, skillData.type || '');
            this.setElementValue(`${skillId}-baseDamage`, skillData.baseDamage || '');
            this.setElementValue(`${skillId}-baseHealth`, skillData.baseHealth || '');
            this.setElementValue(`${skillId}-cooldown`, skillData.cooldown || '');
            this.setElementValue(`${skillId}-value`, skillData.value || '');
            this.setElementValue(`${skillId}-hits`, skillData.hits || '');
            this.setElementValue(`${skillId}-damageBuff`, skillData.damageBuff || '');
            this.setElementValue(`${skillId}-healthBuff`, skillData.healthBuff || '');
            this.setElementValue(`${skillId}-duration`, skillData.duration || '');
            this.uiService.toggleSkillParams(skillId);
        }

        // Opponent Data
        const opponentData = data.opponent;
        this.setElementValue('opponent-total-damage', opponentData.totalDamage);
        this.setElementValue('opponent-total-health', opponentData.totalHealth);
        this.setElementValue('opponent-weapon-type', opponentData.weaponType);
        this.passiveSkillService.getPassiveSkillIds().forEach(skillId => {
            this.setElementValue(`opponent-${skillId}`, opponentData.basePassiveSkills[skillId]);
        });
        for (let i = 1; i <= 3; i++) {
            const skillId = `opponent-active${i}`;
            const skillData = opponentData.activeSkills[i - 1] || {};
            this.setElementValue(`${skillId}-type`, skillData.type || '');
            this.setElementValue(`${skillId}-baseDamage`, skillData.baseDamage || '');
            this.setElementValue(`${skillId}-baseHealth`, skillData.baseHealth || '');
            this.setElementValue(`${skillId}-cooldown`, skillData.cooldown || '');
            this.setElementValue(`${skillId}-value`, skillData.value || '');
            this.setElementValue(`${skillId}-hits`, skillData.hits || '');
            this.setElementValue(`${skillId}-damageBuff`, skillData.damageBuff || '');
            this.setElementValue(`${skillId}-healthBuff`, skillData.healthBuff || '');
            this.setElementValue(`${skillId}-duration`, skillData.duration || '');
            toggleSkillParams(skillId);
        }
    }

    displayLogs(prefix, log) {
        const logContent = document.getElementById(`log-content-${prefix}`);
        if (Array.isArray(log)) {
            logContent.textContent = log.join('\n');
        } else {
            logContent.textContent = log;
        }
    }

    toggleLogVisibility(prefix) {
        const logContainer = document.getElementById(`log-container-${prefix}`);
        const currentDisplay = logContainer.style.display;
        logContainer.style.display = currentDisplay === 'none' ? 'block' : 'none';
    }
}
