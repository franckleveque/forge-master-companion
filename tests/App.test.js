// tests/App.test.js

import { CharacterService } from '../src/domain/CharacterService.js';
import { UiService } from '../src/infrastructure/UiService.js';
import { DomAdapter } from '../src/adapters/DomAdapter.js';
import { SimulationService } from '../src/domain/SimulationService.js';
import { FileService } from '../src/infrastructure/FileService.js';
import { PassiveSkillService } from '../src/domain/PassiveSkillService.js';
import { LoggerService } from '../src/infrastructure/LoggerService.js';

// Mock the services
jest.mock('../src/domain/CharacterService.js');
jest.mock('../src/infrastructure/UiService.js');
jest.mock('../src/adapters/DomAdapter.js');
jest.mock('../src/domain/SimulationService.js');
jest.mock('../src/infrastructure/FileService.js');
jest.mock('../src/domain/PassiveSkillService.js');
jest.mock('../src/infrastructure/LoggerService.js');

describe('App', () => {
    let characterService;
    let uiService;
    let domAdapter;
    let simulationService;
    let fileService;
    let passiveSkillService;
    let loggerService;

    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();

        // Create new instances of the mocked services
        characterService = new CharacterService();
        uiService = new UiService();
        domAdapter = new DomAdapter();
        simulationService = new SimulationService();
        fileService = new FileService();
        passiveSkillService = new PassiveSkillService();
        loggerService = new LoggerService();

        // Mock the return values of the services
        passiveSkillService.getPassiveSkillIds.mockReturnValue([]);
        domAdapter.getCharacterStatsPvp.mockReturnValue({
            totalDamage: 1000,
            totalHealth: 10000,
            weaponType: 'corp-a-corp',
            basePassiveSkills: {},
            activeSkills: []
        });
        characterService.getCharacterBaseStats.mockImplementation(stats => stats);
        domAdapter.getEquipment.mockReturnValue({});
        characterService.unequipEquipment.mockImplementation(stats => stats);
        characterService.applyEquipment.mockImplementation(stats => stats);
        characterService.recalculateTotalStats.mockImplementation(stats => stats);
        simulationService.simulate.mockReturnValue({
            survivalTime: 60,
            player1: { totalDamageDealt: 100000 }
        });

        // Set up the DOM
        document.body.innerHTML = `
            <button id="compare-button"></button>
            <div id="results-output"></div>
            <div id="log-content-equipment"></div>
        `;

        // Mock the UiService to return the compare button
        uiService.compareButton = document.getElementById('compare-button');

    });

    it('should create a dummy opponent with the correct stats', () => {
        jest.isolateModules(() => {
            // Dynamically import the App to run the event listener setup
            require('../src/application/App.js');
        });

        // Trigger the click event
        uiService.compareButton.click();

        // Check that the simulation service was called with the correct opponent stats
        expect(simulationService.simulate).toHaveBeenCalledTimes(2);
        const firstCall = simulationService.simulate.mock.calls[0];
        const secondCall = simulationService.simulate.mock.calls[1];
        const opponent = firstCall[1];

        expect(opponent.name).toBe('Opponent');
        expect(opponent.totalDamage).toBe(1000);
        expect(opponent.totalHealth).toBe(10000);
        expect(opponent.weaponType).toBe('corp-a-corp');
        expect(opponent.basePassiveSkills).toEqual({});
        expect(opponent.activeSkills).toEqual([]);

        expect(secondCall[1]).toEqual(opponent);
    });
});
