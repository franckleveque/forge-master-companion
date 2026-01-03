// src/domain/passives/PassiveSkill.js

export class PassiveSkill {
    constructor(id, name, value) {
        this.id = id;
        this.name = name;
        this.value = value;
    }

    onCalculateStats(character) {
        // Hook for modifying initial character stats
    }

    onTick(character, dt) {
        // Hook for effects that trigger on every simulation tick
    }

    onAttack(attacker, defender, damage) {
        // Hook for effects that trigger on an attack
    }
}
