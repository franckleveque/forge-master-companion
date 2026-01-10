// src/domain/EquipmentComparisonService.js

import { Character } from "./Character.js";

export class EquipmentComparisonService {
    constructor(simulationService, characterService, passiveSkillFactory) {
        this.simulationService = simulationService;
        this.characterService = characterService;
        this.passiveSkillFactory = passiveSkillFactory;
    }

    compare(character, equipNew, equipOld) {
        // Character with current equipment
        const characterStateWithOldEquip = JSON.parse(JSON.stringify(character));
        const characterWithOldEquip = new Character({
            ...characterStateWithOldEquip,
            name: "Old Equip",
            id: "Old Equip",
            passiveSkillFactory: this.passiveSkillFactory
        });

        // Calculate stats for character with new equipment
        const baseStats = this.characterService.getCharacterBaseStats(character);
        const cleanBaseStats = this.characterService.unequipEquipment(baseStats, equipOld);
        const statsWithNewEquip = this.characterService.applyEquipment(cleanBaseStats, equipNew);
        const finalStatsNew = this.characterService.recalculateTotalStats(statsWithNewEquip);
        const characterWithNewEquip = new Character({
            ...finalStatsNew,
            name: "New Equip",
            id: "New Equip",
            passiveSkillFactory: this.passiveSkillFactory
        });

        // Run a single simulation between the two character versions
        const simulationResult = this.simulationService.simulatePvp(characterWithOldEquip, characterWithNewEquip);

        return simulationResult;
    }
}
