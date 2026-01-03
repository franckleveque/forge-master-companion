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
        // 1. Get the character's full current stats from the character sheet.
        const characterSheetStats = domAdapter.getCharacterStats();

        // 2. Get the equipment objects for comparison.
        const equipNew = domAdapter.getEquipment(1, characterSheetStats);
        const equipOld = domAdapter.getEquipment(2, characterSheetStats);

        // 3. Create a baseline stat object by sequentially "un-applying" the old equipment.
        // This creates the character's state as if the old equipment was never there.
        const statsWithoutOldEquip = characterService.unequipEquipment(characterSheetStats, equipOld);

        // 4. Create the two scenarios for simulation.

        // Scenario A: The character with the new equipment.
        // We take the baseline and apply the new equipment to it.
        const statsForNewEquip = characterService.applyEquipment(statsWithoutOldEquip, equipNew);

        // Scenario B: The character with the old equipment (or unequipped).
        let statsForOldEquip;
        if (domAdapter.isUnequipChecked()) {
            // If "unequip" is checked, the comparison is against the character with the slot empty.
            statsForOldEquip = statsWithoutOldEquip;
        } else {
            // Otherwise, the comparison is against the original character sheet stats.
            statsForOldEquip = characterSheetStats;
        }

        // 5. Run the simulations.
        const resultNew = simulationService.simulate(statsForNewEquip);
        const resultOld = simulationService.simulate(statsForOldEquip);

        // 6. Display the results.
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
