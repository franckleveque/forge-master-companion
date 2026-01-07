import os
from playwright.sync_api import sync_playwright, expect

def test_equipment_import_and_survivability(page):
    # Get the absolute path to the test data file
    json_file_path = os.path.join(os.path.dirname(__file__), 'test_data', 'equipment_import_issue.json')

    # Set the viewport to a wider size
    page.set_viewport_size({"width": 1920, "height": 1080})

    # The page fixture in conftest.py already loads the URL.
    # We just need to wait for a stable element to ensure the app is ready.
    expect(page.locator(".main-layout")).to_be_visible()

    # Wait for the import button to be visible and then click it
    import_button = page.locator("#import-equipment")
    expect(import_button).to_be_visible()

    # Use a file chooser to upload the JSON file
    with page.expect_file_chooser() as fc_info:
        import_button.click()
    file_chooser = fc_info.value
    file_chooser.set_files(json_file_path)

    # Wait for the import to be processed
    # We can check if one of the values has been updated
    expect(page.locator("#total-damage")).to_have_value("9240")
    expect(page.locator("#total-health")).to_have_value("76100")
    expect(page.locator("#vitesse-attaque")).to_have_value("57.1")
    expect(page.locator("#equip1-health-value")).to_have_value("14000")
    expect(page.locator("#equip2-health-value")).to_have_value("13100")

    # Click the compare button
    page.locator("#compare-button").click()

    # Assert that the survival time is "Infinity" for both pieces of equipment
    expect(page.locator("#survival-time-1")).to_have_text("Infinity")
    expect(page.locator("#survival-time-2")).to_have_text("Infinity")
