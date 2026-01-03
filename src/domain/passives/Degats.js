// src/domain/passives/Degats.js

import { PassiveSkill } from './PassiveSkill.js';

export class Degats extends PassiveSkill {
    constructor(value) {
        super('degats', 'Dégâts', value);
    }

    // The primary damage calculation is now handled by CharacterService before the simulation starts.
    // This hook is kept for potential future use if the skill gains other effects.
    onCalculateStats(character) {
        // No longer modifies finalDamage directly.
    }
}
