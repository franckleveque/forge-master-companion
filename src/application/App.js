// src/application/App.js

import { CharacterService } from '../domain/CharacterService.js';
import { UiService } from '../infrastructure/UiService.js';
import { DomAdapter } from '../adapters/DomAdapter.js';
import { SimulationService } from '../domain/SimulationService.js';
import { FileService } from '../infrastructure/FileService.js';
import { PassiveSkillService } from '../domain/PassiveSkillService.js';
import { LoggerService } from '../infrastructure/LoggerService.js';

document.addEventListener('DOMContentLoaded', () => {
    const characterService = new CharacterService();
    const uiService = new UiService();
    const passiveSkillService = new PassiveSkillService();
    const domAdapter = new DomAdapter(characterService, passiveSkillService);
    const loggerService = new LoggerService();
    const simulationService = new SimulationService(loggerService);
    const fileService = new FileService();

    // Event listeners for mode switching
    uiService.modeEquipmentButton.addEventListener('click', () => uiService.switchToEquipmentMode());
    uiService.modePvpButton.addEventListener('click', () => uiService.switchToPvpMode());

    // Event listener for equipment comparison
    uiService.compareButton.addEventListener('click', () => {
        loggerService.clear();
        const sheetStats = domAdapter.getCharacterStats();
        const baseStats = characterService.getCharacterBaseStats(sheetStats);
        const equipNew = domAdapter.getEquipment(1, baseStats);
        const equipOld = domAdapter.getEquipment(2, baseStats);
        const cleanBaseStats = characterService.unequipEquipment(baseStats, equipOld);

        // Run simulation for new equipment
        let statsWithNewEquip = characterService.applyEquipment(cleanBaseStats, equipNew);
        let finalStatsNew = characterService.recalculateTotalStats(statsWithNewEquip);
        finalStatsNew.enemy = sheetStats.enemy; // Make sure enemy stats are passed
        const resultNew = simulationService.simulate(finalStatsNew);

        loggerService.log('\n\n--- LOG FOR OLD EQUIPMENT ---\n');

        // Run simulation for old equipment
        let statsForOldScenario;
        if (domAdapter.isUnequipChecked()) {
            statsForOldScenario = cleanBaseStats;
        } else {
            statsForOldScenario = characterService.applyEquipment(cleanBaseStats, equipOld);
        }
        let finalStatsOld = characterService.recalculateTotalStats(statsForOldScenario);
        finalStatsOld.enemy = sheetStats.enemy; // Make sure enemy stats are passed
        const resultOld = simulationService.simulate(finalStatsOld);

        // Display results and combined log
        domAdapter.displayComparisonResults(resultNew, resultOld);
        domAdapter.displayLogs('equipment', loggerService.getLogs());
    });

    // Event listener for PvP simulation
    uiService.simulateButton.addEventListener('click', () => {
        loggerService.clear();
        const playerSheetStats = domAdapter.getCharacterStatsPvp('player');
        const opponentSheetStats = domAdapter.getCharacterStatsPvp('opponent');

        const player = characterService.getCharacterBaseStats(playerSheetStats);
        const opponent = characterService.getCharacterBaseStats(opponentSheetStats);

        const result = simulationService.simulatePvp(player, opponent);
        domAdapter.displayPvpResults(result);
    });

    // Log view listeners
    uiService.viewLogEquipmentButton.addEventListener('click', () => domAdapter.toggleLogVisibility('equipment'));
    uiService.viewLogPvpButton.addEventListener('click', () => domAdapter.toggleLogVisibility('pvp'));

    uiService.exportLogEquipmentButton.addEventListener('click', () => {
        const log = loggerService.getLogs();
        fileService.exportLog('equipment', log);
    });

    uiService.exportLogPvpButton.addEventListener('click', () => {
        const log = loggerService.getLogs();
        fileService.exportLog('pvp', log);
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
