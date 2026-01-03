// src/domain/passives/Sante.js

import { PassiveSkill } from './PassiveSkill.js';

export class Sante extends PassiveSkill {
    constructor(value) {
        super('sante', 'Sante', value);
    }

    onCalculateStats(character) {
        character.finalHealth = character.baseHealth * (1 + this.value / 100);
    }
}
