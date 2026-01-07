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
        const dummyEnemy = this.createDummyEnemy(character);

        // Run simulation for old equipment (using the character stats as-is)
        const pvpResultOld = this.simulationService.simulatePvp(character, dummyEnemy);
        const resultOld = {
            survivalTime: pvpResultOld.time,
            totalDamageDealt: pvpResultOld.player1.totalDamageDealt,
            healthRemaining: pvpResultOld.player1.healthRemaining
        };

        // Run simulation for new equipment
        const baseStats = this.characterService.getCharacterBaseStats(character);
        const cleanBaseStats = this.characterService.unequipEquipment(baseStats, equipOld);
        let statsWithNewEquip = this.characterService.applyEquipment(cleanBaseStats, equipNew);
        let finalStatsNew = this.characterService.recalculateTotalStats(statsWithNewEquip);
        const pvpResultNew = this.simulationService.simulatePvp(finalStatsNew, dummyEnemy);
        const resultNew = {
            survivalTime: pvpResultNew.time,
            totalDamageDealt: pvpResultNew.player1.totalDamageDealt,
            healthRemaining: pvpResultNew.player1.healthRemaining
        };

        return { resultNew, resultOld };
    }
}
