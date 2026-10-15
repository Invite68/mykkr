# My KKR — Production Dockerfile
# Next.js 16.4.0 + Turbopack standalone output
# Verified: build passes, standalone HTTP 200 confirmed

# Stage 1: Install deps
FROM node:20.18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json .npmrc ./
RUN npm ci

# Stage 2: Build
FROM node:20.18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npm run build

# Stage 3: Production runner (minimal image)
FROM node:20.18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Non-root user — never run as root in production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

# Next.js 16 standalone output structure:
# .next/standalone/ contains: server.js, package.json, node_modules/, public/, .next/
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# Static files must be copied separately into standalone
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Public folder (preview.html, images, etc)
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget -qO- http://localhost:3000/ || exit 1

# Standalone server — no npm needed at runtime
CMD ["node", "server.js"]
