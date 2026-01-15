// src/application/CharacterFactory.js

import { Character } from '../domain/Character.js';
import { Equipment } from '../domain/Equipment.js';
import { ActiveSkillFactory } from '../domain/skills/ActiveSkillFactory.js';
import { PassiveSkillFactory } from '../domain/passives/PassiveSkillFactory.js';

export class CharacterFactory {
    create(sheetStats) {
        const stats = JSON.parse(JSON.stringify(sheetStats));
        const p = stats.basePassiveSkills;

        let totalDamageModifier = 1 + (p['degats'] || 0) / 100;
        if (stats.weaponType === 'corp-a-corp') {
            totalDamageModifier += (p['degats-corps-a-corps'] || 0) / 100;
        } else if (stats.weaponType === 'a-distance') {
            totalDamageModifier += (p['degats-a-distance'] || 0) / 100;
        }

        const totalHealthModifier = 1 + (p['sante'] || 0) / 100;

        let effectiveBaseDamage = stats.totalDamage / (totalDamageModifier || 1);
        let effectiveBaseHealth = stats.totalHealth / (totalHealthModifier || 1);

        if (stats.activeSkills && Array.isArray(stats.activeSkills)) {
            const competenceDegatsMod = 1 + (p['competence-degats'] || 0) / 100;
            stats.activeSkills.forEach(skill => {
                if (skill.baseDamage) {
                    effectiveBaseDamage -= skill.baseDamage * competenceDegatsMod;
                }
                if (skill.baseHealth) {
                    effectiveBaseHealth -= skill.baseHealth * competenceDegatsMod;
                }
            });
        }

        const character = new Character({
            ...stats,
            baseDamage: effectiveBaseDamage,
            baseHealth: effectiveBaseHealth,
            basePassiveSkills: stats.basePassiveSkills,
            name: stats.name || 'Player'
        });

        return character.recalculateTotalStats();
    }

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
        return skillsData.map(skillData => ActiveSkillFactory.create(skillData)).filter(Boolean);
    }

    createPassiveSkillsFromData(basePassiveSkills) {
        return Object.keys(basePassiveSkills).map(skillId => {
            return PassiveSkillFactory.create(skillId, basePassiveSkills[skillId]);
        }).filter(Boolean);
    }
}
