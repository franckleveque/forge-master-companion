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
        // 1. Get the character's stats as displayed on the character sheet.
        const sheetStats = domAdapter.getCharacterStats();

        // 2. Calculate the character's true base stats (flat damage/health before passives).
        const baseStats = characterService.getCharacterBaseStats(sheetStats);

        // 3. Get the equipment to be compared.
        const equipNew = domAdapter.getEquipment(1, baseStats);
        const equipOld = domAdapter.getEquipment(2, baseStats);

        // 4. Create a clean baseline by removing the old equipment's flat stats and passives from the base stats.
        const cleanBaseStats = characterService.unequipEquipment(baseStats, equipOld);

        // 5. Build the two scenarios for comparison.

        // Scenario A: Character with the new equipment.
        let statsWithNewEquip = characterService.applyEquipment(cleanBaseStats, equipNew);
        let finalStatsNew = characterService.recalculateTotalStats(statsWithNewEquip);

        // Scenario B: Character with the old equipment (or unequipped).
        let statsForOldScenario;
        if (domAdapter.isUnequipChecked()) {
            // If unequipping, the old scenario is just the clean base.
            statsForOldScenario = cleanBaseStats;
        } else {
            // Otherwise, re-apply the old equipment to the clean base.
            statsForOldScenario = characterService.applyEquipment(cleanBaseStats, equipOld);
        }
        let finalStatsOld = characterService.recalculateTotalStats(statsForOldScenario);

        // 6. Run simulations with the final, recalculated stats.
        const resultNew = simulationService.simulate(finalStatsNew);
        const resultOld = simulationService.simulate(finalStatsOld);

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
