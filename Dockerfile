# --- Build: install all dependencies and build the frontend ---
FROM node:24-slim AS build
WORKDIR /app

COPY package.json package-lock.json ./
# better-sqlite3 ships prebuilt binaries, so its node-gyp install script is not needed.
RUN npm ci --ignore-scripts

COPY . .
RUN npm run build && npm prune --omit=dev

# --- Runtime: Fastify serves the API and the built frontend ---
FROM node:24-slim
WORKDIR /app

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000 \
    DB_PATH=/app/data/calendar.db \
    STATIC_DIR=/app/dist

COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/server ./server
COPY --from=build /app/dist ./dist

RUN mkdir -p /app/data && chown node:node /app/data
USER node

EXPOSE 3000
CMD ["node_modules/.bin/tsx", "server/index.ts"]
