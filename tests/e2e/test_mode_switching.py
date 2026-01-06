from playwright.sync_api import Page, expect

def test_mode_switching(page: Page):
    page.goto("http://localhost:8080")

    # Initially in Equipment Comparison mode
    expect(page.locator("#equipment-comparison-section")).to_be_visible()
    expect(page.locator("#pvp-simulation-section")).not_to_be_visible()

    # Switch to PvP Simulation mode
    page.locator("#mode-pvp").click()
    expect(page.locator("#equipment-comparison-section")).not_to_be_visible()
    expect(page.locator("#pvp-simulation-section")).to_be_visible()

    # Switch back to Equipment Comparison mode
    page.locator("#mode-equipment").click()
    expect(page.locator("#equipment-comparison-section")).to_be_visible()
    expect(page.locator("#pvp-simulation-section")).not_to_be_visible()
