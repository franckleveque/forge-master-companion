import { DegatsCorpsACorps } from '../../src/domain/passives/DegatsCorpsACorps.js';

describe('DegatsCorpsACorps', () => {
  it('should increase melee damage', () => {
    const character = { weaponType: 'corp-a-corp' };
    const skill = new DegatsCorpsACorps(50);
    const damage = skill.onModifyOutgoingDamage(character, null, 100);
    expect(damage).toBe(150);
  });

  it('should not increase non-melee damage', () => {
    const character = { weaponType: 'a-distance' };
    const skill = new DegatsCorpsACorps(50);
    const damage = skill.onModifyOutgoingDamage(character, null, 100);
    expect(damage).toBe(100);
  });

  test('handles zero melee damage bonus', () => {
    const character = { weaponType: 'corp-a-corp' };
    const skill = new DegatsCorpsACorps(0);
    const damage = skill.onModifyOutgoingDamage(character, null, 100);
    expect(damage).toBe(100);
  });

  test('handles negative melee damage bonus', () => {
    const character = { weaponType: 'corp-a-corp' };
    const skill = new DegatsCorpsACorps(-50);
    const damage = skill.onModifyOutgoingDamage(character, null, 100);
    expect(damage).toBe(50);
  });
});
