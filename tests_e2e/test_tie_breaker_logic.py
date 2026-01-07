# tests_e2e/test_tie_breaker_logic.py

from playwright.sync_api import Page, expect

def test_health_tie_breaker_logic(page: Page):
    # Fill in player stats
    page.locator("#total-damage").fill("1000")
    page.locator("#total-health").fill("10000")

    # Equipment 1: More health, less damage
    page.locator("#equip1-health-value").fill("1000")
    page.locator("#equip1-damage-value").fill("10")

    # Equipment 2: Less health, more damage
    page.locator("#equip2-health-value").fill("10")
    page.locator("#equip2-damage-value").fill("1000")

    # Click the compare button
    page.locator("#compare-button").click()

    # Wait for the results to appear
    expect(page.locator("#survival-time-1")).not_to_have_text("-")

    # Check that Equipment 1 is ranked as best due to higher health (survival time should be equal)
    expect(page.locator("#result-item-1")).to_have_class("result-item best-equipment")
    expect(page.locator("#result-item-2")).to_have_class("result-item")
