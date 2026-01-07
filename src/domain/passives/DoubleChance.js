// src/domain/passives/DoubleChance.js

import { PassiveSkill } from './PassiveSkill.js';

export class DoubleChance extends PassiveSkill {
    constructor(value) {
        super('double-chance', 'Double chance', value);
        this.doubleChanceCounter = 0;
    }

    onInitialize(character) {
        this.doubleChanceCounter = 0;
    }

    onAfterAttackProcessed(attacker, defender, log) {
        this.doubleChanceCounter += (attacker.basePassiveSkills['double-chance'] || 0) / 100;
        if (this.doubleChanceCounter >= 1) {
            this.doubleChanceCounter--;
            log(`${attacker.id} performs an extra attack from Double Chance!`);
            return true; // Signal to perform an extra attack
        }
        return false;
    }
}
