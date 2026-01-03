// src/domain/passives/DegatsADistance.js

import { PassiveSkill } from './PassiveSkill.js';

export class DegatsADistance extends PassiveSkill {
    constructor(value) {
        super('degats-a-distance', 'Dégâts à distance', value);
    }

    // The primary damage calculation is now handled by CharacterService before the simulation starts.
    // This hook is kept for potential future use if the skill gains other effects.
    onCalculateStats(character) {
        // No longer modifies finalDamage directly.
    }
}
