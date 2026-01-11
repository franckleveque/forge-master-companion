import { CharacterService } from '../src/domain/CharacterService.js';
import { PassiveSkillFactory } from '../src/domain/passives/PassiveSkillFactory.js';
import { PassiveSkillService } from '../src/domain/PassiveSkillService.js';

describe('CharacterService', () => {
  let characterService;

  beforeEach(() => {
    const passiveSkillService = new PassiveSkillService();
    const passiveSkillFactory = new PassiveSkillFactory();
    characterService = new CharacterService(passiveSkillService, passiveSkillFactory);
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

  describe('recalculateTotalStats', () => {
    it('should correctly recalculate total stats from base stats', () => {
      const characterStats = {
        baseDamage: 100,
        baseHealth: 1000,
        weaponType: 'corp-a-corp',
        basePassiveSkills: {
          'degats': 50,
          'sante': 50,
          'degats-corps-a-corps': 20
        }
      };
      const finalStats = characterService.recalculateTotalStats(characterStats);
      expect(finalStats.totalDamage).toBeCloseTo(170);
      expect(finalStats.totalHealth).toBeCloseTo(1500);
    });
  });
});
