// tests/passives/suites/vitesse-attaque.test.js
import assert from 'assert';
import { SimulationService } from '../../../src/domain/SimulationService.js';
import { createTestCharacter } from '../test-helper.js';

export const vitesseAttaqueTests = {
    "Vitesse d'attaque": {
        'should correctly calculate timePerAttack for 200% attack speed': () => {
            const character = createTestCharacter({ 'vitesse-attaque': 200 });
            const simulationService = new SimulationService();
            const calculatedStats = simulationService._calculateCharacterStats(character);
            assert.strictEqual(Math.round(calculatedStats.timePerAttack * 100) / 100, 0.25, `Expected timePerAttack to be ~0.25, but got ${calculatedStats.timePerAttack}`);
        },
        'should perform the correct number of attacks for a melee weapon': () => {
            const character = createTestCharacter({ 'vitesse-attaque': 200 });
            const simulationService = new SimulationService();
            const result = simulationService.simulate(character);
            const expectedAttacks = Math.floor((60 - 2) / 0.25) + 1;
            const expectedDamage = 100 * expectedAttacks;
            assert.strictEqual(result.totalDamageDealt, expectedDamage, `Expected total damage to be ${expectedDamage}, but got ${result.totalDamageDealt}`);
        }
    }
};
