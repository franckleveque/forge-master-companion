// tests/ActiveSkill.test.js

import { Character } from '../src/domain/Character.js';
import { CharacterService } from '../src/domain/CharacterService.js';
import { SimulationService } from '../src/domain/SimulationService.js';
import { DamageSkill, BuffSkill } from '../src/domain/Skills.js';

describe('Active Skills', () => {
    let characterService;
    let simulationService;

    beforeEach(() => {
        characterService = new CharacterService();
        simulationService = new SimulationService();
    });

    test('Skills should start in cooldown on initialization', () => {
        const skill = new DamageSkill({ cooldown: 10 });
        expect(skill.timer).toBe(10);
    });

    test('Base inputs should be correctly scaled by the Passive Damage Skill', () => {
        const character = new Character({
            baseDamage: 100,
            baseHealth: 1000,
            totalDamage: 100,
            totalHealth: 1000,
            basePassiveSkills: { 'competence-degats': 50 },
            activeSkills: [
                new DamageSkill({ baseDamage: 10, baseHealth: 100 })
            ]
        });
        const stats = characterService.recalculateTotalStats(character);
        expect(stats.totalDamage).toBe(100 + 10 * 1.5);
        expect(stats.totalHealth).toBe(1000 + 100 * 1.5);
    });

    test('Multi-hit skills should trigger the correct amount of hits', () => {
        const attacker = new Character({
            totalDamage: 100,
            totalHealth: 1000,
            basePassiveSkills: {},
            activeSkills: [
                new DamageSkill({ value: 50, hits: 3, cooldown: 1 })
            ]
        });
        const defender = new Character({
            totalDamage: 100,
            totalHealth: 1000,
            basePassiveSkills: {},
            activeSkills: []
        });

        const p1 = simulationService._calculateCharacterStats(attacker);
        const p2 = simulationService._calculateCharacterStats(defender);

        p1.activeSkills[0].timer = 0;
        simulationService._processActiveSkills(p1, p2, 0.01);

        expect(p2.currentHealth).toBe(1000 - 50 * 3);
    });

    test('Buffs should apply and expire correctly, and cooldowns should start after the buff duration', () => {
        const character = new Character({
            totalDamage: 100,
            totalHealth: 1000,
            basePassiveSkills: {},
            activeSkills: [
                new BuffSkill({ damageBuff: 50, healthBuff: 500, duration: 2, cooldown: 5 })
            ]
        });

        const p1 = simulationService._calculateCharacterStats(character);
        p1.activeSkills[0].timer = 0;

        // Trigger the buff
        simulationService._processActiveSkills(p1, null, 0.01);
        expect(p1.finalDamage).toBe(150);
        expect(p1.finalHealth).toBe(1500);
        expect(p1.activeSkills[0].isActive()).toBe(true);

        // Tick for 1 second
        p1.activeSkills[0].tick(1);
        expect(p1.finalDamage).toBe(150);
        expect(p1.finalHealth).toBe(1500);

        // Tick for another second (buff expires)
        p1.activeSkills[0].tick(1);
        simulationService._revertBuffs(p1, p1.activeSkills[0]);
        expect(p1.finalDamage).toBe(100);
        expect(p1.finalHealth).toBe(1000);
        expect(p1.activeSkills[0].isActive()).toBe(false);
        expect(p1.activeSkills[0].timer).toBe(5);
    });
});
