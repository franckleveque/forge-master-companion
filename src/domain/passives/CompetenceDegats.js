// src/domain/passives/CompetenceDegats.js

import { PassiveSkill } from './PassiveSkill.js';

export class CompetenceDegats extends PassiveSkill {
    constructor(value) {
        super('competence-degats', 'Compétence dégâts', value);
    }

    onCalculateStats(character) {
        character.competenceDegatsMod *= 1 + this.value / 100;
    }
}
