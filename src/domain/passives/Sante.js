// src/domain/passives/Sante.js

import { PassiveSkill } from './PassiveSkill.js';

export class Sante extends PassiveSkill {
    constructor(value) {
        super('sante', 'Sante', value);
    }

    // The primary health calculation is now handled by CharacterService before the simulation starts.
    // This hook is kept for potential future use if the skill gains other effects.
    onCalculateStats(character) {
        // No longer modifies finalHealth directly.
    }
}
