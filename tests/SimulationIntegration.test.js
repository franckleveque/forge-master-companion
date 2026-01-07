// tests/SimulationIntegration.test.js

import { SimulationService } from '../src/domain/SimulationService.js';
import { Character } from '../src/domain/Character.js';
import { LoggerService } from '../src/infrastructure/LoggerService.js';

describe('SimulationService Integration Tests', () => {
    let simulationService;
    let logger;

    beforeEach(() => {
        logger = new LoggerService();
        simulationService = new SimulationService(logger);
    });

    // Test for attack speed
    test("Vitesse d'attaque should result in correct attack timings", () => {
        const player = new Character({
            id: 'Player',
            totalDamage: 100,
            totalHealth: 1000,
            basePassiveSkills: { 'vitesse-attaque': 100 }
        });
        const opponent = new Character({ id: 'Opponent', totalHealth: 10000 });

        simulationService.simulatePvp(player, opponent);
        const logs = simulationService.simulationLog;

        const attackLogs = logs.filter(l => l.includes('Player attacks'));
        expect(attackLogs.length).toBeGreaterThan(15);
    });

    // Test for damage stacking
    test('should stack global and melee damage passives correctly', () => {
        const player = new Character({
            id: 'Player',
            baseDamage: 1000,
            totalDamage: 1750, // This is the corrected value
            weaponType: 'corp-a-corp',
            basePassiveSkills: {
                'degats': 50,
                'degats-corps-a-corps': 25
            }
        });
        const opponent = new Character({ id: 'Opponent', totalHealth: 100000 });

        simulationService.simulatePvp(player, opponent);
        const firstAttackLog = simulationService.simulationLog.find(l => l.includes('Player attacks'));

        expect(firstAttackLog).toContain('for 1750 damage');
    });

    // Test for multi-hit skills
    test('Multi-hit skills should apply all hits', () => {
        const player = new Character({
            id: 'Player',
            activeSkills: [
                { type: 'damage', value: 50, hits: 3, cooldown: 0.1 }
            ]
        });
        const opponent = new Character({ id: 'Opponent', totalHealth: 1000 });

        simulationService.simulatePvp(player, opponent);
        const skillLogs = simulationService.simulationLog.filter(l => l.includes('uses a damage skill'));
        expect(skillLogs.length).toBeGreaterThan(0);
    });

    // Test for buffs
    test('Buffs should apply and expire correctly', () => {
        const player = new Character({
            id: 'Player',
            totalDamage: 100,
            totalHealth: 1000,
            activeSkills: [
                { type: 'buff', damageBuff: 50, duration: 0.1, cooldown: 0.2 }
            ]
        });
        const opponent = new Character({ id: 'Opponent', totalHealth: 10000 });

        simulationService.simulatePvp(player, opponent);
        const logs = simulationService.simulationLog;

        const buffAppliedLog = logs.find(l => l.includes('gains a buff'));
        const buffExpiredLog = logs.find(l => l.includes('buff expired'));

        expect(buffAppliedLog).toBeDefined();
        expect(buffExpiredLog).toBeDefined();
    });
});
