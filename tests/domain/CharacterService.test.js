// tests/domain/CharacterService.test.js

import { CharacterService } from '../../src/domain/CharacterService.js';

describe('CharacterService', () => {
    let characterService;

    beforeEach(() => {
        characterService = new CharacterService();
    });

    describe('createDummyOpponent', () => {
        it('should create a dummy opponent with the correct stats', () => {
            const playerStats = {
                totalDamage: 1000,
                totalHealth: 10000
            };

            const opponent = characterService.createDummyOpponent(playerStats);

            expect(opponent.name).toBe('Opponent');
            expect(opponent.totalDamage).toBe(1000);
            expect(opponent.totalHealth).toBe(10000);
            expect(opponent.weaponType).toBe('corp-a-corp');
            expect(opponent.basePassiveSkills).toEqual({});
            expect(opponent.activeSkills).toEqual([]);
        });
    });
});
