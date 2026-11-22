# BLOODBRIDGE — DEMO ENVIRONMENT SETUP & RESET GUIDE

**Workspace:** `D:\PROJECT REPO\bloodbridge-integration-test`  
**Database Name:** `bloodbridge_integration_test` (MySQL 8.0.46)

---

## 1. Quick Start

### 1.1 Prerequisites
- Node.js v20+ / v24+
- MySQL 8.0.46 running locally on port 3306
- Valid credentials in `backend/.env`:
  ```env
  DATABASE_URL="mysql://[DB_USER]:[DB_PASSWORD]@127.0.0.1:3306/bloodbridge_integration_test"
  NEXCONN_APP_KEY="[YOUR_NEXCONN_APP_KEY]"
  NEXCONN_APP_SECRET="[YOUR_NEXCONN_APP_SECRET]"
  NEXCONN_API_REGION="sg"
  ```

### 1.2 Start Backend and Frontend Servers
1. **Start Backend Server:**
   ```powershell
   cd "D:\PROJECT REPO\bloodbridge-integration-test\backend"
   npx tsx src/server.ts
   ```
   API runs on `http://localhost:5001`.

2. **Start Frontend Dev Server:**
   ```powershell
   cd "D:\PROJECT REPO\bloodbridge-integration-test"
   npx vite --host 0.0.0.0 --port 5173
   ```
   Web application available at `http://localhost:5173`.

---

## 2. Idempotent Data Seeding

To seed or refresh the 36 Chennai demo institutions, 14 demo accounts, blood inventory, requests, and conversations:

```powershell
cd "D:\PROJECT REPO\bloodbridge-integration-test"
npx tsx prisma/seed.ts
```

*Note: Running this command repeatedly is 100% safe and idempotent. It uses `ON DUPLICATE KEY UPDATE` and stable primary identifiers.*

---

## 3. Safe Database Reset Procedure

If you need a complete clean-slate reset of the test database:

> [!CAUTION]
> This command only operates on `bloodbridge_integration_test`. It NEVER touches `bloodbridge_dev`, `bloodbridge_prod`, or other MySQL schemas.

```powershell
node -e "
const mysql = require('mysql2/promise');
async function reset() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL || 'mysql://root@127.0.0.1:3306/bloodbridge_integration_test');
  console.log('Resetting bloodbridge_integration_test data tables...');
  await conn.query('SET FOREIGN_KEY_CHECKS = 0');
  const [tables] = await conn.query('SHOW TABLES');
  for (const t of tables) {
    const name = Object.values(t)[0];
    await conn.query('TRUNCATE TABLE ' + name);
  }
  await conn.query('SET FOREIGN_KEY_CHECKS = 1');
  await conn.end();
  console.log('Reset complete. Now re-run: npx tsx prisma/seed.ts');
}
reset();
"
```
After reset, re-run `npx tsx prisma/seed.ts` to restore the complete demo dataset.
