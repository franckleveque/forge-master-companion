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

    applyEquipment(characterStats, equipment) {
        let stats = JSON.parse(JSON.stringify(characterStats));

        // 1. Add flat damage and health from the new equipment.
        stats.totalDamage += equipment.damage;
        stats.totalHealth += equipment.health;

        // 2. Add the percentage-based passive from the new equipment to the character's total passives.
        const passive = this.passiveSkills.find(p => p.name === equipment.passiveSkill);
        if (passive) {
            stats.basePassiveSkills[passive.id] = (stats.basePassiveSkills[passive.id] || 0) + equipment.passiveSkillValue;
        }

        // 3. Apply the relevant *single* percentage passive from the new equipment to the new total.
        // This matches the user's formula: (current_total + flat_stat) * (1 + passive_percent / 100)
        if (passive) {
            const passiveValue = equipment.passiveSkillValue;
            if (passive.id === 'degats' || passive.id === 'degats-corps-a-corps' || passive.id === 'degats-a-distance') {
                stats.totalDamage *= (1 + passiveValue / 100);
            } else if (passive.id === 'sante') {
                stats.totalHealth *= (1 + passiveValue / 100);
            }
        }

        // Update weapon type if the new equipment is a weapon.
        if (equipment.category === 'weapon') {
            stats.weaponType = equipment.weaponType;
        }

        return stats;
    }

    unequipEquipment(characterStats, equipment) {
        let stats = JSON.parse(JSON.stringify(characterStats));

        // 1. Find the passive skill from the equipment being unequipped.
        const passive = this.passiveSkills.find(p => p.name === equipment.passiveSkill);

        // 2. "Un-apply" the relevant single percentage passive.
        // This matches the user's formula: new_total = (current_total / (1 + passive_percent / 100)) - flat_stat
        if (passive) {
            const passiveValue = equipment.passiveSkillValue;
            if (passive.id === 'degats' || passive.id === 'degats-corps-a-corps' || passive.id === 'degats-a-distance') {
                if ((1 + passiveValue / 100) !== 0) {
                    stats.totalDamage /= (1 + passiveValue / 100);
                }
            } else if (passive.id === 'sante') {
                 if ((1 + passiveValue / 100) !== 0) {
                    stats.totalHealth /= (1 + passiveValue / 100);
                }
            }
        }

        // 3. Subtract the flat damage and health.
        stats.totalDamage -= equipment.damage;
        stats.totalHealth -= equipment.health;

        // 4. Subtract the passive value from the character's total passives.
        if (passive) {
            stats.basePassiveSkills[passive.id] = (stats.basePassiveSkills[passive.id] || 0) - equipment.passiveSkillValue;
        }

        return stats;
    }
}
