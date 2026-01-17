import { CharacterService } from '../src/application/CharacterService.js';

describe('CharacterService', () => {
  let characterService;

  beforeEach(() => {
    characterService = new CharacterService();
  });

  describe('getCharacterBaseStats', () => {
    it('should correctly calculate base stats from total stats with global modifiers', () => {
      const sheetStats = {
        totalDamage: 150,
        totalHealth: 2000,
        weaponType: 'a-distance',
        basePassiveSkills: {
          'degats': 50,
          'sante': 100
        }
      };
      const baseStats = characterService.getCharacterBaseStats(sheetStats);
      expect(baseStats.baseDamage).toBeCloseTo(100);
      expect(baseStats.baseHealth).toBeCloseTo(1000);
    });

    it('should correctly calculate base stats with weapon-specific modifiers', () => {
      const sheetStats = {
        totalDamage: 170,
        totalHealth: 1000,
        weaponType: 'corp-a-corp',
        basePassiveSkills: {
          'degats': 50,
          'degats-corps-a-corps': 20
        }
      };
      const baseStats = characterService.getCharacterBaseStats(sheetStats);
      expect(baseStats.baseDamage).toBeCloseTo(100);
    });

    it('should handle zero modifiers correctly', () => {
        const sheetStats = {
          totalDamage: 100,
          totalHealth: 1000,
          weaponType: 'corp-a-corp',
          basePassiveSkills: {}
        };
        const baseStats = characterService.getCharacterBaseStats(sheetStats);
        expect(baseStats.baseDamage).toBeCloseTo(100);
        expect(baseStats.baseHealth).toBeCloseTo(1000);
      });
  });

});
