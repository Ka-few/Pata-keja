# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
# Copy root package files for workspace support if needed, but here we focus on api
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
RUN npm install

# Copy source and config
COPY . .

# Generate Prisma Client
RUN npx prisma generate --schema=./apps/api/prisma/schema.prisma

# Build the API
RUN cd apps/api && npm run build

# Stage 2: Runtime
FROM node:20-alpine
WORKDIR /app

# Copy built artifacts and dependencies
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package*.json ./
COPY --from=builder /app/apps/api/prisma ./prisma

# Install production dependencies
RUN npm install --omit=dev

# Ensure the database connection URL is available (will be provided by docker-compose)
EXPOSE 4000

# Use node directly to avoid npm overhead and ensure path clarity
CMD ["node", "dist/src/main.js"]
