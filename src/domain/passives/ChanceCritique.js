// src/domain/passives/ChanceCritique.js

import { PassiveSkill } from './PassiveSkill.js';

export class ChanceCritique extends PassiveSkill {
    constructor(value) {
        super('chance-critique', 'Chance critique', value);
    }

    onCalculateStats(character) {
        character.critChance += this.value / 100;
    }
}
