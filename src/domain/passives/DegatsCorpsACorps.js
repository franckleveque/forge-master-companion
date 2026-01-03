// src/domain/passives/DegatsCorpsACorps.js

import { PassiveSkill } from './PassiveSkill.js';

export class DegatsCorpsACorps extends PassiveSkill {
    constructor(value) {
        super('degats-corps-a-corps', 'Dégâts corps à corps', value);
    }

    onCalculateStats(character) {
        if (character.weaponType === 'corp-a-corp') {
            character.finalDamage *= 1 + this.value / 100;
        }
    }
}
