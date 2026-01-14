// src/domain/skills/DamageSkill.js
import { ActiveSkill } from '../Skills.js';

export class DamageSkill extends ActiveSkill {
    constructor({ baseDamage = 0, baseHealth = 0, cooldown = 0, value = 0, hits = 1 }) {
        super({ baseDamage, baseHealth, cooldown });
        this.type = 'damage';
        this.value = value;
        this.hits = hits;

        this.remainingHits = 0;
        this.hitTimer = 0;
        this.hitDelay = 0.01;
        this.isExecuting = false;
    }

    isReady() {
        return super.isReady() && !this.isExecuting;
    }

    trigger(caster) {
        if (this.hits > 1) {
            this.isExecuting = true;
            this.remainingHits = this.hits;
            this.hitTimer = 0;
            this.reset(); // Reset cooldown as soon as the skill is triggered
        } else {
            if (caster.enemy && caster.enemy.isAlive()) {
                caster.enemy.takeDamage(this.value);
                caster._log(`${caster.id} uses a ${this.type} skill for ${this.value} damage. ${caster.enemy.id}'s health is now ${caster.enemy.health.toFixed(0)}.`);
            }
            this.reset();
        }
    }

    tick(dt, caster) {
        super.tick(dt);

        if (this.isExecuting) {
            this.hitTimer -= dt;

            if (this.hitTimer <= 0 && this.remainingHits > 0) {
                if (caster.enemy && caster.enemy.isAlive()) {
                    caster.enemy.takeDamage(this.value);
                    caster._log(`${caster.id} uses a ${this.type} skill for ${this.value} damage. ${caster.enemy.id}'s health is now ${caster.enemy.health.toFixed(0)}.`);
                    this.remainingHits--;
                    this.hitTimer = this.hitDelay;
                } else {
                    this.isExecuting = false;
                    this.remainingHits = 0;
                }

                if (this.remainingHits === 0) {
                    this.isExecuting = false;
                }
            }
        }
    }
}
