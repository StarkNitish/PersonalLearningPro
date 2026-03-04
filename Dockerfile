# ── PersonalLearningPro Dockerfile ──
# Multi-stage build optimized for:
# - Fast rebuilds (layer caching)
# - Small-ish production image
# - Non-root runtime
# - Separate dev target for docker-compose

# ------------------------------------------------------------
# Stage 1: deps (install once, reused by build/dev)
# ------------------------------------------------------------
FROM node:20-slim AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# ------------------------------------------------------------
# Stage 2: development (hot reload)
# ------------------------------------------------------------
FROM node:20-slim AS development
WORKDIR /app

ENV NODE_ENV=development

COPY --from=deps /app/node_modules ./node_modules
COPY . .

EXPOSE 5001
CMD ["npm", "run", "dev"]

# ------------------------------------------------------------
# Stage 3: build (vite + server bundle)
# ------------------------------------------------------------
FROM node:20-slim AS build
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# ------------------------------------------------------------
# Stage 4: production runtime
# ------------------------------------------------------------
FROM node:20-slim AS production
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5001

# Install only production dependencies (separate from build cache)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund \
  && npm cache clean --force

# Copy built artifacts
COPY --from=build /app/dist ./dist

# Ensure uploads dir exists (server serves /public/uploads)
RUN mkdir -p public/uploads \
  && chown -R node:node /app

USER node

EXPOSE 5001
# ══════════════════════════════════════════════════════════════════
#  PersonalLearningPro — Multi-stage Dockerfile
#  Stages: deps → development | deps → build → production
# ══════════════════════════════════════════════════════════════════

ARG NODE_VERSION=20-alpine

# ── Stage 1: Shared dependency layer ──────────────────────────────
# Both dev and prod build on top of this for maximum cache reuse.
FROM node:${NODE_VERSION} AS deps

# ── Metadata ──────────────────────────────────────────────────────
LABEL org.opencontainers.image.title="PersonalLearningPro"
LABEL org.opencontainers.image.description="AI-powered personal learning platform"
LABEL org.opencontainers.image.source="https://github.com/NitishKumar-ai/PersonalLearningPro"

# Install OS-level build tools needed by native addons (e.g. canvas, bcrypt)
RUN apk add --no-cache libc6-compat python3 make g++

WORKDIR /app

# Copy only manifests first — Docker layer-caches node_modules
# until package.json or package-lock.json actually changes.
COPY package.json package-lock.json ./
RUN npm ci --prefer-offline

# ── Stage 2: Development ──────────────────────────────────────────
FROM node:${NODE_VERSION} AS development

RUN apk add --no-cache libc6-compat

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs \
    && adduser  --system --uid 1001 appuser

WORKDIR /app

# Reuse installed modules from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Own the working directory
RUN chown -R appuser:nodejs /app

USER appuser

EXPOSE 5001

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD wget -qO- http://localhost:5001/api/health || exit 1

CMD ["npm", "run", "dev"]

# ── Stage 3: Build ────────────────────────────────────────────────
FROM node:${NODE_VERSION} AS build

ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_APP_ID
ARG VITE_FIREBASE_MEASUREMENT_ID
ARG VITE_FIREBASE_MESSAGING_SENDER_ID
ARG VITE_FIREBASE_PROJECT_ID

ENV VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY \
    VITE_FIREBASE_APP_ID=$VITE_FIREBASE_APP_ID \
    VITE_FIREBASE_MEASUREMENT_ID=$VITE_FIREBASE_MEASUREMENT_ID \
    VITE_FIREBASE_MESSAGING_SENDER_ID=$VITE_FIREBASE_MESSAGING_SENDER_ID \
    VITE_FIREBASE_PROJECT_ID=$VITE_FIREBASE_PROJECT_ID

RUN apk add --no-cache libc6-compat python3 make g++

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Type-check then build (client via Vite + server via esbuild)
RUN npm run build

# ── Stage 4: Production ───────────────────────────────────────────
FROM node:${NODE_VERSION} AS production

RUN apk add --no-cache libc6-compat \
    # wget is needed by HEALTHCHECK
    && apk add --no-cache wget

# Non-root user
RUN addgroup --system --gid 1001 nodejs \
    && adduser  --system --uid 1001 appuser

WORKDIR /app

# Install production-only dependencies (lean image)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --prefer-offline && npm cache clean --force

# Copy compiled output from the build stage
COPY --from=build /app/dist ./dist

# Own files
RUN chown -R appuser:nodejs /app

USER appuser

# Disable Node.js memory leaks and enable production optimisations
ENV NODE_ENV=production \
    NODE_OPTIONS="--max-old-space-size=512"

EXPOSE 5001

HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
    CMD wget -qO- http://localhost:5001/api/health || exit 1

CMD ["node", "dist/index.js"]
