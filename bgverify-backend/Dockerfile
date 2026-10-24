# ─────────────────────────────────────────────────────────────────────────────
# Stage 1 — deps: Install only production dependencies
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-slim AS deps

WORKDIR /app

# Copy manifests first for layer cache optimisation
COPY package.json package-lock.json ./

# Install ALL deps (needed to build TS)
RUN npm ci --ignore-scripts

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2 — builder: Compile TypeScript → dist/
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-slim AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Compile TypeScript
RUN npm run build

# ─────────────────────────────────────────────────────────────────────────────
# Stage 3 — runner: Lean production image
# Playwright + Chromium requires extra system libraries
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-slim AS runner

# Install system dependencies required by Playwright Chromium
RUN apt-get update && apt-get install -y --no-install-recommends \
    libnss3 \
    libnspr4 \
    libdbus-1-3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libpango-1.0-0 \
    libcairo2 \
    libatspi2.0-0 \
    fonts-liberation \
    ca-certificates \
    curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Create a non-root user for security
RUN groupadd --gid 1001 nodejs && \
    useradd --uid 1001 --gid nodejs --shell /bin/bash --create-home bgverify

# Copy only production node_modules
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts

# Install Playwright Chromium browser binary
ENV PLAYWRIGHT_BROWSERS_PATH=/app/.playwright-browsers
RUN npx playwright install chromium

# Copy compiled application from builder stage
COPY --from=builder /app/dist ./dist

# Set correct ownership
RUN chown -R bgverify:nodejs /app

# Switch to non-root user
USER bgverify

# Runtime environment defaults (override via docker-compose or K8s secrets)
ENV NODE_ENV=production \
    PORT=5000 \
    API_PREFIX=/api/v1

EXPOSE 5000

# Health check — hits the /health endpoint every 30s
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

CMD ["node", "dist/server.js"]
