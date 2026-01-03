# Forge Master Companion

A detailed combat simulator to help you choose the best equipment in Forge Master Idle RPG.

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
    **Note:** You must use the `.git` URL for Docker to correctly fetch the repository. Using a direct HTTPS link will fail because Docker will receive an HTML page instead of the repository contents.

Once the image is built, you can run it.

1.  **Run the Docker container:**
    ```bash
    docker run -d -p 8080:80 forge-master-companion
    ```

2.  **Access the application:**
    Open your web browser and navigate to `http://localhost:8080`.

## For Developers

### Setup

To set up the project for local development, you will need Node.js and npm installed.

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/franckleveque/forge-master-companion.git
    cd forge-master-companion
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```

### Testing

This project uses Jest for unit and integration testing.

1.  **Run the test suite:**
    ```bash
    npm test
    ```

## How to Use (Manual)

1.  **Enter Character Stats:**
    *   Fill in your character's total damage and health.
    *   Select your weapon type (Melee or Ranged).

2.  **Enter Base Passive Skills:**
    *   Input all of your character's existing passive skill percentages. These are the stats you have *before* equipping either of the items you want to compare.

3.  **Configure Active Skills:**
    *   Set up your three active skills by selecting their type (Damage or Healing), their base value, and their cooldown in seconds.

4.  **Enter Enemy Stats:**
    *   Input the enemy's damage per second (DPS) and their weapon type.

5.  **Enter Equipment to Compare:**
    *   For each piece of equipment, you must select its **Weapon Type** (Corp à corp or À distance). This is crucial for accurately comparing items with different combat styles.
    *   Enter the main stat and the passive skill for each item.
    *   **Important:** If your in-game Character Stats already include the stats from your old equipment, check the **"Stats are included..."** box. This will automatically subtract the old item's stats before running the comparison.

6.  **Compare:**
    *   Click the "Compare" button to see the results. The application provides two key metrics:
        *   **Survival Time:** How long your character survives in the fight.
        *   **Total Damage Dealt:** The total damage your character inflicts during their survival time.
    *   A better item is usually one that offers a good balance of both high survival time and high damage.

## Combat Assumptions

*   **Simulation Model:** The simulation is **deterministic** and runs on a high-precision time step (0.01 seconds) to accurately model the timing of attacks and events. It continues until the character's health reaches zero or a 60-second time limit is reached. It does not use random chance, ensuring that the results are stable and reflect the "on-average" performance of a gear setup.
*   **Player Attack Speed:** The "Vitesse d'attaque" passive reduces the time between attacks based on an exponential model. Every 100% of bonus attack speed halves the time per attack (doubling the number of attacks). The formula is: `Attacks per Second = 1 / (0.5 ^ Bonus %)`. For example, a 200% bonus results in `1 / (0.5 ^ 2) = 4` attacks per second.
*   **Weapon Delay:** The simulation correctly uses the weapon type selected for each piece of equipment. Melee weapons have a 2-second delay before their first attack, while ranged weapons attack immediately.
*   **Enemy Attack Speed:** Assumed to be 1 hit per second.
*   **Probabilities (Crit, Block, etc.):** All percentage-based chances are normalized. For example, a 10% chance to block will result in exactly 1 blocked attack for every 10 enemy hits.
*   **Lifesteal:** Heals for a percentage of the damage dealt by auto-attacks.
*   **Health Regen:** Heals for a flat value each second.
*   **Double Chance:** Triggers a second, independent auto-attack. This second attack uses the same base damage and can also critically hit.
*   **Active Skills:** Assumed to be used off-cooldown. Healing skills contribute to survival. Damage skills contribute to the "Total Damage Dealt" metric and are boosted by a "Compétence dégâts" passive.
