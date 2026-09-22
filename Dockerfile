FROM node:22-bookworm-slim

WORKDIR /app
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci

COPY . .
RUN npx prisma generate && npx next build

ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "scripts/start.mjs"]
