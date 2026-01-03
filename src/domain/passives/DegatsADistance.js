// src/domain/passives/DegatsADistance.js

import { PassiveSkill } from './PassiveSkill.js';

export class DegatsADistance extends PassiveSkill {
    constructor(value) {
        super('degats-a-distance', 'Dégâts à distance', value);
    }

    onModifyOutgoingDamage(character, target, damage) {
        if (character.weaponType === 'a-distance') {
            return damage * (1 + this.value / 100);
        }
        return damage;
    }
}
