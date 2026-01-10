// src/domain/passives/PassiveSkillFactory.js

import { Sante } from './Sante.js';
import { Degats } from './Degats.js';
import { DegatsCorpsACorps } from './DegatsCorpsACorps.js';
import { DegatsADistance } from './DegatsADistance.js';
import { VitesseAttaque } from './VitesseAttaque.js';
import { ChanceCritique } from './ChanceCritique.js';
import { DegatsCritiques } from './DegatsCritiques.js';
import { ChanceBlocage } from './ChanceBlocage.js';
import { RegenerationSante } from './RegenerationSante.js';
import { VolDeVie } from './VolDeVie.js';
import { DoubleChance } from './DoubleChance.js';
import { CompetenceDegats } from './CompetenceDegats.js';
import { CompetencesTempsRecharge } from './CompetencesTempsRecharge.js';

const skillMap = {
    'sante': Sante,
    'degats': Degats,
    'degats-corps-a-corps': DegatsCorpsACorps,
    'degats-a-distance': DegatsADistance,
    'vitesse-attaque': VitesseAttaque,
    'chance-critique': ChanceCritique,
    'degats-critiques': DegatsCritiques,
    'chance-blocage': ChanceBlocage,
    'regeneration-sante': RegenerationSante,
    'vol-de-vie': VolDeVie,
    'double-chance': DoubleChance,
    'competence-degats': CompetenceDegats,
    'competences-temps-recharge': CompetencesTempsRecharge
};

export class PassiveSkillFactory {
    create(id, value) {
        const SkillClass = skillMap[id];
        if (SkillClass) {
            return new SkillClass(value);
        }
        return null;
    }
}
