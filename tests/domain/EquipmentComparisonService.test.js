// tests/domain/EquipmentComparisonService.test.js

import { EquipmentComparisonService } from '../../src/domain/EquipmentComparisonService.js';
import { Character } from '../../src/domain/Character.js';
import { Equipment } from '../../src/domain/Equipment.js';

describe('EquipmentComparisonService', () => {
    let simulationService;
    let characterService;
    let service;
    let character;
    let equipNew;
    let equipOld;

    beforeEach(() => {
        // Mock the simulation service to return a predictable result
        simulationService = {
            simulatePvp: jest.fn().mockImplementation((player1, player2) => ({
                winner: player2.name, // Let's assume the one with the new equipment always wins
                time: 15.5,
                player1: { name: player1.name, totalDamageDealt: 100, healthRemaining: 50, maxHealth: 10000 },
                player2: { name: player2.name, totalDamageDealt: 120, healthRemaining: 200, maxHealth: 11000 },
                log: ["Simulation log..."]
            }))
        };

        // Mock the character service to return a character with updated stats
        characterService = {
            getCharacterBaseStats: jest.fn(c => new Character(c)),
            unequipEquipment: jest.fn(c => new Character(c)),
            applyEquipment: jest.fn((c, e) => new Character({ ...c, totalDamage: c.totalDamage + e.damage, totalHealth: c.totalHealth + e.health })),
            recalculateTotalStats: jest.fn(c => new Character(c))
        };

        service = new EquipmentComparisonService(simulationService, characterService);

        // Define standard test data
        character = new Character({ name: 'Player', totalHealth: 10000, totalDamage: 1000 });
        equipNew = new Equipment({ damage: 200, health: 1000 });
        equipOld = new Equipment({ damage: 100, health: 500 });
    });

    test('should run a single simulation', () => {
        service.compare(character, equipNew, equipOld);
        expect(simulationService.simulatePvp).toHaveBeenCalledTimes(1);
    });

    test('should simulate a fight between "Old Equip" and "New Equip"', () => {
        service.compare(character, equipNew, equipOld);

        const call = simulationService.simulatePvp.mock.calls[0];
        const player1 = call[0];
        const player2 = call[1];

        expect(player1.name).toBe('Old Equip');
        expect(player2.name).toBe('New Equip');
    });

    test('should correctly configure the "New Equip" character', () => {
        service.compare(character, equipNew, equipOld);

        expect(characterService.getCharacterBaseStats).toHaveBeenCalledWith(character);
        expect(characterService.unequipEquipment).toHaveBeenCalled();
        expect(characterService.applyEquipment).toHaveBeenCalledWith(expect.any(Character), equipNew);
        expect(characterService.recalculateTotalStats).toHaveBeenCalled();
    });

    test('should return the direct result from the simulation service', () => {
        const result = service.compare(character, equipNew, equipOld);

        expect(result).toBeDefined();
        expect(result.winner).toBe('New Equip');
        expect(result.player1.name).toBe('Old Equip');
        expect(result.player2.name).toBe('New Equip');
        expect(result.log).toEqual(["Simulation log..."]);
    });
});
