import { ChanceBlocage } from '../../src/domain/passives/ChanceBlocage.js';

describe('ChanceBlocage', () => {
    beforeEach(() => {
        ChanceBlocage.blockCounter = 0;
    });

  it('should increase blockChance onCalculateStats', () => {
    const character = { blockChance: 0 };
    const skill = new ChanceBlocage(50);
    skill.onCalculateStats(character);
    expect(character.blockChance).toBe(0.5);
  });

  it('should block incoming damage when counter allows', () => {
    const character = { blockChance: 1.0 };
    const skill = new ChanceBlocage(100);
    const damage = skill.onModifyIncomingDamage(character, null, 100);
    expect(damage).toBe(0);
  });

  it('should not block incoming damage when counter does not allow', () => {
    const character = { blockChance: 0.5 };
    const skill = new ChanceBlocage(50);
    ChanceBlocage.blockCounter = 0.6;
    const damage = skill.onModifyIncomingDamage(character, null, 100);
    expect(damage).toBe(100);
  });

  test('handles zero block chance', () => {
    const character = { blockChance: 0 };
    const skill = new ChanceBlocage(0);
    skill.onCalculateStats(character);
    expect(character.blockChance).toBe(0);
  });

  test('handles negative block chance', () => {
    const character = { blockChance: 0 };
    const skill = new ChanceBlocage(-50);
    skill.onCalculateStats(character);
    expect(character.blockChance).toBe(-0.5);
  });
});
