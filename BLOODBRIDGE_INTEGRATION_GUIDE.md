# BLOODBRIDGE INTEGRATION GUIDE
## Integrating Person 1's Backend with Person 2's MySQL Database

### 1. Overview
This guide provides the exact steps for the development team to run and reproduce the combined BloodBridge backend, MySQL database, and frontend in an isolated environment.

---

### 2. Isolated Integration Database Setup

#### Step 1: Create Database & User Permissions (MySQL Workbench / CLI as root)
```sql
CREATE DATABASE IF NOT EXISTS `bloodbridge_integration_test`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

GRANT ALL PRIVILEGES ON `bloodbridge_integration_test`.* TO 'bloodbridge_app'@'localhost';
GRANT ALL PRIVILEGES ON `bloodbridge_app`@'127.0.0.1';
GRANT ALL PRIVILEGES ON `bloodbridge_integration_test`.* TO 'bloodbridge_migrate'@'localhost';
GRANT ALL PRIVILEGES ON `bloodbridge_migrate`@'127.0.0.1';
FLUSH PRIVILEGES;
```

#### Step 2: Initialize Core Schema and Reference Seeds
Run the automated initialization runner:
```bash
npx tsx database/scripts/init_integration_db.ts
```
*(Or source `database/schema/bloodbridge_core_schema.sql` and `database/seeds/*.sql` in MySQL Workbench).*

---

### 3. Environment Configuration (`.env`)
Create `.env` in both the root workspace and `backend/`:
```env
PORT=5000
NODE_ENV="development"
API_PREFIX="/api/v1"
CORS_ORIGIN="http://localhost:5173"
TZ="UTC"

DATABASE_URL="mysql://bloodbridge_app:AppSecurePass2026!@127.0.0.1:3306/bloodbridge_integration_test?connection_limit=20"
MIGRATION_DATABASE_URL="mysql://bloodbridge_migrate:MigrateSecurePass2026!@127.0.0.1:3306/bloodbridge_integration_test"
TEST_DATABASE_URL="mysql://bloodbridge_app:AppSecurePass2026!@127.0.0.1:3306/bloodbridge_integration_test"

JWT_SECRET="bloodbridge_jwt_secret_key_chennai_2026_super_secure"
JWT_EXPIRATION_TIME=900
```

---

### 4. Running the Applications

#### Starting the Backend:
```bash
cd backend
npm install
npm run dev
```
- API Server: `http://localhost:5000/api/v1`
- WebSocket Gateway: `ws://localhost:5000/ws`
- Health Check: `http://localhost:5000/health`

#### Starting the Frontend:
```bash
npm install
npm run dev
```
- Frontend UI: `http://localhost:5173`

---

### 5. Running the Test Suites

#### 1. Person 1 Backend Tests:
```bash
cd backend
npm test
```
Result: **6/6 passed** (Auth, JWT, Inventory, Concurrency decrement, Chat storage).

#### 2. End-to-End MySQL Integration Tests:
```bash
cd backend
npx ts-node src/tests/e2e_integration_suite.ts
```
Result: **9/9 passed** (Sections A through I: Auth, Institutions, Inventory, Requests, Concurrency contention, Spatial ST_Distance_Sphere, Rare Bombay Phenotype, Audit trail, Security).
