from playwright.sync_api import expect

def test_mode_switching_from_equipment_to_pvp(page):
    # Initially, Equipment Comparison is visible
    expect(page.locator("#equipment-comparison-section")).to_be_visible()
    expect(page.locator("#pvp-simulation-section")).not_to_be_visible()

    # Switch to PvP Simulation
    page.click("text=PvP Simulation")

    # Now, PvP Simulation is visible and Equipment Comparison is not
    expect(page.locator("#pvp-simulation-section")).to_be_visible()
    expect(page.locator("#equipment-comparison-section")).not_to_be_visible()

    # Check for opponent visibility
    expect(page.locator(".opponent-column")).to_be_visible()

def test_mode_switching_from_pvp_to_equipment(page):
    # Start in PvP Simulation mode
    page.click("text=PvP Simulation")
    expect(page.locator("#pvp-simulation-section")).to_be_visible()
    expect(page.locator("#equipment-comparison-section")).not_to_be_visible()

    # Switch back to Equipment Comparison
    page.click("text=Equipment Comparison")

    # Now, Equipment Comparison is visible and PvP Simulation is not
    expect(page.locator("#equipment-comparison-section")).to_be_visible()
    expect(page.locator("#pvp-simulation-section")).not_to_be_visible()

    # Check for simplified opponent section
    expect(page.locator(".enemy-stats")).not_to_be_visible()
    expect(page.locator(".equipment-comparison")).to_be_visible()
