// src/application/CharacterFactory.js

import { Character } from '../domain/Character.js';
import { Equipment } from '../domain/Equipment.js';
import { DamageSkill } from '../domain/skills/DamageSkill.js';
import { BuffSkill } from '../domain/skills/BuffSkill.js';

export class CharacterFactory {
    createCharacterFromData(characterData) {
        const activeSkills = this.createActiveSkillsFromData(characterData.activeSkills);

        return new Character({
            totalDamage: characterData.totalDamage,
            totalHealth: characterData.totalHealth,
            weaponType: characterData.weaponType,
            basePassiveSkills: characterData.basePassiveSkills,
            activeSkills: activeSkills,
            name: characterData.name
        });
    }

    createEquipmentFromData(equipmentData, baseStats) {
        return new Equipment({
            ...equipmentData,
            weaponType: equipmentData.category === 'weapon' ? equipmentData.weaponType : baseStats.weaponType,
        });
    }

    createActiveSkillsFromData(skillsData) {
        return skillsData.map(skillData => {
            if (skillData.type === 'damage') {
                return new DamageSkill(skillData);
            }
            if (skillData.type === 'buff') {
                return new BuffSkill(skillData);
            }
            return null;
        }).filter(Boolean);
    }
}
