// src/domain/passives/RegenerationSante.js

import { PassiveSkill } from './PassiveSkill.js';

export class RegenerationSante extends PassiveSkill {
    constructor(value) {
        super('regeneration-sante', 'Régénération santé', value);
    }

    onTick(character, dt) {
        const healthToRegen = character.maxHealth * (this.value / 100) * dt;
        if (healthToRegen > 0) {
            const healedAmount = character.heal(healthToRegen);
            if (healedAmount > 0) {
                character._log(`${character.id} regenerates ${healedAmount.toFixed(0)} health from Regeneration. Now at ${character.health.toFixed(0)} HP.`);
            }
        }
    }
}
