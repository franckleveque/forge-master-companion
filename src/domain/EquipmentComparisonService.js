// src/domain/EquipmentComparisonService.js

import { Character } from "./Character.js";

export class EquipmentComparisonService {
    constructor(simulationService, characterService) {
        this.simulationService = simulationService;
        this.characterService = characterService;
    }

    createDummyEnemy(character) {
        return new Character({
            totalDamage: character.totalDamage,
            totalHealth: character.totalHealth,
            weaponType: 'melee',
            activeSkills: [],
            basePassiveSkills: {}
        });
    }

    compare(character, equipNew, equipOld) {
        const baseStats = this.characterService.getCharacterBaseStats(character);
        const cleanBaseStats = this.characterService.unequipEquipment(baseStats, equipOld);
        const dummyEnemy = this.createDummyEnemy(character);

        // Run simulation for old equipment
        let statsForOldScenario = this.characterService.applyEquipment(cleanBaseStats, equipOld);
        let finalStatsOld = this.characterService.recalculateTotalStats(statsForOldScenario);
        const pvpResultOld = this.simulationService.simulatePvp(finalStatsOld, dummyEnemy);
        const resultOld = {
            survivalTime: pvpResultOld.time,
            totalDamageDealt: pvpResultOld.player1.totalDamageDealt
        };

        // Run simulation for new equipment
        let statsWithNewEquip = this.characterService.applyEquipment(cleanBaseStats, equipNew);
        let finalStatsNew = this.characterService.recalculateTotalStats(statsWithNewEquip);
        const pvpResultNew = this.simulationService.simulatePvp(finalStatsNew, dummyEnemy);
        const resultNew = {
            survivalTime: pvpResultNew.time,
            totalDamageDealt: pvpResultNew.player1.totalDamageDealt
        };

        return { resultNew, resultOld };
    }
}
