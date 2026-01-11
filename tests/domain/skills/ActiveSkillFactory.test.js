// tests/domain/skills/ActiveSkillFactory.test.js

import { ActiveSkillFactory } from '../../../src/domain/skills/ActiveSkillFactory.js';
import { DamageSkill } from '../../../src/domain/skills/DamageSkill.js';
import { BuffSkill } from '../../../src/domain/skills/BuffSkill.js';

describe('ActiveSkillFactory', () => {
    let factory;

    beforeEach(() => {
        factory = new ActiveSkillFactory();
    });

    it('should create a DamageSkill instance for type "damage"', () => {
        const skillData = { type: 'damage', baseDamage: 100, cooldown: 10, hits: 1 };
        const skill = factory.create(skillData);
        expect(skill).toBeInstanceOf(DamageSkill);
        expect(skill.baseDamage).toBe(100);
    });

    it('should create a BuffSkill instance for type "buff"', () => {
        const skillData = { type: 'buff', duration: 5, damageBuff: 0.2, cooldown: 15 };
        const skill = factory.create(skillData);
        expect(skill).toBeInstanceOf(BuffSkill);
        expect(skill.duration).toBe(5);
    });

    it('should return null for an unknown skill type', () => {
        const skillData = { type: 'unknown' };
        const skill = factory.create(skillData);
        expect(skill).toBeNull();
    });
});
