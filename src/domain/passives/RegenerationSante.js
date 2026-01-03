// src/domain/passives/RegenerationSante.js

import { PassiveSkill } from './PassiveSkill.js';

export class RegenerationSante extends PassiveSkill {
    constructor(value) {
        super('regeneration-sante', 'Régénération santé', value);
    }

    onCalculateStats(character) {
        character.healthRegenPerSec = (character.healthRegenPerSec || 0) + this.value;
    }

    onTick(character, dt) {
        character.currentHealth += (character.healthRegenPerSec || 0) * dt;
    }
}
