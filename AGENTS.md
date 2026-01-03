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

## Coding Conventions

- Follow standard HTML, CSS, and JavaScript best practices.
- Use descriptive variable and function names.
- Comment code where necessary to explain complex logic.

## Development Process

1. Understand the user's request and the project goals.
2. Formulate a plan to implement the requested changes, respecting the existing architecture.
3. Write clean, efficient, and well-documented code.
4. Test the changes thoroughly to ensure they work as expected.
5. Update the documentation to reflect any changes.
6. Submit the changes with a clear and concise commit message.
