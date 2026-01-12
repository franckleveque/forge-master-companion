// src/domain/ports/EquipmentData.js

/**
 * Represents the data contract for equipment statistics retrieved from an adapter.
 * This class defines the port for equipment data flowing into the application layer.
 */
export class EquipmentData {
    /**
     * @param {object} data
     * @param {string} data.category
     * @param {string} data.weaponType
     * @param {number} data.damage
     * @param {number} data.health
     * @param {string} data.passiveSkill
     * @param {number} data.passiveSkillValue
     */
    constructor({ category, weaponType, damage, health, passiveSkill, passiveSkillValue }) {
        this.category = category;
        this.weaponType = weaponType;
        this.damage = damage;
        this.health = health;
        this.passiveSkill = passiveSkill;
        this.passiveSkillValue = passiveSkillValue;
    }
}
