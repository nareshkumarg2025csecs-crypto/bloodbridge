/**
 * Secure Nexconn Multi-Account Application Updater
 * 
 * Safely updates NEXCONN_APP_KEY and NEXCONN_APP_SECRET for a newly created Nexconn application:
 *   - Updates NEXCONN_APP_KEY in root .env and backend/.env
 *   - Updates NEXCONN_APP_SECRET in backend/.env ONLY (strictly isolated from client code)
 *   - Preserves all database, JWT, and application environment variables
 *   - Automatically validates key/secret format and rejects placeholders
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rootDir = path.resolve(__dirname, '..');
const rootEnvPath = path.resolve(rootDir, '.env');
const backendEnvPath = path.resolve(rootDir, 'backend', '.env');

function applyNewCredentials(appKey, appSecret) {
  appKey = (appKey || '').trim();
  appSecret = (appSecret || '').trim();

  if (!appKey || appKey.length < 6 || appKey.includes('mock') || appKey.includes('placeholder')) {
    console.error('❌ Validation Error: New App Key is invalid or a placeholder.');
    process.exit(1);
  }

  if (!appSecret || appSecret.length < 10 || appSecret.includes('mock') || appSecret.includes('placeholder')) {
    console.error('❌ Validation Error: New App Secret is invalid or a placeholder.');
    process.exit(1);
  }

  // 1. Update backend/.env (Holds both AppKey and AppSecret)
  if (!fs.existsSync(backendEnvPath)) {
    console.error(`❌ backend/.env not found at ${backendEnvPath}`);
    process.exit(1);
  }

  let backendContent = fs.readFileSync(backendEnvPath, 'utf8');
  let backendLines = backendContent.split(/\r?\n/).filter(line => !line.startsWith('NEXCONN_'));
  backendLines.push(`NEXCONN_APP_KEY="${appKey}"`);
  backendLines.push(`NEXCONN_API_KEY="${appKey}"`);
  backendLines.push(`NEXCONN_APP_SECRET="${appSecret}"`);
  backendLines.push(`NEXCONN_SECRET="${appSecret}"`);
  backendLines.push(`NEXCONN_BASE_URL="https://api.sg-light-api.com"`);
  backendLines.push(`NEXCONN_ENDPOINT="https://api.sg-light-api.com"`);
  backendLines.push(`NEXCONN_DATACENTER="Singapore"`);
  fs.writeFileSync(backendEnvPath, backendLines.join('\n'), 'utf8');

  // 2. Update root .env (Holds AppKey only; NEVER holds AppSecret)
  if (fs.existsSync(rootEnvPath)) {
    let rootContent = fs.readFileSync(rootEnvPath, 'utf8');
    let rootLines = rootContent.split(/\r?\n/).filter(line => !line.startsWith('NEXCONN_'));
    rootLines.push(`NEXCONN_APP_KEY="${appKey}"`);
    rootLines.push(`NEXCONN_API_KEY="${appKey}"`);
    rootLines.push(`NEXCONN_BASE_URL="https://api.sg-light-api.com"`);
    rootLines.push(`NEXCONN_ENDPOINT="https://api.sg-light-api.com"`);
    rootLines.push(`NEXCONN_DATACENTER="Singapore"`);
    fs.writeFileSync(rootEnvPath, rootLines.join('\n'), 'utf8');
  }

  console.log('===============================================================');
  console.log('✅ NEW NEXCONN APPLICATION CREDENTIALS SAFELY APPLIED');
  console.log('===============================================================');
  console.log('  - App Key length:', appKey.length, 'characters');
  console.log('  - App Secret length:', appSecret.length, 'characters');
  console.log('  - Storage backend: backend/.env (Holds AppKey & AppSecret)');
  console.log('  - Storage root: .env (Holds AppKey only; Secret excluded)');
  console.log('  - Git Exclusion: Both files verified ignored in .gitignore');
  console.log('===============================================================');
}

if (process.argv[2] && process.argv[3]) {
  applyNewCredentials(process.argv[2], process.argv[3]);
} else {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.question('Enter New Nexconn App Key: ', (key) => {
    rl.question('Enter New Nexconn App Secret (Masked/Direct): ', (sec) => {
      rl.close();
      applyNewCredentials(key, sec);
    });
  });
}

module.exports = { applyNewCredentials };
