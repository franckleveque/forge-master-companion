# tests_e2e/test_fight_log.py

import pytest
from playwright.sync_api import Page, expect

def test_fight_log_visibility_and_export(page: Page):
    # page.goto("/") is not needed, as it is handled by the page fixture in conftest.py

    # Switch to PvP mode
    page.click("text=PvP Simulation")

    # Check that the log controls are initially hidden
    log_controls = page.locator('[data-testid="pvp-log-controls"]')
    expect(log_controls).to_be_hidden()

    # Run the simulation
    page.click("text=Simulate")

    # Wait for results to appear as a signal that the simulation is done
    expect(page.locator("#pvp-results-output")).not_to_be_empty()

    # Check that the log controls are now visible
    expect(log_controls).to_be_visible()

    # Check that the log container is initially hidden
    log_container = page.locator("#log-container-pvp")
    expect(log_container).to_be_hidden()

    # Click the "View Log" button
    page.click("#view-log-pvp")

    # Check that the log container is now visible
    expect(log_container).to_be_visible()
    log_content = page.locator("#log-content-pvp")
    expect(log_content).to_contain_text(
        "[0.00] Player starts with 10000 health.\n"
        "[0.00] Opponent starts with 10000 health."
    )

    # Click the "Export Log" button and verify the download
    with page.expect_download() as download_info:
        page.click("#export-log-pvp")
    download = download_info.value
    assert download.suggested_filename == "pvp_fight_log.txt"
