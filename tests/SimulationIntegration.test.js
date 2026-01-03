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
      totalDamage: 100,
      totalHealth: 1000,
      weaponType: 'corp-a-corp',
      basePassiveSkills: {},
      activeSkills: []
    });
    opponent = new Character({
      name: 'Opponent',
      totalDamage: 100,
      totalHealth: 1000,
      weaponType: 'corp-a-corp',
      basePassiveSkills: {},
      activeSkills: []
    });
  });

  // Helper function to simulate a single attack
  const simulateAttack = (attacker, defender) => {
    let damage = attacker.finalDamage;
    damage = attacker.passiveSkills.reduce((dmg, skill) => skill.onModifyOutgoingDamage(attacker, defender, dmg), damage);
    damage = defender.passiveSkills.reduce((dmg, skill) => skill.onModifyIncomingDamage(defender, attacker, dmg), damage);

    defender.currentHealth -= damage;
    attacker.passiveSkills.forEach(s => s.onAfterAttackDealt(attacker, defender, damage));
  };

  test('Lifesteal should apply to critical hits', () => {
    player.basePassiveSkills = {
      'vol-de-vie': 50,
      'chance-critique': 100,
      'degats-critiques': 50
    };
    opponent.basePassiveSkills = { 'chance-blocage': -100 }; // Ensure no blocks

    const p1 = simulationService._calculateCharacterStats(player);
    const p2 = simulationService._calculateCharacterStats(opponent);

    p1.currentHealth = 500;
    const initialHealth = p1.currentHealth;

    simulateAttack(p1, p2);

    const expectedCritDamage = 100 * (1.5 + 0.5); // 100 base * (1.5 base crit + 0.5 bonus)
    const expectedLifesteal = expectedCritDamage * 0.5;
    expect(p1.currentHealth).toBe(initialHealth + expectedLifesteal);
  });

  test('Vitesse d\'attaque should result in correct attack timings', () => {
    player.basePassiveSkills = { 'vitesse-attaque': 200 }; // 200% -> 4 attacks per second (0.25s interval)
    player.weaponType = 'a-distance'; // Use ranged to avoid 2s melee delay

    const p1 = simulationService._calculateCharacterStats(player);
    expect(p1.timePerAttack).toBeCloseTo(0.25);

    let time = 0;
    const dt = 0.01;
    const attackTimes = [];

    // Manually simulate the attack loop
    for (let i = 0; i < 100; i++) { // Simulate for 1 second
      time += dt;
      p1.attackTimer -= dt;
      // Use a small tolerance for floating point comparisons
      while (p1.attackTimer <= 1e-9) {
        attackTimes.push(time);
        p1.attackTimer += p1.timePerAttack;
      }
    }

    expect(attackTimes.length).toBe(4);
    expect(attackTimes[0]).toBeCloseTo(0.25, 2);
    expect(attackTimes[1]).toBeCloseTo(0.50, 2);
    expect(attackTimes[2]).toBeCloseTo(0.75, 2);
    expect(attackTimes[3]).toBeCloseTo(1.00, 2);
  });
});
