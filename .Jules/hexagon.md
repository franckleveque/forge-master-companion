## 2024-07-25 - Centralized Data Normalization at the Application Boundary

**Learning:** Data normalization, such as converting `weapon_type` to `weaponType`, is a critical architectural concern that must be handled at the correct boundary. Placing this logic in an infrastructure adapter like the `DomAdapter` violates the Single Responsibility Principle and creates duplicate code. The correct place for this transformation is at the application's composition root (`App.js`) when the data is received from an external source, or in a factory (`CharacterFactory`) when creating domain objects from raw data.

**Action:** In the future, I will ensure that all data normalization is handled at the application boundary, before the data is passed to the domain or adapter layers. This will create a cleaner, more maintainable architecture that adheres to hexagonal principles.

I will now complete the pre-commit steps.