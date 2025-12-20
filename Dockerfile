# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm
RUN pnpm config set node-linker hoisted

# Copy metadata first for better caching
COPY package.json pnpm-lock.yaml* ./

# Install ALL dependencies (including dev dependencies for build)
RUN pnpm install --frozen-lockfile

# Copy source and build
COPY . .
RUN pnpm run build

# Compile TypeORM data-source for production use
RUN npx tsc src/data-source.ts --outDir dist --module commonjs --esModuleInterop

# --- Stage 2: Run ---
FROM node:20-alpine

WORKDIR /app

# Install pnpm in the runner
RUN npm install -g pnpm
RUN pnpm config set node-linker hoisted

# Copy package files
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml* ./

# Install ALL dependencies (needed for TypeORM CLI and ts-node)
RUN pnpm install --frozen-lockfile

# Copy the build output
COPY --from=builder /app/dist ./dist

# Copy source files (needed for TypeORM CLI operations)
COPY --from=builder /app/src ./src
COPY --from=builder /app/tsconfig.json ./tsconfig.json

EXPOSE 3000

CMD ["node", "dist/main"]