// src/domain/ports/ActiveSkillData.js

/**
 * Represents the data contract for an active skill retrieved from an adapter.
 * This class defines the port for active skill data flowing into the application layer.
 */
export class ActiveSkillData {
    /**
     * @param {object} data
     * @param {string} data.type
     * @param {number} data.baseDamage
     * @param {number} data.baseHealth
     * @param {number} data.cooldown
     * @param {number} data.value
     * @param {number} data.hits
     * @param {number} data.damageBuff
     * @param {number} data.healthBuff
     * @param {number} data.duration
     */
    constructor({ type, baseDamage, baseHealth, cooldown, value, hits, damageBuff, healthBuff, duration }) {
        this.type = type;
        this.baseDamage = baseDamage;
        this.baseHealth = baseHealth;
        this.cooldown = cooldown;
        this.value = value;
        this.hits = hits;
        this.damageBuff = damageBuff;
        this.healthBuff = healthBuff;
        this.duration = duration;
    }
}
