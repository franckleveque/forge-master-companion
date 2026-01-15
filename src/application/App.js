// src/application/App.js

import { CharacterService } from '../domain/CharacterService.js';
import { UiService } from '../infrastructure/UiService.js';
import { DomAdapter } from '../adapters/DomAdapter.js';
import { SimulationService } from '../domain/SimulationService.js';
import { FileService } from '../infrastructure/FileService.js';
import { PassiveSkillService } from '../domain/PassiveSkillService.js';
import { LoggerService } from '../infrastructure/LoggerService.js';
import { EquipmentComparisonService } from '../domain/EquipmentComparisonService.js';
import { CharacterFactory } from './CharacterFactory.js';

document.addEventListener('DOMContentLoaded', () => {
    const passiveSkillService = new PassiveSkillService();
    const characterService = new CharacterService(passiveSkillService);
    const uiService = new UiService();
    const domAdapter = new DomAdapter(characterService, passiveSkillService, uiService);
    const loggerService = new LoggerService();
    const simulationService = new SimulationService(loggerService);
    const fileService = new FileService();
    const equipmentComparisonService = new EquipmentComparisonService(simulationService, characterService);
    const characterFactory = new CharacterFactory();

    // Event listeners for mode switching
    uiService.modeEquipmentButton.addEventListener('click', () => uiService.switchToEquipmentMode());
    uiService.modePvpButton.addEventListener('click', () => uiService.switchToPvpMode());

    // Event listener for equipment comparison
    uiService.compareButton.addEventListener('click', () => {
        loggerService.clear();

        const characterData = domAdapter.getCharacterStats();
        const characterSheet = characterFactory.createCharacterFromData(characterData);
        const character = characterFactory.create(characterSheet);

        const equipNewData = domAdapter.getEquipment(1);
        const equipOldData = domAdapter.getEquipment(2);

        const equipNew = characterFactory.createEquipmentFromData(equipNewData, character);
        const equipOld = characterFactory.createEquipmentFromData(equipOldData, character);

        const result = equipmentComparisonService.compare(character, equipNew, equipOld);

        domAdapter.displayComparisonResults(result);
        loggerService.setLogs(result.log);
    });

    // Event listener for PvP simulation
    uiService.simulateButton.addEventListener('click', () => {
        loggerService.clear(); // Clear logger for a fresh PvP simulation.
        const playerData = domAdapter.getCharacterStatsPvp('player');
        const opponentData = domAdapter.getCharacterStatsPvp('opponent');

        const playerSheet = characterFactory.createCharacterFromData(playerData);
        const opponentSheet = characterFactory.createCharacterFromData(opponentData);

        const player = characterFactory.create(playerSheet);
        player.id = "Player"; // Assign ID for logs
        const opponent = characterFactory.create(opponentSheet);
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
    domAdapter.populatePassiveSkills();
});
