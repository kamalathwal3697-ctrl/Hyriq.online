# Multi-stage production Dockerfile for HYRIQ.online Next.js Application

# Stage 1: Build Dependencies
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package lockfiles
COPY package.json package-lock.json ./
COPY next-app/package.json next-app/package-lock.json ./next-app/

# Install dependencies (production & development for build stages)
RUN npm ci

# Stage 2: Builder
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/next-app/node_modules ./next-app/node_modules
COPY . .

# Generate Prisma Client & Build NextJS app
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production
RUN npx prisma generate --schema=next-app/prisma/schema.prisma
RUN cd next-app && npm run build

# Stage 3: Runner
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy essential runtime files
COPY --from=builder /app/next-app/public ./next-app/public
COPY --from=builder --chown=nextjs:nodejs /app/next-app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/next-app/.next/static ./next-app/.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "next-app/server.js"]
