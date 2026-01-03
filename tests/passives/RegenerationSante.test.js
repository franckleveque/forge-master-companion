import { RegenerationSante } from '../../src/domain/passives/RegenerationSante.js';

describe('RegenerationSante', () => {
  it('should increase healthRegenPerSec onCalculateStats', () => {
    const character = { healthRegenPerSec: 0 };
    const skill = new RegenerationSante(10);
    skill.onCalculateStats(character);
    expect(character.healthRegenPerSec).toBe(10);
  });

  it('should regenerate health onTick', () => {
    const character = { currentHealth: 100, healthRegenPerSec: 10 };
    const skill = new RegenerationSante(10);
    skill.onTick(character, 1.0);
    expect(character.currentHealth).toBe(110);
  });

  test('handles zero health regeneration', () => {
    const character = { healthRegenPerSec: 0 };
    const skill = new RegenerationSante(0);
    skill.onCalculateStats(character);
    expect(character.healthRegenPerSec).toBe(0);
  });

  test('handles negative health regeneration', () => {
    const character = { healthRegenPerSec: 0 };
    const skill = new RegenerationSante(-10);
    skill.onCalculateStats(character);
    expect(character.healthRegenPerSec).toBe(-10);
  });
});
