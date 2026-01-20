// tests/domain/Character.test.js
import { Character } from '../../src/domain/Character.js';

describe('Character', () => {
    describe('fromTotalStats', () => {
        it('should correctly calculate base stats from total stats with global modifiers', () => {
            const sheetStats = {
                totalDamage: 150,
                totalHealth: 2000,
                weaponType: 'a-distance',
                basePassiveSkills: {
                    'degats': 50,
                    'sante': 100
                }
            };
            const character = Character.fromTotalStats(sheetStats);
            expect(character.baseDamage).toBeCloseTo(100);
            expect(character.baseHealth).toBeCloseTo(1000);
        });

        it('should correctly calculate base stats with weapon-specific modifiers', () => {
            const sheetStats = {
                totalDamage: 170,
                totalHealth: 1000,
                weaponType: 'corp-a-corp',
                basePassiveSkills: {
                    'degats': 50,
                    'degats-corps-a-corps': 20
                }
            };
            const character = Character.fromTotalStats(sheetStats);
            expect(character.baseDamage).toBeCloseTo(100);
        });

        it('should handle zero modifiers correctly', () => {
            const sheetStats = {
                totalDamage: 100,
                totalHealth: 1000,
                weaponType: 'corp-a-corp',
                basePassiveSkills: {}
            };
            const character = Character.fromTotalStats(sheetStats);
            expect(character.baseDamage).toBeCloseTo(100);
            expect(character.baseHealth).toBeCloseTo(1000);
        });
    });
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
});
