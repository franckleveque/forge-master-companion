// tests/domain/SimulationService.test.js

import { SimulationService } from '../../src/domain/SimulationService.js';
import { LoggerService } from '../../src/infrastructure/LoggerService.js';
import { Character } from '../../src/domain/Character.js';
import { DamageSkill } from '../../src/domain/Skills.js';

describe('SimulationService', () => {
    let logger;
    let simulationService;

    beforeEach(() => {
        logger = new LoggerService();
        simulationService = new SimulationService(logger);
    });

    test('should log events during a PvP simulation', () => {
        const player = new Character({ name: 'Player', totalHealth: 100, totalDamage: 10, basePassiveSkills: {}, activeSkills: [] });
        const opponent = new Character({ name: 'Opponent', totalHealth: 100, totalDamage: 10, basePassiveSkills: {}, activeSkills: [] });

        simulationService.simulatePvp(player, opponent);
        const logs = logger.getLogs();

        expect(logs.length).toBeGreaterThan(0);
        expect(logs[0]).toContain('Player starts with 100 health.');
        expect(logs[1]).toContain('Opponent starts with 100 health.');
        expect(logs.some(log => log.includes('attacks'))).toBe(true);
        expect(logs[logs.length - 1]).toContain('Simulation ended.');
    });

    test('should log events during an equipment comparison simulation', () => {
        const stats = {
            totalHealth: 100,
            totalDamage: 10,
            basePassiveSkills: {},
            activeSkills: [],
            enemy: { dps: 10, weaponType: 'corp-a-corp' }
        };

        simulationService.simulate(stats);
        const logs = logger.getLogs();

        expect(logs.length).toBeGreaterThan(0);
        expect(logs[0]).toContain('Player starts with 100 health.');
        expect(logs.some(log => log.includes('Player attacks'))).toBe(true);
        expect(logs.some(log => log.includes('Enemy attacks'))).toBe(true);
        expect(logs[logs.length - 1]).toContain('Simulation ended.');
    });

    test('should log active skill usage', () => {
        const player = new Character({
            name: 'Player',
            totalHealth: 100,
            totalDamage: 10,
            basePassiveSkills: {},
            activeSkills: [new DamageSkill({ value: 20, cooldown: 0.1, hits: 1 })]
        });
        const opponent = new Character({ name: 'Opponent', totalHealth: 100, totalDamage: 10, basePassiveSkills: {}, activeSkills: [] });

        simulationService.simulatePvp(player, opponent);
        const logs = logger.getLogs();

        expect(logs.some(log => log.includes('uses a damage skill'))).toBe(true);
    });
});
