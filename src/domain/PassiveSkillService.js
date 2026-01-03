// src/domain/PassiveSkillService.js

import { PassiveSkillFactory } from './passives/PassiveSkillFactory.js';

export class PassiveSkillService {
    constructor() {
        this.passiveSkills = [
            'sante', 'degats', 'degats-corps-a-corps', 'degats-a-distance',
            'vitesse-attaque', 'chance-critique', 'degats-critiques', 'chance-blocage',
            'regeneration-sante', 'vol-de-vie', 'double-chance', 'competence-degats',
            'competences-temps-recharge'
        ];
    }

    getPassiveSkillIds() {
        return this.passiveSkills;
    }

    createPassiveSkill(id, value) {
        return PassiveSkillFactory.create(id, value);
    }
}
