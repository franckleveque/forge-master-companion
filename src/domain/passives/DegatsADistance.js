// src/domain/passives/DegatsADistance.js

import { PassiveSkill } from './PassiveSkill.js';

export class DegatsADistance extends PassiveSkill {
    constructor(value) {
        super('degats-a-distance', 'Dégâts à distance', value);
    }

    onModifyOutgoingDamage(character, target, damage) {
        if (character.weaponType === 'a-distance') {
            // Add damage based on the base damage to ensure additive stacking
            return damage + character.baseDamage * (this.value / 100);
        }
        return damage;
    }
}
