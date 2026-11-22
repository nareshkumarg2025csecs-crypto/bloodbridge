# BLOODBRIDGE PERSON 1 & PERSON 3 INTEGRATION HANDOVER
## Database Engineering Delivery Contract (Person 2)

### 1. Delivery Summary
Person 2 has architected, implemented, and validated the complete MySQL 8.0.46 database module for BloodBridge.

---

### 2. Integration Contract for PERSON 1 (Backend Engineer)

#### 2.1 Connection Setup
1. Copy `.env.example` to `.env` in the project root:
   ```env
   DATABASE_URL="mysql://bloodbridge_app:AppSecurePass2026!@127.0.0.1:3306/bloodbridge_dev?connection_limit=20"
   ```
2. Import Prisma Client in your Express/Fastify/Nest services:
   ```typescript
   import { PrismaClient } from '@prisma/client';
   export const prisma = new PrismaClient();
   ```

#### 2.2 Concurrency-Safe Reservation API Implementation
When exposing `POST /api/v1/reservations`:
- **DO NOT** perform a simple `prisma.bloodInventoryUnit.update()`.
- Use the provided transactional service [reservation_engine.ts](file:///D:/PROJECT%20REPO/bloodbridge-main/database/scripts/reservation_engine.ts) which wraps MySQL InnoDB `SELECT ... FOR UPDATE` row locks with automatic rollback.

#### 2.3 Nexconn Chat SDK Mapping
Map conversation threads using `channel_identifier` in the `conversations` table:
```typescript
const channel = await prisma.conversation.findUnique({
  where: { channelIdentifier: nexconnChannelId }
});
```

---

### 3. Integration Contract for PERSON 3 (AI Search & Frontend UI)

> [!NOTE]
> Person 3 consumes data exclusively via Person 1's REST and WebSocket APIs. No direct database credentials should be stored in the frontend client.

#### 3.1 Geolocation Search Response Data Contract
When Person 3's AI assistant calls `POST /api/v1/search/nearby`:
```json
{
  "query": {
    "userLocation": { "latitude": 13.1235, "longitude": 80.2089, "area": "Kolathur" },
    "bloodGroup": "O-",
    "component": "PRBC",
    "radiusKm": 15
  },
  "results": [
    {
      "branchId": 5,
      "branchName": "Kolathur Redhills Road Hub",
      "institutionName": "Kolathur LifeBridge Blood Hub [SYNTHETIC]",
      "institutionType": "PRIVATE_BLOOD_BANK",
      "area": "Kolathur",
      "distanceKm": 0.45,
      "availableUnits": 4,
      "contactPhone": "+914425508005",
      "verificationStatus": "VERIFIED"
    },
    {
      "branchId": 1,
      "branchName": "Kilpauk Main Branch",
      "institutionName": "Govt Central Blood Bank - Kilpauk [SYNTHETIC]",
      "institutionType": "GOVERNMENT_BLOOD_BANK",
      "area": "Kilpauk",
      "distanceKm": 5.82,
      "availableUnits": 1,
      "contactPhone": "+914428364001",
      "verificationStatus": "VERIFIED"
    }
  ]
}
```

#### 3.2 Rare Phenotype Data Contract
When a patient requires Bombay phenotype (`Oh`):
```json
{
  "bloodGroup": "O+",
  "isRare": true,
  "phenotype": {
    "code": "BOMBAY_OH",
    "name": "Bombay Phenotype (Oh / H-deficient)",
    "category": "BOMBAY",
    "safetyWarning": "CRITICAL: Patient produces potent Anti-H antibodies. Only transfuse Bombay (Oh) blood."
  },
  "unitsAvailable": 2,
  "holdingBranch": "Adyar Sardar Patel Wing"
}
```
