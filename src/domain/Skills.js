// src/domain/Skills.js

class PassiveSkill {
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }
}

class ActiveSkill {
    constructor(type, value, cooldown) {
        this.type = type;
        this.value = value;
        this.cooldown = cooldown;
        this.timer = 0;
    }
}
