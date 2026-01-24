// tests/domain/Character.test.js
import { Character } from '../../src/domain/Character.js';

describe('Character', () => {
    describe('recalculateStats', () => {
        it('should correctly recalculate total stats from base stats', () => {
            const characterStats = {
                baseDamage: 100,
                baseHealth: 1000,
                weaponType: 'corp-a-corp',
                basePassiveSkills: {
                    'degats': 50,
                    'sante': 50,
                    'degats-corps-a-corps': 20
                }
            };
            const character = new Character(characterStats);
            const finalStats = character.recalculateStats();
            expect(finalStats.totalDamage).toBeCloseTo(170);
            expect(finalStats.totalHealth).toBeCloseTo(1500);
        });

        it('should correctly scale active skill damage with passive modifiers', () => {
            const characterData = {
                baseDamage: 100,
                baseHealth: 1000,
                basePassiveSkills: { 'competence-degats': 50, 'degats': 20 },
                activeSkills: [
                    { type: 'damage', baseDamage: 10, baseHealth: 100 }
                ]
            };
            const character = new Character(characterData);
            const finalStats = character.recalculateStats();
            const expectedDamage = (100 + 10 * 1.5) * 1.2;
            expect(finalStats.totalDamage).toBe(expectedDamage);
        });
    });

    describe('fromTotalStats', () => {
        it('should correctly calculate base stats from total stats and passives', () => {
            const sheetStats = {
                totalDamage: 170,
                totalHealth: 1500,
                weaponType: 'corp-a-corp',
                basePassiveSkills: {
                    'degats': 50,
                    'sante': 50,
                    'degats-corps-a-corps': 20
                },
                activeSkills: []
            };

            const character = Character.fromTotalStats(sheetStats);

            expect(character.baseDamage).toBeCloseTo(100);
            expect(character.baseHealth).toBeCloseTo(1000);
        });

        it('should correctly factor in active skills when calculating base stats', () => {
            const sheetStats = {
                totalDamage: 138, // (100 base + 10 skill * 1.5 comp) * 1.2 degats = 138
                totalHealth: 1650, // (1000 base + 100 skill) * 1.5 sante = 1650
                basePassiveSkills: {
                    'degats': 20,
                    'sante': 50,
                    'competence-degats': 50
                },
                activeSkills: [
                    { baseDamage: 10, baseHealth: 100 }
                ]
            };

            const character = Character.fromTotalStats(sheetStats);

            expect(character.baseDamage).toBeCloseTo(100);
            expect(character.baseHealth).toBeCloseTo(1000);
        });
    });
});
