// src/domain/passives/Degats.js

import { PassiveSkill } from './PassiveSkill.js';

export class Degats extends PassiveSkill {
    constructor(value) {
        super('degats', 'Dégâts', value);
    }

    onCalculateStats(character) {
        // This skill modifies stats during the calculation phase, not during combat.
    }
}
