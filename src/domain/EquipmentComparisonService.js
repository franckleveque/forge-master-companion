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
        // Create a single, standardized dummy enemy based on the initial character stats.
        const standardDummyEnemy = this.createDummyEnemy(character, 'Ennemi');

        // --- Simulation for old equipment ---
        const characterOld = new Character({ ...character, name: 'Avec Équipement Actuel' });
        const dummyEnemyOld = new Character(standardDummyEnemy); // Use a clone
        const pvpResultOld = this.simulationService.simulatePvp(characterOld, dummyEnemyOld);

        // Correctly determine survivability
        const survivalTimeOld = pvpResultOld.winner === characterOld.name ? Infinity : pvpResultOld.time;

        const resultOld = {
            survivalTime: survivalTimeOld,
            totalDamageDealt: pvpResultOld.player1.totalDamageDealt,
            healthRemaining: pvpResultOld.player1.healthRemaining,
            log: pvpResultOld.log
        };

        // --- Simulation for new equipment ---
        const baseStats = this.characterService.getCharacterBaseStats(character);
        const cleanBaseStats = this.characterService.unequipEquipment(baseStats, equipOld);
        const statsWithNewEquip = this.characterService.applyEquipment(cleanBaseStats, equipNew);
        const finalStatsNew = this.characterService.recalculateTotalStats(statsWithNewEquip);

        const characterNew = new Character({ ...finalStatsNew, name: 'Avec Nouvel Équipement' });
        const dummyEnemyNew = new Character(standardDummyEnemy); // Use a fresh clone
        const pvpResultNew = this.simulationService.simulatePvp(characterNew, dummyEnemyNew);

        // Correctly determine survivability
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
