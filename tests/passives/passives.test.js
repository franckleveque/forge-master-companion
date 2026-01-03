// Using dynamic import() for ES modules in a CommonJS environment
const SimulationService = import('../../src/domain/SimulationService.js');
const Character = import('../../src/domain/Character.js');

describe('SimulationService Passives', () => {
    let simulationService, characterClass;

    beforeAll(async () => {
        const simModule = await SimulationService;
        const charModule = await Character;
        simulationService = new simModule.SimulationService();
        characterClass = charModule.Character;
    });

    // Helper function to create a baseline character for tests
    const createTestCharacter = (passives = {}, overrides = {}) => {
        const character = new characterClass('Player', 1000, 100, 'corp-a-corp', passives);
        character.totalHealth = 1000;
        character.totalDamage = 100;
        character.activeSkills = [];
        character.enemy = { dps: 0, weaponType: 'corp-a-corp' }; // No enemy damage unless specified
        return { ...character, ...overrides };
    };

    describe("Vitesse d'attaque", () => {
        it('should correctly calculate timePerAttack for 200% attack speed', () => {
            const character = createTestCharacter({ 'vitesse-attaque': 200 });
            const calculatedStats = simulationService._calculateCharacterStats(character);
            expect(calculatedStats.timePerAttack).toBeCloseTo(0.25);
        });

        it('should perform attacks at the correct intervals with 200% attack speed', () => {
            const character = createTestCharacter({ 'vitesse-attaque': 200 });
            const result = simulationService.simulate(character);
            const expectedAttacks = 60 / 0.25;
            expect(result.totalDamageDealt).toBe(100 * expectedAttacks);
        });
    });
});
