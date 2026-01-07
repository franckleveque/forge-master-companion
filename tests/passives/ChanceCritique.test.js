import { ChanceCritique } from '../../src/domain/passives/ChanceCritique.js';

describe('ChanceCritique', () => {
    it('should return critical damage when crit counter is high enough', () => {
        const skill = new ChanceCritique(100);
        const attacker = {
            basePassiveSkills: {
                'chance-critique': 100,
                'degats-critiques': 50
            }
        };
        const result = skill.onModifyOutgoingDamage(attacker, null, 100);
        expect(result.damage).toBe(150);
        expect(result.isCrit).toBe(true);
    });

    it('should not return critical damage when crit counter is too low', () => {
        const skill = new ChanceCritique(0);
        const attacker = {
            basePassiveSkills: {
                'chance-critique': 0,
                'degats-critiques': 50
            }
        };
        const result = skill.onModifyOutgoingDamage(attacker, null, 100);
        expect(result.damage).toBe(100);
        expect(result.isCrit).toBe(false);
    });
});
