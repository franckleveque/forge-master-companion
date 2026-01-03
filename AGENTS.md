This file provides guidance for AI agents working on the Forge Master Companion project.

## Project Structure

The codebase is organized following a Hexagonal (Ports & Adapters) architecture.

- `index.html`: The main HTML file for the user interface.
- `src/`: Contains the JavaScript source code, divided into the following layers:
  - `domain/`: The core of the application. It contains the business logic, models (e.g., `Character`, `Equipment`), and services (`SimulationService`, `CharacterService`) that are independent of any UI or external framework.
  - `application/`: The entry point of the application (`App.js`). It is responsible for orchestrating the different parts of the application, initializing services and adapters, and setting up event listeners.
  - `adapters/`: Acts as the bridge between the domain and external systems. `DomAdapter.js` is responsible for all interactions with the DOM, translating UI events into application commands and application data into UI updates.
  - `infrastructure/`: Provides concrete implementations for external concerns. This includes services for UI state management (`UiService.js`) and file handling (`FileService.js`).
- `styles/style.css`: The CSS file for the application styling.
- `README.md`: The project documentation.

## Architectural Principles

- **Separation of Concerns:** The code is strictly divided into layers. The `domain` layer should never depend on any other layer. The `application` layer orchestrates the flow of data between the `domain` and the `adapters`/`infrastructure`.
- **Dependency Inversion:** The core logic in the `domain` is completely independent of the UI and other external services. This allows for easier testing and maintenance.
- **Ports and Adapters:** The `DomAdapter` and `FileService` are examples of adapters that connect to the "ports" of the application (the methods exposed by the domain services).

### Stat Calculation Architecture

A critical aspect of this architecture is the distinction between pre-simulation stat calculations and simulation-time logic.

-   **Pre-simulation Stat Calculations (`CharacterService`):** Passives that grant direct, non-conditional stat bonuses like **Santé**, **Dégâts**, **Dégâts corps à corps**, and **Dégâts à distance** are handled exclusively by the `CharacterService`. The `CharacterService` is responsible for:
    1.  Taking the **total stats** provided by the UI.
    2.  Calculating the character's **base stats** by reversing the effects of these passive skills.
    3.  Applying equipment changes to the **base stats**.
    4.  Recalculating the **total stats** from the modified base stats before a simulation begins.

    The passive skill classes for these stats (`Sante.js`, `Degats.js`, etc.) are intentionally simple data containers and should not contain any logic in their hooks (`onCalculateStats`, `onModifyOutgoingDamage`, etc.).

-   **Simulation-Time Logic (PassiveSkill Classes):** Passives that have conditional or event-driven effects during combat (e.g., **Vol de vie**, **Vitesse d'attaque**, **Chance critique**, **Régénération santé**) contain their logic directly within their respective classes. These skills are instantiated by the `SimulationService` and their hooks (`onTick`, `onAfterAttackDealt`, etc.) are called during the simulation loop.

## Development Process & Testing

**All development must follow a Test-Driven Development (TDD) workflow.** This is a mandatory requirement for all future changes, whether they are new features or bug fixes.

### TDD Workflow:
1.  **Write a Failing Test:** Before writing any implementation code, create a new test case that clearly defines the desired functionality or reproduces the bug. This test must fail.
2.  **Write Code to Pass the Test:** Write the minimum amount of code required to make the failing test pass.
3.  **Refactor:** Once the test is passing, refactor the code for clarity, efficiency, and adherence to architectural principles.

### Testing Strategy:
-   **CharacterService Tests:** When modifying stat calculation logic, write tests for the `CharacterService`. These tests should verify that the service correctly calculates base stats from total stats and recalculates total stats after applying modifiers.
-   **PassiveSkill Unit Tests:** For simulation-time passives, write isolated unit tests for the passive skill class itself. Mock the character object and verify that the skill's hooks produce the correct output.
-   **Simulation Integration Tests:** For complex interactions between multiple skills or time-based mechanics (like attack speed), add a test case to `tests/SimulationIntegration.test.js`.

By following these principles, we ensure the codebase remains robust, maintainable, and well-tested.
