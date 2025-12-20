# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Force pnpm to use a flat node_modules structure (hoisting)
RUN pnpm config set node-linker hoisted

# Copy metadata first for better caching
COPY package.json pnpm-lock.yaml* ./

# Install ALL dependencies (including dev dependencies for build)
RUN pnpm install --frozen-lockfile

# Copy source and build
COPY . .
RUN pnpm run build

# --- Stage 2: Run ---
FROM node:20-alpine

WORKDIR /app

# Install pnpm in the runner
RUN npm install -g pnpm
RUN pnpm config set node-linker hoisted

# Copy package files
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml* ./

# Install PRODUCTION dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy the build output AFTER installing dependencies
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main"]