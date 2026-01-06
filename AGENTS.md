# Agent Instructions for Forge Master Companion

This document provides guidance for AI agents working on this repository.

## End-to-End (E2E) Testing

This project uses Playwright with Python for E2E testing to prevent regressions in the user interface and core functionality.

### Running the E2E Tests

Before submitting any changes, you **must** run the E2E test suite to ensure that your changes have not introduced any regressions.

1.  **Ensure Dependencies are Installed:**
    - The Python dependencies are listed in `requirements.txt`.
    - The required browser binaries can be installed with `playwright install`.

2.  **Start the Application:**
    - The application is a simple static site. You can serve it locally using Python's built-in web server:
      ```bash
      python3 -m http.server 8080 &
      ```

3.  **Run the Tests:**
    - Once the server is running, execute the test suite with `pytest`:
      ```bash
      pytest tests/e2e/
      ```

### When to Run the Tests

You must run the E2E tests after making any changes to the following:
- `index.html`
- Any CSS files in the `styles/` directory.
- Any JavaScript files in the `src/` directory.

If the tests fail, diagnose the issue and fix it before submitting your changes. The tests are designed to catch common issues related to UI layout, mode switching, and simulation logic.
