/**
 * Secure App Secret Updater
 * 
 * Safely updates only the NEXCONN_APP_SECRET and NEXCONN_SECRET in backend/.env.
 * Does not write the secret to root .env, does not print it, and validates length.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const backendEnvPath = path.resolve(__dirname, '..', 'backend', '.env');

function updateSecret(newSecret) {
  newSecret = (newSecret || '').trim();
  if (!newSecret || newSecret.length < 12 || newSecret.includes('mock')) {
    console.error('❌ Validation Error: Rotated App Secret is invalid or too short.');
    process.exit(1);
  }

  if (!fs.existsSync(backendEnvPath)) {
    console.error(`❌ backend/.env not found at ${backendEnvPath}`);
    process.exit(1);
  }

  let content = fs.readFileSync(backendEnvPath, 'utf8');
  let lines = content.split(/\r?\n/).filter(line => 
    !line.startsWith('NEXCONN_APP_SECRET=') && !line.startsWith('NEXCONN_SECRET=')
  );

  lines.push(`NEXCONN_APP_SECRET="${newSecret}"`);
  lines.push(`NEXCONN_SECRET="${newSecret}"`);

  fs.writeFileSync(backendEnvPath, lines.join('\n'), 'utf8');
  console.log('✅ SUCCESS: Replacement App Secret safely updated in backend/.env.');
  console.log('   - Destination: backend/.env ONLY (strictly isolated from frontend)');
  console.log('   - Secret length:', newSecret.length, 'characters');
}

if (process.argv[2]) {
  updateSecret(process.argv[2]);
} else {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.question('Paste rotated Nexconn App Secret (Masked/Direct): ', (ans) => {
    rl.close();
    updateSecret(ans);
  });
}
