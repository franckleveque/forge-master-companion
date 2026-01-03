// tests/passives/suites/vol-de-vie.test.js
import assert from 'assert';
import { SimulationService } from '../../../src/domain/SimulationService.js';
import { createTestCharacter } from '../test-helper.js';

export const volDeVieTests = {
    "Vol de Vie (Lifesteal)": {
        'should heal for 50% of damage dealt with 50% lifesteal': () => {
            const character = createTestCharacter({ 'vol-de-vie': 50 });
            const simulationService = new SimulationService();
            const p1 = simulationService._calculateCharacterStats(character);
            p1.currentHealth = 500;

            const damageDealt = p1.finalDamage;
            p1.passiveSkills.find(s => s.id === 'vol-de-vie').onAfterAttackDealt(p1, null, damageDealt);

            const expectedHealth = 500 + (damageDealt * 0.5);
            assert.strictEqual(p1.currentHealth, expectedHealth, `Expected health to be ${expectedHealth}, but got ${p1.currentHealth}`);
        },
        'should calculate lifesteal based on critical strike damage': () => {
             const character = createTestCharacter({ 'vol-de-vie': 50, 'chance-critique': 100, 'degats-critiques': 50 });
             const simulationService = new SimulationService();
             const p1 = simulationService._calculateCharacterStats(character);
             p1.currentHealth = 500;

             let damage = p1.finalDamage;
             p1.passiveSkills.forEach(s => {
                 damage = s.onModifyOutgoingDamage(p1, null, damage);
             });
             p1.passiveSkills.forEach(s => {
                 s.onAfterAttackDealt(p1, null, damage);
             });

             const expectedHealth = 500 + (100 * 2.0 * 0.5); // Damage * Crit * Lifesteal
             assert.strictEqual(p1.currentHealth, expectedHealth, `Expected health to be ${expectedHealth}, but got ${p1.currentHealth}`);
        }
    }
};
