// src/domain/skills/ActiveSkillFactory.js

import { DamageSkill } from './DamageSkill.js';
import { BuffSkill } from './BuffSkill.js';

export class ActiveSkillFactory {
    /**
     * @param {ActiveSkillData} skillData
     * @returns {DamageSkill | BuffSkill | null}
     */
    static create(skillData) {
        if (skillData.type === 'damage') {
            return new DamageSkill(skillData);
        }
        if (skillData.type === 'buff') {
            return new BuffSkill(skillData);
        }
        return null;
    }
}
