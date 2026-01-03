// src/domain/Character.js

class Character {
    constructor({
        name,
        totalDamage,
        totalHealth,
        weaponType,
        basePassiveSkills,
        activeSkills
    }) {
        this.name = name;
        this.totalDamage = totalDamage;
        this.totalHealth = totalHealth;
        this.weaponType = weaponType;
        this.basePassiveSkills = basePassiveSkills;
        this.activeSkills = activeSkills;
    }
}
