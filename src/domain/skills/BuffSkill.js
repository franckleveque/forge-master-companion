// src/domain/skills/BuffSkill.js
import { ActiveSkill } from '../Skills.js';

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

    trigger(caster) {
        this.durationTimer = this.duration;
        caster.applyBuff(this);
        caster._log(`${caster.id} uses a buff skill. Damage is now ${caster.totalDamage}, Health is now ${caster.health.toFixed(0)}/${caster.maxHealth.toFixed(0)}.`);
        // The cooldown will start after the duration ends
        this.timer = this.cooldown + this.duration;
    }

    onExpire(caster) {
        caster._log(`${caster.id}'s buff expired. Damage is now ${caster.totalDamage}, Health is now ${caster.health.toFixed(0)}/${caster.maxHealth.toFixed(0)}.`);
    }
}
