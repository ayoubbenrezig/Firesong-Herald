FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY svelte.config.js vite.config.ts tsconfig.json ./
COPY static ./static
COPY src ./src

RUN npm run build

# ---

FROM node:24-alpine AS runner

ENV NODE_ENV=production
ENV PORT=3001
ENV HOST=0.0.0.0

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/build ./build

EXPOSE 3001

CMD ["node", "build/index.js"]
