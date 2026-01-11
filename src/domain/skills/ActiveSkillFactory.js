// src/domain/skills/ActiveSkillFactory.js

import { DamageSkill } from './DamageSkill.js';
import { BuffSkill } from './BuffSkill.js';

const skillMap = {
    'damage': DamageSkill,
    'buff': BuffSkill,
};

export class ActiveSkillFactory {
    create(skillData) {
        const SkillClass = skillMap[skillData.type];
        if (SkillClass) {
            return new SkillClass(skillData);
        }
        return null;
    }
}
