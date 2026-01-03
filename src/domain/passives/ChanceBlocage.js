// src/domain/passives/ChanceBlocage.js

import { PassiveSkill } from './PassiveSkill.js';

export class ChanceBlocage extends PassiveSkill {
    constructor(value) {
        super('chance-blocage', 'Chance blocage', value);
    }

    onCalculateStats(character) {
        character.blockChance += this.value / 100;
    }
}
