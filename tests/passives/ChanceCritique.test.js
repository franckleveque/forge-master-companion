import { ChanceCritique } from '../../src/domain/passives/ChanceCritique.js';

describe('ChanceCritique', () => {
    it('should apply critical damage and log the event when crit counter is high enough', () => {
        const skill = new ChanceCritique(100);
        const attacker = {
            id: 'Player',
            basePassiveSkills: {
                'chance-critique': 100,
                'degats-critiques': 50
            }
        };
        const mockLog = jest.fn();
        const damage = skill.onModifyOutgoingDamage(attacker, null, 100, mockLog);

        expect(damage).toBe(150);
        expect(mockLog).toHaveBeenCalledWith('Player lands a Critical Strike!');
    });

    it('should not apply critical damage or log when crit counter is too low', () => {
        const skill = new ChanceCritique(0);
        const attacker = {
            id: 'Player',
            basePassiveSkills: {
                'chance-critique': 0,
                'degats-critiques': 50
            }
        };
        const mockLog = jest.fn();
        const damage = skill.onModifyOutgoingDamage(attacker, null, 100, mockLog);

        expect(damage).toBe(100);
        expect(mockLog).not.toHaveBeenCalled();
    });
});
