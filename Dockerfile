# Stage 1: Build
FROM node:20-alpine AS builder

# Install pnpm globally
RUN npm install -g pnpm

WORKDIR /app

# Copy pnpm lockfile and package.json
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code and build
COPY . .
RUN pnpm run build

# Stage 2: Run
FROM node:20-alpine

WORKDIR /app

# Install pnpm in the runner stage as well (needed for your scripts)
RUN npm install -g pnpm

# Copy only necessary files
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml* ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# Expose the application port
EXPOSE 3000

CMD ["node", "dist/main"]