# BLOODBRIDGE DATABASE MIGRATIONS GUIDE

### 1. Migration Strategy: Prisma Migrations + Native MySQL DDL
BloodBridge utilizes Prisma as its primary ORM data-modeling tool in conjunction with native MySQL 8.0 DDL scripts. Because Prisma does not natively support MySQL `POINT SRID 4326` and `SPATIAL INDEX` as first-class schema generator primitives, the architecture maintains strict synchronicity between:
1. `prisma/schema.prisma` – Powers the strongly typed Prisma Client used by Person 1 for REST/WebSocket models.
2. `database/schema/bloodbridge_core_schema.sql` – The canonical DDL executed on MySQL 8.0 containing native spatial indexes, check constraints, and fine-grained MySQL table options.

---

### 2. Migration Execution Commands

#### Step 1: Run Canonical Database Initialization (DDL)
Execute using the migration account (`bloodbridge_migrate`):
```bash
mysql -u bloodbridge_migrate -p bloodbridge_dev < database/schema/bloodbridge_core_schema.sql
```

#### Step 2: Seed Clinical Catalog & Geographic Data
```bash
mysql -u bloodbridge_migrate -p bloodbridge_dev < database/seeds/01_blood_catalog_seeds.sql
mysql -u bloodbridge_migrate -p bloodbridge_dev < database/seeds/02_chennai_institutions_seeds.sql
mysql -u bloodbridge_migrate -p bloodbridge_dev < database/seeds/03_blood_inventory_seeds.sql
```

#### Step 3: Synchronize Prisma Schema
To generate or re-generate the Prisma Client without destructive database resets:
```bash
npx prisma generate
```

To verify database schema drift against the active database:
```bash
npx prisma db pull --print
```

---

### 3. Spatial Field Preservation in Migrations
The `institution_branches` table includes:
```sql
`location_point` POINT NOT NULL SRID 4326,
SPATIAL INDEX `spx_branches_location` (`location_point`)
```
**CRITICAL:** Never execute destructive `prisma migrate reset` in production environments without ensuring the custom spatial indexes are reapplied via custom SQL migration hooks.
