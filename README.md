# Forge Master Companion

A detailed combat simulator to help you choose the best equipment in Forge Master Idle RPG.

## How to Use

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
    *   **Equipment 1 (New):** This is the new piece of gear you are considering.
    *   **Equipment 2 (Old):** This should represent what you are currently wearing (or the second new item to compare).
        *   **Important:** If your in-game Character Stats already include the stats from your old equipment, check the **"Stats are included..."** box. This will automatically subtract the old item's stats before running the comparison, ensuring an accurate result.
    *   For each piece, enter its main stat and the passive skill it provides.

6.  **Compare:**
    *   Click the "Compare" button to see the results. The application will simulate a fight to the death for each equipment setup, and the primary result is the **Survival Time**. A longer survival time is generally better.

## Combat Assumptions

*   **Simulation Model:** The simulation is **deterministic** and runs second-by-second until the character's health reaches zero or a 60-second time limit is reached. It does not use random chance, ensuring that the results are stable and reflect the "on-average" performance of a gear setup.
*   **Player Attack Speed:** The "Vitesse d'attaque" passive reduces the time between attacks. The number of attacks per second is calculated with the formula: `1 / (1 - Bonus %)`. For example, a 50% bonus results in `1 / (1 - 0.5) = 2` attacks per second.
*   **Weapon Delay:** Melee weapons (both player and enemy) have a 2-second delay before their first attack. Ranged weapons attack immediately.
*   **Enemy Attack Speed:** Assumed to be 1 hit per second.
*   **Probabilities (Crit, Block, etc.):** All percentage-based chances are normalized. For example, a 10% chance to block will result in exactly 1 blocked attack for every 10 enemy hits.
*   **Lifesteal:** Heals for a percentage of the damage dealt by auto-attacks.
*   **Health Regen:** Heals for a percentage of maximum health each second.
*   **Active Skills:** Assumed to be used off-cooldown. Only skills that directly impact survival (i.e., Healing skills) are factored into the calculation. Damage-dealing skills do not contribute to survival time in this simulation, as they do not provide lifesteal.
