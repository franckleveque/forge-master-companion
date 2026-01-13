// src/domain/SimulationService.js

import { Character } from "./Character.js";
import { PassiveSkillFactory } from "./passives/PassiveSkillFactory.js";
import { ActiveSkillFactory } from "./skills/ActiveSkillFactory.js";

export class SimulationService {
    constructor(logger) {
        this.logger = logger;
        this.time = 0;
        this.fighters = [];
        this.simulationLog = [];
    }

    _initializeFighters(player1, player2) {
        const logFn = this._log.bind(this);

        // Create a deep copy of the characters to avoid modifying the originals.
        // The 'enemy' property is temporarily removed to prevent circular reference errors.
        const p1Data = JSON.parse(JSON.stringify({ ...player1, enemy: null }));
        const p2Data = JSON.parse(JSON.stringify({ ...player2, enemy: null }));

        const p1 = new Character({ ...p1Data, logFunction: logFn });
        const p2 = new Character({ ...p2Data, logFunction: logFn });

        p1.activeSkills = player1.activeSkills.map(ActiveSkillFactory.create).filter(Boolean);
        p2.activeSkills = player2.activeSkills.map(ActiveSkillFactory.create).filter(Boolean);

        p1.passiveSkills = Object.entries(p1.basePassiveSkills).map(([id, value]) => PassiveSkillFactory.create(id, value)).filter(Boolean);
        p2.passiveSkills = Object.entries(p2.basePassiveSkills).map(([id, value]) => PassiveSkillFactory.create(id, value)).filter(Boolean);

        p1.enemy = p2;
        p2.enemy = p1;

        p1.passiveSkills.forEach(skill => skill.onInitialize(p1));
        p2.passiveSkills.forEach(skill => skill.onInitialize(p2));

        p1.activeSkills.forEach(skill => skill.onInitialize(p1));
        p2.activeSkills.forEach(skill => skill.onInitialize(p2));

        return [p1, p2];
    }

    _log(message) {
        const formattedMessage = `[${this.time.toFixed(2)}] ${message}`;
        this.simulationLog.push(formattedMessage);
        if (this.logger) {
            this.logger.log(formattedMessage);
        }
    }

    simulatePvp(player1, player2) {
        this.simulationLog = [];
        this.time = 0;

        this.fighters = this._initializeFighters(player1, player2);

        this.fighters.forEach(f => {
            if (isNaN(f.health) || f.health <= 0) {
                f.health = 1;
            }
            this._log(`${f.id} starts with ${f.health.toFixed(0)} health.`);
        });

        while (this.time < 60 && this.fighters.every(f => f.isAlive())) {
            this.time = parseFloat((this.time + 0.01).toFixed(2));
            this.fighters.forEach(fighter => {
                fighter.tick(0.01);
                fighter.activeSkills.forEach(skill => {
                    if (skill.isReady()) {
                        skill.trigger(fighter);
                    }
                });
            });
        }

        const winner = [...this.fighters].sort((a, b) => b.health - a.health)[0];

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
            log: this.simulationLog
        };
    }
}
