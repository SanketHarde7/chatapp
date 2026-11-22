# ---------- Stage 1: build (TypeScript -> JavaScript) ----------
    FROM node:22-alpine AS build
    WORKDIR /app
    COPY package.json package-lock.json ./
    RUN npm ci
    COPY tsconfig.json ./
    COPY src ./src
    RUN npx tsc
    
    # ---------- Stage 2: final image (sirf run karne layak) ----------
    FROM node:22-alpine
    WORKDIR /app
    ENV NODE_ENV=production
    COPY package.json package-lock.json ./
    RUN npm ci --omit=dev
    COPY --from=build /app/dist ./dist
    COPY public ./public
    USER node
    EXPOSE 3000
    CMD ["node", "dist/server.js"]