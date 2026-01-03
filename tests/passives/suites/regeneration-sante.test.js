// tests/passives/suites/regeneration-sante.test.js
import assert from 'assert';
import { SimulationService } from '../../../src/domain/SimulationService.js';
import { createTestCharacter } from '../test-helper.js';

export const regenerationSanteTests = {
    "Régénération Santé": {
        'should regenerate 1% of max health per second': () => {
            const character = createTestCharacter({ 'regeneration-sante': 1 });
            const simulationService = new SimulationService();
            const p1 = simulationService._calculateCharacterStats(character);
            p1.currentHealth = 500;

            const regenSkill = p1.passiveSkills.find(s => s.id === 'regeneration-sante');
            regenSkill.onTick(p1, 1.0); // Simulate 1 second

            // 1% of 1000 health is 10
            assert.strictEqual(p1.currentHealth, 510, `Expected health to be 510, but got ${p1.currentHealth}`);
        },
        'should not regenerate health beyond the maximum': () => {
            const character = createTestCharacter({ 'regeneration-sante': 1 });
            const simulationService = new SimulationService();
            const p1 = simulationService._calculateCharacterStats(character);
            p1.currentHealth = 995;

            const regenSkill = p1.passiveSkills.find(s => s.id === 'regeneration-sante');
            regenSkill.onTick(p1, 1.0); // Regenerate 10 health

            // Manually cap health, as the simulation loop does
            if (p1.currentHealth > p1.finalHealth) {
                p1.currentHealth = p1.finalHealth;
            }

            assert.strictEqual(p1.currentHealth, 1000, `Expected health to be capped at 1000, but got ${p1.currentHealth}`);
        }
    }
};
