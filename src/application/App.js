// src/application/App.js

import { CharacterService } from '../domain/CharacterService.js';
import { UiService } from '../infrastructure/UiService.js';
import { DomAdapter } from '../adapters/DomAdapter.js';
import { SimulationService } from '../domain/SimulationService.js';
import { FileService } from '../infrastructure/FileService.js';
import { PassiveSkillService } from '../domain/PassiveSkillService.js';

document.addEventListener('DOMContentLoaded', () => {
    const characterService = new CharacterService();
    const uiService = new UiService();
    const passiveSkillService = new PassiveSkillService();
    const domAdapter = new DomAdapter(characterService, passiveSkillService);
    const simulationService = new SimulationService();
    const fileService = new FileService();

    // Event listeners for mode switching
    uiService.modeEquipmentButton.addEventListener('click', () => uiService.switchToEquipmentMode());
    uiService.modePvpButton.addEventListener('click', () => uiService.switchToPvpMode());

    // Event listener for equipment comparison
    uiService.compareButton.addEventListener('click', () => {
        let baseStats = domAdapter.getCharacterStats();
        const equipNew = domAdapter.getEquipment(1, baseStats);
        const equipOld = domAdapter.getEquipment(2, baseStats);

        if (domAdapter.isUnequipChecked()) {
            baseStats = characterService.unequipEquipment(baseStats, equipOld);
        }

        const statsNew = characterService.applyEquipment(baseStats, equipNew);
        const statsOld = characterService.applyEquipment(baseStats, equipOld);

        const resultNew = simulationService.simulate(statsNew);
        const resultOld = simulationService.simulate(statsOld);

        domAdapter.displayComparisonResults(resultNew, resultOld);
    });

    // Event listener for PvP simulation
    uiService.simulateButton.addEventListener('click', () => {
        const player = domAdapter.getCharacterStatsPvp('player');
        const opponent = domAdapter.getCharacterStatsPvp('opponent');
        const result = simulationService.simulatePvp(player, opponent);
        domAdapter.displayPvpResults(result);
    });

    // Event listeners for import/export
    uiService.exportEquipmentButton.addEventListener('click', () => {
        const data = domAdapter.getEquipmentComparisonData();
        fileService.exportData('equipment', data);
    });
    uiService.exportPvpButton.addEventListener('click', () => {
        const data = domAdapter.getPvpData();
        fileService.exportData('pvp', data);
    });
    uiService.importEquipmentButton.addEventListener('click', () => uiService.importFile.click());
    uiService.importPvpButton.addEventListener('click', () => uiService.importFile.click());
    uiService.importFile.addEventListener('change', (event) => {
        fileService.importData(event, (data) => {
            if (data.type === 'equipment_comparison' && uiService.isEquipmentMode()) {
                domAdapter.importEquipmentComparisonData(data);
            } else if (data.type === 'pvp_simulation' && uiService.isPvpMode()) {
                domAdapter.importPvpData(data);
            } else {
                alert('The selected file does not match the active tab or is invalid.');
            }
        });
    });

    // Initial population of passive skills
    const passiveSkillsForUi = characterService.getPassiveSkills();
    uiService.populatePassiveSkills(passiveSkillsForUi);
});
