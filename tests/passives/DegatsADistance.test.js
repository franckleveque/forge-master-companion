import { DegatsADistance } from '../../src/domain/passives/DegatsADistance.js';

describe('DegatsADistance', () => {
  it('should increase ranged damage', () => {
    const character = { weaponType: 'a-distance' };
    const skill = new DegatsADistance(50);
    const damage = skill.onModifyOutgoingDamage(character, null, 100);
    expect(damage).toBe(150);
  });

  it('should not increase non-ranged damage', () => {
    const character = { weaponType: 'corp-a-corp' };
    const skill = new DegatsADistance(50);
    const damage = skill.onModifyOutgoingDamage(character, null, 100);
    expect(damage).toBe(100);
  });

  test('handles zero ranged damage bonus', () => {
    const character = { weaponType: 'a-distance' };
    const skill = new DegatsADistance(0);
    const damage = skill.onModifyOutgoingDamage(character, null, 100);
    expect(damage).toBe(100);
  });

  test('handles negative ranged damage bonus', () => {
    const character = { weaponType: 'a-distance' };
    const skill = new DegatsADistance(-50);
    const damage = skill.onModifyOutgoingDamage(character, null, 100);
    expect(damage).toBe(50);
  });
});
