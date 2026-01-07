# tests_e2e/test_equipment_comparison_simplified.py

from playwright.sync_api import Page, expect

def test_equipment_comparison_runs_and_displays_results(page: Page):
    # Fill in player and equipment stats
    page.locator("#total-damage").fill("1000")
    page.locator("#total-health").fill("10000")
    page.locator("#equip1-damage-value").fill("200")

    # Click the compare button
    page.locator("#compare-button").click()

    # Check for results container
    expect(page.locator("#results-output")).to_be_visible()
