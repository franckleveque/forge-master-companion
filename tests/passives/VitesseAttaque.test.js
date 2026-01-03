import { VitesseAttaque } from '../../src/domain/passives/VitesseAttaque.js';

describe('VitesseAttaque', () => {
  it('should decrease timePerAttack', () => {
    const character = { timePerAttack: 1.0 };
    const skill = new VitesseAttaque(100);
    skill.onCalculateStats(character);
    expect(character.timePerAttack).toBeCloseTo(0.5);
  });

  test('handles zero attack speed bonus', () => {
    const character = { timePerAttack: 1.0 };
    const skill = new VitesseAttaque(0);
    skill.onCalculateStats(character);
    expect(character.timePerAttack).toBeCloseTo(1.0);
  });

  test('handles negative attack speed bonus', () => {
    const character = { timePerAttack: 1.0 };
    const skill = new VitesseAttaque(-100);
    skill.onCalculateStats(character);
    expect(character.timePerAttack).toBeCloseTo(2.0);
  });
});
