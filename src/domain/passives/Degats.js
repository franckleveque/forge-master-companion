// src/domain/passives/Degats.js

import { PassiveSkill } from './PassiveSkill.js';

export class Degats extends PassiveSkill {
    constructor(value) {
        super('degats', 'Dégâts', value);
    }

    onCalculateStats(character) {
        character.finalDamage = character.baseDamage * (1 + this.value / 100);
    }
}
