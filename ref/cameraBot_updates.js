const mineflayer = require('mineflayer');
const keytar = require('keytar');
const { startViewer } = require('./viewer');
const cameraManager = require('./cameraManager');

// --- Configuration ---
// This section defines the constants needed to securely fetch credentials.
const SERVICE_NAME = 'MineflayerBot';       // Must match the Keychain Item Name
const EMAIL_ACCOUNT_KEY = 'bot-email';       // The key for the email item in Keychain
const PASSWORD_ACCOUNT_KEY = 'bot-password'; // The key for the password item in Keychain
const SERVER_IP = 'localhost';               // The IP address of your Minecraft server
const SERVER_PORT = 25565;                   // The port of your Minecraft server

/**
 * The main asynchronous function that initializes and runs the bot.
 * This structure is used to allow for the 'await' keyword when fetching credentials.
 */
async function main() {
  try {
    // Fetch both email and password from the macOS Keychain concurrently
    const [email, password] = await Promise.all([
      keytar.getPassword(SERVICE_NAME, EMAIL_ACCOUNT_KEY),
      keytar.getPassword(SERVICE_NAME, PASSWORD_ACCOUNT_KEY)
    ]);

    // Validate that credentials were successfully retrieved
    if (!email || !password) {
      console.error(`Could not find email or password in Keychain under the service name '${SERVICE_NAME}'.`);
      console.error('Please ensure you have stored both correctly in the Keychain Access app as per the README.');
      return;
    }

    console.log('Successfully retrieved credentials from Keychain. Attempting to connect...');

    // Create the Mineflayer bot instance
    const bot = mineflayer.createBot({
      host: SERVER_IP,
      port: SERVER_PORT,
      username: email,
      password: password,
      auth: 'microsoft'
    });

    // --- Bot Event Handlers ---

    // This event fires once when the bot successfully joins the server and spawns in the world.
    bot.once('spawn', () => {
      console.log(`Bot '${bot.username}' has successfully spawned.`);
      
      // Start the web viewer so we can see the bot's perspective
      startViewer(bot);
      
      // Set the bot's gamemode based on the configuration in cameraManager.js
      const gamemode = cameraManager.config.defaultGamemode;
      console.log(`Setting bot gamemode to: ${gamemode}`);
      bot.chat(`/gamemode ${gamemode}`);

      // Start the main camera logic
      cameraManager.start(bot);
    });

    // This event fires when a chat message is received. It's used for commands.
    bot.on('chat', (username, message) => {
      // Ignore messages sent by the bot itself
      if (username === bot.username) return;

      const args = message.split(' ');
      const command = args[0].toLowerCase();

      // Check for the 'cam' command to control the camera
      if (command === 'cam') {
        const key = args[1];
        let value = args[2];

        // Parse the input value for boolean or numeric types
        if (value === 'true') value = true;
        else if (value === 'false') value = false;
        else if (!isNaN(parseFloat(value))) {
          // Convert minutes to milliseconds for the switchInterval setting
          if (key === 'switchInterval') {
            value = parseFloat(value) * 60 * 1000;
          } else {
            value = parseFloat(value);
          }
        }
        
        // Attempt to update the configuration in the camera manager
        if (cameraManager.updateConfig(key, value)) {
          bot.chat(`Camera setting '${key}' updated.`);
        } else {
          bot.chat(`Unknown setting: '${key}'.`);
        }
      }
    });

    // --- Standard Bot Lifecycle Events ---

    bot.on('kicked', (reason) => {
      console.log('Bot was kicked from the server. Reason:', reason);
    });

    bot.on('error', (err) => {
      console.error('A bot error occurred:', err);
    });

    bot.on('end', (reason) => {
        console.log(`Bot has disconnected. Reason: ${reason}`);
    });

  } catch (err) {
    console.error('An unexpected error occurred during the bot startup process:', err);
  }
}

// Run the main function to start the bot
main();