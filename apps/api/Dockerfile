# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json
RUN npm ci --workspace=api --include-workspace-root=false

# Copy source and config
COPY . .

# Generate Prisma Client
RUN npx prisma generate --schema=./apps/api/prisma/schema.prisma

# Build the API
RUN cd apps/api && npm run build

# Stage 2: Runtime
FROM node:20-alpine
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json

# Install production dependencies
RUN npm ci --omit=dev --workspace=api --include-workspace-root=false

# Copy built artifacts and generate Prisma Client for the runtime image
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
RUN npx prisma generate --schema=./apps/api/prisma/schema.prisma

# Ensure the database connection URL is available (will be provided by docker-compose)
EXPOSE 4000

# Use node directly to avoid npm overhead and ensure path clarity
CMD ["node", "apps/api/dist/src/main.js"]
