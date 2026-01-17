// tests/ActiveSkill.test.js

import { Character } from '../src/domain/Character.js';
import { CharacterService } from '../src/application/CharacterService.js';
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

    // Note: The tests for multi-hit and buffs require a running simulation,
    // making them integration tests. They have been moved to SimulationIntegration.test.js
    // and adapted to use the public API. This file now only contains unit tests for Active Skills.
});
