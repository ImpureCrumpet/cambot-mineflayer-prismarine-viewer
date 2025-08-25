// runTests.js

const mineflayer = require('mineflayer');
const keytar = require('keytar');

// --- Test Configuration ---
const SERVICE_NAME = 'MineflayerBot';
// IMPORTANT: The bot needs an email/password for the test, but it's not in a .env file.
// We'll fetch it from Keytar just like the main bot.
const SERVER_IP = 'localhost';
const SERVER_PORT = 25565;
const EXPECTED_GAMEMODE = 'spectator';

// --- Test Runner ---
async function runTests() {
  console.log('--- Running Bot Integration Tests ---');
  let bot;
  let testResults = {
    connection: 'FAIL',
    spectatorMode: 'FAIL',
    playerDiscovery: 'FAIL'
  };

  try {
    // Fetch credentials securely
    const [email, password] = await Promise.all([
        keytar.getPassword(SERVICE_NAME, 'bot-email'),
        keytar.getPassword(SERVICE_NAME, 'bot-password')
    ]);

    if (!email || !password) {
      throw new Error('Could not retrieve credentials from Keychain for testing.');
    }
    
    console.log('Attempting to connect to the server...');
    bot = mineflayer.createBot({
      host: SERVER_IP,
      port: SERVER_PORT,
      username: email,
      password: password,
      auth: 'microsoft'
    });

    await new Promise((resolve, reject) => {
      bot.once('spawn', resolve);
      bot.once('kicked', (reason) => reject(new Error(`Bot was kicked: ${reason}`)));
      bot.once('error', (err) => reject(err));
    });

    // TEST 1: Connection
    console.log('✅ Test 1: Connection successful.');
    testResults.connection = 'PASS';
    
    // Give the server a moment to update the bot's state
    await new Promise(resolve => setTimeout(resolve, 1000)); 

    // TEST 2: Spectator Mode Check
    bot.chat(`/gamemode ${EXPECTED_GAMEMODE}`); // Ensure the mode is set
    await new Promise(resolve => setTimeout(resolve, 500)); // Wait for change
    
    if (bot.game.gameMode === EXPECTED_GAMEMODE) {
      console.log('✅ Test 2: Bot is in spectator mode.');
      testResults.spectatorMode = 'PASS';
    } else {
      console.error(`❌ Test 2: Bot is in incorrect mode! Expected '${EXPECTED_GAMEMODE}', got '${bot.game.gameMode}'.`);
    }

    // TEST 3: Player Discovery
    // The bot should see at least one other player (or more). The count includes the bot itself.
    const playerCount = Object.keys(bot.players).length;
    if (playerCount > 1) {
      console.log(`✅ Test 3: Player discovery successful. Found ${playerCount} players.`);
      testResults.playerDiscovery = 'PASS';
    } else {
      console.error('❌ Test 3: Bot did not discover any other players.');
    }

    console.log('\n--- Test Summary ---');

  } catch (err) {
    console.error('\n--- A critical test error occurred ---');
    console.error(err.message);
  } finally {
    console.table(testResults);
    if (bot) {
      console.log('Disconnecting test bot.');
      bot.quit();
    }
  }
}

runTests();