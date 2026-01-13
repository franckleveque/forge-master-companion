// src/domain/Skills.js

export class PassiveSkill {
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }
}

export class ActiveSkill {
    constructor({ baseDamage = 0, baseHealth = 0, cooldown = 0 }) {
        this.baseDamage = baseDamage;
        this.baseHealth = baseHealth;
        this.cooldown = cooldown;
        this.timer = cooldown; // Skills start in cooldown
    }

    onInitialize(character) {
        // This method can be overridden by subclasses to perform setup actions
        // such as applying initial stat bonuses.
    }

    isReady() {
        return this.timer <= 0;
    }

    tick(dt) {
        if (this.timer > 0) {
            this.timer -= dt;
        }
    }

    reset() {
        this.timer = this.cooldown;
    }

    trigger(caster) {
        // Base implementation does nothing, but can be overridden.
        this.reset();
    }
}
