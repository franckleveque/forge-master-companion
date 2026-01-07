# Forge Master Companion

A detailed combat simulator to help you choose the best equipment in Forge Master Idle RPG.

## Features

-   **Equipment Comparison:** Run a detailed simulation to determine which of two pieces of equipment will perform better in a fight.
-   **PvP Simulation:** Pit two fully customized characters against each other to see who comes out on top.
-   **Import / Export:** Save your character setups as a JSON file and load them back in later, making it easy to manage multiple configurations.

## How to Run with Docker

This application is containerized and can be easily run using Docker.

### Building from local sources

1.  **Build the Docker image:**
    ```bash
    docker build -t forge-master-companion .
    ```

### Building from GitHub

You can also build the Docker image directly from the GitHub repository.

1.  **Build the Docker image:**
    ```bash
    docker build -t forge-master-companion https://github.com/franckleveque/forge-master-companion.git
    ```
    **Note:** You must use the `.git` URL for Docker to correctly fetch the repository.

Once the image is built, you can run it.

1.  **Run the Docker container:**
    ```bash
    docker run -d -p 8080:80 forge-master-companion
    ```

2.  **Access the application:**
    Open your web browser and navigate to `http://localhost:8080`.

## For Developers

### Setup

To set up the project for local development, you will need Node.js, npm, and Python installed.

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/franckleveque/forge-master-companion.git
    cd forge-master-companion
    ```
2.  **Install JavaScript dependencies:**
    ```bash
    npm install
    ```
3.  **Install Python dependencies (for E2E tests):**
    ```bash
    pip install -r requirements.txt
    playwright install --with-deps
    ```

### Running Locally

To run the application for manual testing or development, start a simple web server from the project root:

```bash
python -m http.server 8000
```

Then, open your browser to `http://localhost:8000`.

### Testing

This project uses Jest for unit/integration testing and Playwright for E2E testing.

1.  **Run the unit test suite:**
    ```bash
    npm test
    ```

2. **Run the E2E test suite:**
   ```bash
   python -m pytest tests_e2e/
   ```
   *Note: The E2E test suite automatically starts and stops its own web server.*

## Usage

### Equipment Comparison

1.  **Select the "Equipment Comparison" Tab.**
2.  **Enter Character Stats:** Fill in your character's total damage, health, and weapon type.
3.  **Enter Base Passive Skills:** Input your character's passive skill percentages *before* equipping either of the items you want to compare.
4.  **Configure Active Skills:** Set up your three active skills (type, base value, cooldown).
5.  **Enter Equipment to Compare:**
    *   For each piece of equipment, enter its main stat and any passive skill bonuses it provides.
    *   **Important:** If your in-game stats already include the old equipment, check the **"Stats are included..."** box. This correctly subtracts the old item's stats before running the comparison.
6.  **Compare:** Click the "Compare Equipment" button. The tool will simulate combat with each item and declare the best one based on a combined score of survival time and total damage dealt.

### PvP Simulation

1.  **Select the "PvP Simulation" Tab.**
2.  **Configure Player & Opponent:** For both your character and your opponent, fill in their total damage, health, weapon type, passive skills, and active skills.
3.  **Simulate:** Click the "Start Simulation" button to run the fight. The winner will be announced, and a detailed combat log will be available.

### Import / Export Data

You can save and load your configurations for either mode.

-   **To Export:** Click the "Export to JSON" button. Your current setup (stats, skills, equipment) for the active tab will be saved to a file named `comparison_data.json` or `pvp_data.json`.
-   **To Import:** Click the "Import from JSON" button and select a previously saved file. The data will populate the form automatically.

## Combat Assumptions

*   **Simulation Model:** The simulation is **deterministic**, running on a high-precision time step (0.01s). It continues until a character's health reaches zero or a 60-second time limit is reached. This ensures consistent, reproducible results.
*   **Player Attack Speed:** The "Vitesse d'attaque" passive reduces the time between attacks based on an exponential model. Every 100% bonus halves the time per attack.
*   **Weapon Delay:** Melee weapons have a 2-second delay before their first attack.
*   **Probabilities (Crit, Block, etc.):** All percentage-based chances are normalized for consistency. For example, a 10% chance to block will result in exactly 1 blocked attack for every 10 enemy hits.
*   **Lifesteal:** Heals based on a percentage of auto-attack damage.
*   **Health Regen:** Heals based on a percentage of maximum health per second.
*   **Double Chance:** Triggers a second, independent auto-attack that can also critically hit.
*   **Active Skills:** Are used as soon as their cooldown is available.
