// src/domain/passives/ChanceBlocage.js

import { PassiveSkill } from './PassiveSkill.js';

export class ChanceBlocage extends PassiveSkill {
    constructor(value) {
        super('chance-blocage', 'Chance blocage', value);
        this.blockCounter = 0;
    }

    onInitialize(character) {
        this.blockCounter = 0;
    }

    onCalculateStats(character) {
        character.blockChance += this.value / 100;
    }

    onModifyIncomingDamage(defender, attacker, damage) {
        this.blockCounter += defender.blockChance;
        if (this.blockCounter >= 1) {
            this.blockCounter--;
            return 0; // Block negates all damage
        }
        return damage;
    }
}
