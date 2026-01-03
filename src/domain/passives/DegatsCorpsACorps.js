// src/domain/passives/DegatsCorpsACorps.js

import { PassiveSkill } from './PassiveSkill.js';

export class DegatsCorpsACorps extends PassiveSkill {
    constructor(value) {
        super('degats-corps-a-corps', 'Dégâts corps à corps', value);
    }

    onModifyOutgoingDamage(character, target, damage) {
        if (character.weaponType === 'corp-a-corp') {
            // Add damage based on the base damage to ensure additive stacking
            return damage + character.baseDamage * (this.value / 100);
        }
        return damage;
    }
}
