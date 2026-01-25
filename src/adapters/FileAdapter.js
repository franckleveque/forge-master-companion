// src/adapters/FileAdapter.js
export class FileAdapter {
    constructor(domAdapter, passiveSkillService, uiService) {
        this.domAdapter = domAdapter;
        this.passiveSkillService = passiveSkillService;
        this.uiService = uiService;
    }

    getEquipmentComparisonData() {
        const data = {
            type: 'equipment_comparison',
            character_stats: {},
            passive_skills: {},
            active_skills: [],
            enemy_stats: {},
            equipment: {
                equip1: {},
                equip2: {}
            }
        };

        data.character_stats.total_damage = this.domAdapter.getElementValue('total-damage');
        data.character_stats.total_health = this.domAdapter.getElementValue('total-health');
        data.character_stats.weaponType = this.domAdapter.getElementValue('weapon-type');

        this.passiveSkillService.getPassiveSkillIds().forEach(skillId => {
            data.passive_skills[skillId] = this.domAdapter.getElementValue(skillId);
        });

        for (let i = 1; i <= 3; i++) {
            const skillId = `player-active${i}`;
            data.active_skills.push({
                type: this.domAdapter.getElementValue(`${skillId}-type`),
                baseDamage: this.domAdapter.getElementValue(`${skillId}-baseDamage`),
                baseHealth: this.domAdapter.getElementValue(`${skillId}-baseHealth`),
                cooldown: this.domAdapter.getElementValue(`${skillId}-cooldown`),
                value: this.domAdapter.getElementValue(`${skillId}-value`),
                hits: this.domAdapter.getElementValue(`${skillId}-hits`),
                damageBuff: this.domAdapter.getElementValue(`${skillId}-damageBuff`),
                healthBuff: this.domAdapter.getElementValue(`${skillId}-healthBuff`),
                duration: this.domAdapter.getElementValue(`${skillId}-duration`)
            });
        }

        data.equipment.category = this.domAdapter.getElementValue('equipment-category');
        data.equipment.equip1.weaponType = this.domAdapter.getElementValue('equip1-weapon-type');
        data.equipment.equip1.damage = this.domAdapter.getElementValue('equip1-damage-value');
        data.equipment.equip1.health = this.domAdapter.getElementValue('equip1-health-value');
        data.equipment.equip1.passive_skill = this.domAdapter.getElementValue('equip1-passive-skill');
        data.equipment.equip1.passive_skill_value = this.domAdapter.getElementValue('equip1-passive-skill-value');
        data.equipment.equip2.unequip = this.domAdapter.getElementValue('equip2-unequip');
        data.equipment.equip2.weaponType = this.domAdapter.getElementValue('equip2-weapon-type');
        data.equipment.equip2.damage = this.domAdapter.getElementValue('equip2-damage-value');
        data.equipment.equip2.health = this.domAdapter.getElementValue('equip2-health-value');
        data.equipment.equip2.passive_skill = this.domAdapter.getElementValue('equip2-passive-skill');
        data.equipment.equip2.passive_skill_value = this.domAdapter.getElementValue('equip2-passive-skill-value');

        return data;
    }

    getPvpData() {
        const data = {
            type: 'pvp_simulation',
            player: this.domAdapter.getCharacterStatsPvp('player'),
            opponent: this.domAdapter.getCharacterStatsPvp('opponent')
        };
        return data;
    }

    importEquipmentComparisonData(data) {
        this.domAdapter.setElementValue('total-damage', data.character_stats.total_damage);
        this.domAdapter.setElementValue('total-health', data.character_stats.total_health);
        this.domAdapter.setElementValue('weapon-type', data.character_stats.weaponType);

        this.passiveSkillService.getPassiveSkillIds().forEach(skillId => {
            this.domAdapter.setElementValue(skillId, data.passive_skills[skillId]);
        });

        for (let i = 1; i <= 3; i++) {
            const skillId = `player-active${i}`;
            const skillData = data.active_skills[i - 1] || {};
            this.domAdapter.setElementValue(`${skillId}-type`, skillData.type || '');
            this.domAdapter.setElementValue(`${skillId}-baseDamage`, skillData.baseDamage || '');
            this.domAdapter.setElementValue(`${skillId}-baseHealth`, skillData.baseHealth || '');
            this.domAdapter.setElementValue(`${skillId}-cooldown`, skillData.cooldown || '');
            this.domAdapter.setElementValue(`${skillId}-value`, skillData.value || '');
            this.domAdapter.setElementValue(`${skillId}-hits`, skillData.hits || '');
            this.domAdapter.setElementValue(`${skillId}-damageBuff`, skillData.damageBuff || '');
            this.domAdapter.setElementValue(`${skillId}-healthBuff`, skillData.healthBuff || '');
            this.domAdapter.setElementValue(`${skillId}-duration`, skillData.duration || '');
            this.uiService.toggleSkillParams(skillId);
        }

        this.domAdapter.setElementValue('equipment-category', data.equipment.category);
        this.domAdapter.setElementValue('equip1-weapon-type', data.equipment.equip1.weaponType);
        this.domAdapter.setElementValue('equip1-damage-value', data.equipment.equip1.damage);
        this.domAdapter.setElementValue('equip1-health-value', data.equipment.equip1.health);
        this.domAdapter.setElementValue('equip1-passive-skill', data.equipment.equip1.passive_skill);
        this.domAdapter.setElementValue('equip1-passive-skill-value', data.equipment.equip1.passive_skill_value);
        this.domAdapter.setElementValue('equip2-unequip', data.equipment.equip2.unequip);
        this.domAdapter.setElementValue('equip2-weapon-type', data.equipment.equip2.weaponType);
        this.domAdapter.setElementValue('equip2-damage-value', data.equipment.equip2.damage);
        this.domAdapter.setElementValue('equip2-health-value', data.equipment.equip2.health);
        this.domAdapter.setElementValue('equip2-passive-skill', data.equipment.equip2.passive_skill);
        this.domAdapter.setElementValue('equip2-passive-skill-value', data.equipment.equip2.passive_skill_value);
    }

    importPvpData(data) {
        // Player Data
        const playerData = data.player;
        this.domAdapter.setElementValue('total-damage', playerData.totalDamage);
        this.domAdapter.setElementValue('total-health', playerData.totalHealth);
        this.domAdapter.setElementValue('weapon-type', playerData.weaponType);
        this.passiveSkillService.getPassiveSkillIds().forEach(skillId => {
            this.domAdapter.setElementValue(skillId, playerData.basePassiveSkills[skillId]);
        });
        for (let i = 1; i <= 3; i++) {
            const skillId = `player-active${i}`;
            const skillData = playerData.activeSkills[i - 1] || {};
            this.domAdapter.setElementValue(`${skillId}-type`, skillData.type || '');
            this.domAdapter.setElementValue(`${skillId}-baseDamage`, skillData.baseDamage || '');
            this.domAdapter.setElementValue(`${skillId}-baseHealth`, skillData.baseHealth || '');
            this.domAdapter.setElementValue(`${skillId}-cooldown`, skillData.cooldown || '');
            this.domAdapter.setElementValue(`${skillId}-value`, skillData.value || '');
            this.domAdapter.setElementValue(`${skillId}-hits`, skillData.hits || '');
            this.domAdapter.setElementValue(`${skillId}-damageBuff`, skillData.damageBuff || '');
            this.domAdapter.setElementValue(`${skillId}-healthBuff`, skillData.healthBuff || '');
            this.domAdapter.setElementValue(`${skillId}-duration`, skillData.duration || '');
            this.uiService.toggleSkillParams(skillId);
        }

        // Opponent Data
        const opponentData = data.opponent;
        this.domAdapter.setElementValue('opponent-total-damage', opponentData.totalDamage);
        this.domAdapter.setElementValue('opponent-total-health', opponentData.totalHealth);
        this.domAdapter.setElementValue('opponent-weapon-type', opponentData.weaponType);
        this.passiveSkillService.getPassiveSkillIds().forEach(skillId => {
            this.domAdapter.setElementValue(`opponent-${skillId}`, opponentData.basePassiveSkills[skillId]);
        });
        for (let i = 1; i <= 3; i++) {
            const skillId = `opponent-active${i}`;
            const skillData = opponentData.activeSkills[i - 1] || {};
            this.domAdapter.setElementValue(`${skillId}-type`, skillData.type || '');
            this.domAdapter.setElementValue(`${skillId}-baseDamage`, skillData.baseDamage || '');
            this.domAdapter.setElementValue(`${skillId}-baseHealth`, skillData.baseHealth || '');
            this.domAdapter.setElementValue(`${skillId}-cooldown`, skillData.cooldown || '');
            this.domAdapter.setElementValue(`${skillId}-value`, skillData.value || '');
            this.domAdapter.setElementValue(`${skillId}-hits`, skillData.hits || '');
            this.domAdapter.setElementValue(`${skillId}-damageBuff`, skillData.damageBuff || '');
            this.domAdapter.setElementValue(`${skillId}-healthBuff`, skillData.healthBuff || '');
            this.domAdapter.setElementValue(`${skillId}-duration`, skillData.duration || '');
            this.uiService.toggleSkillParams(skillId);
        }
    }
}
