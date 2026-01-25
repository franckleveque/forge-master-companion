// src/adapters/DomAdapter.js

import { CharacterData } from '../domain/ports/CharacterData.js';
import { EquipmentData } from '../domain/ports/EquipmentData.js';
import { ActiveSkillData } from '../domain/ports/ActiveSkillData.js';

export class DomAdapter {
    constructor(characterService, passiveSkillService, uiService) {
        this.characterService = characterService;
        this.passiveSkillService = passiveSkillService;
        this.uiService = uiService;
    }

    populatePassiveSkills() {
        const passiveSkills = this.passiveSkillService.passiveSkills;
        this.uiService.populatePassiveSkills(passiveSkills);
    }

    getActiveSkills(prefix) {
        const activeSkillsData = [];
        for (let i = 1; i <= 3; i++) {
            const id_prefix = prefix ? `${prefix}-` : '';
            const skillId = `${id_prefix}active${i}`;
            const type = this.getElementValue(`${skillId}-type`);
            if (!type) continue;

            const skillData = {
                type: type,
                baseDamage: parseFloat(this.getElementValue(`${skillId}-baseDamage`)) || 0,
                baseHealth: parseFloat(this.getElementValue(`${skillId}-baseHealth`)) || 0,
                cooldown: parseFloat(this.getElementValue(`${skillId}-cooldown`)) || 0,
            };

            if (type === 'damage') {
                skillData.value = parseFloat(this.getElementValue(`${skillId}-value`)) || 0;
                skillData.hits = parseFloat(this.getElementValue(`${skillId}-hits`)) || 1;
            } else if (type === 'buff') {
                skillData.damageBuff = parseFloat(this.getElementValue(`${skillId}-damageBuff`)) || 0;
                skillData.healthBuff = parseFloat(this.getElementValue(`${skillId}-healthBuff`)) || 0;
                skillData.duration = parseFloat(this.getElementValue(`${skillId}-duration`)) || 0;
            }
            activeSkillsData.push(new ActiveSkillData(skillData));
        }
        return activeSkillsData;
    }

    getCharacterStats() {
        const basePassiveSkills = {};
        this.passiveSkillService.getPassiveSkillIds().forEach(skillId => {
            basePassiveSkills[skillId] = parseFloat(document.getElementById(skillId).value) || 0;
        });

        return new CharacterData({
            totalDamage: parseFloat(document.getElementById('total-damage').value) || 0,
            totalHealth: parseFloat(document.getElementById('total-health').value) || 0,
            weaponType: document.getElementById('weapon-type').value,
            basePassiveSkills: basePassiveSkills,
            activeSkills: this.getActiveSkills('player')
        });
    }

    getEquipment(index) {
        return new EquipmentData({
            category: document.getElementById('equipment-category').value,
            weaponType: document.getElementById(`equip${index}-weapon-type`).value,
            damage: parseFloat(document.getElementById(`equip${index}-damage-value`).value) || 0,
            health: parseFloat(document.getElementById(`equip${index}-health-value`).value) || 0,
            passiveSkill: document.getElementById(`equip${index}-passive-skill`).value,
            passiveSkillValue: parseFloat(document.getElementById(`equip${index}-passive-skill-value`).value) || 0
        });
    }

    displayComparisonResults(result) {
        this.displayLogs('equipment', result.log);

        const resultsOutput = document.getElementById('results-output');
        resultsOutput.innerHTML = `
            <h3>Comparison Result</h3>
            <p><strong>Best Equipment:</strong> ${result.winner}</p>
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

        document.querySelector('[data-testid="equipment-log-controls"]').style.display = 'block';
    }

    getCharacterStatsPvp(prefix) {
        const id_prefix = prefix === 'player' ? '' : `${prefix}-`;

        const basePassiveSkills = {};
        this.passiveSkillService.getPassiveSkillIds().forEach(skillId => {
            basePassiveSkills[skillId] = parseFloat(document.getElementById(`${id_prefix}${skillId}`).value) || 0;
        });

        return new CharacterData({
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
