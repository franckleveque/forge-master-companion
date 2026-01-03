import { Degats } from '../../src/domain/passives/Degats.js';

describe('Degats', () => {
  it('should increase finalDamage onCalculateStats', () => {
    const character = { totalDamage: 100, finalDamage: 100 };
    const skill = new Degats(50);
    skill.onCalculateStats(character);
    expect(character.finalDamage).toBe(150);
  });

  test('handles zero damage bonus', () => {
    const character = { totalDamage: 100, finalDamage: 100 };
    const skill = new Degats(0);
    skill.onCalculateStats(character);
    expect(character.finalDamage).toBe(100);
  });

  test('handles negative damage bonus', () => {
    const character = { totalDamage: 100, finalDamage: 100 };
    const skill = new Degats(-50);
    skill.onCalculateStats(character);
    expect(character.finalDamage).toBe(50);
  });
});
