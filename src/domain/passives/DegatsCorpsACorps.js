// src/domain/passives/DegatsCorpsACorps.js

import { PassiveSkill } from './PassiveSkill.js';

export class DegatsCorpsACorps extends PassiveSkill {
    constructor(value) {
        super('degats-corps-a-corps', 'Dégâts corps à corps', value);
    }

    onModifyOutgoingDamage(character, target, damage) {
        if (character.weaponType === 'corp-a-corp') {
            return damage * (1 + this.value / 100);
        }
        return damage;
    }
}
