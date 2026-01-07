# tests_e2e/test_equipment_comparison_simplified.py

from playwright.sync_api import Page, expect

def test_enemy_inputs_are_hidden_in_equipment_mode(page: Page):
    # Verify enemy stats are not visible by default (equipment mode)
    enemy_stats_container = page.locator("#enemy-stats-container")
    expect(enemy_stats_container).to_be_hidden()

def test_equipment_comparison_runs_without_enemy_config(page: Page):
    # Fill in player and equipment stats
    page.locator("#total-damage").fill("1000")
    page.locator("#total-health").fill("10000")
    page.locator("#equip1-damage-value").fill("200")

    # Click the compare button
    page.locator("#compare-button").click()

    # Check for results
    expect(page.locator("#survival-time-1")).not_to_have_text("-")
    expect(page.locator("#total-damage-1")).not_to_have_text("-")

def test_mode_switching_hides_and_shows_enemy_inputs(page: Page):
    # Initially hidden in equipment mode
    enemy_stats_container = page.locator("#enemy-stats-container")
    expect(enemy_stats_container).to_be_hidden()

    # Switch to PvP mode
    page.locator("#mode-pvp").click()

    # In PvP mode, the right column is for the opponent, so the enemy stats container from equipment mode should not be there.
    # Instead, we check that the opponent's stat inputs are visible.
    expect(page.locator("#opponent-total-damage")).to_be_visible()

    # Switch back to Equipment mode
    page.locator("#mode-equipment").click()

    # Verify enemy stats container is hidden again
    expect(enemy_stats_container).to_be_hidden()
    expect(page.locator("#opponent-total-damage")).to_be_hidden()
