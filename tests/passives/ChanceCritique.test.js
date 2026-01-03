import { ChanceCritique } from '../../src/domain/passives/ChanceCritique.js';

describe('ChanceCritique', () => {
  beforeEach(() => {
    // Reset the counter before each test
    ChanceCritique.critCounter = 0;
  });

  it('should increase critChance onCalculateStats', () => {
    const character = { critChance: 0 };
    const skill = new ChanceCritique(50);
    skill.onCalculateStats(character);
    expect(character.critChance).toBe(0.5);
  });

  it('should deal critical damage when counter allows', () => {
    const character = { critChance: 1.0, critDamage: 1.5 }; // Ensure 100% crit for test reliability
    const skill = new ChanceCritique(100);
    const damage = skill.onModifyOutgoingDamage(character, null, 100);
    expect(damage).toBe(150);
  });

  it('should not deal critical damage when counter does not allow', () => {
    const character = { critChance: 0.5, critDamage: 1.5 };
    const skill = new ChanceCritique(50);
    // Manually set counter to a non-crit state
    ChanceCritique.critCounter = 0.6;
    const damage = skill.onModifyOutgoingDamage(character, null, 100);
    expect(damage).toBe(100);
  });

  test('handles zero critical chance', () => {
    const character = { critChance: 0 };
    const skill = new ChanceCritique(0);
    skill.onCalculateStats(character);
    expect(character.critChance).toBe(0);
  });

  test('handles negative critical chance', () => {
    const character = { critChance: 0 };
    const skill = new ChanceCritique(-50);
    skill.onCalculateStats(character);
    expect(character.critChance).toBe(-0.5);
  });
});
