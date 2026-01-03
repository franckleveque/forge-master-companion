import { DegatsCritiques } from '../../src/domain/passives/DegatsCritiques.js';

describe('DegatsCritiques', () => {
  it('should increase critDamage onCalculateStats', () => {
    const character = { critDamage: 1.5 };
    const skill = new DegatsCritiques(50);
    skill.onCalculateStats(character);
    expect(character.critDamage).toBe(2.0);
  });

  test('handles zero critical damage bonus', () => {
    const character = { critDamage: 1.5 };
    const skill = new DegatsCritiques(0);
    skill.onCalculateStats(character);
    expect(character.critDamage).toBe(1.5);
  });

  test('handles negative critical damage bonus', () => {
    const character = { critDamage: 1.5 };
    const skill = new DegatsCritiques(-50);
    skill.onCalculateStats(character);
    expect(character.critDamage).toBe(1.0);
  });
});
