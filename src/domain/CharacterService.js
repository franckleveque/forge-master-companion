// src/domain/CharacterService.js

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
        const p = sheetStats.basePassiveSkills;
        let totalDamageModifier = 1 + (p['degats'] || 0) / 100;
        if (sheetStats.weaponType === 'corp-a-corp') {
            totalDamageModifier += (p['degats-corps-a-corps'] || 0) / 100;
        } else if (sheetStats.weaponType === 'a-distance') {
            totalDamageModifier += (p['degats-a-distance'] || 0) / 100;
        }

        const totalHealthModifier = 1 + (p['sante'] || 0) / 100;

        const baseDamage = sheetStats.totalDamage / (totalDamageModifier || 1);
        const baseHealth = sheetStats.totalHealth / (totalHealthModifier || 1);

        return {
            ...sheetStats,
            baseDamage,
            baseHealth,
        };
    }

    recalculateTotalStats(characterStats) {
        const p = characterStats.basePassiveSkills;
        let totalDamageModifier = 1 + (p['degats'] || 0) / 100;
        if (characterStats.weaponType === 'corp-a-corp') {
            totalDamageModifier += (p['degats-corps-a-corps'] || 0) / 100;
        } else if (characterStats.weaponType === 'a-distance') {
            totalDamageModifier += (p['degats-a-distance'] || 0) / 100;
        }

        const totalHealthModifier = 1 + (p['sante'] || 0) / 100;

        const stats = JSON.parse(JSON.stringify(characterStats));
        stats.totalDamage = characterStats.baseDamage * totalDamageModifier;
        stats.totalHealth = characterStats.baseHealth * totalHealthModifier;

        if (stats.activeSkills && Array.isArray(stats.activeSkills)) {
            const competenceDegatsMod = 1 + (p['competence-degats'] || 0) / 100;
            stats.activeSkills.forEach(skill => {
                if (skill.baseDamage) {
                    stats.totalDamage += skill.baseDamage * competenceDegatsMod;
                }
                if (skill.baseHealth) {
                    stats.totalHealth += skill.baseHealth * competenceDegatsMod;
                }
            });
        }

        return stats;
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

        return stats;
    }

    unequipEquipment(characterStats, equipment) {
        const stats = JSON.parse(JSON.stringify(characterStats));
        stats.baseDamage -= equipment.damage;
        stats.baseHealth -= equipment.health;

        const passive = this.passiveSkills.find(p => p.name === equipment.passiveSkill);
        if (passive) {
            stats.basePassiveSkills[passive.id] = (stats.basePassiveSkills[passive.id] || 0) - equipment.passiveSkillValue;
        }

        return stats;
    }
}
