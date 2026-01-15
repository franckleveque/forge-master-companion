// tests/temp_buff.test.js
import { Character } from '../src/domain/Character.js';
import { BuffSkill } from '../src/domain/skills/BuffSkill.js';
import { SimulationService } from '../src/domain/SimulationService.js';

describe('Refactored BuffSkill Integration Test', () => {
    it('should apply and expire buffs correctly using the unified activeSkills list', () => {
        const logs = [];
        const logFunction = (message) => logs.push(message);

        const buffSkill = new BuffSkill({
            healthBuff: 50,
            duration: 2,
            cooldown: 5,
        });
        // Start the skill off cooldown
        buffSkill.timer = 0;

        const character = new Character({
            name: 'Hero',
            baseHealth: 100,
            totalHealth: 100,
            maxHealth: 100,
            activeSkills: [buffSkill],
            logFunction,
        });

        const opponent = new Character({
            name: 'Opponent',
            baseHealth: 100,
            totalHealth: 100,
            maxHealth: 100,
        });
        character.enemy = opponent;
        opponent.enemy = character;

        // Tick 1 (t=1.0): Buff should trigger
        character.tick(1);
        expect(character.maxHealth).toBe(150);
        expect(character.health).toBe(150);

        // Tick 2 (t=2.0): Buff is still active
        character.tick(1);
        expect(character.maxHealth).toBe(150);

        // Tick 3 (t=3.0): Buff should expire
        character.tick(1);
        expect(character.maxHealth).toBe(100);

        // Verify logs for expiration message
        const expirationLog = logs.find(log => log.includes("buff expired"));
        expect(expirationLog).toContain("Hero's buff expired. Damage is now 0, Health is now 100/100.");
    });
});
