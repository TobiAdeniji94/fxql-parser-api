# ===================================
# Stage 1: Build
# ===================================
FROM node:18 AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (prefer lockfile when present)
RUN if [ -f package-lock.json ]; then \
      npm ci --quiet; \
    else \
      npm install --quiet; \
    fi

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Prune dev dependencies
RUN npm prune --production

# ===================================
# Stage 2: Production
# ===================================
FROM node:18 AS production

# Set working directory
WORKDIR /app

# Copy built application from builder
COPY --from=builder --chown=node:node /app/dist ./dist
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/package*.json ./
COPY --from=builder --chown=node:node /app/tsconfig.json ./tsconfig.json
COPY --from=builder --chown=node:node /app/tsconfig.build.json ./tsconfig.build.json
COPY --from=builder --chown=node:node /app/nest-cli.json ./nest-cli.json
COPY --chown=node:node config ./config

# Switch to non-root user provided by base image
USER node

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Run in production mode
CMD ["node", "dist/main"]
