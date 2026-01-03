// src/domain/passives/PassiveSkill.js

export class PassiveSkill {
    constructor(id, name, value) {
        this.id = id;
        this.name = name;
        this.value = value;
    }

    onInitialize(character) {
        // Hook for setting up initial state on the skill object itself, like counters.
    }

    onCalculateStats(character) {
        // Hook for modifying initial character stats.
    }

    onTick(character, dt) {
        // Hook for effects that trigger on every simulation tick.
    }

    onModifyOutgoingDamage(attacker, defender, damage) {
        // Hook for skills that modify outgoing damage (e.g., crit).
        // Must return the modified damage.
        return damage;
    }

    onModifyIncomingDamage(defender, attacker, damage) {
        // Hook for skills that modify incoming damage (e.g., block).
        // Must return the modified damage.
        return damage;
    }

    onAfterAttackDealt(attacker, defender, damageDealt) {
        // Hook for effects that trigger after damage has been dealt (e.g., lifesteal).
    }

    onAfterAttackProcessed(attacker, defender) {
        // Hook for effects that trigger after the entire attack sequence is complete.
        // Can be used to trigger follow-up actions, like a second attack for "Double Chance".
        // Should return true if an extra attack should be performed.
        return false;
    }
}
