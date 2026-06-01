FROM node:20-slim AS builder
WORKDIR /usr/src/app

RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY . .
ARG DATABASE_URL=postgresql://build:build@localhost:5432/build
ARG DIRECT_URL=postgresql://build:build@localhost:5432/build
ENV DATABASE_URL=$DATABASE_URL
ENV DIRECT_URL=$DIRECT_URL
RUN npm run build:next

FROM node:20-slim AS runner
WORKDIR /usr/src/app
ENV NODE_ENV=production

RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm install prisma --no-save

COPY --from=builder /usr/src/app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /usr/src/app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /usr/src/app/.next ./.next
COPY --from=builder /usr/src/app/public ./public
COPY --from=builder /usr/src/app/prisma ./prisma
COPY --from=builder /usr/src/app/server.js ./server.js
COPY --from=builder /usr/src/app/lib ./lib
COPY --from=builder /usr/src/app/app ./app
COPY --from=builder /usr/src/app/components ./components
COPY --from=builder /usr/src/app/middleware.ts ./middleware.ts
COPY --from=builder /usr/src/app/next.config.ts ./next.config.ts
COPY --from=builder /usr/src/app/instrumentation.ts ./instrumentation.ts
COPY --from=builder /usr/src/app/tsconfig.json ./tsconfig.json

RUN mkdir -p uploads data

EXPOSE 3000 8080
CMD ["npm", "run", "start:next"]
