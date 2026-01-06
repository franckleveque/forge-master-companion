from playwright.sync_api import Page, expect

def test_equipment_comparison_mode(page: Page):
    page.goto("http://localhost:8080")

    # Verify main character is displayed
    expect(page.locator(".player-column")).to_be_visible()
    expect(page.locator(".player-column h2")).to_have_text("Player")

    # Verify character display includes main characteristics, passive skill, and active skills
    expect(page.locator("#total-damage")).to_be_visible()
    expect(page.locator("#total-health")).to_be_visible()
    expect(page.locator(".player-column .passive-skills")).to_be_visible()
    expect(page.locator(".player-column .active-skills")).to_be_visible()

    # Confirm simplified opponent is displayed for equipment comparison
    expect(page.locator(".enemy-stats")).to_be_visible()

    # Perform a simple simulation
    page.locator("#total-damage").fill("1000")
    page.locator("#total-health").fill("10000")
    page.locator("#compare-button").click()

    # Check for results
    expect(page.locator("#results-output")).to_be_visible()
    expect(page.locator("#survival-time-1")).not_to_have_text("-")
    expect(page.locator("#survival-time-2")).not_to_have_text("-")
