import { Sante } from '../../src/domain/passives/Sante.js';

describe('Sante', () => {
  it('should increase finalHealth onCalculateStats', () => {
    const character = { totalHealth: 1000, finalHealth: 1000 };
    const skill = new Sante(50);
    skill.onCalculateStats(character);
    expect(character.finalHealth).toBe(1500);
  });

  test('handles zero health bonus', () => {
    const character = { totalHealth: 1000, finalHealth: 1000 };
    const skill = new Sante(0);
    skill.onCalculateStats(character);
    expect(character.finalHealth).toBe(1000);
  });

  test('handles negative health bonus', () => {
    const character = { totalHealth: 1000, finalHealth: 1000 };
    const skill = new Sante(-50);
    skill.onCalculateStats(character);
    expect(character.finalHealth).toBe(500);
  });
});
