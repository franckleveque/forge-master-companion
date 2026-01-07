// src/application/App.js

import { CharacterService } from '../domain/CharacterService.js';
import { UiService } from '../infrastructure/UiService.js';
import { DomAdapter } from '../adapters/DomAdapter.js';
import { SimulationService } from '../domain/SimulationService.js';
import { FileService } from '../infrastructure/FileService.js';
import { PassiveSkillService } from '../domain/PassiveSkillService.js';
import { LoggerService } from '../infrastructure/LoggerService.js';
import { EquipmentComparisonService } from '../domain/EquipmentComparisonService.js';

document.addEventListener('DOMContentLoaded', () => {
    const characterService = new CharacterService();
    const uiService = new UiService();
    const passiveSkillService = new PassiveSkillService();
    const domAdapter = new DomAdapter(characterService, passiveSkillService);
    const loggerService = new LoggerService();
    const simulationService = new SimulationService(loggerService);
    const fileService = new FileService();
    const equipmentComparisonService = new EquipmentComparisonService(simulationService, characterService);

    // Event listeners for mode switching
    uiService.modeEquipmentButton.addEventListener('click', () => uiService.switchToEquipmentMode());
    uiService.modePvpButton.addEventListener('click', () => uiService.switchToPvpMode());

    // Event listener for equipment comparison
    uiService.compareButton.addEventListener('click', () => {
        loggerService.clear(); // Clear the main logger before starting the comparison process.

        const characterSheetStats = domAdapter.getCharacterStats();
        const character = characterService.getCharacterBaseStats(characterSheetStats);
        character.id = "Player"; // Assign a consistent ID for logging purposes

        const equipNew = domAdapter.getEquipment(1, character);
        const equipOld = domAdapter.getEquipment(2, character);

        const { resultNew, resultOld } = equipmentComparisonService.compare(character, equipNew, equipOld);

        // Display results and combined log
        domAdapter.displayComparisonResults(resultNew, resultOld);

        // Combine the self-contained logs from each simulation for a complete report.
        const combinedLog = `--- Simulation avec Nouvel Équipement ---\n${resultNew.log.join('\n')}\n\n--- Simulation avec Équipement Actuel ---\n${resultOld.log.join('\n')}`;
        domAdapter.displayLogs('equipment', combinedLog);

        // Also update the global logger so the "Export Log" button works correctly.
        loggerService.setLogs(combinedLog.split('\n'));
    });

    // Event listener for PvP simulation
    uiService.simulateButton.addEventListener('click', () => {
        loggerService.clear(); // Clear logger for a fresh PvP simulation.
        const playerSheetStats = domAdapter.getCharacterStatsPvp('player');
        const opponentSheetStats = domAdapter.getCharacterStatsPvp('opponent');

        const player = characterService.getCharacterBaseStats(playerSheetStats);
        player.id = "Player"; // Assign ID for logs
        const opponent = characterService.getCharacterBaseStats(opponentSheetStats);
        opponent.id = "Opponent"; // Assign ID for logs

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
            // Normalize weapon_type to weaponType at the application boundary
            if (data.character_stats && data.character_stats.weapon_type) {
                data.character_stats.weaponType = data.character_stats.weapon_type;
                delete data.character_stats.weapon_type;
            }
            if (data.equipment) {
                if (data.equipment.equip1 && data.equipment.equip1.weapon_type) {
                    data.equipment.equip1.weaponType = data.equipment.equip1.weapon_type;
                    delete data.equipment.equip1.weapon_type;
                }
                if (data.equipment.equip2 && data.equipment.equip2.weapon_type) {
                    data.equipment.equip2.weaponType = data.equipment.equip2.weapon_type;
                    delete data.equipment.equip2.weapon_type;
                }
            }

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
