// src/domain/EquipmentComparisonService.js

import { Character } from "./Character.js";

export class EquipmentComparisonService {
    constructor(simulationService, characterService) {
        this.simulationService = simulationService;
        this.characterService = characterService;
    }

    createDummyEnemy(character, name) {
        return new Character({
            name: name,
            totalDamage: character.totalDamage,
            totalHealth: character.totalHealth,
            weaponType: 'melee',
            activeSkills: [],
            basePassiveSkills: {}
        });
    }

    compare(character, equipNew, equipOld) {
        // Create a deep copy of the character's data for the new equipment calculation.
        // This is crucial to prevent mutating the original `character` object, which is needed for the "old equipment" simulation.
        const characterDataForNew = JSON.parse(JSON.stringify(character));

        // Perform all calculations for the new equipment on the copied data.
        const baseStats = this.characterService.getCharacterBaseStats(characterDataForNew);
        const cleanBaseStats = this.characterService.unequipEquipment(baseStats, equipOld);
        const statsWithNewEquip = this.characterService.applyEquipment(cleanBaseStats, equipNew);
        const finalStatsNew = this.characterService.recalculateTotalStats(statsWithNewEquip);
        const characterNew = new Character({ ...finalStatsNew, name: 'Avec Nouvel Équipement' });

        // Create the standard dummy enemy based on the ORIGINAL character with OLD equipment. This is the baseline for a fair comparison.
        const standardDummyEnemy = this.createDummyEnemy(character, 'Ennemi');

        // --- Run simulation for NEW equipment vs. the standard enemy ---
        const pvpResultNew = this.simulationService.simulatePvp(characterNew, new Character(standardDummyEnemy));
        // Survivability is infinite if the player wins; otherwise, it's the fight duration.
        const survivalTimeNew = pvpResultNew.winner === characterNew.name ? Infinity : pvpResultNew.time;
        const resultNew = {
            survivalTime: survivalTimeNew,
            totalDamageDealt: pvpResultNew.player1.totalDamageDealt,
            healthRemaining: pvpResultNew.player1.healthRemaining,
            log: pvpResultNew.log
        };

        // --- Run simulation for OLD equipment vs. the standard enemy ---
        // Use the original, untouched `character` object to ensure its state was not corrupted.
        const characterOld = new Character({ ...character, name: 'Avec Équipement Actuel' });
        const pvpResultOld = this.simulationService.simulatePvp(characterOld, new Character(standardDummyEnemy));
        const survivalTimeOld = pvpResultOld.winner === characterOld.name ? Infinity : pvpResultOld.time;
        const resultOld = {
            survivalTime: survivalTimeOld,
            totalDamageDealt: pvpResultOld.player1.totalDamageDealt,
            healthRemaining: pvpResultOld.player1.healthRemaining,
            log: pvpResultOld.log
        };

        return { resultNew, resultOld };
    }
}
