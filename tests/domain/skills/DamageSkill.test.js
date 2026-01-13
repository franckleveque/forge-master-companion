// tests/domain/skills/DamageSkill.test.js
import { DamageSkill } from '../../../src/domain/skills/DamageSkill.js';
import { Character } from '../../../src/domain/Character.js';

describe('DamageSkill', () => {
    test('should log the correct damage and remaining health', () => {
        const logFunction = jest.fn();
        const attacker = new Character({
            id: 'Attacker',
            totalDamage: 100,
            logFunction: logFunction,
        });
        const target = new Character({
            id: 'Target',
            totalHealth: 200,
        });
        attacker.enemy = target;

        const skill = new DamageSkill({ value: 50, hits: 1 });
        skill.trigger(attacker);

        expect(logFunction).toHaveBeenCalledWith("Attacker uses a damage skill for 50 damage. Target's health is now 150.");
        expect(target.health).toBe(150);
    });

    test('should log the correct damage and remaining health with decimals', () => {
        const logFunction = jest.fn();
        const attacker = new Character({
            id: 'Attacker',
            totalDamage: 100,
            logFunction: logFunction,
        });
        const target = new Character({
            id: 'Target',
            totalHealth: 200.5,
        });
        target.health = 200.5;
        attacker.enemy = target;

        const skill = new DamageSkill({ value: 50, hits: 1 });
        skill.trigger(attacker);

        expect(logFunction).toHaveBeenCalledWith("Attacker uses a damage skill for 50 damage. Target's health is now 151.");
        expect(target.health).toBe(150.5);
    });
});
