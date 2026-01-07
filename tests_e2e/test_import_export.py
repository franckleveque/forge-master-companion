# tests_e2e/test_import_export.py
import json
from playwright.sync_api import Page, expect

def test_equipment_comparison_import_export_roundtrip(page: Page):
    """
    Tests the full import/export roundtrip for the Equipment Comparison tab.
    1. Fills the form with data.
    2. Exports the data to a file.
    3. Clears the form.
    4. Imports the previously exported file.
    5. Verifies that the form is repopulated with the original data.
    """
    page.goto("http://localhost:8000")

    # Wait for a key element to be visible, ensuring the UI is ready
    expect(page.locator("#compare-button")).to_be_visible()

    # 1. Fill the form with test data
    test_data = {
        "total-damage": "1000",
        "total-health": "50000",
        "weapon-type": "a-distance",
        "sante": "10",
        "degats": "20",
        "vitesse-attaque": "30",
        "equip1-damage-value": "150",
        "equip1-health-value": "2000",
        "equip1-passive-skill": "Vol de vie",
        "equip1-passive-skill-value": "5.5",
        "equip2-damage-value": "120",
        "equip2-health-value": "2500",
        "equip2-passive-skill": "Double chance",
        "equip2-passive-skill-value": "10.2"
    }

    for key, value in test_data.items():
        element = page.locator(f"#{key}")
        element_tag = element.evaluate("element => element.tagName")
        if element_tag == "SELECT":
            # Use 'value' for the weapon type dropdown for reliability
            if key == "weapon-type":
                element.select_option(value=value)
            else:
                element.select_option(label=value)
        else:
            element.fill(value)

    # 2. Export the data
    with page.expect_download() as download_info:
        page.get_by_role("button", name="Export").click()
    download = download_info.value

    # Read the content of the downloaded file
    exported_data_str = download.path().read_text()
    exported_data = json.loads(exported_data_str)

    # 3. Clear the form by reloading the page
    page.reload()

    # Wait for the page to be fully loaded again
    expect(page.locator("#compare-button")).to_be_visible()

    # 4. Import the data
    # Create a temporary file with the exported content to upload
    with open("temp_import.json", "w") as f:
        json.dump(exported_data, f)

    page.set_input_files("input#import-file", "temp_import.json")

    # 5. Verify the form is repopulated correctly
    for key, value in test_data.items():
        element = page.locator(f"#{key}")
        expect(element).to_have_value(value)
