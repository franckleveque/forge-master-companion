// src/domain/CharacterService.js

class CharacterService {
    constructor() {
        this.passiveSkills = [
            { id: 'chance-critique', name: "Chance critique" },
            { id: 'degats-critiques', name: "Dégâts critiques" },
            { id: 'chance-blocage', name: "Chance de blocage" },
            { id: 'regeneration-sante', name: "Régénération santé" },
            { id: 'vol-de-vie', name: "Vol de vie" },
            { id: 'double-chance', name: "Double chance" },
            { id: 'degats', name: "Dégâts" },
            { id: 'degats-corps-a-corps', name: "Dégâts corps à corps" },
            { id: 'degats-a-distance', name: "Dégâts à distance" },
            { id: 'vitesse-attaque', name: "Vitesse d'attaque" },
            { id: 'competence-degats', name: "Compétence dégâts" },
            { id: 'competences-temps-recharge', name: "Compétences temps de recharge" },
            { id: 'sante', name: "Santé" }
        ];
    }

    getPassiveSkills() {
        return this.passiveSkills;
    }

    applyEquipment(baseStats, equipment) {
        let stats = JSON.parse(JSON.stringify(baseStats));
        if (equipment.category === 'weapon') {
            stats.weaponType = equipment.weaponType;
        }
        stats.totalDamage += equipment.damage;
        stats.totalHealth += equipment.health;
        const passive = this.passiveSkills.find(p => p.name === equipment.passiveSkill);
        if (passive) {
            stats.basePassiveSkills[passive.id] += equipment.passiveSkillValue;
        }
        return stats;
    }

    unequipEquipment(baseStats, equipment) {
        let stats = JSON.parse(JSON.stringify(baseStats));
        stats.totalDamage -= equipment.damage;
        stats.totalHealth -= equipment.health;
        const passive = this.passiveSkills.find(p => p.name === equipment.passiveSkill);
        if (passive) {
            stats.basePassiveSkills[passive.id] -= equipment.passiveSkillValue;
        }
        return stats;
    }
}
