// cameraManager.js
// --- Default Configuration ---
const config = {
  // NEW: Gamemode setting
  defaultGamemode: 'spectator', // (2) Set the bot to spectator mode on start.

  // ... (rest of the config is the same)
};

// ... (start, stop, updateConfig are the same)
// ... (Logic Cycle and Target/Mode Selection are the same)

// --- Movement & View Logic ---
let circleAngle = 0;

function updateBotMovement() {
  // (1) Centralized error check at the beginning of the movement loop
  if (!bot || !currentTarget) {
    console.warn('[CameraManager] Movement updated called with no bot or target.');
    return;
  }

  // (1) The most important check: If the entity is no longer loaded by the bot, it's invalid.
  // This handles players logging off or moving out of range.
  if (!currentTarget.isValid) {
    console.log(`[CameraManager] Target ${currentTarget.username || currentTarget.displayName} is no longer valid. Stopping movement.`);
    clearInterval(movementInterval); // Stop this movement loop
    // The main logic cycle will automatically find a new target on its next run.
    return;
  }
  
  const targetPos = currentTarget.position.offset(0, currentTarget.height, 0);
  
  try {
    bot.lookAt(targetPos);

    let goalPos;
    // ... (switch statement for view modes is the same)
    
    if (goalPos) {
      bot.pathfinder.setGoal(new goals.GoalNear(goalPos.x, goalPos.y, goalPos.z, 1));
    }
  } catch (err) {
    console.error('[CameraManager] An error occurred during movement update:', err.message);
    // This try...catch prevents a single bad calculation from crashing the bot.
  }
}

// Export the config object so the main file can access defaultGamemode
module.exports = { start, stop, updateConfig, config };