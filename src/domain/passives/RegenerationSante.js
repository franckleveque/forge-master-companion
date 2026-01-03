// src/domain/passives/RegenerationSante.js

import { PassiveSkill } from './PassiveSkill.js';

export class RegenerationSante extends PassiveSkill {
    constructor(value) {
        super('regeneration-sante', 'Régénération santé', value);
    }

    onTick(character, dt) {
        character.currentHealth += character.finalHealth * (this.value / 100) * dt;
    }
}
