// src/application/CharacterService.js
import { Character } from "../domain/Character.js";

export class CharacterService {
    constructor(passiveSkillService) {
        this.passiveSkillService = passiveSkillService;
    }

    getCharacterBaseStats(sheetStats) {
        // Use a deep copy to ensure the original object is NEVER mutated.
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

        // The Character constructor now automatically recalculates total stats.
        // This service is only responsible for determining the base stats from UI inputs.
        const character = new Character({
            ...stats,
            baseDamage: effectiveBaseDamage,
            baseHealth: effectiveBaseHealth,
            basePassiveSkills: stats.basePassiveSkills, // Ensure passives are passed through
            name: stats.name || 'Player' // Ensure a name is set
        });
        return character.recalculateStats();
    }

    applyEquipment(characterStats, equipment) {
        const stats = JSON.parse(JSON.stringify(characterStats));
        stats.baseDamage += equipment.damage;
        stats.baseHealth += equipment.health;

        const passive = this.passiveSkillService.findSkillByName(equipment.passiveSkill);
        if (passive) {
            stats.basePassiveSkills[passive.id] = (stats.basePassiveSkills[passive.id] || 0) + equipment.passiveSkillValue;
        }

        if (equipment.category === 'weapon') {
            stats.weaponType = equipment.weaponType;
        }

        return new Character(stats);
    }

    unequipEquipment(characterStats, equipment) {
        const stats = JSON.parse(JSON.stringify(characterStats));
        stats.baseDamage -= equipment.damage;
        stats.baseHealth -= equipment.health;

        const passive = this.passiveSkillService.findSkillByName(equipment.passiveSkill);
        if (passive) {
            stats.basePassiveSkills[passive.id] = (stats.basePassiveSkills[passive.id] || 0) - equipment.passiveSkillValue;
        }

        return new Character(stats);
    }
}
