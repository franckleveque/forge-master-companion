// src/domain/passives/VolDeVie.js

import { PassiveSkill } from './PassiveSkill.js';

export class VolDeVie extends PassiveSkill {
    constructor(value) {
        super('vol-de-vie', 'Vol de vie', value);
    }

    onAttack(attacker, defender, damage) {
        attacker.currentHealth += damage * (this.value / 100);
    }
}
