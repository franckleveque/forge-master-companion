import { VolDeVie } from '../../src/domain/passives/VolDeVie.js';

describe('VolDeVie', () => {
    let attacker;

    beforeEach(() => {
        attacker = {
            health: 50,
            heal: jest.fn(function(amount) {
                const healedAmount = Math.min(this.maxHealth - this.health, amount);
                this.health += healedAmount;
                return healedAmount;
            }),
            _log: jest.fn(),
            id: 'Player',
            maxHealth: 100
        };
    });

    it('should call heal with the correct lifesteal amount', () => {
        const skill = new VolDeVie(50); // 50% lifesteal
        skill.onAfterAttackDealt(attacker, null, 100); // 100 damage dealt
        expect(attacker.heal).toHaveBeenCalledWith(50);
        expect(attacker._log).toHaveBeenCalledWith('Player lifesteals 50 health from Lifesteal. Now at 100 HP.');
    });

    it('should not call heal if damage dealt is zero', () => {
        const skill = new VolDeVie(50);
        skill.onAfterAttackDealt(attacker, null, 0);
        expect(attacker.heal).not.toHaveBeenCalled();
    });

    it('should not call heal if lifesteal value is zero', () => {
        const skill = new VolDeVie(0);
        skill.onAfterAttackDealt(attacker, null, 100);
        expect(attacker.heal).not.toHaveBeenCalled();
    });

    it('should not call heal if lifesteal value is negative', () => {
        const skill = new VolDeVie(-50);
        skill.onAfterAttackDealt(attacker, null, 100);
        expect(attacker.heal).not.toHaveBeenCalled();
    });
});
