FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig*.json ./
COPY src ./src
RUN npm run build

FROM node:22-alpine AS production
ENV NODE_ENV=production
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 appuser

COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package*.json ./

USER appuser

CMD ["node", "dist/stdio.js"]
