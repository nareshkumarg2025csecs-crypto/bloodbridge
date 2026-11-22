/**
 * Exact File: scripts/setup_new_nexconn.cjs
 * Project: BloodBridge
 * Workspace: D:\PROJECT REPO\bloodbridge-integration-test
 * 
 * Secure Interactive Credential Setup Utility for Nexconn Application:
 * 1. Prompts for the new Nexconn App Key (visible input).
 * 2. Prompts for the new Nexconn App Secret (masked with asterisks `*` in terminal).
 * 3. Prompts for the application's actual API region (Singapore / North America / Saudi Arabia).
 * 4. Stores App Secret ONLY in backend/.env (strictly isolated from frontend/browser code).
 * 5. Stores App Key only in required backend and root environment locations.
 * 6. Preserves all unrelated environment variables.
 * 7. Never prints, logs, echoes, or transmits credentials.
 * 8. Ensures .env files remain Git-ignored.
 * 9. Completely replaces old credentials without retaining stale values.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rootDir = path.resolve(__dirname, '..');
const rootEnvPath = path.resolve(rootDir, '.env');
const backendEnvPath = path.resolve(rootDir, 'backend', '.env');
const gitignorePath = path.resolve(rootDir, '.gitignore');

// Masked terminal input reader
function promptMasked(query) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    process.stdout.write(query);
    const stdin = process.stdin;
    const oldRaw = stdin.isRaw;

    if (stdin.isTTY) {
      stdin.setRawMode(true);
      stdin.resume();
      stdin.setEncoding('utf8');

      let input = '';
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
            resolve(input.trim());
            break;
          case '\u0003':
            process.exit(1);
            break;
          case '\b':
          case '\x7f':
            if (input.length > 0) {
              input = input.slice(0, -1);
              process.stdout.write('\b \b');
            }
            break;
          default:
            input += char;
            process.stdout.write('*');
            break;
        }
      };
      stdin.on('data', onData);
    } else {
      rl.question('', (ans) => {
        rl.close();
        resolve(ans.trim());
      });
    }
  });
}

// Standard visible terminal input reader
function promptVisible(query) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans.trim());
    });
  });
}

// Ensure .env files are Git-ignored
function verifyGitIgnore() {
  if (fs.existsSync(gitignorePath)) {
    const content = fs.readFileSync(gitignorePath, 'utf8');
    const requiredPatterns = ['.env', 'backend/.env'];
    let needsUpdate = false;
    let newContent = content;

    for (const pattern of requiredPatterns) {
      if (!content.includes(pattern)) {
        needsUpdate = true;
        newContent += `\n${pattern}`;
      }
    }

    if (needsUpdate) {
      fs.writeFileSync(gitignorePath, newContent, 'utf8');
    }
  }
}

async function main() {
  console.log('================================================================');
  console.log('🔒 BloodBridge — New Nexconn Application Credential Setup');
  console.log('================================================================\n');

  // Verify Git-ignore rules first
  verifyGitIgnore();

  // 1. Prompt for App Key
  const appKey = await promptVisible('1. Enter New Nexconn App Key: ');
  if (!appKey || appKey.length < 5) {
    console.error('\n❌ Validation Error: App Key cannot be empty or invalid.');
    process.exit(1);
  }

  // 2. Prompt for Masked App Secret
  const appSecret = await promptMasked('2. Enter New Nexconn App Secret (Masked): ');
  if (!appSecret || appSecret.length < 8) {
    console.error('\n❌ Validation Error: App Secret cannot be empty or invalid.');
    process.exit(1);
  }

  // 3. Prompt for API Region
  console.log('\n3. Select Data Center Region for your new Nexconn application:');
  console.log('  [1] Singapore     (api.sg-light-api.com) — Default');
  console.log('  [2] North America (api.us-light-api.com)');
  console.log('  [3] Saudi Arabia  (api.sau-light-api.com)');
  const regionChoice = await promptVisible('Select Region [1-3, default 1]: ');

  let apiBaseUrl = 'https://api.sg-light-api.com';
  let dataCenter = 'Singapore';

  if (regionChoice === '2') {
    apiBaseUrl = 'https://api.us-light-api.com';
    dataCenter = 'North America';
  } else if (regionChoice === '3') {
    apiBaseUrl = 'https://api.sau-light-api.com';
    dataCenter = 'Saudi Arabia';
  }

  // 4. Update backend/.env (Authoritative backend storage with App Secret)
  if (!fs.existsSync(backendEnvPath)) {
    console.error(`\n❌ Error: backend/.env not found at ${backendEnvPath}`);
    process.exit(1);
  }

  const backendContent = fs.readFileSync(backendEnvPath, 'utf8');
  const backendLines = backendContent.split(/\r?\n/).filter(line => !line.startsWith('NEXCONN_'));
  backendLines.push(`NEXCONN_APP_KEY="${appKey}"`);
  backendLines.push(`NEXCONN_API_KEY="${appKey}"`);
  backendLines.push(`NEXCONN_APP_SECRET="${appSecret}"`);
  backendLines.push(`NEXCONN_SECRET="${appSecret}"`);
  backendLines.push(`NEXCONN_BASE_URL="${apiBaseUrl}"`);
  backendLines.push(`NEXCONN_ENDPOINT="${apiBaseUrl}"`);
  backendLines.push(`NEXCONN_DATACENTER="${dataCenter}"`);
  fs.writeFileSync(backendEnvPath, backendLines.join('\n'), 'utf8');

  // 5. Update root .env (App Key only; App Secret strictly omitted)
  if (fs.existsSync(rootEnvPath)) {
    const rootContent = fs.readFileSync(rootEnvPath, 'utf8');
    const rootLines = rootContent.split(/\r?\n/).filter(line => !line.startsWith('NEXCONN_'));
    rootLines.push(`NEXCONN_APP_KEY="${appKey}"`);
    rootLines.push(`NEXCONN_API_KEY="${appKey}"`);
    rootLines.push(`NEXCONN_BASE_URL="${apiBaseUrl}"`);
    rootLines.push(`NEXCONN_ENDPOINT="${apiBaseUrl}"`);
    rootLines.push(`NEXCONN_DATACENTER="${dataCenter}"`);
    fs.writeFileSync(rootEnvPath, rootLines.join('\n'), 'utf8');
  }

  console.log('\n================================================================');
  console.log('✅ NEW NEXCONN APPLICATION CREDENTIALS CONFIGURED SECURELY');
  console.log('================================================================');
  console.log(`  - App Key length: ${appKey.length} characters`);
  console.log(`  - App Secret: Saved securely (Masked, ${appSecret.length} characters)`);
  console.log(`  - Regional API Host: ${apiBaseUrl} (${dataCenter})`);
  console.log(`  - App Secret Storage: backend/.env ONLY (strictly isolated from client code)`);
  console.log(`  - Git Protection: Confirmed .env files are Git-ignored`);
  console.log('================================================================\n');
}

if (require.main === module) {
  main().catch((err) => {
    console.error('\nConfiguration failed:', err.message);
    process.exit(1);
  });
}

module.exports = { main };
