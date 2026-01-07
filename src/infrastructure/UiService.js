// src/infrastructure/UiService.js

export class UiService {
    constructor() {
        // Mode switching elements
        this.modeEquipmentButton = document.getElementById('mode-equipment');
        this.modePvpButton = document.getElementById('mode-pvp');
        this.equipmentSection = document.getElementById('equipment-comparison-section');
        this.pvpSection = document.getElementById('pvp-simulation-section');
        this.enemyStatsContainer = document.getElementById('enemy-stats-container');

        // Equipment comparison elements
        this.compareButton = document.getElementById('compare-button');
        this.equip1PassiveSkill = document.getElementById('equip1-passive-skill');
        this.equip2PassiveSkill = document.getElementById('equip2-passive-skill');
        this.equipmentCategory = document.getElementById('equipment-category');
        this.equip1WeaponTypeContainer = document.getElementById('equip1-weapon-type-container');
        this.equip2WeaponTypeContainer = document.getElementById('equip2-weapon-type-container');

        // PvP simulation elements
        this.simulateButton = document.getElementById('simulate-button');

        // Log elements
        this.viewLogEquipmentButton = document.getElementById('view-log-equipment');
        this.exportLogEquipmentButton = document.getElementById('export-log-equipment');
        this.viewLogPvpButton = document.getElementById('view-log-pvp');
        this.exportLogPvpButton = document.getElementById('export-log-pvp');

        // Import/Export elements
        this.exportEquipmentButton = document.getElementById('export-equipment');
        this.importEquipmentButton = document.getElementById('import-equipment');
        this.exportPvpButton = document.getElementById('export-pvp');
        this.importPvpButton = document.getElementById('import-pvp');
        this.importFile = document.getElementById('import-file');

        this.playerActiveSkillsContainer = document.getElementById('player-active-skills-container');
        this.opponentActiveSkillsContainer = document.getElementById('opponent-active-skills-container');

        this.equipmentCategory.addEventListener('change', () => this.toggleWeaponTypeDisplay());

        this.createActiveSkillUI('player-active-skills-container', 'player');
        this.createActiveSkillUI('opponent-active-skills-container', 'opponent');

        this.switchToEquipmentMode();
    }

    createActiveSkillUI(containerId, prefix) {
        const container = document.getElementById(containerId);
        for (let i = 1; i <= 3; i++) {
            const skillId = `${prefix}-active${i}`;
            const skillDiv = document.createElement('div');
            skillDiv.className = 'active-skill-item';
            skillDiv.innerHTML = `
                <h4>Skill ${i}</h4>
                <select id="${skillId}-type">
                    <option value="damage">Damage</option>
                    <option value="buff">Buff</option>
                </select>
                <input type="number" id="${skillId}-baseDamage" placeholder="Base Dmg">
                <input type="number" id="${skillId}-baseHealth" placeholder="Base Health">
                <input type="number" id="${skillId}-cooldown" placeholder="Cooldown (s)">
                <div id="${skillId}-damage-params" class="skill-param">
                    <input type="number" id="${skillId}-value" placeholder="Value">
                    <input type="number" id="${skillId}-hits" placeholder="Hits">
                </div>
                <div id="${skillId}-buff-params" class="skill-param">
                    <input type="number" id="${skillId}-damageBuff" placeholder="Dmg Buff">
                    <input type="number" id="${skillId}-healthBuff" placeholder="Health Buff">
                    <input type="number" id="${skillId}-duration" placeholder="Duration (s)">
                </div>
            `;
            container.appendChild(skillDiv);

            const typeSelector = skillDiv.querySelector(`#${skillId}-type`);
            typeSelector.addEventListener('change', () => this.toggleSkillParams(skillId));
            this.toggleSkillParams(skillId); // Initial setup
        }
    }

    toggleSkillParams(skillId) {
        const type = document.getElementById(`${skillId}-type`).value;
        const damageParams = document.getElementById(`${skillId}-damage-params`);
        const buffParams = document.getElementById(`${skillId}-buff-params`);

        damageParams.style.display = type === 'damage' ? 'block' : 'none';
        buffParams.style.display = type === 'buff' ? 'block' : 'none';
    }

    switchToEquipmentMode() {
        this.modeEquipmentButton.classList.add('active');
        this.modePvpButton.classList.remove('active');
        this.equipmentSection.style.display = 'block';
        this.pvpSection.style.display = 'none';
        this.enemyStatsContainer.style.display = 'none';
    }

    switchToPvpMode() {
        this.modePvpButton.classList.add('active');
        this.modeEquipmentButton.classList.remove('active');
        this.pvpSection.style.display = 'block';
        this.equipmentSection.style.display = 'none';
    }

    isEquipmentMode() {
        return this.modeEquipmentButton.classList.contains('active');
    }

    isPvpMode() {
        return this.modePvpButton.classList.contains('active');
    }

    toggleWeaponTypeDisplay() {
        const isWeapon = this.equipmentCategory.value === 'weapon';
        this.equip1WeaponTypeContainer.style.display = isWeapon ? 'block' : 'none';
        this.equip2WeaponTypeContainer.style.display = isWeapon ? 'block' : 'none';
    }

    populatePassiveSkills(passiveSkills) {
        passiveSkills.forEach(skill => {
            const option1 = document.createElement('option');
            option1.value = skill.name;
            option1.textContent = skill.name;
            this.equip1PassiveSkill.appendChild(option1);

            const option2 = document.createElement('option');
            option2.value = skill.name;
            option2.textContent = skill.name;
            this.equip2PassiveSkill.appendChild(option2);
        });
    }
}
