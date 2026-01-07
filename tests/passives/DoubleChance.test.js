import { DoubleChance } from '../../src/domain/passives/DoubleChance.js';

describe('DoubleChance', () => {
    it('should return true when double chance counter is high enough', () => {
        const skill = new DoubleChance(100);
        const attacker = {
            doubleChance: 1.0
        };
        const result = skill.onAfterAttackProcessed(attacker, null);
        expect(result).toBe(true);
    });

    it('should return false when double chance counter is too low', () => {
        const skill = new DoubleChance(0);
        const attacker = {
            doubleChance: 0
        };
        const result = skill.onAfterAttackProcessed(attacker, null);
        expect(result).toBe(false);
    });
});
