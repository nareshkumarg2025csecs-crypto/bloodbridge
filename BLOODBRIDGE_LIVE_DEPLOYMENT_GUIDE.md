# BLOODBRIDGE LIVE DEPLOYMENT GUIDE
## Production Hosting & Infrastructure Runbook

### 1. Architectural Deployment Topology

```
[ User Browser / Mobile Client ]
              |
              v (HTTPS / WSS)
[ Deployed Frontend - Vercel / Cloudflare Pages / S3+CloudFront ]
              |
              v (REST API / WebSocket)
[ Deployed Backend - AWS ECS / Render / Railway / Google Cloud Run ]
              |
              v (TLS 1.3 / MySQL Native Protocol Port 3306)
[ Managed MySQL 8.0 Cloud Database - AWS RDS / Google Cloud SQL / PlanetScale ]
```

---

### 2. Supported Deployment Options

#### Option A: Containerized Cloud Hosting (Recommended for WebSockets + REST)
- **Providers:** AWS App Runner / ECS, Google Cloud Run, Railway, Render.
- **Docker Blueprint:** Pre-configured in [Dockerfile](file:///D:/PROJECT%20REPO/bloodbridge-integration-test/Dockerfile) and [docker-compose.yml](file:///D:/PROJECT%20REPO/bloodbridge-integration-test/docker-compose.yml).
- **Execution:**
  ```bash
  docker build -t bloodbridge-backend:latest .
  docker run -p 5000:5000 --env-file .env.production bloodbridge-backend:latest
  ```

#### Option B: Split Frontend / Backend Hosting
1. **Frontend:** Deploy root Vite React app to **Vercel** or **Cloudflare Pages**:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Environment Variable: `VITE_API_URL=https://api.bloodbridge.yourdomain.com/api/v1`
2. **Backend:** Deploy `backend/` to **Render** or **Railway**:
   - Root Directory: `backend`
   - Build Command: `npm install && npx prisma generate --schema=../prisma/schema.prisma && npm run build`
   - Start Command: `node dist/server.js`

---

### 3. Production Database Provisioning Rules

> [!CAUTION]
> Never connect production traffic to local developer machines or development databases (`bloodbridge_dev`, `bloodbridge_test`, `bloodbridge_integration_test`).

1. **Provision MySQL 8.0 Instance:** Ensure MySQL 8.0.36+ or 8.0.46 with InnoDB and Spatial functions enabled.
2. **Create Production Database & Least-Privilege Users:**
   ```sql
   CREATE DATABASE bloodbridge_prod CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'bloodbridge_prod_user'@'%' IDENTIFIED BY 'STRONG_SECRET_PASSWORD';
   GRANT SELECT, INSERT, UPDATE, DELETE, EXECUTE, SHOW VIEW ON bloodbridge_prod.* TO 'bloodbridge_prod_user'@'%';
   FLUSH PRIVILEGES;
   ```
3. **Execute Production Schema:**
   Deploy `database/schema/bloodbridge_core_schema.sql` and catalog reference seeds `database/seeds/01_blood_catalog_seeds.sql`.
