FROM node:20-slim AS base

FROM base AS deps
RUN apt-get update && apt-get install -y libc6-dev openssl
WORKDIR /app

COPY package.json package-lock.json* ./
COPY prisma ./prisma/
RUN rm -rf package-lock.json
RUN npm install

RUN npx prisma generate

FROM base AS builder
RUN apt-get update && apt-get install -y openssl
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

FROM base AS runner
RUN apt-get update && apt-get install -y openssl
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

COPY --from=builder /app/public ./public

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
