// src/domain/SimulationService.js

import { Character } from "./Character.js";
import { DamageSkill } from "./skills/DamageSkill.js";
import { BuffSkill } from "./skills/BuffSkill.js";
import { PassiveSkillFactory } from "./passives/PassiveSkillFactory.js";

export class SimulationService {
    constructor(logger) {
        this.logger = logger;
        this.time = 0;
        this.fighters = [];
        this.simulationLog = [];
    }

    _initializeFighters(player1, player2) {
        const logFn = this._log.bind(this);

        const p1Data = JSON.parse(JSON.stringify(player1));
        const p2Data = JSON.parse(JSON.stringify(player2));

        const p1 = new Character({ ...p1Data, logFunction: logFn });
        const p2 = new Character({ ...p2Data, logFunction: logFn });

        p1.activeSkills = player1.activeSkills.map(skillData => {
            if (skillData.type === 'damage') return new DamageSkill(skillData);
            if (skillData.type === 'buff') return new BuffSkill(skillData);
            return null;
        }).filter(Boolean);

        p2.activeSkills = player2.activeSkills.map(skillData => {
            if (skillData.type === 'damage') return new DamageSkill(skillData);
            if (skillData.type === 'buff') return new BuffSkill(skillData);
            return null;
        }).filter(Boolean);

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
            this.time += 0.01;
            this.fighters.forEach(fighter => {
                fighter.tick(0.01);
                fighter.activeSkills.forEach(skill => {
                    if (skill.isReady()) {
                        this._log(`${fighter.id} uses a ${skill.type} skill.`);
                        if (skill.type === 'buff') {
                            skill.trigger(); // Trigger the buff
                            fighter.applyBuff(skill);
                        }
                    }
                });
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
            log: this.simulationLog
        };
    }
}
