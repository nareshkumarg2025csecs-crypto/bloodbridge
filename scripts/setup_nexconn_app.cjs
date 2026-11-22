/**
 * Interactive Masked Credential Prompt Utility for Nexconn Application Setup
 * 
 * Safely collects new App Key and masked App Secret directly from user's terminal:
 *   - Completely purges old credential values from active configuration.
 *   - Masks App Secret keystrokes with asterisks (*) in terminal.
 *   - Stores App Key in .env and backend/.env.
 *   - Stores App Secret strictly in backend/.env (never in frontend code or root .env).
 *   - Configures regional API host based on user selection or defaults to Singapore.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rootDir = path.resolve(__dirname, '..');
const rootEnvPath = path.resolve(rootDir, '.env');
const backendEnvPath = path.resolve(rootDir, 'backend', '.env');

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
            process.exit();
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

function promptVisible(query) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans.trim());
    });
  });
}

async function main() {
  console.log('================================================================');
  console.log('🔒 BloodBridge — Connect New Nexconn Application');
  console.log('================================================================\n');

  console.log('Please enter the credentials from your new Nexconn application:');
  const appKey = await promptVisible('1. Enter New Nexconn App Key: ');
  const appSecret = await promptMasked('2. Enter New Nexconn App Secret (Masked): ');

  console.log('\nSelect Data Center Region:');
  console.log('  [1] Singapore     (api.sg-light-api.com) — Default');
  console.log('  [2] North America (api.us-light-api.com)');
  console.log('  [3] Saudi Arabia  (api.sau-light-api.com)');
  const regionChoice = await promptVisible('Choice [1-3, default 1]: ');

  let apiBaseUrl = 'https://api.sg-light-api.com';
  let dataCenter = 'Singapore';
  if (regionChoice === '2') {
    apiBaseUrl = 'https://api.us-light-api.com';
    dataCenter = 'North America';
  } else if (regionChoice === '3') {
    apiBaseUrl = 'https://api.sau-light-api.com';
    dataCenter = 'Saudi Arabia';
  }

  // Validation
  if (!appKey || appKey.length < 6) {
    console.error('\n❌ Validation Error: App Key cannot be empty or invalid.');
    process.exit(1);
  }
  if (!appSecret || appSecret.length < 10) {
    console.error('\n❌ Validation Error: App Secret cannot be empty or invalid.');
    process.exit(1);
  }

  // 1. Update backend/.env (Authoritative server config with secret)
  if (!fs.existsSync(backendEnvPath)) {
    console.error(`\n❌ Error: backend/.env not found at ${backendEnvPath}`);
    process.exit(1);
  }

  let backendContent = fs.readFileSync(backendEnvPath, 'utf8');
  let backendLines = backendContent.split(/\r?\n/).filter(line => !line.startsWith('NEXCONN_'));
  backendLines.push(`NEXCONN_APP_KEY="${appKey}"`);
  backendLines.push(`NEXCONN_API_KEY="${appKey}"`);
  backendLines.push(`NEXCONN_APP_SECRET="${appSecret}"`);
  backendLines.push(`NEXCONN_SECRET="${appSecret}"`);
  backendLines.push(`NEXCONN_BASE_URL="${apiBaseUrl}"`);
  backendLines.push(`NEXCONN_ENDPOINT="${apiBaseUrl}"`);
  backendLines.push(`NEXCONN_DATACENTER="${dataCenter}"`);
  fs.writeFileSync(backendEnvPath, backendLines.join('\n'), 'utf8');

  // 2. Update root .env (Client AppKey only; Secret strictly excluded)
  if (fs.existsSync(rootEnvPath)) {
    let rootContent = fs.readFileSync(rootEnvPath, 'utf8');
    let rootLines = rootContent.split(/\r?\n/).filter(line => !line.startsWith('NEXCONN_'));
    rootLines.push(`NEXCONN_APP_KEY="${appKey}"`);
    rootLines.push(`NEXCONN_API_KEY="${appKey}"`);
    rootLines.push(`NEXCONN_BASE_URL="${apiBaseUrl}"`);
    rootLines.push(`NEXCONN_ENDPOINT="${apiBaseUrl}"`);
    rootLines.push(`NEXCONN_DATACENTER="${dataCenter}"`);
    fs.writeFileSync(rootEnvPath, rootLines.join('\n'), 'utf8');
  }

  console.log('\n================================================================');
  console.log('✅ NEW NEXCONN APPLICATION SUCCESSFULLY CONFIGURED');
  console.log('================================================================');
  console.log(`  - App Key length: ${appKey.length} characters`);
  console.log(`  - App Secret length: ${appSecret.length} characters (Masked & Protected)`);
  console.log(`  - Regional API: ${apiBaseUrl} (${dataCenter})`);
  console.log(`  - Stored in: backend/.env (Isolated from frontend/browser)`);
  console.log('  - Old application credentials completely purged.');
  console.log('================================================================\n');
}

main().catch(err => {
  console.error('Configuration failed:', err.message);
  process.exit(1);
});
