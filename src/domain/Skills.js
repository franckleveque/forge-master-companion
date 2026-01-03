// src/domain/Skills.js

class PassiveSkill {
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }
}

class ActiveSkill {
    constructor({ baseDamage = 0, baseHealth = 0, cooldown = 0 }) {
        this.baseDamage = baseDamage;
        this.baseHealth = baseHealth;
        this.cooldown = cooldown;
        this.timer = cooldown; // Skills start in cooldown
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
}

export class DamageSkill extends ActiveSkill {
    constructor({ baseDamage = 0, baseHealth = 0, cooldown = 0, value = 0, hits = 1 }) {
        super({ baseDamage, baseHealth, cooldown });
        this.type = 'damage';
        this.value = value;
        this.hits = hits;
    }
}

export class BuffSkill extends ActiveSkill {
    constructor({ baseDamage = 0, baseHealth = 0, cooldown = 0, damageBuff = 0, healthBuff = 0, duration = 0 }) {
        super({ baseDamage, baseHealth, cooldown });
        this.type = 'buff';
        this.damageBuff = damageBuff;
        this.healthBuff = healthBuff;
        this.duration = duration;
        this.durationTimer = 0;
    }

    isActive() {
        return this.durationTimer > 0;
    }

    tick(dt) {
        super.tick(dt);
        if (this.isActive()) {
            this.durationTimer -= dt;
            if (this.durationTimer <= 0) {
                // Buff expired, now the cooldown can start
                this.timer = this.cooldown;
            }
        }
    }

    trigger() {
        this.durationTimer = this.duration;
        // The cooldown will start after the duration ends
        this.timer = this.cooldown + this.duration;
    }
}
