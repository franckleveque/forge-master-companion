from playwright.sync_api import expect
import json
import os

def test_pvp_simulation_timeout_winner(page):
    # Switch to PvP Simulation
    page.click("text=PvP Simulation")

    # Player stats
    page.fill("#total-damage", "1000")
    page.fill("#total-health", "1000000")
    page.select_option("#weapon-type", "corp-a-corp")

    # Opponent stats
    page.fill("#opponent-total-damage", "1100")
    page.fill("#opponent-total-health", "1000000")
    page.select_option("#opponent-weapon-type", "corp-a-corp")

    # Run simulation
    page.click("#simulate-button")

    # Check for results
    expect(page.locator("#pvp-results-output")).to_be_visible()
    expect(page.locator("#pvp-results-output")).to_contain_text("Winner: Opponent")
