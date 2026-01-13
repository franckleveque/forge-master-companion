// tests/domain/skills/BuffSkill.test.js
import { BuffSkill } from '../../../src/domain/skills/BuffSkill.js';
import { Character } from '../../../src/domain/Character.js';

describe('BuffSkill', () => {
    test('should apply buff, log correctly, and remove buff after duration', () => {
        const logFunction = jest.fn();
        const character = new Character({
            id: 'Caster',
            baseDamage: 100,
            baseHealth: 1000,
            totalDamage: 100,
            totalHealth: 1000,
            maxHealth: 1000,
            logFunction: logFunction,
        });

        const skill = new BuffSkill({ damageBuff: 20, healthBuff: 200, duration: 5, cooldown: 10 });
        character.activeSkills.push(skill);

        // 1. Trigger the skill
        skill.trigger(character);

        // 2. Verify stats are buffed and log is correct
        expect(character.totalDamage).toBe(120);
        expect(character.maxHealth).toBe(1200);
        expect(character.health).toBe(1200);
        expect(logFunction).toHaveBeenCalledWith("Caster uses a buff skill. Damage is now 120, Health is now 1200/1200.");

        // 3. Simulate time passing for the duration of the buff
        for (let i = 0; i < 500; i++) { // 5 seconds
            character.tick(0.01);
        }

        // 4. Verify stats have reverted and buff expiration is logged
        expect(character.totalDamage).toBe(100);
        expect(character.maxHealth).toBe(1000);
        expect(character.health).toBe(1000);
        expect(logFunction).toHaveBeenCalledWith("Caster's buff expired. Damage is now 100, Health is now 1000/1000.");
    });
});
