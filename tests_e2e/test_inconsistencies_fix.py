# tests_e2e/test_inconsistencies_fix.py
import json
import pytest
import re
from playwright.sync_api import Page, expect
import os

# Test case from the user's bug report to verify the original fix
def test_inconsistencies_fix(page: Page):
    page.goto("http://localhost:8000/")

    json_data = {
      "type": "equipment_comparison",
      "character_stats": {
        "total_damage": "1000",
        "total_health": "10000",
        "weapon_type": "corp-a-corp"
      },
      "passive_skills": { "sante": "0", "degats": "0", "degats-corps-a-corps": "0", "degats-a-distance": "0", "vitesse-attaque": "0", "chance-critique": "5", "degats-critiques": "50", "chance-blocage": "0", "regeneration-sante": "0", "vol-de-vie": "0", "double-chance": "0", "competence-degats": "0", "competences-temps-recharge": "0" },
      "active_skills": [],
      "equipment": {
        "equip1": { "weapon_type": "corp-a-corp", "damage": "100", "health": "0", "passive_skill": "Santé", "passive_skill_value": "10" },
        "equip2": { "unequip": None, "weapon_type": "corp-a-corp", "damage": "0", "health": "0", "passive_skill": "Santé", "passive_skill_value": "0" },
        "category": "head"
      }
    }

    file_path = "test_data.json"
    with open(file_path, "w") as f:
        json.dump(json_data, f)

    page.on("filechooser", lambda file_chooser: file_chooser.set_files(file_path))
    page.click('#import-equipment')

    expect(page.locator('#total-damage')).to_have_value('1000')
    page.click('#compare-button')

    log_content_element = page.locator('#log-content-equipment')
    expect(log_content_element).not_to_be_empty()
    log_content = log_content_element.inner_text()

    # Verify that the player with new equipment starts with the correct health
    assert "Player (New Equip) starts with 11000 health." in log_content

    # Find the first attack from the player and the enemy
    player_attack_match = re.search(r"\[(\d+\.\d+)\] Player \(New Equip\) attacks Ennemi", log_content)
    enemy_attack_match = re.search(r"\[(\d+\.\d+)\] Ennemi attacks Player \(New Equip\)", log_content)

    # Verify that both attacks occur and at the correct time
    assert player_attack_match, "Could not find player's first attack."
    assert float(player_attack_match.group(1)) == 3.00, "Player's first attack is not at 3.00s."
    assert enemy_attack_match, "Could not find enemy's first attack."
    assert float(enemy_attack_match.group(1)) == 3.00, "Enemy's first attack is not at 3.00s."
    os.remove(file_path)

# Test to explicitly ensure the dummy enemy is always melee, regardless of player weapon type
def test_dummy_enemy_is_always_melee(page: Page):
    page.goto("http://localhost:8000/")

    # Same data, but player has a distance weapon
    json_data = {
      "type": "equipment_comparison",
      "character_stats": {
        "total_damage": "1000",
        "total_health": "10000",
        "weapon_type": "a-distance"
      },
      "passive_skills": { "sante": "0", "degats": "0", "degats-corps-a-corps": "0", "degats-a-distance": "0", "vitesse-attaque": "0", "chance-critique": "0", "degats-critiques": "0", "chance-blocage": "0", "regeneration-sante": "0", "vol-de-vie": "0", "double-chance": "0", "competence-degats": "0", "competences-temps-recharge": "0" },
      "active_skills": [],
      "equipment": {
        "equip1": { "weapon_type": "a-distance", "damage": "100", "health": "0", "passive_skill": "Santé", "passive_skill_value": "10" },
        "equip2": { "unequip": None, "weapon_type": "a-distance", "damage": "0", "health": "0", "passive_skill": "Santé", "passive_skill_value": "0" },
        "category": "weapon"
      }
    }

    file_path = "test_data_distance.json"
    with open(file_path, "w") as f:
        json.dump(json_data, f)

    page.on("filechooser", lambda file_chooser: file_chooser.set_files(file_path))
    page.click('#import-equipment')

    expect(page.locator('#total-damage')).to_have_value('1000')
    page.click('#compare-button')

    log_content_element = page.locator('#log-content-equipment')
    expect(log_content_element).not_to_be_empty()
    log_content = log_content_element.inner_text()

    # Find the first attack from the player and the enemy
    player_attack_match = re.search(r"\[(\d+\.\d+)\] Player \(New Equip\) attacks Ennemi", log_content)
    enemy_attack_match = re.search(r"\[(\d+\.\d+)\] Ennemi attacks Player \(New Equip\)", log_content)

    # Verify that both attacks occur and at the correct time
    assert player_attack_match, "Could not find player's first attack."
    assert float(player_attack_match.group(1)) == 1.00, "Player's first attack is not at 1.00s."
    assert enemy_attack_match, "Could not find enemy's first attack."
    assert float(enemy_attack_match.group(1)) == 3.00, "Enemy's first attack is not at 3.00s."
    os.remove(file_path)
