// src/domain/passives/CompetencesTempsRecharge.js

import { PassiveSkill } from './PassiveSkill.js';

export class CompetencesTempsRecharge extends PassiveSkill {
    constructor(value) {
        super('competences-temps-recharge', 'Compétences temps de recharge', value);
    }

    onCalculateStats(character) {
        character.competenceCooldownMod *= 1 - this.value / 100;
    }
}
