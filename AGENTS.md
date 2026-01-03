This file provides guidance for AI agents working on the Forge Master Companion project.

## Project Structure

The codebase is organized following a Hexagonal (Ports & Adapters) architecture.

-   `src/domain/`: The core of the application, containing business logic and models.
-   `src/application/`: The entry point that orchestrates the application's flow.
-   `src/adapters/`: Bridges the domain to external systems like the DOM.
-   `src/infrastructure/`: Provides concrete implementations for external concerns like UI services.

## Architectural Principles

-   **Separation of Concerns:** The `domain` layer is independent of all other layers.
-   **Dependency Inversion:** The core logic does not depend on the UI or other external services.

### Stat Calculation Architecture

The application has a clear and strict architecture for calculating character stats, which is crucial for both the **Equipment Comparison** tool and the **PvP Simulation**.

#### Key Services & Their Roles

1.  **`CharacterService` (Total Stats -> Base Stats)**
    *   **Primary Responsibility:** To calculate a character's **base stats** (`baseDamage`, `baseHealth`) from the **total stats** (`totalDamage`, `totalHealth`) that are input in the UI.
    *   **How it Works:** It reads the total stats and the values of stat-modifying passives (like `degats`, `sante`, `degats-corps-a-corps`). It then reverses the formula `total = base * (1 + modifier)` to find the `base` values.
    *   **When to Use:** This service is primarily used by the Equipment Comparison feature to establish a clean baseline before applying or removing equipment.

2.  **`SimulationService` (Base Stats -> Final Combat Stats)**
    *   **Primary Responsibility:** To orchestrate a combat simulation between characters.
    *   **How it Works:** When a simulation begins, its `_calculateCharacterStats` method is called. It performs these critical steps in order:
        1.  Initializes a character object for combat, setting its initial `finalDamage = baseDamage` and `finalHealth = baseHealth`.
        2.  It then iterates through all of the character's passive skills and calls their `onCalculateStats` hooks. This is the step where skills like `Sante` and `Degats` apply their percentage bonuses to the `finalDamage` and `finalHealth` properties, calculating the character's true stats for the upcoming fight.

#### Passive Skill Logic

-   **Stat-Calculation Passives (`Sante`, `Degats`):** These skills **must** contain logic in their `onCalculateStats` methods. This logic must calculate the final stat based on the character's base stat (e.g., `character.finalHealth = character.baseHealth * (1 + this.value / 100);`).
-   **Conditional Damage Passives (`DegatsCorpsACorps`, `DegatsADistance`):** These skills **must** contain logic in their `onModifyOutgoingDamage` hooks. They apply their bonus conditionally during an attack and do not affect the character's pre-calculated `finalDamage`.
-   **Simulation-Time Passives (`VitesseAttaque`, `VolDeVie`, etc.):** These skills contain their logic in the appropriate simulation hooks (`onCalculateStats`, `onAfterAttackDealt`, `onTick`, etc.) to be called by the `SimulationService`.

## Development Process & Testing

**All development must follow a Test-Driven Development (TDD) workflow.** This is a mandatory requirement for all future changes.

### TDD Workflow:

1.  **Write a Failing Test:** Before writing any implementation, create a test that defines the desired functionality or reproduces a bug. Ensure it fails.
2.  **Write Code to Pass:** Write the minimum code required to make the test pass.
3.  **Refactor:** Refactor the code for clarity and adherence to the architecture.

### Testing Strategy:

-   **`CharacterService.test.js`:** Use this to test the "Total Stats -> Base Stats" calculation logic.
-   **Passive Skill Unit Tests:** Every passive skill that contains logic in its hooks (`Sante`, `VitesseAttaque`, `DegatsCorpsACorps`, etc.) **must** have its own unit test file in `tests/passives/`. These tests should mock a character object and verify the hook's output in isolation.
-   **`SimulationIntegration.test.js`:** Use this to test the interaction of components within the `SimulationService` loop, especially for time-based mechanics (e.g., ensuring `VitesseAttaque` results in correct attack timings). When testing time-based logic, use the `_processTick` method on the `SimulationService` to advance the simulation step-by-step.
