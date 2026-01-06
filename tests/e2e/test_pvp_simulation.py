from playwright.sync_api import Page, expect

def test_pvp_simulation_mode(page: Page):
    page.goto("http://localhost:8080")

    # Switch to PvP Simulation mode
    page.locator("#mode-pvp").click()

    # Verify main character is displayed
    expect(page.locator(".player-column")).to_be_visible()

    # Verify opponent is visible
    expect(page.locator(".opponent-column")).to_be_visible()
    expect(page.locator(".opponent-column h2")).to_have_text("Opponent")

    # Perform a simple simulation
    page.locator("#total-damage").fill("1000")
    page.locator("#total-health").fill("10000")
    page.locator("#opponent-total-damage").fill("1000")
    page.locator("#opponent-total-health").fill("10000")
    page.locator("#simulate-button").click()

    # Check for results
    expect(page.locator("#pvp-results-output")).to_be_visible()
    expect(page.locator("#pvp-results-output")).to_contain_text("wins")
