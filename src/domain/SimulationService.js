// src/domain/SimulationService.js

import { Character } from "./Character.js";
import { DamageSkill } from "./skills/DamageSkill.js";
import { BuffSkill } from "./skills/BuffSkill.js";

export class SimulationService {
    constructor(logger) {
        this.logger = logger; // Global logger for display in PvP mode
        this.time = 0;
        this.fighters = [];
        this.simulationLog = []; // Local log for a single simulation run
    }

    _initializeFighters(player1, player2) {
        // Deep copy fighters to avoid mutation issues during simulation
        const p1 = new Character(JSON.parse(JSON.stringify(player1)));
        const p2 = new Character(JSON.parse(JSON.stringify(player2)));

        p1.enemy = p2;
        p2.enemy = p1;

        // Instantiate active skills to ensure they have their methods
        p1.activeSkills = p1.activeSkills.map(skillData => {
            if (skillData.type === 'damage') return new DamageSkill(skillData);
            if (skillData.type === 'buff') return new BuffSkill(skillData);
            return null;
        }).filter(Boolean);

        p2.activeSkills = p2.activeSkills.map(skillData => {
            if (skillData.type === 'damage') return new DamageSkill(skillData);
            if (skillData.type === 'buff') return new BuffSkill(skillData);
            return null;
        }).filter(Boolean);

        p1.passiveSkills.forEach(skill => skill.onInitialize(p1));
        p2.passiveSkills.forEach(skill => skill.onInitialize(p2));

        p1.activeSkills.forEach(skill => skill.onInitialize(p1));
        p2.activeSkills.forEach(skill => skill.onInitialize(p2));

        return [p1, p2];
    }

    _log(message) {
        const formattedMessage = `[${this.time.toFixed(2)}] ${message}`;
        this.simulationLog.push(formattedMessage);
        // We also log to the global logger for the main PvP mode's live log view
        if (this.logger) {
            this.logger.log(message, this.time);
        }
    }

    simulatePvp(player1, player2) {
        // Reset state for the new simulation run
        this.simulationLog = [];
        this.time = 0;

        this.fighters = this._initializeFighters(player1, player2);

        this.fighters.forEach(f => {
            if (isNaN(f.health) || f.health <= 0) {
                console.error(`ERROR: Fighter ${f.id} initialized with invalid health: ${f.health}.`);
                f.health = 1; // Prevent simulation errors
            }
            this._log(`${f.id} starts with ${f.health.toFixed(0)} health.`);
        });

        while (this.time < 60 && this.fighters.every(f => f.isAlive())) {
            this.time += 0.01;
            this.fighters.forEach(fighter => {
                fighter.tick(0.01);
            });
        }

        const winner = this.fighters.find(f => f.isAlive()) || this.fighters.sort((a, b) => b.health - a.health)[0];

        this._log(`Simulation ended. Winner: ${winner ? winner.id : 'None'}.`);

        return {
            winner: winner ? winner.id : 'None',
            time: this.time,
            player1: {
                name: this.fighters[0].name,
                healthRemaining: this.fighters[0].health,
                totalDamageDealt: this.fighters[0].totalDamageDealt,
                maxHealth: this.fighters[0].maxHealth
            },
            player2: {
                name: this.fighters[1].name,
                healthRemaining: this.fighters[1].health,
                totalDamageDealt: this.fighters[1].totalDamageDealt,
                maxHealth: this.fighters[1].maxHealth
            },
            log: this.simulationLog // Return the self-contained log from this specific simulation
        };
    }
}
