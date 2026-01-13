// src/domain/skills/DamageSkill.js
import { ActiveSkill } from '../Skills.js';

export class DamageSkill extends ActiveSkill {
    constructor({ baseDamage = 0, baseHealth = 0, cooldown = 0, value = 0, hits = 1 }) {
        super({ baseDamage, baseHealth, cooldown });
        this.type = 'damage';
        this.value = value;
        this.hits = hits;
        this._remainingHits = 0;
    }

    onInitialize(caster) {
        super.onInitialize(caster);
        this._remainingHits = this.hits;
    }

    trigger(caster) {
        if (this._remainingHits > 0 && caster.enemy && caster.enemy.isAlive()) {
            const damage = this.value;
            caster.enemy.takeDamage(damage);
            caster._log(`${caster.id} uses a ${this.type} skill for ${damage} damage. ${caster.enemy.id}'s health is now ${caster.enemy.health.toFixed(0)}.`);

            this._remainingHits--;

            if (this._remainingHits === 0) {
                this.reset();
            }
        }
    }

    tick(delta) {
        const wasOnCooldown = this.currentCooldown > 0;
        super.tick(delta);
        if (wasOnCooldown && this.currentCooldown <= 0) {
            this._remainingHits = this.hits;
        }
    }
}
