# tests_e2e/test_equipment_comparison.py

import pytest
from playwright.sync_api import Page, expect

def test_equipment_comparison_computes_results(page: Page):
    """
    Tests that the equipment comparison feature computes and displays results.
    """
    # Navigate to the app
    page.goto("http://localhost:8000")

    # Fill in old equipment stats
    page.locator("#equip2-damage-value").fill("50")

    # Fill in new equipment stats
    page.locator("#equip1-damage-value").fill("100")

    # Click the compare button
    page.locator("#compare-button").click()

    # Check for results
    expect(page.locator("#survival-time-1")).not_to_be_empty()
    expect(page.locator("#total-damage-1")).not_to_be_empty()
    expect(page.locator("#survival-time-2")).not_to_be_empty()
    expect(page.locator("#total-damage-2")).not_to_be_empty()
