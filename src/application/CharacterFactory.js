// src/application/CharacterFactory.js

import { Character } from '../domain/Character.js';
import { Equipment } from '../domain/Equipment.js';
import { ActiveSkillFactory } from '../domain/skills/ActiveSkillFactory.js';
import { PassiveSkillFactory } from '../domain/passives/PassiveSkillFactory.js';

export class CharacterFactory {
    createCharacterFromData(characterData) {
        const activeSkills = this.createActiveSkillsFromData(characterData.activeSkills);
        const passiveSkills = this.createPassiveSkillsFromData(characterData.basePassiveSkills);

        // Normalize weapon_type to weaponType at the factory boundary
        const weaponType = characterData.weaponType || characterData.weapon_type;

        return new Character({
            totalDamage: characterData.totalDamage,
            totalHealth: characterData.totalHealth,
            weaponType: weaponType,
            basePassiveSkills: characterData.basePassiveSkills,
            activeSkills: activeSkills,
            passiveSkills: passiveSkills,
            name: characterData.name
        });
    }

    createEquipmentFromData(equipmentData, baseStats) {
        // Normalize weapon_type to weaponType at the factory boundary
        const weaponType = equipmentData.weaponType || equipmentData.weapon_type;

        return new Equipment({
            ...equipmentData,
            weaponType: equipmentData.category === 'weapon' ? weaponType : baseStats.weaponType,
        });
    }

    createActiveSkillsFromData(skillsData) {
        return skillsData.map(skillData => ActiveSkillFactory.create(skillData)).filter(Boolean);
    }

    createPassiveSkillsFromData(basePassiveSkills) {
        return Object.keys(basePassiveSkills).map(skillId => {
            return PassiveSkillFactory.create(skillId, basePassiveSkills[skillId]);
        }).filter(Boolean);
    }
}
