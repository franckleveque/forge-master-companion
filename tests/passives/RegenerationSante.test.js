import { RegenerationSante } from '../../src/domain/passives/RegenerationSante.js';

describe('RegenerationSante', () => {
    let character;

    beforeEach(() => {
        character = {
            maxHealth: 1000,
            health: 500,
            heal: jest.fn(function(amount) {
                const healedAmount = Math.min(this.maxHealth - this.health, amount);
                this.health += healedAmount;
                return healedAmount;
            }),
            _log: jest.fn(),
            id: 'Player'
        };
    });

    it('should call heal with the correct amount for 1 second', () => {
        const skill = new RegenerationSante(10); // 10%
        skill.onTick(character, 1.0);
        expect(character.heal).toHaveBeenCalledWith(100); // 10% of 1000
        expect(character._log).toHaveBeenCalledWith('Player regenerates 100 health from Regeneration. Now at 600 HP.');
    });

    it('should call heal with the correct amount for 0.5 seconds', () => {
        const skill = new RegenerationSante(10); // 10%
        skill.onTick(character, 0.5);
        expect(character.heal).toHaveBeenCalledWith(50); // 10% of 1000 * 0.5
        expect(character._log).toHaveBeenCalledWith('Player regenerates 50 health from Regeneration. Now at 550 HP.');
    });

    it('should not call heal if regeneration value is zero', () => {
        const skill = new RegenerationSante(0);
        skill.onTick(character, 1.0);
        expect(character.heal).not.toHaveBeenCalled();
    });

    it('should not call heal if regeneration value is negative', () => {
        const skill = new RegenerationSante(-10);
        skill.onTick(character, 1.0);
        expect(character.heal).not.toHaveBeenCalled();
    });
});
