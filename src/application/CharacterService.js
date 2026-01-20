// src/application/CharacterService.js
import { Character } from "../domain/Character.js";

export class CharacterService {
    constructor(passiveSkillService) {
        this.passiveSkillService = passiveSkillService;
    }

    getCharacterBaseStats(sheetStats) {
        return Character.fromTotalStats(sheetStats);
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
