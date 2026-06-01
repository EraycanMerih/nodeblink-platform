FROM node:20-slim AS builder
WORKDIR /usr/src/app

# Install build deps
RUN apt-get update && apt-get install -y python3 make g++ git && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci --production=false

COPY . .
RUN npm run build:next

FROM node:20-slim AS runner
WORKDIR /usr/src/app
ENV NODE_ENV=production

# Copy built app and production deps
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/.next ./.next
COPY --from=builder /usr/src/app/public ./public
COPY --from=builder /usr/src/app/package.json ./package.json
COPY --from=builder /usr/src/app/server.js ./server.js
COPY --from=builder /usr/src/app/uploads ./uploads

EXPOSE 3000
CMD ["npm", "run", "start:next"]
