// src/domain/Equipment.js

class Equipment {
    constructor({
        category,
        weaponType,
        damage,
        health,
        passiveSkill,
        passiveSkillValue
    }) {
        this.category = category;
        this.weaponType = weaponType;
        this.damage = damage;
        this.health = health;
        this.passiveSkill = passiveSkill;
        this.passiveSkillValue = passiveSkillValue;
    }
}
