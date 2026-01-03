// src/infrastructure/UiService.js

class UiService {
    constructor() {
        // Mode switching elements
        this.modeEquipmentButton = document.getElementById('mode-equipment');
        this.modePvpButton = document.getElementById('mode-pvp');
        this.equipmentSection = document.getElementById('equipment-comparison-section');
        this.pvpSection = document.getElementById('pvp-simulation-section');

        // Equipment comparison elements
        this.compareButton = document.getElementById('compare-button');
        this.equip1PassiveSkill = document.getElementById('equip1-passive-skill');
        this.equip2PassiveSkill = document.getElementById('equip2-passive-skill');
        this.equipmentCategory = document.getElementById('equipment-category');
        this.equip1WeaponTypeContainer = document.getElementById('equip1-weapon-type-container');
        this.equip2WeaponTypeContainer = document.getElementById('equip2-weapon-type-container');

        // PvP simulation elements
        this.simulateButton = document.getElementById('simulate-button');

        // Import/Export elements
        this.exportEquipmentButton = document.getElementById('export-equipment');
        this.importEquipmentButton = document.getElementById('import-equipment');
        this.exportPvpButton = document.getElementById('export-pvp');
        this.importPvpButton = document.getElementById('import-pvp');
        this.importFile = document.getElementById('import-file');

        this.equipmentCategory.addEventListener('change', () => this.toggleWeaponTypeDisplay());
    }

    switchToEquipmentMode() {
        this.modeEquipmentButton.classList.add('active');
        this.modePvpButton.classList.remove('active');
        this.equipmentSection.style.display = 'block';
        this.pvpSection.style.display = 'none';
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
