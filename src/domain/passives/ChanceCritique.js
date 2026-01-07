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

    onModifyOutgoingDamage(attacker, defender, damage, log) {
        this.critCounter += (attacker.basePassiveSkills['chance-critique'] || 0) / 100;
        if (this.critCounter >= 1) {
            this.critCounter--;
            const critDamageModifier = 1 + (attacker.basePassiveSkills['degats-critiques'] || 0) / 100;
            const modifiedDamage = damage * critDamageModifier;
            log(`${attacker.id} lands a Critical Strike!`);
            return modifiedDamage;
        }
        return damage;
    }
}
