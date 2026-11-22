# Multi-stage Dockerfile for BloodBridge Full-Stack Application
# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Build Backend
FROM node:20-alpine AS backend-builder
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm ci
COPY backend/ ./
RUN npx prisma generate --schema=../prisma/schema.prisma
RUN npm run build

# Stage 3: Production Runtime
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000

# Install production dependencies
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --only=production
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm ci --only=production
RUN npx prisma generate --schema=../prisma/schema.prisma

# Copy compiled backend
COPY --from=backend-builder /app/backend/dist ./dist

EXPOSE 5000

CMD ["node", "dist/server.js"]
