// src/domain/EquipmentComparisonService.js

import { Character } from "./Character.js";

export class EquipmentComparisonService {
    constructor(simulationService, characterService) {
        this.simulationService = simulationService;
        this.characterService = characterService;
    }

    createDummyEnemy(character) {
        const charCopy = JSON.parse(JSON.stringify(character));
        return new Character({
            id: 'Ennemi',
            totalDamage: charCopy.totalDamage,
            totalHealth: charCopy.totalHealth,
            weaponType: 'melee',
            activeSkills: [],
            basePassiveSkills: {}
        });
    }

    compare(character, equipNew, equipOld) {
        const initialCharacterState = JSON.parse(JSON.stringify(character));
        const dummyEnemy = this.createDummyEnemy(new Character(initialCharacterState));

        const baseStats = this.characterService.getCharacterBaseStats(initialCharacterState);
        const cleanBaseStats = this.characterService.unequipEquipment(baseStats, equipOld);
        const statsWithNewEquip = this.characterService.applyEquipment(cleanBaseStats, equipNew);
        const finalStatsNew = this.characterService.recalculateTotalStats(statsWithNewEquip);

        const characterForNewSim = new Character(finalStatsNew);
        characterForNewSim.id = "Avec Nouvel Équipement";
        const pvpResultNew = this.simulationService.simulatePvp(characterForNewSim, JSON.parse(JSON.stringify(dummyEnemy)));
        const resultNew = {
            survivalTime: pvpResultNew.time,
            totalDamageDealt: pvpResultNew.player1.totalDamageDealt,
            healthRemaining: pvpResultNew.player1.healthRemaining,
            log: pvpResultNew.log
        };

        const characterForOldSim = new Character(initialCharacterState);
        characterForOldSim.id = "Avec Équipement Actuel"; // Corrected typo
        const pvpResultOld = this.simulationService.simulatePvp(characterForOldSim, JSON.parse(JSON.stringify(dummyEnemy)));
        const resultOld = {
            survivalTime: pvpResultOld.time,
            totalDamageDealt: pvpResultOld.player1.totalDamageDealt,
            healthRemaining: pvpResultOld.player1.healthRemaining,
            log: pvpResultOld.log
        };

        return { resultNew, resultOld };
    }
}
