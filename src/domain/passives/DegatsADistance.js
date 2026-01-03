// src/domain/passives/DegatsADistance.js

import { PassiveSkill } from './PassiveSkill.js';

export class DegatsADistance extends PassiveSkill {
    constructor(value) {
        super('degats-a-distance', 'Dégâts à distance', value);
    }

    onCalculateStats(character) {
        if (character.weaponType === 'a-distance') {
            character.finalDamage *= 1 + this.value / 100;
        }
    }
}
