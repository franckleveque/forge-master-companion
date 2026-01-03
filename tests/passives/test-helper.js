// tests/passives/test-helper.js
import { Character } from '../../src/domain/Character.js';

export const createTestCharacter = (passives = {}, overrides = {}) => {
    const defaultCharacter = {
        name: 'Player',
        totalHealth: 1000,
        totalDamage: 100,
        weaponType: 'corp-a-corp',
        basePassiveSkills: passives,
        activeSkills: [],
    };
    const characterData = { ...defaultCharacter, ...overrides };
    const character = new Character(characterData);
    character.enemy = { dps: 0, weaponType: 'corp-a-corp' }; // Always add enemy
    return character;
};
