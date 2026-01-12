// src/application/CharacterFactory.js

import { Character } from '../domain/Character.js';
import { Equipment } from '../domain/Equipment.js';
import { DamageSkill } from '../domain/skills/DamageSkill.js';
import { BuffSkill } from '../domain/skills/BuffSkill.js';
import { PassiveSkillFactory } from '../domain/passives/PassiveSkillFactory.js';

export class CharacterFactory {
    createCharacterFromData(characterData) {
        const activeSkills = this.createActiveSkillsFromData(characterData.activeSkills);
        const passiveSkills = this.createPassiveSkillsFromData(characterData.basePassiveSkills);

        return new Character({
            totalDamage: characterData.totalDamage,
            totalHealth: characterData.totalHealth,
            weaponType: characterData.weaponType,
            basePassiveSkills: characterData.basePassiveSkills,
            activeSkills: activeSkills,
            passiveSkills: passiveSkills,
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

    createPassiveSkillsFromData(basePassiveSkills) {
        return Object.keys(basePassiveSkills).map(skillId => {
            return PassiveSkillFactory.create(skillId, basePassiveSkills[skillId]);
        }).filter(Boolean);
    }
}
