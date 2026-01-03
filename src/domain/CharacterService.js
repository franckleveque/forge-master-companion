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

    getCharacterBaseStats(statsFromDom) {
        let baseDamage = statsFromDom.totalDamage;
        let baseHealth = statsFromDom.totalHealth;

        const p = statsFromDom.basePassiveSkills;

        // Un-apply percentage-based damage buffs
        let totalDamageModifier = 1.0;
        totalDamageModifier += p['degats'] / 100;
        if (statsFromDom.weaponType === 'corp-a-corp') {
            totalDamageModifier += p['degats-corps-a-corps'] / 100;
        }
        if (statsFromDom.weaponType === 'a-distance') {
            totalDamageModifier += p['degats-a-distance'] / 100;
        }
        if (totalDamageModifier > 0) {
            baseDamage /= totalDamageModifier;
        }

        // Un-apply percentage-based health buffs
        const totalHealthModifier = 1.0 + (p['sante'] / 100);
        if (totalHealthModifier > 0) {
            baseHealth /= totalHealthModifier;
        }

        return {
            ...statsFromDom,
            baseDamage: baseDamage,
            baseHealth: baseHealth,
        };
    }

    applyEquipment(baseStats, equipment) {
        let stats = JSON.parse(JSON.stringify(baseStats));

        // Start with the true base stats
        stats.totalDamage = baseStats.baseDamage;
        stats.totalHealth = baseStats.baseHealth;

        if (equipment.category === 'weapon') {
            stats.weaponType = equipment.weaponType;
        }

        // Add flat stats from equipment
        stats.totalDamage += equipment.damage;
        stats.totalHealth += equipment.health;

        // Add passive skill from equipment
        const passive = this.passiveSkills.find(p => p.name === equipment.passiveSkill);
        if (passive) {
            stats.basePassiveSkills[passive.id] = (stats.basePassiveSkills[passive.id] || 0) + equipment.passiveSkillValue;
        }

        return stats;
    }

    unequipEquipment(baseStats, equipment) {
        let stats = JSON.parse(JSON.stringify(baseStats));

        // Start with the true base stats
        stats.totalDamage = baseStats.baseDamage;
        stats.totalHealth = baseStats.baseHealth;

        // In an unequip scenario, the "equipment" being removed is still part of the
        // character's sheet. So we subtract its value.
        stats.totalDamage -= equipment.damage;
        stats.totalHealth -= equipment.health;

        const passive = this.passiveSkills.find(p => p.name === equipment.passiveSkill);
        if (passive) {
            stats.basePassiveSkills[passive.id] = (stats.basePassiveSkills[passive.id] || 0) - equipment.passiveSkillValue;
        }

        return stats;
    }
}
