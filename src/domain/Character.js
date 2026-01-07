// src/domain/Character.js

export class Character {
    constructor({
        name,
        baseDamage,
        baseHealth,
        totalDamage,
        totalHealth,
        weaponType,
        basePassiveSkills,
        activeSkills
    }) {
        this.name = name || 'Character';
        this.baseDamage = parseFloat(baseDamage) || 0;
        this.baseHealth = parseFloat(baseHealth) || 0;
        this.totalDamage = parseFloat(totalDamage) || 0;
        this.totalHealth = parseFloat(totalHealth) || 0;
        this.weaponType = weaponType;
        this.basePassiveSkills = basePassiveSkills || {};
        this.activeSkills = activeSkills || [];
    }
}
