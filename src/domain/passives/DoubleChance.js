// src/domain/passives/DoubleChance.js

import { PassiveSkill } from './PassiveSkill.js';

export class DoubleChance extends PassiveSkill {
    constructor(value) {
        super('double-chance', 'Double chance', value);
    }

    onCalculateStats(character) {
        character.doubleChance += this.value / 100;
    }
}
