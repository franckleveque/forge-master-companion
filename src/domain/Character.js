// src/domain/Character.js
import { PassiveSkillFactory } from "./passives/PassiveSkillFactory.js";

export class Character {
    constructor({
        id,
        name,
        baseDamage,
        baseHealth,
        totalDamage,
        totalHealth,
        maxHealth,
        weaponType,
        basePassiveSkills,
        activeSkills,
        passiveSkills,
        enemy = null,
        logFunction = null
    }) {
        this.id = id || name || 'Character';
        this.name = name || 'Character';

        this.baseDamage = parseFloat(baseDamage) || 0;
        this.baseHealth = parseFloat(baseHealth) || 0;
        this.totalDamage = parseFloat(totalDamage) || 0;
        this.totalHealth = parseFloat(totalHealth) || 0;
        this.maxHealth = parseFloat(maxHealth) || this.totalHealth;

        this.weaponType = weaponType;
        this.basePassiveSkills = basePassiveSkills || {};
        this.activeSkills = activeSkills || [];

        if (passiveSkills) {
            this.passiveSkills = passiveSkills;
        } else {
            this.passiveSkills = Object.keys(this.basePassiveSkills).map(skillId => {
                return PassiveSkillFactory.create(skillId, this.basePassiveSkills[skillId]);
            }).filter(Boolean);
        }

        this.enemy = enemy;
        this._log = logFunction || (() => {});

        this.health = this.maxHealth;
        this.attackTimer = this.weaponType === 'corp-a-corp' ? -2 : 0;
        this.totalDamageDealt = 0;
        this.critChanceCounter = 0;
        this.blockChanceCounter = 0;
        this.doubleChanceCounter = 0;
        this.activeBuffs = [];
    }

    isAlive() {
        return this.health > 0;
    }

    tick(dt) {
        if (!this.isAlive()) return;

        this.passiveSkills.forEach(skill => skill.onTick(this, dt));
        this.activeSkills.forEach(skill => skill.tick(dt));

        // This is the critical fix: check for and remove expired buffs.
        this.activeBuffs.forEach(buff => {
            buff.tick(dt);
            if (!buff.isActive()) {
                this.removeBuff(buff);
            }
        });

        this.attackTimer += dt;
        const attackSpeedBonus = this.basePassiveSkills['vitesse-attaque'] || 0;
        const attackTime = 1 / Math.pow(2, attackSpeedBonus / 100);

        if (this.attackTimer >= attackTime) {
            this.attackTimer -= attackTime;
            this.performAttack();

            let performExtraAttack = false;
            this.passiveSkills.forEach(skill => {
                if (skill.onAfterAttackProcessed) {
                    if (skill.onAfterAttackProcessed(this, this.enemy, this._log)) {
                        performExtraAttack = true;
                    }
                }
            });

            if (performExtraAttack) {
                this.performAttack();
            }
        }
    }

    performAttack() {
        if (this.enemy && this.enemy.isAlive()) {
            let damage = this.totalDamage;

            this.passiveSkills.forEach(skill => {
                if (skill.onModifyOutgoingDamage) {
                    damage = skill.onModifyOutgoingDamage(this, this.enemy, damage, this._log);
                }
            });

            this.enemy.takeDamage(damage);
            this.totalDamageDealt += damage;
            this._log(`${this.id} attacks ${this.enemy.id} for ${damage.toFixed(0)} damage. ${this.enemy.id}'s health is now ${this.enemy.health.toFixed(0)}.`);

            // Trigger after-attack effects
            this.passiveSkills.forEach(skill => {
                if (skill.onAfterAttackDealt) {
                    skill.onAfterAttackDealt(this, this.enemy, damage);
                }
            });
        }
    }

    heal(amount) {
        if (!this.isAlive()) return 0;
        const healthBefore = this.health;
        this.health += amount;
        if (this.health > this.maxHealth) {
            this.health = this.maxHealth;
        }
        return this.health - healthBefore;
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health < 0) {
            this.health = 0;
        }
    }

    applyBuff(buff) {
        this.activeBuffs.push(buff);
        this._log(`${this.id} gains a buff.`);
    }

    removeBuff(buff) {
        this.activeBuffs = this.activeBuffs.filter(b => b !== buff);
        this._log(`${this.id} buff expired.`);
    }
}
