// src/domain/skills/DamageSkill.js
import { ActiveSkill } from '../Skills.js';

export class DamageSkill extends ActiveSkill {
    constructor({ baseDamage = 0, baseHealth = 0, cooldown = 0, value = 0, hits = 1 }) {
        super({ baseDamage, baseHealth, cooldown });
        this.type = 'damage';
        this.value = value;
        this.hits = hits;
    }

    trigger(caster) {
        if (caster.enemy && caster.enemy.isAlive()) {
            const damage = this.value * this.hits;
            caster.enemy.takeDamage(damage);
            caster._log(`${caster.id} uses a ${this.type} skill for ${damage} damage. ${caster.enemy.id}'s health is now ${caster.enemy.health.toFixed(0)}.`);
            this.reset();
        }
    }
}
