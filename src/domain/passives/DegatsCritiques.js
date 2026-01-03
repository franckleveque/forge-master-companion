// src/domain/passives/DegatsCritiques.js

import { PassiveSkill } from './PassiveSkill.js';

export class DegatsCritiques extends PassiveSkill {
    constructor(value) {
        super('degats-critiques', 'Dégâts critiques', value);
    }

    onCalculateStats(character) {
        character.critDamage += this.value / 100;
    }
}
