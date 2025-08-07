# Base Node.js image
FROM node:18-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies only when needed
FROM base AS deps
COPY package.json package-lock.json* ./
COPY turbo.json ./
COPY packages/db/package.json ./packages/db/
COPY packages/workers/package.json ./packages/workers/
COPY apps/server/package.json ./apps/server/

RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate --schema=packages/db/prisma/schema.prisma

# Build the server
RUN npm run build --workspace=server

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 sortify

# Copy built application
COPY --from=builder --chown=sortify:nodejs /app/apps/server/dist ./dist
COPY --from=builder --chown=sortify:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=sortify:nodejs /app/packages ./packages

# Create uploads directory
RUN mkdir -p uploads logs && chown sortify:nodejs uploads logs

USER sortify

EXPOSE 3002

ENV PORT=3002

CMD ["node", "dist/index.js"]
