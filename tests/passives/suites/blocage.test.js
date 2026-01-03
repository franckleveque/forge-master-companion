// tests/passives/suites/blocage.test.js
import assert from 'assert';
import { SimulationService } from '../../../src/domain/SimulationService.js';
import { createTestCharacter } from '../test-helper.js';

export const blocageTests = {
    "Blocage": {
        'should block the second incoming attack with 50% block chance': () => {
            const character = createTestCharacter({ 'chance-blocage': 50 });
            const simulationService = new SimulationService();
            const p1 = simulationService._calculateCharacterStats(character);
            const blockSkill = p1.passiveSkills.find(s => s.id === 'chance-blocage');

            const incomingDamage = 100;
            const damage1 = blockSkill.onModifyIncomingDamage(p1, null, incomingDamage);
            const damage2 = blockSkill.onModifyIncomingDamage(p1, null, incomingDamage);

            assert.strictEqual(damage1, 100, `Expected the first attack to not be blocked.`);
            assert.strictEqual(damage2, 0, `Expected the second attack to be blocked.`);
        },
        'should block the first incoming attack with 100% block chance': () => {
            const character = createTestCharacter({ 'chance-blocage': 100 });
            const simulationService = new SimulationService();
            const p1 = simulationService._calculateCharacterStats(character);
            const blockSkill = p1.passiveSkills.find(s => s.id === 'chance-blocage');

            const incomingDamage = 100;
            const damage = blockSkill.onModifyIncomingDamage(p1, null, incomingDamage);

            assert.strictEqual(damage, 0, `Expected the first attack to be blocked.`);
        }
    }
};
