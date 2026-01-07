# tests_e2e/test_incoherent_comparison.py
import json
import pytest
from playwright.sync_api import Page, expect
import os

def test_incoherent_comparison_bug(page: Page):
    page.goto("http://localhost:8000/")

    # The JSON data from the bug report
    json_data = {
      "type": "equipment_comparison",
      "character_stats": {
        "total_damage": "1000",
        "total_health": "10000",
        "weapon_type": "corp-a-corp"
      },
      "passive_skills": {
        "sante": "0",
        "degats": "0",
        "degats-corps-a-corps": "0",
        "degats-a-distance": "0",
        "vitesse-attaque": "0",
        "chance-critique": "5",
        "degats-critiques": "50",
        "chance-blocage": "0",
        "regeneration-sante": "0",
        "vol-de-vie": "0",
        "double-chance": "0",
        "competence-degats": "0",
        "competences-temps-recharge": "0"
      },
      "active_skills": [
        { "type": "damage", "baseDamage": "", "baseHealth": "", "cooldown": "", "value": "", "hits": "", "damageBuff": "", "healthBuff": "", "duration": "" },
        { "type": "damage", "baseDamage": "", "baseHealth": "", "cooldown": "", "value": "", "hits": "", "damageBuff": "", "healthBuff": "", "duration": "" },
        { "type": "damage", "baseDamage": "", "baseHealth": "", "cooldown": "", "value": "", "hits": "", "damageBuff": "", "healthBuff": "", "duration": "" }
      ],
      "enemy_stats": {},
      "equipment": {
        "equip1": { "weapon_type": "corp-a-corp", "damage": "100", "health": "0", "passive_skill": "Santé", "passive_skill_value": "10" },
        "equip2": { "unequip": None, "weapon_type": "corp-a-corp", "damage": "0", "health": "0", "passive_skill": "Santé", "passive_skill_value": "0" },
        "category": "head"
      }
    }

    # Create a temporary file with the JSON data
    file_path = "test_data.json"
    with open(file_path, "w") as f:
        json.dump(json_data, f)

    # Use the import functionality
    page.on("filechooser", lambda file_chooser: file_chooser.set_files(file_path))
    page.click('#import-equipment')

    # Wait for the import to complete by checking a field
    expect(page.locator('#total-damage')).to_have_value('1000')

    # Click the compare button
    page.click('#compare-button')

    # Check the log content
    log_content_element = page.locator('#log-content-equipment')
    expect(log_content_element).not_to_be_empty()
    log_content = log_content_element.inner_text()

    # Assertions
    assert "undefined" not in log_content, "Log should not contain 'undefined'"
    assert "NaN" not in log_content, "Log should not contain 'NaN'"
    assert "--- Simulation avec Nouvel Équipement ---" in log_content, "Log should contain the new equipment simulation marker"
    assert "--- Simulation avec Équipement Actuel ---" in log_content, "Log should contain the old equipment simulation marker"

    # Clean up the temporary file
    os.remove(file_path)
