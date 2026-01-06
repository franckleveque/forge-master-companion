import { SimulationService } from '../src/domain/SimulationService.js';
import { Character } from '../src/domain/Character.js';

describe('SimulationService Integration Tests', () => {
  let simulationService;
  let player;
  let opponent;

  beforeEach(() => {
    simulationService = new SimulationService();
    player = new Character({
      name: 'Player',
      baseDamage: 100,
      baseHealth: 1000,
      weaponType: 'a-distance', // Use ranged to avoid 2s melee delay
      basePassiveSkills: {},
      activeSkills: []
    });
    opponent = new Character({
      name: 'Opponent',
      baseDamage: 100,
      baseHealth: 1000,
      weaponType: 'corp-a-corp',
      basePassiveSkills: {},
      activeSkills: []
    });
  });

  test('Vitesse d\'attaque should result in correct attack timings', () => {
    player.basePassiveSkills = { 'vitesse-attaque': 200 }; // 200% -> 4 attacks per second (0.25s interval)

    const p1 = simulationService._calculateCharacterStats(player);
    const p2 = simulationService._calculateCharacterStats(opponent);

    // Spy on the performAttack method to track calls
    const attackSpy = jest.spyOn(simulationService, '_performAttack');

    const dt = 0.01;
    let time = 0;
    const attackTimes = [];

    // Simulate time and check for attacks
    for (let i = 0; i < 100; i++) { // Simulate for 1 second
      time += dt;

      const preAttackCount = attackSpy.mock.calls.length;
      simulationService._processTick(p1, p2, dt);
      const postAttackCount = attackSpy.mock.calls.length;

      if (postAttackCount > preAttackCount) {
        attackTimes.push(time);
      }
    }

    expect(attackTimes.length).toBe(4);
    expect(attackTimes[0]).toBeCloseTo(0.25, 2);
    expect(attackTimes[1]).toBeCloseTo(0.50, 2);
    expect(attackTimes[2]).toBeCloseTo(0.75, 2);
    expect(attackTimes[3]).toBeCloseTo(1.00, 2);

    attackSpy.mockRestore();
  });

  test('should stack global and melee damage passives correctly', () => {
    player.baseDamage = 1000;
    player.weaponType = 'corp-a-corp';
    player.basePassiveSkills = {
      'degats': 50,
      'degats-corps-a-corps': 25
    };

    const p1 = simulationService._calculateCharacterStats(player);
    const finalDamage = p1.passiveSkills.reduce((dmg, skill) => skill.onModifyOutgoingDamage(p1, null, dmg), p1.finalDamage);

    expect(finalDamage).toBeCloseTo(1750);
  });

  test('should stack global and ranged damage passives correctly and ignore melee', () => {
    player.baseDamage = 1000;
    player.weaponType = 'a-distance';
    player.basePassiveSkills = {
      'degats': 50,
      'degats-a-distance': 25,
      'degats-corps-a-corps': 30 // This should be ignored
    };

    const p1 = simulationService._calculateCharacterStats(player);
    const finalDamage = p1.passiveSkills.reduce((dmg, skill) => skill.onModifyOutgoingDamage(p1, null, dmg), p1.finalDamage);

    expect(finalDamage).toBeCloseTo(1750);
  });
});
