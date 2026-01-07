// tests/domain/EquipmentComparisonService.test.js

import { EquipmentComparisonService } from '../../src/domain/EquipmentComparisonService.js';
import { Character } from '../../src/domain/Character.js';
import { Equipment } from '../../src/domain/Equipment.js';
import { SimulationService } from '../../src/domain/SimulationService.js';
import { CharacterService } from '../../src/domain/CharacterService.js';

// Mock dependencies
jest.mock('../../src/domain/SimulationService.js');
jest.mock('../../src/domain/CharacterService.js');

describe('EquipmentComparisonService', () => {
    let simulationService;
    let characterService;
    let service;
    let character;
    const mockPvpResult = {
        time: 50,
        player1: { totalDamageDealt: 5000, healthRemaining: 2500 },
        player2: { totalDamageDealt: 4000 }
    };

    beforeEach(() => {
        simulationService = new SimulationService();
        characterService = new CharacterService();
        service = new EquipmentComparisonService(simulationService, characterService);
        character = new Character({
            totalDamage: 1000,
            totalHealth: 10000,
            weaponType: 'melee',
            basePassiveSkills: {},
            activeSkills: []
        });

        // Mock CharacterService methods
        characterService.getCharacterBaseStats.mockImplementation(c => ({...c}));
        characterService.unequipEquipment.mockImplementation(c => ({...c}));
        characterService.applyEquipment.mockImplementation((c, e) => ({ ...c, equipment: e }));
        characterService.recalculateTotalStats.mockImplementation(c => ({...c}));

        // Mock SimulationService
        simulationService.simulatePvp.mockReturnValue(mockPvpResult);
    });

    test('should create a dummy enemy as a Character object with correct stats', () => {
        const dummy = service.createDummyEnemy(character);
        expect(dummy).toBeInstanceOf(Character);
        expect(dummy.totalDamage).toBe(character.totalDamage);
        expect(dummy.totalHealth).toBe(character.totalHealth);
        expect(dummy.weaponType).toBe('melee');
        expect(dummy.activeSkills).toEqual([]);
        expect(dummy.basePassiveSkills).toEqual({});
    });

    test('should run simulations in the correct order (old then new)', () => {
        const equipNew = new Equipment({ damage: 100 });
        const equipOld = new Equipment({ damage: 50 });
        const callOrder = [];

        simulationService.simulatePvp.mockImplementation((player, enemy) => {
            callOrder.push(player);
            return mockPvpResult;
        });

        service.compare(character, equipNew, equipOld);

        expect(simulationService.simulatePvp).toHaveBeenCalledTimes(2);
        expect(callOrder[0]).toBe(character); // Initial character for old equipment
        expect(callOrder[1]).toEqual(expect.objectContaining({ equipment: equipNew })); // New character for new equipment
    });

    test('should correctly pass character and dummy enemy to pvp simulation', () => {
        const equipNew = new Equipment({ damage: 100 });
        const equipOld = new Equipment({ damage: 50 });

        service.compare(character, equipNew, equipOld);

        expect(simulationService.simulatePvp).toHaveBeenCalledWith(
            character,
            expect.any(Character)
        );
        expect(simulationService.simulatePvp).toHaveBeenCalledWith(
            expect.objectContaining({ equipment: equipNew }),
            expect.any(Character)
        );
    });

    test('should return formatted results from pvp simulations', () => {
        const equipNew = new Equipment({ damage: 100 });
        const equipOld = new Equipment({ damage: 50 });

        const results = service.compare(character, equipNew, equipOld);

        expect(results.resultNew).toEqual({
            survivalTime: mockPvpResult.time,
            totalDamageDealt: mockPvpResult.player1.totalDamageDealt,
            healthRemaining: mockPvpResult.player1.healthRemaining
        });
        expect(results.resultOld).toEqual({
            survivalTime: mockPvpResult.time,
            totalDamageDealt: mockPvpResult.player1.totalDamageDealt,
            healthRemaining: mockPvpResult.player1.healthRemaining
        });
    });
});
