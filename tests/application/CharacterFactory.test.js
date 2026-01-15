// tests/application/CharacterFactory.test.js

import { CharacterFactory } from '../../src/application/CharacterFactory';

describe('CharacterFactory', () => {
    let characterFactory;

    beforeEach(() => {
        characterFactory = new CharacterFactory();
    });

    describe('create', () => {
        it('should correctly calculate base stats from total stats with global modifiers', () => {
            const sheetStats = {
                totalDamage: 120,
                totalHealth: 1100,
                basePassiveSkills: {
                    'degats': 20,
                    'sante': 10
                }
            };
            const character = characterFactory.create(sheetStats);
            expect(character.baseDamage).toBeCloseTo(100);
            expect(character.baseHealth).toBeCloseTo(1000);
        });

        it('should correctly calculate base stats with weapon-specific modifiers', () => {
            const sheetStats = {
                totalDamage: 130,
                totalHealth: 1000,
                weaponType: 'corp-a-corp',
                basePassiveSkills: {
                    'degats': 10,
                    'degats-corps-a-corps': 20
                }
            };
            const character = characterFactory.create(sheetStats);
            expect(character.baseDamage).toBeCloseTo(100);
        });

        it('should handle zero modifiers correctly', () => {
            const sheetStats = {
                totalDamage: 100,
                totalHealth: 1000,
                basePassiveSkills: {}
            };
            const character = characterFactory.create(sheetStats);
            expect(character.baseDamage).toBeCloseTo(100);
            expect(character.baseHealth).toBeCloseTo(1000);
        });
    });
});
