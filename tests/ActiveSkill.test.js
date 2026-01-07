// tests/ActiveSkill.test.js

import { Character } from '../src/domain/Character.js';
import { CharacterService } from '../src/domain/CharacterService.js';
import { SimulationService } from '../src/domain/SimulationService.js';
import { DamageSkill } from '../src/domain/skills/DamageSkill.js';
import { BuffSkill } from '../src/domain/skills/BuffSkill.js';
import { LoggerService } from '../src/infrastructure/LoggerService.js';

describe('Active Skills', () => {
    let characterService;

    beforeEach(() => {
        characterService = new CharacterService();
    });

    test('Skills should start in cooldown on initialization', () => {
        const skill = new DamageSkill({ cooldown: 10 });
        expect(skill.timer).toBe(10);
    });

    test('Base inputs should be correctly scaled by the Passive Damage Skill', () => {
        const characterData = {
            baseDamage: 100,
            baseHealth: 1000,
            totalDamage: 100,
            totalHealth: 1000,
            basePassiveSkills: { 'competence-degats': 50, 'degats': 20 },
            activeSkills: [
                { type: 'damage', baseDamage: 10, baseHealth: 100 }
            ]
        };
        const character = new Character(characterData);
        const stats = characterService.recalculateTotalStats(character);
        const expectedDamage = (100 + 10 * 1.5) * 1.2;
        expect(stats.totalDamage).toBe(expectedDamage);

        const baseStats = characterService.getCharacterBaseStats(stats);
        expect(baseStats.baseDamage).toBeCloseTo(100);
    });

    // Note: The tests for multi-hit and buffs require a running simulation,
    // making them integration tests. They have been moved to SimulationIntegration.test.js
    // and adapted to use the public API. This file now only contains unit tests for Active Skills.
});
