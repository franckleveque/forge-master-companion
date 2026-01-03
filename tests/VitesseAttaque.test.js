// tests/VitesseAttaque.test.js
import { VitesseAttaque } from '../src/domain/passives/VitesseAttaque.js';

describe('VitesseAttaque', () => {
    it('should correctly calculate the attack time modifier', () => {
        // Arrange
        const skill = new VitesseAttaque(200);
        const mockCharacter = { timePerAttack: 1.0 };

        // Act
        skill.onCalculateStats(mockCharacter);

        // Assert
        expect(mockCharacter.timePerAttack).toBeCloseTo(0.25);
    });

    it('should handle a zero value without changing the attack time', () => {
        // Arrange
        const skill = new VitesseAttaque(0);
        const mockCharacter = { timePerAttack: 1.0 };

        // Act
        skill.onCalculateStats(mockCharacter);

        // Assert
        expect(mockCharacter.timePerAttack).toBe(1.0);
    });
});
