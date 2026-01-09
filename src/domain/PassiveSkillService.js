// src/domain/PassiveSkillService.js

import { PassiveSkillFactory } from './passives/PassiveSkillFactory.js';

export class PassiveSkillService {
    constructor() {
        this.passiveSkills = [
            { id: 'sante', name: "Santé" },
            { id: 'degats', name: "Dégâts" },
            { id: 'degats-corps-a-corps', name: "Dégâts corps à corps" },
            { id: 'degats-a-distance', name: "Dégâts à distance" },
            { id: 'vitesse-attaque', name: "Vitesse d'attaque" },
            { id: 'chance-critique', name: "Chance critique" },
            { id: 'degats-critiques', name: "Dégâts critiques" },
            { id: 'chance-blocage', name: "Chance de blocage" },
            { id: 'regeneration-sante', name: "Régénération santé" },
            { id: 'vol-de-vie', name: "Vol de vie" },
            { id: 'double-chance', name: "Double chance" },
            { id: 'competence-degats', name: "Compétence dégâts" },
            { id: 'competences-temps-recharge', name: "Compétences temps de recharge" },
        ];
    }

    getPassiveSkillIds() {
        return this.passiveSkills.map(skill => skill.id);
    }

    findSkillByName(name) {
        return this.passiveSkills.find(skill => skill.name === name);
    }

    createPassiveSkill(id, value) {
        return PassiveSkillFactory.create(id, value);
    }
}
