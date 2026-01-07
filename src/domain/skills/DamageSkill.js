// src/domain/skills/DamageSkill.js
import { ActiveSkill } from '../Skills.js';

export class DamageSkill extends ActiveSkill {
    constructor({ baseDamage = 0, baseHealth = 0, cooldown = 0, value = 0, hits = 1 }) {
        super({ baseDamage, baseHealth, cooldown });
        this.type = 'damage';
        this.value = value;
        this.hits = hits;
    }
}
