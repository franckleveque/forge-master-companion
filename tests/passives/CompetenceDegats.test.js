import { CompetenceDegats } from '../../src/domain/passives/CompetenceDegats.js';

describe('CompetenceDegats', () => {
  it('should increase competenceDegatsMod onCalculateStats', () => {
    const character = { competenceDegatsMod: 1.0 };
    const skill = new CompetenceDegats(50);
    skill.onCalculateStats(character);
    expect(character.competenceDegatsMod).toBe(1.5);
  });

  test('handles zero competence damage bonus', () => {
    const character = { competenceDegatsMod: 1.0 };
    const skill = new CompetenceDegats(0);
    skill.onCalculateStats(character);
    expect(character.competenceDegatsMod).toBe(1.0);
  });

  test('handles negative competence damage bonus', () => {
    const character = { competenceDegatsMod: 1.0 };
    const skill = new CompetenceDegats(-50);
    skill.onCalculateStats(character);
    expect(character.competenceDegatsMod).toBe(0.5);
  });
});
