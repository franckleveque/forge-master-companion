import { CompetencesTempsRecharge } from '../../src/domain/passives/CompetencesTempsRecharge.js';

describe('CompetencesTempsRecharge', () => {
  it('should decrease competenceCooldownMod onCalculateStats', () => {
    const character = { competenceCooldownMod: 1.0 };
    const skill = new CompetencesTempsRecharge(100);
    skill.onCalculateStats(character);
    expect(character.competenceCooldownMod).toBe(0.5);
  });

  test('handles zero competence cooldown reduction', () => {
    const character = { competenceCooldownMod: 1.0 };
    const skill = new CompetencesTempsRecharge(0);
    skill.onCalculateStats(character);
    expect(character.competenceCooldownMod).toBe(1.0);
  });

  test('handles negative competence cooldown reduction', () => {
    const character = { competenceCooldownMod: 1.0 };
    const skill = new CompetencesTempsRecharge(-100);
    skill.onCalculateStats(character);
    expect(character.competenceCooldownMod).toBe(2.0);
  });
});
