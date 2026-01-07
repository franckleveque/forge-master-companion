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
        // Run simulation for old equipment
        const characterOld = new Character({ ...character, name: 'Avec Équipement Actuel' });
        const dummyEnemyOld = this.createDummyEnemy(characterOld, 'Ennemi (vs Équipement Actuel)');
        const pvpResultOld = this.simulationService.simulatePvp(characterOld, dummyEnemyOld);
        const resultOld = {
            survivalTime: pvpResultOld.time,
            totalDamageDealt: pvpResultOld.player1.totalDamageDealt,
            healthRemaining: pvpResultOld.player1.healthRemaining,
            log: pvpResultOld.log
        };

        // Run simulation for new equipment
        const baseStats = this.characterService.getCharacterBaseStats(character);
        const cleanBaseStats = this.characterService.unequipEquipment(baseStats, equipOld);
        const statsWithNewEquip = this.characterService.applyEquipment(cleanBaseStats, equipNew);
        const finalStatsNew = this.characterService.recalculateTotalStats(statsWithNewEquip);

        const characterNew = new Character({ ...finalStatsNew, name: 'Avec Nouvel Équipement' });
        const dummyEnemyNew = this.createDummyEnemy(characterNew, 'Ennemi (vs Nouvel Équipement)');
        const pvpResultNew = this.simulationService.simulatePvp(characterNew, dummyEnemyNew);
        const resultNew = {
            survivalTime: pvpResultNew.time,
            totalDamageDealt: pvpResultNew.player1.totalDamageDealt,
            healthRemaining: pvpResultNew.player1.healthRemaining,
            log: pvpResultNew.log
        };

        return { resultNew, resultOld };
    }
}
