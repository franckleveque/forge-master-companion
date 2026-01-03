// src/domain/passives/VitesseAttaque.js

import { PassiveSkill } from './PassiveSkill.js';

export class VitesseAttaque extends PassiveSkill {
    constructor(value) {
        super('vitesse-attaque', 'Vitesse d\'attaque', value);
    }

    onCalculateStats(character) {
        character.timePerAttack /= 1 / Math.pow(0.5, this.value / 100);
    }
}
