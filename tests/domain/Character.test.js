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
});
