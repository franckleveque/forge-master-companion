import { CharacterService } from '../../src/application/CharacterService.js';
import { Character } from '../../src/domain/Character.js';

jest.mock('../../src/domain/Character.js');

describe('CharacterService', () => {
  let characterService;
  let mockPassiveSkillService;

  beforeEach(() => {
    mockPassiveSkillService = {};
    characterService = new CharacterService(mockPassiveSkillService);
    Character.fromTotalStats.mockClear();
  });

  describe('getCharacterBaseStats', () => {
    it('should call the Character.fromTotalStats factory method', () => {
      const sheetStats = { totalDamage: 100, totalHealth: 1000 };
      characterService.getCharacterBaseStats(sheetStats);
      expect(Character.fromTotalStats).toHaveBeenCalledWith(sheetStats);
      expect(Character.fromTotalStats).toHaveBeenCalledTimes(1);
    });
  });
});
