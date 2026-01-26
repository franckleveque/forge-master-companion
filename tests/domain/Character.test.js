// tests/domain/Character.test.js
import { Character } from '../../src/domain/Character.js';

describe('Character', () => {
    describe('recalculateTotalStats', () => {
        it('should correctly recalculate total stats from base stats and passives', () => {
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
            const finalStats = character.recalculateTotalStats();
            expect(finalStats.totalDamage).toBeCloseTo(170);
            expect(finalStats.totalHealth).toBeCloseTo(1500);
        });

        it('should correctly scale active skill base damage with passive modifiers', () => {
            const characterData = {
                baseDamage: 100,
                baseHealth: 1000,
                basePassiveSkills: { 'competence-degats': 50, 'degats': 20 },
                activeSkills: [
                    // This is a plain data object, not a skill instance
                    { type: 'damage', baseDamage: 10, baseHealth: 100 }
                ]
            };
            const character = new Character(characterData);
            const finalStats = character.recalculateTotalStats();
            // Expect: (baseDamage + (skill.baseDamage * competenceMod)) * degatsMod
            // (100 + (10 * 1.5)) * 1.2 = 115 * 1.2 = 138
            expect(finalStats.totalDamage).toBe(138);
        });

        it('should correctly apply temporary active skill instance modifiers during recalculation', () => {
            const characterData = {
                baseDamage: 100,
                baseHealth: 1000,
                basePassiveSkills: { 'degats': 20 }, // 1.2x damage
                activeSkills: [
                    // This mock skill instance adds a flat 50 damage and 200 health
                    { getStatModifiers: () => ({ damage: 50, health: 200 }) }
                ]
            };
            const character = new Character(characterData);
            character.recalculateTotalStats();
            // Expected Damage: (baseDamage * passiveModifier) + activeSkillModifier = (100 * 1.2) + 50 = 170
            expect(character.totalDamage).toBe(170);
             // Expected Health: (baseHealth * passiveModifier) + activeSkillModifier = (1000 * 1.0) + 200 = 1200
            expect(character.maxHealth).toBe(1200);
        });
    });
});
