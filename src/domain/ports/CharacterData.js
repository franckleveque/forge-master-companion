// src/domain/ports/CharacterData.js

/**
 * @typedef {import('./ActiveSkillData.js').ActiveSkillData} ActiveSkillData
 */

/**
 * Represents the data contract for character statistics retrieved from an adapter.
 * This class defines the port for character data flowing into the application layer.
 */
export class CharacterData {
    /**
     * @param {object} data
     * @param {string} data.name
     * @param {number} data.totalDamage
     * @param {number} data.totalHealth
     * @param {string} data.weaponType
     * @param {Object.<string, number>} data.basePassiveSkills
     * @param {ActiveSkillData[]} data.activeSkills
     */
    constructor({ name, totalDamage, totalHealth, weaponType, basePassiveSkills, activeSkills }) {
        this.name = name;
        this.totalDamage = totalDamage;
        this.totalHealth = totalHealth;
        this.weaponType = weaponType;
        this.basePassiveSkills = basePassiveSkills;
        this.activeSkills = activeSkills;
    }
}
