// src/domain/passives/DegatsCorpsACorps.js

import { PassiveSkill } from './PassiveSkill.js';

export class DegatsCorpsACorps extends PassiveSkill {
    constructor(value) {
        super('degats-corps-a-corps', 'Dégâts corps à corps', value);
    }

    onCalculateStats(character) {
        // This skill modifies stats during the calculation phase, not during combat.
    }
}
