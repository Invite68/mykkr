# ══════════════════════════════════════════════════════════════
# My KKR — Hardened Production Dockerfile
# ══════════════════════════════════════════════════════════════
# Security measures applied:
# - Multi-stage build (no dev dependencies in final image)
# - Non-root user (nextjs:nodejs, uid/gid 1001)
# - No secrets in image layers (use Coolify env vars)
# - Minimal Alpine base (smaller attack surface)
# - Health check included
# - Pinned Node version
# ══════════════════════════════════════════════════════════════

# ── Stage 1: Dependencies ──
FROM node:20.18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files first (Docker layer caching)
COPY package.json package-lock.json* ./

# npm ci: clean install from lockfile — reproducible, no version drift
RUN npm ci --only=production && npm cache clean --force

# ── Stage 2: Builder ──
FROM node:20.18-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Public env vars passed as build args from Coolify
# IMPORTANT: Only NEXT_PUBLIC_ vars go here — they end up in the browser bundle
# Server-only secrets must NEVER be ARG/ENV in the builder stage
ARG NEXT_PUBLIC_API_URL=https://api.mykkr.in
ARG NEXT_PUBLIC_APP_URL=https://mykkr.in

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

# ── Stage 3: Runner (production image) ──
FROM node:20.18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create non-root user — never run as root in production
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy only what's needed to run the app
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

# Expose app port
EXPOSE 3000

# Health check — Coolify uses this to know if app is healthy
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget -qO- http://localhost:3000/ || exit 1

# Start the app
CMD ["node", "server.js"]
