import { CharacterService } from '../src/application/CharacterService.js';
import { Character } from '../src/domain/Character.js';

// Mock the Character class and its static method
jest.mock('../src/domain/Character.js');

describe('CharacterService', () => {
  let characterService;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    characterService = new CharacterService();
  });

  describe('getCharacterBaseStats', () => {
    it('should orchestrate character creation by calling Character.fromTotalStats', () => {
      const sheetStats = {
        totalDamage: 150,
        totalHealth: 2000,
        basePassiveSkills: {}
      };

      // Create a mock instance with a spy on recalculateStats
      const mockCharacterInstance = {
        recalculateStats: jest.fn().mockReturnThis(),
      };

      // Configure the static mock to return our mock instance
      Character.fromTotalStats.mockReturnValue(mockCharacterInstance);

      // Call the service method
      characterService.getCharacterBaseStats(sheetStats);

      // Assert that the static factory method was called correctly
      expect(Character.fromTotalStats).toHaveBeenCalledWith(sheetStats);
      expect(Character.fromTotalStats).toHaveBeenCalledTimes(1);

      // Assert that the final stat recalculation was triggered
      expect(mockCharacterInstance.recalculateStats).toHaveBeenCalledTimes(1);
    });
  });
});
