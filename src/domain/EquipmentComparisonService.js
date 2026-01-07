// src/domain/EquipmentComparisonService.js

import { Character } from "./Character.js";

export class EquipmentComparisonService {
    constructor(simulationService, characterService) {
        this.simulationService = simulationService;
        this.characterService = characterService;
    }

    createDummyEnemy(character) {
        // Use a deep copy to ensure the dummy is not affected by character mutations
        const charCopy = JSON.parse(JSON.stringify(character));
        return new Character({
            id: 'dummy', // Give it an ID for clarity in logs
            totalDamage: charCopy.totalDamage,
            totalHealth: charCopy.totalHealth,
            weaponType: 'melee', // Dummy has a default weapon type
            activeSkills: [],
            basePassiveSkills: {}
        });
    }

    compare(character, equipNew, equipOld) {
        // --- ISOLATION & PREPARATION ---
        const initialCharacterState = JSON.parse(JSON.stringify(character));
        const dummyEnemy = this.createDummyEnemy(new Character(initialCharacterState));

        // --- SIMULATION A: NEW EQUIPMENT ---
        const baseStats = this.characterService.getCharacterBaseStats(initialCharacterState);
        const cleanBaseStats = this.characterService.unequipEquipment(baseStats, equipOld);
        const statsWithNewEquip = this.characterService.applyEquipment(cleanBaseStats, equipNew);
        const finalStatsNew = this.characterService.recalculateTotalStats(statsWithNewEquip);

        const characterForNewSim = new Character(finalStatsNew);
        characterForNewSim.id = "Player (New Equip)"; // Assign a clear ID for logs
        const pvpResultNew = this.simulationService.simulatePvp(characterForNewSim, JSON.parse(JSON.stringify(dummyEnemy)));
        const resultNew = {
            survivalTime: pvpResultNew.time,
            totalDamageDealt: pvpResultNew.player1.totalDamageDealt,
            healthRemaining: pvpResultNew.player1.healthRemaining,
            log: pvpResultNew.log // Pass the log up
        };

        // --- SIMULATION B: OLD EQUIPMENT ---
        const characterForOldSim = new Character(initialCharacterState);
        characterForOldSim.id = "Player (Old Equip)"; // Assign a clear ID for logs
        const pvpResultOld = this.simulationService.simulatePvp(characterForOldSim, JSON.parse(JSON.stringify(dummyEnemy)));
        const resultOld = {
            survivalTime: pvpResultOld.time,
            totalDamageDealt: pvpResultOld.player1.totalDamageDealt,
            healthRemaining: pvpResultOld.player1.healthRemaining,
            log: pvpResultOld.log // Pass the log up
        };

        return { resultNew, resultOld };
    }
}
