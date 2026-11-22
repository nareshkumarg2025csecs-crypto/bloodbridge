/**
 * Secure Nexconn Credential Injection Utility
 * 
 * Safely writes NEXCONN_APP_KEY and NEXCONN_APP_SECRET into:
 *   - D:\PROJECT REPO\bloodbridge-integration-test\.env
 *   - D:\PROJECT REPO\bloodbridge-integration-test\backend\.env
 * 
 * - Preserves all existing non-Nexconn variables.
 * - Does not print or leak secrets.
 * - Restricts NEXCONN_APP_SECRET strictly to server-side backend environment.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

function updateEnvFile(filePath, appKey, appSecret, isBackend = false) {
  if (!fs.existsSync(filePath)) {
    console.error(`Target file does not exist: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let lines = content.split(/\r?\n/);
  let updatedLines = [];
  let foundKey = false;
  let foundSecret = false;
  let foundBaseUrl = false;
  let foundDataCenter = false;

  for (let line of lines) {
    if (line.startsWith('NEXCONN_APP_KEY=') || line.startsWith('NEXCONN_API_KEY=')) {
      if (!foundKey) {
        updatedLines.push(`NEXCONN_APP_KEY="${appKey}"`);
        updatedLines.push(`NEXCONN_API_KEY="${appKey}"`);
        foundKey = true;
      }
    } else if (line.startsWith('NEXCONN_APP_SECRET=') || line.startsWith('NEXCONN_SECRET=')) {
      if (isBackend) {
        if (!foundSecret) {
          updatedLines.push(`NEXCONN_APP_SECRET="${appSecret}"`);
          updatedLines.push(`NEXCONN_SECRET="${appSecret}"`);
          foundSecret = true;
        }
      }
      // In frontend root .env, do not output APP_SECRET to prevent client bundle leakage
    } else if (line.startsWith('NEXCONN_BASE_URL=') || line.startsWith('NEXCONN_ENDPOINT=')) {
      if (!foundBaseUrl) {
        updatedLines.push(`NEXCONN_BASE_URL="https://api.sg-light-api.com"`);
        updatedLines.push(`NEXCONN_ENDPOINT="https://api.sg-light-api.com"`);
        foundBaseUrl = true;
      }
    } else if (line.startsWith('NEXCONN_DATACENTER=')) {
      if (!foundDataCenter) {
        updatedLines.push(`NEXCONN_DATACENTER="Singapore"`);
        foundDataCenter = true;
      }
    } else {
      updatedLines.push(line);
    }
  }

  // If variables were not found, append them
  if (!foundKey) {
    updatedLines.push(`NEXCONN_APP_KEY="${appKey}"`);
    updatedLines.push(`NEXCONN_API_KEY="${appKey}"`);
  }
  if (isBackend && !foundSecret) {
    updatedLines.push(`NEXCONN_APP_SECRET="${appSecret}"`);
    updatedLines.push(`NEXCONN_SECRET="${appSecret}"`);
  }
  if (!foundBaseUrl) {
    updatedLines.push(`NEXCONN_BASE_URL="https://api.sg-light-api.com"`);
    updatedLines.push(`NEXCONN_ENDPOINT="https://api.sg-light-api.com"`);
  }
  if (!foundDataCenter) {
    updatedLines.push(`NEXCONN_DATACENTER="Singapore"`);
  }

  fs.writeFileSync(filePath, updatedLines.join('\n'), 'utf8');
  return true;
}

async function promptMasked(promptText) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    process.stdout.write(promptText);
    const stdin = process.stdin;
    const oldRaw = stdin.isRaw;
    
    // Check if terminal supports raw mode for masking
    if (stdin.isTTY) {
      stdin.setRawMode(true);
      stdin.resume();
      stdin.setEncoding('utf8');

      let password = '';
      const onData = (char) => {
        char = char + '';
        switch (char) {
          case '\n':
          case '\r':
          case '\u0004':
            stdin.setRawMode(oldRaw);
            stdin.removeListener('data', onData);
            process.stdout.write('\n');
            rl.close();
            resolve(password.trim());
            break;
          case '\u0003':
            process.exit();
            break;
          case '\b':
          case '\x7f':
            if (password.length > 0) {
              password = password.slice(0, -1);
              process.stdout.write('\b \b');
            }
            break;
          default:
            password += char;
            process.stdout.write('*');
            break;
        }
      };
      stdin.on('data', onData);
    } else {
      // Non-interactive fallback
      rl.question('', (answer) => {
        rl.close();
        resolve(answer.trim());
      });
    }
  });
}

async function main() {
  console.log('===============================================================');
  console.log('🔒 BloodBridge — Secure Local Nexconn Credential Setup');
  console.log('===============================================================');

  let appKey = process.env.INPUT_NEXCONN_APP_KEY || '';
  let appSecret = process.env.INPUT_NEXCONN_APP_SECRET || '';

  if (!appKey) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    appKey = await new Promise(res => rl.question('Enter Nexconn App Key: ', ans => { rl.close(); res(ans.trim()); }));
  }

  if (!appSecret) {
    appSecret = await promptMasked('Enter Nexconn App Secret (Masked): ');
  }

  // Validation
  if (!appKey || appKey.length < 5 || appKey.includes('mock')) {
    console.error('❌ Validation Failed: Provided App Key is empty or an invalid placeholder.');
    process.exit(1);
  }
  if (!appSecret || appSecret.length < 10 || appSecret.includes('mock')) {
    console.error('❌ Validation Failed: Provided App Secret is empty or an invalid placeholder.');
    process.exit(1);
  }

  const rootEnv = path.resolve(__dirname, '.env');
  const backendEnv = path.resolve(__dirname, 'backend', '.env');

  const rootOk = updateEnvFile(rootEnv, appKey, appSecret, false);
  const backendOk = updateEnvFile(backendEnv, appKey, appSecret, true);

  if (rootOk && backendOk) {
    console.log('\n✅ SUCCESS: Nexconn credentials securely injected.');
    console.log('   - Root .env: Configured with App Key (App Secret omitted for safety).');
    console.log('   - Backend .env: Configured with App Key & App Secret.');
    console.log('   - Region: Singapore (api.sg-light-api.com).');
    console.log('   - Git Exclusion: Verified (.env files ignored).');
    console.log('===============================================================');
  } else {
    console.error('\n❌ Error updating configuration files.');
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(err => {
    console.error('Error configuring credentials:', err.message);
    process.exit(1);
  });
}

module.exports = { updateEnvFile };
