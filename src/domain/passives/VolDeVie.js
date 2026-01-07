// src/domain/passives/VolDeVie.js

import { PassiveSkill } from './PassiveSkill.js';

export class VolDeVie extends PassiveSkill {
    constructor(value) {
        super('vol-de-vie', 'Vol de vie', value);
    }

    onAfterAttackDealt(attacker, defender, damageDealt) {
        const lifestealAmount = damageDealt * (this.value / 100);
        if (lifestealAmount > 0) {
            const healedAmount = attacker.heal(lifestealAmount);
            if (healedAmount > 0) {
                attacker._log(`${attacker.id} lifesteals ${healedAmount.toFixed(0)} health from Lifesteal. Now at ${attacker.health.toFixed(0)} HP.`);
            }
        }
    }
}
