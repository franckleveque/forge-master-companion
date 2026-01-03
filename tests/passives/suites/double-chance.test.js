// tests/passives/suites/double-chance.test.js
import assert from 'assert';
import { SimulationService } from '../../../src/domain/SimulationService.js';
import { createTestCharacter } from '../test-helper.js';

export const doubleChanceTests = {
    "Double Chance": {
        'should trigger a second attack on the 4th hit with 25% double chance': () => {
            const character = createTestCharacter({ 'double-chance': 25 });
            const simulationService = new SimulationService();
            const p1 = simulationService._calculateCharacterStats(character);
            const doubleChanceSkill = p1.passiveSkills.find(s => s.id === 'double-chance');

            const res1 = doubleChanceSkill.onAfterAttackProcessed(p1, null);
            const res2 = doubleChanceSkill.onAfterAttackProcessed(p1, null);
            const res3 = doubleChanceSkill.onAfterAttackProcessed(p1, null);
            const res4 = doubleChanceSkill.onAfterAttackProcessed(p1, null);

            assert.strictEqual(res1, false, "Expected first attack not to double.");
            assert.strictEqual(res2, false, "Expected second attack not to double.");
            assert.strictEqual(res3, false, "Expected third attack not to double.");
            assert.strictEqual(res4, true, "Expected fourth attack to double.");
        },
        'should result in ~33% more total attacks over a long simulation with 25% double chance': () => {
            const passives = { 'vitesse-attaque': 300 };
            const doubleChance = 0.25;

            const simulationService1 = new SimulationService();
            const charNoDouble = createTestCharacter(passives);
            const resultNoDouble = simulationService1.simulate(charNoDouble);
            const baseAttacks = resultNoDouble.totalDamageDealt / 100;

            const simulationService2 = new SimulationService();
            const charWithDouble = createTestCharacter({ ...passives, 'double-chance': doubleChance * 100 });
            const resultWithDouble = simulationService2.simulate(charWithDouble);
            const totalAttacksWithDouble = resultWithDouble.totalDamageDealt / 100;

            // With chaining procs, the total attacks follow a geometric series: base / (1 - chance)
            const expectedAttacks = baseAttacks / (1 - doubleChance);

            assert(Math.abs(totalAttacksWithDouble - expectedAttacks) < 2, `Expected ~${expectedAttacks.toFixed(2)} attacks, but got ${totalAttacksWithDouble}`);
        }
    }
};
