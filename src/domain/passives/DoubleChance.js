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

    onCalculateStats(character) {
        character.doubleChance += this.value / 100;
    }

    onAfterAttackProcessed(attacker, defender) {
        this.doubleChanceCounter += attacker.doubleChance;
        if (this.doubleChanceCounter >= 1) {
            this.doubleChanceCounter--;
            return true; // Signal to perform an extra attack
        }
        return false;
    }
}
