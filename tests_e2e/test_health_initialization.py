# tests_e2e/test_health_initialization.py
import pytest
import re
from playwright.sync_api import Page, expect

def test_health_is_max_at_fight_start(page: Page):
    """
    This test verifies that in an equipment comparison, both the player and the enemy
    start the fight with their health correctly initialized to their maximum health.
    It specifically guards against regressions of the '0 health' bug.
    """
    page.goto("http://localhost:8000/")

    # 1. ARRANGE: Set up a simple equipment comparison scenario.
    initial_player_health = "15000"
    initial_player_damage = "1200"

    # The equipment will not modify health, only damage. This provides a clean test
    # to ensure the character's starting health is not being improperly mutated.
    page.fill("#total-health", initial_player_health)
    page.fill("#total-damage", initial_player_damage)
    page.fill("#equip1-damage-value", "200")
    page.fill("#equip1-health-value", "0")
    page.fill("#equip1-passive-skill-value", "0") # Ensure no passive health bonus
    page.fill("#equip2-damage-value", "0")
    page.fill("#equip2-health-value", "0")
    page.fill("#equip2-passive-skill-value", "0") # Ensure no passive health bonus

    # 2. ACT: Run the comparison.
    page.click('#compare-button')

    # 3. ASSERT: Verify the log output.
    log_content_element = page.locator('#log-content-equipment')
    expect(log_content_element).not_to_be_empty()
    log_content = log_content_element.inner_text()

    # --- Verification for "New Equipment" simulation ---
    new_equip_log_match = re.search(r"--- Simulation with New Equip ---\n([\s\S]*?)--- Simulation with Old Equip ---", log_content)
    assert new_equip_log_match, "Could not find the log block for the new equipment simulation."
    new_equip_log = new_equip_log_match.group(1)

    player_health_new_match = re.search(r"Player \(New Equip\) starts with (\d+) health", new_equip_log)
    assert player_health_new_match, "Could not find player's starting health for new equipment."
    player_health_new = int(player_health_new_match.group(1))

    enemy_health_new_match = re.search(r"Ennemi starts with (\d+) health", new_equip_log)
    assert enemy_health_new_match, "Could not find enemy's starting health for new equipment."
    enemy_health_new = int(enemy_health_new_match.group(1))

    # Assert that starting health is exactly the initial health since equipment has no health bonus.
    assert player_health_new == int(initial_player_health)
    assert enemy_health_new == int(initial_player_health)

    # --- Verification for "Old Equipment" simulation ---
    old_equip_log_match = re.search(r"--- Simulation with Old Equip ---\n([\s\S]*)", log_content)
    assert old_equip_log_match, "Could not find the log block for the old equipment simulation."
    old_equip_log = old_equip_log_match.group(1)

    player_health_old_match = re.search(r"Player \(Old Equip\) starts with (\d+) health", old_equip_log)
    assert player_health_old_match, "Could not find player's starting health for old equipment."
    player_health_old = int(player_health_old_match.group(1))

    enemy_health_old_match = re.search(r"Ennemi starts with (\d+) health", old_equip_log)
    assert enemy_health_old_match, "Could not find enemy's starting health for old equipment."
    enemy_health_old = int(enemy_health_old_match.group(1))

    # Assert that starting health is exactly the initial health.
    assert player_health_old == int(initial_player_health)
    assert enemy_health_old == int(initial_player_health)
