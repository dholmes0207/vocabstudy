# Build the SPA, then run the Express server that serves the API + static dist.
FROM node:20-bookworm-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production
# Native module (better-sqlite3) is already built in the deps below.
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist
COPY server ./server
COPY src/lib/ai/systemPrompt.ts ./src/lib/ai/systemPrompt.ts
COPY src/lib/level.ts ./src/lib/level.ts
COPY tsconfig*.json ./
# tsx runs the TS server directly.
RUN npm i -g tsx@4
EXPOSE 8787
VOLUME ["/app/server"]
CMD ["tsx", "server/index.ts"]
