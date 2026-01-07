# tests_e2e/test_equipment_comparison_simulation.py
from playwright.sync_api import Page, expect

def test_equipment_comparison_simulation_displays_results_correctly(page: Page):
    # Set up character and equipment stats
    page.locator("#total-damage").fill("1000")
    page.locator("#total-health").fill("10000")
    page.locator("#weapon-type").select_option("corp-a-corp")

    # Old Equipment (Equip 2) - Weaker
    page.locator("#equip2-damage-value").fill("100")
    page.locator("#equip2-health-value").fill("500")

    # New Equipment (Equip 1) - Stronger
    page.locator("#equip1-damage-value").fill("200")
    page.locator("#equip1-health-value").fill("1000")

    # Run the comparison
    page.locator("#compare-button").click()

    # Verify the results are displayed in the new format
    results_output = page.locator("#results-output")
    expect(results_output).to_be_visible()

    # Check for the winner announcement
    expect(results_output.locator('p:has-text("Best Equipment:")')).to_contain_text("New Equip")

    # Check for fighter details
    expect(results_output.locator("h4")).to_contain_text(["Old Equip", "New Equip"])

    # Verify that the log content is displayed
    log_content = page.locator("#log-content-equipment")
    expect(log_content).not_to_be_empty()
