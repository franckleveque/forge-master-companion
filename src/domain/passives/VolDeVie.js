// src/domain/passives/VolDeVie.js

import { PassiveSkill } from './PassiveSkill.js';

export class VolDeVie extends PassiveSkill {
    constructor(value) {
        super('vol-de-vie', 'Vol de vie', value);
    }

    onCalculateStats(character) {
        character.lifesteal += this.value / 100;
    }

    onAfterAttackDealt(attacker, defender, damageDealt) {
        attacker.currentHealth += damageDealt * attacker.lifesteal;
    }
}
