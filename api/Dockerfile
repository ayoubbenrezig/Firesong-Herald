FROM node:24-alpine AS builder

WORKDIR /app

# Install and generate Prisma client
COPY db/package*.json ./db/
COPY db/prisma ./db/prisma
COPY db/prisma.config.ts ./db/
RUN cd db && npm ci && npx prisma generate

# Install and build API
COPY api/package*.json ./api/
RUN cd api && npm ci

COPY api/tsconfig.json ./api/
COPY api/src ./api/src

RUN cd api && npm run build

# ---

FROM node:24-alpine AS runner

ENV NODE_ENV=production

WORKDIR /app

COPY api/package*.json ./api/
RUN cd api && npm ci --omit=dev

COPY --from=builder /app/db/generated ./db/generated
COPY --from=builder /app/api/dist ./api/dist

EXPOSE 3000

CMD ["node", "api/dist/api/src/index.js"]