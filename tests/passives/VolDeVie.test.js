import { VolDeVie } from '../../src/domain/passives/VolDeVie.js';

describe('VolDeVie', () => {
  it('should increase lifesteal onCalculateStats', () => {
    const character = { lifesteal: 0 };
    const skill = new VolDeVie(50);
    skill.onCalculateStats(character);
    expect(character.lifesteal).toBe(0.5);
  });

  it('should heal the attacker onAfterAttackDealt', () => {
    const attacker = { currentHealth: 50, lifesteal: 0.5 };
    const skill = new VolDeVie(50);
    skill.onAfterAttackDealt(attacker, null, 100);
    expect(attacker.currentHealth).toBe(100);
  });

  test('handles zero lifesteal value', () => {
    const character = { lifesteal: 0 };
    const skill = new VolDeVie(0);
    skill.onCalculateStats(character);
    expect(character.lifesteal).toBe(0);
  });

  test('handles negative lifesteal value', () => {
    const character = { lifesteal: 0 };
    const skill = new VolDeVie(-50);
    skill.onCalculateStats(character);
    expect(character.lifesteal).toBe(-0.5);
  });
});
