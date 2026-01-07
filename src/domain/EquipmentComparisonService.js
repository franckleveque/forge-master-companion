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
        // Create the standard dummy enemy based on the original character. This ensures a fair comparison.
        const standardDummyEnemy = this.createDummyEnemy(character, 'Ennemi');

        // --- Step 1: Run simulation for OLD equipment FIRST ---
        // This uses the original, untouched `character` object, guaranteeing its state is not corrupted.
        const characterOld = new Character({ ...character, name: 'Avec Équipement Actuel' });
        const pvpResultOld = this.simulationService.simulatePvp(characterOld, new Character(standardDummyEnemy));

        // Correctly determine survivability.
        const survivalTimeOld = pvpResultOld.winner === characterOld.name ? Infinity : pvpResultOld.time;
        const resultOld = {
            survivalTime: survivalTimeOld,
            totalDamageDealt: pvpResultOld.player1.totalDamageDealt,
            healthRemaining: pvpResultOld.player1.healthRemaining,
            log: pvpResultOld.log
        };

        // --- Step 2: Now, calculate stats and run simulation for NEW equipment ---
        // This process can no longer corrupt the data for the first simulation.
        const baseStats = this.characterService.getCharacterBaseStats(character);
        const cleanBaseStats = this.characterService.unequipEquipment(baseStats, equipOld);
        const statsWithNewEquip = this.characterService.applyEquipment(cleanBaseStats, equipNew);
        const finalStatsNew = this.characterService.recalculateTotalStats(statsWithNewEquip);
        const characterNew = new Character({ ...finalStatsNew, name: 'Avec Nouvel Équipement' });

        const pvpResultNew = this.simulationService.simulatePvp(characterNew, new Character(standardDummyEnemy));
        const survivalTimeNew = pvpResultNew.winner === characterNew.name ? Infinity : pvpResultNew.time;
        const resultNew = {
            survivalTime: survivalTimeNew,
            totalDamageDealt: pvpResultNew.player1.totalDamageDealt,
            healthRemaining: pvpResultNew.player1.healthRemaining,
            log: pvpResultNew.log
        };

        return { resultNew, resultOld };
    }
}
