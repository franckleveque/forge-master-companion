import pytest
from playwright.sync_api import sync_playwright
import subprocess
import time

@pytest.fixture(scope="session", autouse=True)
def http_server():
    p = subprocess.Popen(['python', '-m', 'http.server', '8000'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(1)
    yield
    p.kill()

@pytest.fixture(scope="session")
def browser():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        yield browser
        browser.close()

@pytest.fixture(scope="function")
def page(browser, http_server):
    page = browser.new_page()
    page.goto("http://localhost:8000")
    yield page
    page.close()
