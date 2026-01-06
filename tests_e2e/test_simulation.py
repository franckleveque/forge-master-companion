from playwright.sync_api import expect

def test_equipment_comparison_simulation(page):
    # Fill in character stats
    page.fill("#total-damage", "1000")
    page.fill("#total-health", "10000")
    page.select_option("#weapon-type", "corp-a-corp")

    # Fill in enemy stats
    page.fill("#enemy-dps", "500")
    page.select_option("#enemy-weapon-type", "corp-a-corp")

    # Fill in equipment stats
    page.fill("#equip1-damage-value", "100")
    page.fill("#equip2-damage-value", "120")


    # Run simulation
    page.click("text=Compare")

    # Check for results
    expect(page.locator("#equipment-comparison-section .results").first).to_be_visible()
    expect(page.locator("#result-item-1")).to_be_visible()
    expect(page.locator("#result-item-2")).to_be_visible()
    expect(page.locator(".highlight-best")).to_be_visible()

def test_pvp_simulation(page):
    # Switch to PvP Simulation
    page.click("text=PvP Simulation")

    # Fill in player stats
    page.fill("#total-damage", "1000")
    page.fill("#total-health", "10000")
    page.select_option("#weapon-type", "corp-a-corp")

    # Fill in opponent stats
    page.fill("#opponent-total-damage", "200")
    page.fill("#opponent-total-health", "2000")
    page.select_option("#opponent-weapon-type", "a-distance")

    # Run simulation
    page.click("#simulate-button")

    # Check for results
    expect(page.locator("#pvp-results-output")).to_be_visible()
    expect(page.locator("#pvp-results-output")).to_contain_text("Winner: Player")
