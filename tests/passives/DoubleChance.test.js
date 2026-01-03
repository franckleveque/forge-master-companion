import { DoubleChance } from '../../src/domain/passives/DoubleChance.js';

describe('DoubleChance', () => {
    beforeEach(() => {
        DoubleChance.doubleCounter = 0;
    });

  it('should increase doubleChance onCalculateStats', () => {
    const character = { doubleChance: 0 };
    const skill = new DoubleChance(50);
    skill.onCalculateStats(character);
    expect(character.doubleChance).toBe(0.5);
  });

  it('should trigger extra attack when counter allows', () => {
    const character = { doubleChance: 1.0 };
    const skill = new DoubleChance(100);
    const result = skill.onAfterAttackProcessed(character, null);
    expect(result).toBe(true);
  });

  it('should not trigger extra attack when counter does not allow', () => {
    const character = { doubleChance: 0.5 };
    const skill = new DoubleChance(50);
    DoubleChance.doubleCounter = 0.6;
    const result = skill.onAfterAttackProcessed(character, null);
    expect(result).toBe(false);
  });

  test('handles zero double chance', () => {
    const character = { doubleChance: 0 };
    const skill = new DoubleChance(0);
    skill.onCalculateStats(character);
    expect(character.doubleChance).toBe(0);
  });

  test('handles negative double chance', () => {
    const character = { doubleChance: 0 };
    const skill = new DoubleChance(-50);
    skill.onCalculateStats(character);
    expect(character.doubleChance).toBe(-0.5);
  });
});
