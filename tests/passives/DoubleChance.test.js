import { DoubleChance } from '../../src/domain/passives/DoubleChance.js';

describe('DoubleChance', () => {
    it('should return true and log when double chance counter is high enough', () => {
        const skill = new DoubleChance(100);
        const attacker = {
            id: 'Player',
            basePassiveSkills: {
                'double-chance': 100
            }
        };
        const mockLog = jest.fn();
        const result = skill.onAfterAttackProcessed(attacker, null, mockLog);

        expect(result).toBe(true);
        expect(mockLog).toHaveBeenCalledWith('Player performs an extra attack from Double Chance!');
    });

    it('should return false and not log when double chance counter is too low', () => {
        const skill = new DoubleChance(0);
        const attacker = {
            id: 'Player',
            basePassiveSkills: {
                'double-chance': 0
            }
        };
        const mockLog = jest.fn();
        const result = skill.onAfterAttackProcessed(attacker, null, mockLog);

        expect(result).toBe(false);
        expect(mockLog).not.toHaveBeenCalled();
    });
});
