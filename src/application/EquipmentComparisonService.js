// src/domain/EquipmentComparisonService.js

import { Character } from "../domain/Character.js";

export class EquipmentComparisonService {
    constructor(simulationService, characterService) {
        this.simulationService = simulationService;
        this.characterService = characterService;
    }

    compare(character, equipNew, equipOld) {
        // Character with current equipment
        const characterStateWithOldEquip = JSON.parse(JSON.stringify(character));
        const characterWithOldEquip = new Character({
            ...characterStateWithOldEquip,
            name: "Old Equip",
            id: "Old Equip"
        });

        // Calculate stats for character with new equipment
        const baseStats = this.characterService.getCharacterBaseStats(character);
        const cleanBaseStats = this.characterService.unequipEquipment(baseStats, equipOld).recalculateStats();
        const finalStatsNew = this.characterService.applyEquipment(cleanBaseStats, equipNew).recalculateStats();
        const characterWithNewEquip = new Character({
            ...finalStatsNew,
            name: "New Equip",
            id: "New Equip"
        });

        // Run a single simulation between the two character versions
        const simulationResult = this.simulationService.simulatePvp(characterWithOldEquip, characterWithNewEquip);

        return simulationResult;
    }
}
