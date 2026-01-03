import { RegenerationSante } from '../../src/domain/passives/RegenerationSante.js';

describe('RegenerationSante', () => {
  it('should not have onCalculateStats logic', () => {
    // This skill's value is used directly in onTick, not pre-calculated
    const character = {};
    const skill = new RegenerationSante(10);
    // onCalculateStats should be empty or non-existent
    if (skill.onCalculateStats) {
      skill.onCalculateStats(character);
    }
    // No properties should be added to character
    expect(character).toEqual({});
  });

  it('should regenerate health based on a percentage of finalHealth per second', () => {
    const character = { currentHealth: 100, finalHealth: 1000 };
    const skill = new RegenerationSante(10); // 10% of finalHealth per second
    skill.onTick(character, 1.0); // Simulate 1 second
    // 100 (current) + 1000 * (10 / 100) * 1.0 = 200
    expect(character.currentHealth).toBe(200);
  });

  it('should handle different delta times correctly', () => {
    const character = { currentHealth: 100, finalHealth: 1000 };
    const skill = new RegenerationSante(10);
    skill.onTick(character, 0.5); // Simulate half a second
    // 100 + 1000 * 0.1 * 0.5 = 150
    expect(character.currentHealth).toBe(150);
  });

  test('handles zero health regeneration', () => {
    const character = { currentHealth: 100, finalHealth: 1000 };
    const skill = new RegenerationSante(0);
    skill.onTick(character, 1.0);
    expect(character.currentHealth).toBe(100);
  });

  test('handles negative health regeneration', () => {
    const character = { currentHealth: 100, finalHealth: 1000 };
    const skill = new RegenerationSante(-10);
    skill.onTick(character, 1.0);
    // 100 + 1000 * (-0.1) * 1.0 = 0
    expect(character.currentHealth).toBe(0);
  });
});
