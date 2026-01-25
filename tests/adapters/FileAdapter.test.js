// tests/adapters/FileAdapter.test.js
import { FileAdapter } from '../../src/adapters/FileAdapter';
import { DomAdapter } from '../../src/adapters/DomAdapter';
import { PassiveSkillService } from '../../src/application/PassiveSkillService';
import { UiService } from '../../src/infrastructure/UiService';

jest.mock('../../src/adapters/DomAdapter');
jest.mock('../../src/application/PassiveSkillService');
jest.mock('../../src/infrastructure/UiService');

describe('FileAdapter', () => {
    let fileAdapter;
    let domAdapter;
    let passiveSkillService;
    let uiService;

    beforeEach(() => {
        domAdapter = new DomAdapter();
        passiveSkillService = new PassiveSkillService();
        uiService = new UiService();
        fileAdapter = new FileAdapter(domAdapter, passiveSkillService, uiService);
    });

    test('should correctly get equipment comparison data', () => {
        domAdapter.getElementValue.mockReturnValue('mockValue');
        passiveSkillService.getPassiveSkillIds.mockReturnValue(['skill1', 'skill2']);
        const data = fileAdapter.getEquipmentComparisonData();
        expect(data.type).toBe('equipment_comparison');
        expect(domAdapter.getElementValue).toHaveBeenCalledWith('total-damage');
    });

    test('should correctly get pvp data', () => {
        domAdapter.getCharacterStatsPvp.mockReturnValue('mockPvpData');
        const data = fileAdapter.getPvpData();
        expect(data.type).toBe('pvp_simulation');
        expect(data.player).toBe('mockPvpData');
    });

    test('should correctly import equipment comparison data', () => {
        const data = {
            character_stats: { total_damage: 100 },
            passive_skills: { skill1: 10 },
            active_skills: [{}],
            equipment: { equip1: {}, equip2: {} }
        };
        passiveSkillService.getPassiveSkillIds.mockReturnValue(['skill1']);
        fileAdapter.importEquipmentComparisonData(data);
        expect(domAdapter.setElementValue).toHaveBeenCalledWith('total-damage', 100);
    });

    test('should correctly import pvp data', () => {
        const data = {
            player: { totalDamage: 200, basePassiveSkills: { skill1: 20 }, activeSkills: [{}] },
            opponent: { totalDamage: 300, basePassiveSkills: { skill1: 30 }, activeSkills: [{}] }
        };
        passiveSkillService.getPassiveSkillIds.mockReturnValue(['skill1']);
        fileAdapter.importPvpData(data);
        expect(domAdapter.setElementValue).toHaveBeenCalledWith('total-damage', 200);
        expect(domAdapter.setElementValue).toHaveBeenCalledWith('opponent-total-damage', 300);
    });
});
