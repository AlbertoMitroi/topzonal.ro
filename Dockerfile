# 1. Base image for dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# 2. Builder image
FROM node:20-alpine AS builder
WORKDIR /app

# Build args
ARG DATABASE_URL
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

ENV DATABASE_URL=$DATABASE_URL
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

# Copy deps
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build Next.js app
RUN npm run build

# 3. Production runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy production files
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma/schema.prisma ./prisma/schema.prisma

EXPOSE 3000
CMD ["npm", "start"]
