# Stage 1: build React client
FROM node:18-alpine AS client-build
WORKDIR /client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
ENV VITE_API_URL=""
RUN npm run build

# Stage 2: production server (serves both API and static files)
FROM node:18-alpine
WORKDIR /app
COPY server/package*.json ./
RUN npm ci --omit=dev
COPY server/src ./src
COPY --from=client-build /client/dist ./public
EXPOSE 3000
CMD ["node", "src/index.js"]
