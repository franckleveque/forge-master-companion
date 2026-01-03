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
        this.name = name;
        this.baseDamage = baseDamage;
        this.baseHealth = baseHealth;
        this.totalDamage = totalDamage;
        this.totalHealth = totalHealth;
        this.weaponType = weaponType;
        this.basePassiveSkills = basePassiveSkills;
        this.activeSkills = activeSkills;
    }
}
