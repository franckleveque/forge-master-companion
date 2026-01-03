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
        // 1. Get the character's current state from the DOM, including all passives and equipment.
        const characterSheetStats = domAdapter.getCharacterStats();

        // 2. Get the equipment objects for comparison.
        const equipNew = domAdapter.getEquipment(1, characterSheetStats);
        const equipOld = domAdapter.getEquipment(2, characterSheetStats);

        // 3. Calculate the character's "true base" stats by removing all percentage-based passives.
        // This gives us the character's stats as if all passives were at 0%.
        const trueBaseStats = characterService.getCharacterBaseStats(characterSheetStats);

        // 4. From the "true base", remove the stats of the currently equipped old item.
        // This gives us a clean slate to which we can apply the new items for comparison.
        const baseStatsWithoutOldEquip = characterService.unequipEquipment(trueBaseStats, equipOld);

        // 5. Now, create the two stat objects for simulation:

        // Scenario A: The character with the new equipment.
        const statsForNewEquip = characterService.applyEquipment(baseStatsWithoutOldEquip, equipNew);

        // Scenario B: The character with the old equipment (or unequipped).
        let statsForOldEquip;
        if (domAdapter.isUnequipChecked()) {
            // If "unequip" is checked, the comparison is against the character with the slot empty.
            statsForOldEquip = baseStatsWithoutOldEquip;
        } else {
            // Otherwise, it's against the character with the old equipment re-applied.
            statsForOldEquip = characterService.applyEquipment(baseStatsWithoutOldEquip, equipOld);
        }

        // 6. Run the simulations.
        const resultNew = simulationService.simulate(statsForNewEquip);
        const resultOld = simulationService.simulate(statsForOldEquip);

        // 7. Display the results.
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
