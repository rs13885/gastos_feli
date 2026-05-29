# syntax=docker/dockerfile:1

# Stage 1: build React client
FROM node:18-slim AS client-build
WORKDIR /client
COPY client/package*.json ./
RUN --mount=type=cache,target=/root/.npm npm ci
COPY client/ ./
ENV VITE_API_URL=""
RUN npm run build

# Stage 2: production server (serves API + static files)
FROM node:18-slim
WORKDIR /app
COPY server/package*.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --omit=dev
COPY server/src ./src
COPY --from=client-build /client/dist ./public
EXPOSE 3000
CMD ["node", "src/index.js"]
