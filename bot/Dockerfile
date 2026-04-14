FROM node:24-alpine AS builder

WORKDIR /app

# Install and generate Prisma client
COPY db/package*.json ./db/
COPY db/prisma ./db/prisma
COPY db/prisma.config.ts ./db/
RUN cd db && npm ci && npx prisma generate

# Install and build bot
COPY bot/package*.json ./bot/
RUN cd bot && npm ci

COPY bot/tsconfig.json ./bot/
COPY bot/src ./bot/src

RUN cd bot && npm run build

# ---

FROM node:24-alpine AS runner

ENV NODE_ENV=production

RUN addgroup -S firesong && adduser -S firesong -G firesong

WORKDIR /app

COPY bot/package*.json ./bot/
RUN cd bot && npm ci --omit=dev

COPY --from=builder /app/db/generated ./bot/dist/db/generated
COPY --from=builder /app/bot/dist ./bot/dist

RUN chown -R firesong:firesong /app

USER firesong

CMD ["node", "bot/dist/bot/src/index.js"]