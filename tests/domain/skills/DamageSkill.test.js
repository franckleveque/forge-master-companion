// tests/domain/skills/DamageSkill.test.js

import { SimulationService } from '../../../src/domain/SimulationService.js';
import { Character } from '../../../src/domain/Character.js';
import { LoggerService } from '../../../src/infrastructure/LoggerService.js';

describe('DamageSkill Integration Test', () => {
    let simulationService;
    let logger;

    beforeEach(() => {
        logger = new LoggerService();
        simulationService = new SimulationService(logger);
    });

    test('Multi-hit damage skill should deal damage sequentially across different timestamps', () => {
        const player = new Character({
            id: 'Player',
            name: 'Player',
            totalHealth: 1000,
            activeSkills: [
                { type: 'damage', value: 10, hits: 3, cooldown: 0.1 }
            ]
        });

        const opponent = new Character({
            id: 'Opponent',
            name: 'Opponent',
            totalHealth: 1000
        });

        // Initialize skills to set initial cooldowns and states
        const [p1, p2] = simulationService._initializeFighters(player, opponent);
        p1.activeSkills.forEach(s => s.tick(s.cooldown)); // Make skill ready at time 0

        const { log } = simulationService.simulatePvp(p1, p2);

        const skillLogs = log.filter(l => l.includes('Player uses a damage skill for 10 damage'));

        // Check that all 3 hits were logged
        expect(skillLogs).toHaveLength(3);

        // Check that each hit has a unique timestamp
        const timestamps = skillLogs.map(l => l.match(/\[(\d+\.\d+)\]/)[1]);
        const uniqueTimestamps = [...new Set(timestamps)];

        expect(uniqueTimestamps).toHaveLength(3);

        // Check that the timestamps are sequential
        expect(parseFloat(uniqueTimestamps[0])).toBeCloseTo(0.01);
        expect(parseFloat(uniqueTimestamps[1])).toBeCloseTo(0.02);
        expect(parseFloat(uniqueTimestamps[2])).toBeCloseTo(0.03);
    });
});
