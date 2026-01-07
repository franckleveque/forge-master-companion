// src/domain/CharacterService.js
import { Character } from "./Character.js";

export class CharacterService {
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

    getPassiveSkills() {
        return this.passiveSkills;
    }

    getCharacterBaseStats(sheetStats) {
        // Use a deep copy to ensure the original object is NEVER mutated.
        const stats = JSON.parse(JSON.stringify(sheetStats));
        const p = stats.basePassiveSkills;

        let totalDamageModifier = 1 + (p['degats'] || 0) / 100;
        if (stats.weaponType === 'corp-a-corp') {
            totalDamageModifier += (p['degats-corps-a-corps'] || 0) / 100;
        } else if (stats.weaponType === 'a-distance') {
            totalDamageModifier += (p['degats-a-distance'] || 0) / 100;
        }

        const totalHealthModifier = 1 + (p['sante'] || 0) / 100;

        let effectiveBaseDamage = stats.totalDamage / (totalDamageModifier || 1);
        let effectiveBaseHealth = stats.totalHealth / (totalHealthModifier || 1);

        if (stats.activeSkills && Array.isArray(stats.activeSkills)) {
            const competenceDegatsMod = 1 + (p['competence-degats'] || 0) / 100;
            stats.activeSkills.forEach(skill => {
                if (skill.baseDamage) {
                    effectiveBaseDamage -= skill.baseDamage * competenceDegatsMod;
                }
                if (skill.baseHealth) {
                    effectiveBaseHealth -= skill.baseHealth * competenceDegatsMod;
                }
            });
        }

        // Ensure this service returns a full Character instance, not just a plain object.
        // This is critical for the simulation to have access to all class methods and properties.
        const character = new Character({
            ...stats,
            baseDamage: effectiveBaseDamage,
            baseHealth: effectiveBaseHealth,
            basePassiveSkills: stats.basePassiveSkills, // Ensure passives are passed through
            name: stats.name || 'Player' // Ensure a name is set
        });

        // Recalculate final stats based on the new base stats
        return this.recalculateTotalStats(character);
    }

    recalculateTotalStats(characterStats) {
        // Use a deep copy to ensure the original object is NEVER mutated.
        const stats = JSON.parse(JSON.stringify(characterStats));
        const p = stats.basePassiveSkills || {};

        let effectiveBaseDamage = stats.baseDamage;
        let effectiveBaseHealth = stats.baseHealth;

        if (stats.activeSkills && Array.isArray(stats.activeSkills)) {
            const competenceDegatsMod = 1 + (p['competence-degats'] || 0) / 100;
            stats.activeSkills.forEach(skill => {
                if (skill.baseDamage) {
                    effectiveBaseDamage += skill.baseDamage * competenceDegatsMod;
                }
                if (skill.baseHealth) {
                    effectiveBaseHealth += skill.baseHealth * competenceDegatsMod;
                }
            });
        }

        let totalDamageModifier = 1 + (p['degats'] || 0) / 100;
        if (stats.weaponType === 'corp-a-corp') {
            totalDamageModifier += (p['degats-corps-a-corps'] || 0) / 100;
        } else if (stats.weaponType === 'a-distance') {
            totalDamageModifier += (p['degats-a-distance'] || 0) / 100;
        }

        const totalHealthModifier = 1 + (p['sante'] || 0) / 100;

        stats.totalDamage = effectiveBaseDamage * totalDamageModifier;
        stats.totalHealth = effectiveBaseHealth * totalHealthModifier;

        // Ensure maxHealth is also updated when totalHealth changes.
        stats.maxHealth = stats.totalHealth;

        // Pass the full stats object to the constructor.
        // The ...stats spread includes the (potentially modified) basePassiveSkills.
        return new Character({
            ...stats
        });
    }

    applyEquipment(characterStats, equipment) {
        const stats = JSON.parse(JSON.stringify(characterStats));
        stats.baseDamage += equipment.damage;
        stats.baseHealth += equipment.health;

        const passive = this.passiveSkills.find(p => p.name === equipment.passiveSkill);
        if (passive) {
            stats.basePassiveSkills[passive.id] = (stats.basePassiveSkills[passive.id] || 0) + equipment.passiveSkillValue;
        }

        if (equipment.category === 'weapon') {
            stats.weaponType = equipment.weaponType;
        }

        return new Character(stats);
    }

    unequipEquipment(characterStats, equipment) {
        const stats = JSON.parse(JSON.stringify(characterStats));
        stats.baseDamage -= equipment.damage;
        stats.baseHealth -= equipment.health;

        const passive = this.passiveSkills.find(p => p.name === equipment.passiveSkill);
        if (passive) {
            stats.basePassiveSkills[passive.id] = (stats.basePassiveSkills[passive.id] || 0) - equipment.passiveSkillValue;
        }

        return new Character(stats);
    }
}
