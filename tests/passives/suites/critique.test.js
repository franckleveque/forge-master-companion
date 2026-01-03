// tests/passives/suites/critique.test.js
import assert from 'assert';
import { SimulationService } from '../../../src/domain/SimulationService.js';
import { createTestCharacter } from '../test-helper.js';

export const critiqueTests = {
    "Critique": {
        'should deal 1.5x damage on a critical strike by default': () => {
            const character = createTestCharacter({ 'chance-critique': 100 });
            const simulationService = new SimulationService();
            const p1 = simulationService._calculateCharacterStats(character);

            let damage = p1.finalDamage;
            p1.passiveSkills.forEach(s => {
                damage = s.onModifyOutgoingDamage(p1, null, damage);
            });

            assert.strictEqual(damage, 150, `Expected crit damage to be 150, but got ${damage}`);
        },
        'should increase critical damage with the degats-critiques skill': () => {
            const character = createTestCharacter({ 'chance-critique': 100, 'degats-critiques': 100 });
            const simulationService = new SimulationService();
            const p1 = simulationService._calculateCharacterStats(character);

            let damage = p1.finalDamage;
            p1.passiveSkills.forEach(s => {
                damage = s.onModifyOutgoingDamage(p1, null, damage);
            });

            // Base crit is 1.5, plus 100% from skill = 2.5
            assert.strictEqual(damage, 250, `Expected crit damage to be 250, but got ${damage}`);
        },
        'should crit on the 4th attack with 25% crit chance': () => {
            const character = createTestCharacter({ 'chance-critique': 25 });
            const simulationService = new SimulationService();
            const p1 = simulationService._calculateCharacterStats(character);
            const critSkill = p1.passiveSkills.find(s => s.id === 'chance-critique');

            let damage1 = critSkill.onModifyOutgoingDamage(p1, null, p1.finalDamage);
            let damage2 = critSkill.onModifyOutgoingDamage(p1, null, p1.finalDamage);
            let damage3 = critSkill.onModifyOutgoingDamage(p1, null, p1.finalDamage);
            let damage4 = critSkill.onModifyOutgoingDamage(p1, null, p1.finalDamage);

            assert.strictEqual(damage1, 100, `Expected attack 1 to be normal`);
            assert.strictEqual(damage2, 100, `Expected attack 2 to be normal`);
            assert.strictEqual(damage3, 100, `Expected attack 3 to be normal`);
            assert.strictEqual(damage4, 150, `Expected attack 4 to be a crit`);
        }
    }
};
