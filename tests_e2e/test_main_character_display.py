from playwright.sync_api import expect

def test_character_display_in_equipment_comparison(page):
    # Check for main character's visibility
    expect(page.locator(".player-column")).to_be_visible()

    # Check for main characteristics
    expect(page.locator("#total-damage")).to_be_visible()
    expect(page.locator("#total-health")).to_be_visible()
    expect(page.locator("#weapon-type")).to_be_visible()

    # Check for passive skills
    expect(page.locator(".player-column .passive-skills").first).to_be_visible()

    # Check for active skills
    expect(page.locator(".player-column .active-skills").first).to_be_visible()

def test_character_display_in_pvp_simulation(page):
    # Switch to PvP Simulation mode
    page.click("text=PvP Simulation")

    # Check for main character's visibility
    expect(page.locator(".player-column")).to_be_visible()

    # Check for main characteristics
    expect(page.locator("#total-damage")).to_be_visible()
    expect(page.locator("#total-health")).to_be_visible()
    expect(page.locator("#weapon-type")).to_be_visible()

    # Check for passive skills
    expect(page.locator(".player-column .passive-skills").first).to_be_visible()

    # Check for active skills
    expect(page.locator(".player-column .active-skills").first).to_be_visible()
