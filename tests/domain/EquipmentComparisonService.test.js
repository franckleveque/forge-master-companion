// tests/domain/EquipmentComparisonService.test.js

import { EquipmentComparisonService } from '../../src/domain/EquipmentComparisonService.js';
import { Character } from '../../src/domain/Character.js';
import { Equipment } from '../../src/domain/Equipment.js';

describe('EquipmentComparisonService', () => {
    let simulationService;
    let characterService;
    let service;

    beforeEach(() => {
        simulationService = {
            simulatePvp: jest.fn().mockReturnValue({
                time: 10,
                player1: { totalDamageDealt: 100, healthRemaining: 50 },
                log: []
            })
        };
        characterService = {
            getCharacterBaseStats: jest.fn(c => new Character(c)),
            unequipEquipment: jest.fn(c => new Character(c)),
            applyEquipment: jest.fn(c => new Character(c)),
            recalculateTotalStats: jest.fn(c => new Character(c))
        };
        service = new EquipmentComparisonService(simulationService, characterService);
    });

    test('should run two simulations', () => {
        const character = new Character({ id: 'Player', totalHealth: 10000, totalDamage: 1000 });
        const equipNew = new Equipment({ damage: 200 });
        const equipOld = new Equipment({ damage: 100 });

        service.compare(character, equipNew, equipOld);

        expect(simulationService.simulatePvp).toHaveBeenCalledTimes(2);
    });

    test('should return results for both simulations', () => {
        const character = new Character({ id: 'Player', totalHealth: 10000, totalDamage: 1000 });
        const equipNew = new Equipment({ damage: 200 });
        const equipOld = new Equipment({ damage: 100 });

        const results = service.compare(character, equipNew, equipOld);

        expect(results.resultNew).toBeDefined();
        expect(results.resultOld).toBeDefined();
        expect(results.resultNew.totalDamageDealt).toBe(100);
    });

    // This test is updated to reflect the new simulation order and character ID assignment
    test('should run simulations in the correct order (new then old)', () => {
        const character = new Character({ id: 'Player', totalHealth: 10000, totalDamage: 1000 });
        const equipNew = new Equipment({ damage: 200 });
        const equipOld = new Equipment({ damage: 100 });

        service.compare(character, equipNew, equipOld);

        const callOrder = simulationService.simulatePvp.mock.calls;

        // The first call should be for the character with the new equipment
        expect(callOrder[0][0].id).toBe('Player (New Equip)');

        // The second call should be for the character with the old equipment
        expect(callOrder[1][0].id).toBe('Player (Old Equip)');
    });
});
