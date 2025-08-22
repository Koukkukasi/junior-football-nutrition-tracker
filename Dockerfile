# Multi-stage Dockerfile for Junior Football Nutrition Tracker

# Stage 1: Build the client
FROM node:20-alpine AS client-builder

WORKDIR /app/client

# Copy package files
COPY client/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy client source
COPY client/ .

# Build the client
RUN npm run build

# Stage 2: Build the server
FROM node:20-alpine AS server-builder

WORKDIR /app/server

# Copy package files
COPY server/package*.json ./

# Install dependencies including dev dependencies for building
RUN npm ci

# Copy server source
COPY server/ .

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Remove dev dependencies
RUN npm prune --production

# Stage 3: Production image
FROM node:20-alpine

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy built client from stage 1
COPY --from=client-builder --chown=nodejs:nodejs /app/client/dist ./client

# Copy built server from stage 2
COPY --from=server-builder --chown=nodejs:nodejs /app/server/dist ./server/dist
COPY --from=server-builder --chown=nodejs:nodejs /app/server/node_modules ./server/node_modules
COPY --from=server-builder --chown=nodejs:nodejs /app/server/package*.json ./server/
COPY --from=server-builder --chown=nodejs:nodejs /app/server/prisma ./server/prisma

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3001

# Set environment to production
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the server with dumb-init
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server/dist/server.js"]