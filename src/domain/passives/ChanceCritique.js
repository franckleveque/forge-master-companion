// src/domain/passives/ChanceCritique.js

import { PassiveSkill } from './PassiveSkill.js';

export class ChanceCritique extends PassiveSkill {
    constructor(value) {
        super('chance-critique', 'Chance critique', value);
        this.critCounter = 0;
    }

    onInitialize(character) {
        this.critCounter = 0;
    }

    onCalculateStats(character) {
        character.critChance += this.value / 100;
    }

    onModifyOutgoingDamage(attacker, defender, damage) {
        this.critCounter += attacker.critChance;
        if (this.critCounter >= 1) {
            this.critCounter--;
            return damage * attacker.critDamage;
        }
        return damage;
    }
}
