// tests/skills/DamageSkill.test.js

import { DamageSkill } from '../../src/domain/skills/DamageSkill.js';
import { Character } from '../../src/domain/Character.js';
import { SimulationService } from '../../src/domain/SimulationService.js';

describe('DamageSkill', () => {
    it('should deliver multi-hit attacks over consecutive ticks', () => {
        const logger = { log: jest.fn() };
        const simulation = new SimulationService(logger);

        const player1 = new Character({
            id: 'Player 1',
            name: 'Player 1',
            totalHealth: 10000,
            totalDamage: 0,
            activeSkills: [
                { type: 'damage', value: 100, cooldown: 1, hits: 3 }
            ]
        });

        const player2 = new Character({
            id: 'Player 2',
            name: 'Player 2',
            totalHealth: 10000,
            totalDamage: 0,
        });

        simulation.simulatePvp(player1, player2);

        const skillLogs = logger.log.mock.calls.filter(call => call[0].includes('uses a damage skill')).slice(0, 3);

        expect(skillLogs.length).toBe(3);
        expect(skillLogs[0][0]).toMatch(/\[\d+\.\d+\] Player 1 uses a damage skill for 100 damage. Player 2's health is now 9900./);
        expect(skillLogs[1][0]).toMatch(/\[\d+\.\d+\] Player 1 uses a damage skill for 100 damage. Player 2's health is now 9800./);
        expect(skillLogs[2][0]).toMatch(/\[\d+\.\d+\] Player 1 uses a damage skill for 100 damage. Player 2's health is now 9700./);

        const time1 = parseFloat(skillLogs[0][0].match(/\[(\d+\.\d+)\]/)[1]);
        const time2 = parseFloat(skillLogs[1][0].match(/\[(\d+\.\d+)\]/)[1]);
        const time3 = parseFloat(skillLogs[2][0].match(/\[(\d+\.\d+)\]/)[1]);

        expect(time1).toBe(1.01);
        expect(time2).toBeCloseTo(time1 + 0.01);
        expect(time3).toBeCloseTo(time2 + 0.01);
    });
});
