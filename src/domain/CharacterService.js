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

        let effectiveBaseDamage = sheetStats.totalDamage / (totalDamageModifier || 1);
        let effectiveBaseHealth = sheetStats.totalHealth / (totalHealthModifier || 1);

        if (sheetStats.activeSkills && Array.isArray(sheetStats.activeSkills)) {
            const competenceDegatsMod = 1 + (p['competence-degats'] || 0) / 100;
            sheetStats.activeSkills.forEach(skill => {
                if (skill.baseDamage) {
                    effectiveBaseDamage -= skill.baseDamage * competenceDegatsMod;
                }
                if (skill.baseHealth) {
                    effectiveBaseHealth -= skill.baseHealth * competenceDegatsMod;
                }
            });
        }

        return {
            ...sheetStats,
            baseDamage: effectiveBaseDamage,
            baseHealth: effectiveBaseHealth,
        };
    }

    recalculateTotalStats(characterStats) {
        const p = characterStats.basePassiveSkills;
        const stats = JSON.parse(JSON.stringify(characterStats));

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

    createDummyOpponent(playerStats) {
        return {
            name: 'Opponent',
            totalDamage: playerStats.totalDamage,
            totalHealth: playerStats.totalHealth,
            weaponType: 'corp-a-corp',
            basePassiveSkills: {},
            activeSkills: []
        };
    }
}
