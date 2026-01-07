This file provides guidance for AI agents working on the Forge Master Companion project.

## Project Structure

The codebase is organized following a Hexagonal (Ports & Adapters) architecture.

-   `src/domain/`: The core of the application, containing business logic and models.
-   `src/application/`: The entry point that orchestrates the application's flow.
-   `src/adapters/`: Bridges the domain to external systems like the DOM.
-   `src/infrastructure/`: Provides concrete implementations for external concerns like UI services and file handling.

## Architectural Principles

-   **Separation of Concerns:** The `domain` layer is independent of all other layers.
-   **Dependency Inversion:** The core logic does not depend on the UI or other external services.

### Stat Calculation Architecture

The application has a clear and strict architecture for calculating character stats, which is crucial for both the **Equipment Comparison** and **PvP Simulation** modes.

#### Key Services & Their Roles

1.  **`CharacterService` (Total Stats -> Base Stats)**
    *   **Primary Responsibility:** To calculate a character's **base stats** (`baseDamage`, `baseHealth`) from the **total stats** (`totalDamage`, `totalHealth`) input in the UI.
    *   **How it Works:** It reverses the formula `total = base * (1 + modifier)` to find the `base` values.
    *   **When to Use:**
        *   In **Equipment Comparison**, it establishes a clean baseline before applying equipment changes.
        *   In **PvP Simulation**, it processes the stats for *both* the player and the opponent to ensure a consistent character model is fed into the simulation.

2.  **`SimulationService` (Base Stats -> Final Combat Stats)**
    *   **Primary Responsibility:** To orchestrate a combat simulation between two characters.
    *   **How it Works:** At the start of a simulation, it calculates each character's final combat stats by applying all passive skill bonuses (`onCalculateStats` hooks) to their base stats. It then manages the combat loop tick by tick.

### Infrastructure Services

-   **`UiService`**: Responsible for dynamically rendering and updating all UI components.
-   **`FileService`**: Handles the logic for exporting the current application state to a JSON file and importing it back.

## Development Process & Testing

**All development must follow a Test-Driven Development (TDD) workflow.**

### TDD Workflow:

1.  **Write a Failing Test:** Before writing any implementation, create a test that defines the desired functionality or reproduces a bug.
2.  **Write Code to Pass:** Write the minimum code required to make the test pass.
3.  **Refactor:** Refactor the code for clarity and adherence to the architecture.

### Testing Strategy:

-   **`CharacterService.test.js`:** Tests the "Total Stats -> Base Stats" calculation logic.
-   **Passive Skill Unit Tests (`tests/passives/`):** Each passive skill with logic must have its own unit test file to verify its hooks in isolation.
-   **`PvpService.test.js`:** Tests the application-level logic for the PvP mode, ensuring correct data flow from the UI to the simulation service and back.
-   **`SimulationIntegration.test.js`:** Tests the interaction of components within the `SimulationService` loop, especially for time-based mechanics (e.g., attack speed, cooldowns).
-   **E2E Tests (`tests_e2e/`):** Any changes that affect the UI **must** be accompanied by E2E tests. This is critical for verifying:
    *   The complete user flow for both Equipment Comparison and PvP Simulation tabs.
    *   The correctness of the import/export functionality.
    *   The final results displayed to the user in the UI.
