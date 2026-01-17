// src/domain/Character.js

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
        this.passiveSkills = passiveSkills || [];

        this.enemy = enemy;
        this._log = logFunction || (() => {});

        this.health = this.maxHealth;
        this.attackTimer = this.weaponType === 'corp-a-corp' ? -2 : 0;
        this.totalDamageDealt = 0;
        this.critChanceCounter = 0;
        this.blockChanceCounter = 0;
        this.doubleChanceCounter = 0;
    }

    recalculateStats() {
        const p = this.basePassiveSkills || {};

        let effectiveBaseDamage = this.baseDamage;
        let effectiveBaseHealth = this.baseHealth;

        if (this.activeSkills && Array.isArray(this.activeSkills)) {
            const competenceDegatsMod = 1 + (p['competence-degats'] || 0) / 100;
            this.activeSkills.forEach(skill => {
                if (skill.baseDamage) {
                    effectiveBaseDamage += skill.baseDamage * competenceDegatsMod;
                }
                if (skill.baseHealth) {
                    effectiveBaseHealth += skill.baseHealth * competenceDegatsMod;
                }
            });
        }

        let totalDamageModifier = 1 + (p['degats'] || 0) / 100;
        if (this.weaponType === 'corp-a-corp') {
            totalDamageModifier += (p['degats-corps-a-corps'] || 0) / 100;
        } else if (this.weaponType === 'a-distance') {
            totalDamageModifier += (p['degats-a-distance'] || 0) / 100;
        }

        const totalHealthModifier = 1 + (p['sante'] || 0) / 100;

        this.totalDamage = effectiveBaseDamage * totalDamageModifier;
        this.totalHealth = effectiveBaseHealth * totalHealthModifier;
        this.maxHealth = this.totalHealth;
        this.health = this.maxHealth;

        return this;
    }

    isAlive() {
        return this.health > 0;
    }

    tick(dt) {
        if (!this.isAlive()) return;

        this.passiveSkills.forEach(skill => skill.onTick(this, dt));

        const expiredSkills = [];
        this.activeSkills.forEach(skill => {
            const wasActive = skill.isActive ? skill.isActive() : false;

            skill.tick(dt, this);

            if (skill.isReady()) {
                skill.trigger(this);
            }

            const isNowActive = skill.isActive ? skill.isActive() : false;
            if (wasActive && !isNowActive) {
                expiredSkills.push(skill);
            }
        });

        if (expiredSkills.length > 0) {
            this._recalculateStats();
            expiredSkills.forEach(skill => skill.onExpire(this));
        }

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

    _recalculateStats() {
        const maxHealthBefore = this.maxHealth;

        let totalDamage = this.baseDamage;
        let maxHealth = this.baseHealth;

        this.passiveSkills.forEach(skill => {
            if (skill.onCalculateStats) {
                const result = skill.onCalculateStats(this, { totalDamage, maxHealth });
                totalDamage = result.totalDamage;
                maxHealth = result.maxHealth;
            }
        });

        this.activeSkills.forEach(skill => {
            const modifiers = skill.getStatModifiers();
            totalDamage += modifiers.damage;
            maxHealth += modifiers.health;
        });

        this.totalDamage = totalDamage;
        this.maxHealth = maxHealth;

        if (this.maxHealth > maxHealthBefore) {
            this.health += this.maxHealth - maxHealthBefore;
        }

        if (this.health > this.maxHealth) {
            this.health = this.maxHealth;
        }
    }
}
