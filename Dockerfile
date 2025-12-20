# Stage 1: Build
FROM node:20-alpine AS builder

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy lockfile and package.json
COPY package.json pnpm-lock.yaml ./

# Install ALL dependencies (including devDeps for building)
RUN pnpm install --frozen-lockfile

# Copy source and build
COPY . .
RUN pnpm run build

# Use pnpm deploy to create a production-ready folder (no symlinks)
# This will put only production dependencies into /app/prod
RUN pnpm deploy --filter . --prod /app/prod

# Stage 2: Run
FROM node:20-alpine

WORKDIR /app

# Install pnpm (needed for your db:reset scripts)
RUN npm install -g pnpm

# Copy only the flat production node_modules from the 'prod' folder
COPY --from=builder /app/prod/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

EXPOSE 3000

CMD ["node", "dist/main"]