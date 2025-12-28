# Niyaku Setup Guide

## Prerequisites

- Node.js 20+ and pnpm
- Docker and Docker Compose
- PostgreSQL 15+ (or use Docker)
- Redis (or use Docker)

## Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=niyaku_db

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT Configuration
JWT_SECRET=your_very_strong_secret_key_minimum_32_characters
JWT_EXPIRES_IN=1d
JWT_REFRESH_EXPIRES_IN=7d

# Application Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration (comma-separated)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Email Configuration (if using email notifications)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_email@example.com
SMTP_PASSWORD=your_email_password
```

## Local Development Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Start Docker Services

```bash
docker-compose up -d niyaku-db niyaku-redis
```

This will start:
- PostgreSQL database on port 5432
- Redis on port 6379

### 3. Run Database Migrations

```bash
pnpm run migration:run
```

Or for development:
```bash
pnpm run db:sync
```

### 4. Seed Database (Optional)

```bash
pnpm run seed
```

This creates:
- Default permissions
- Admin user (Patrick) with admin role

### 5. Start Development Server

```bash
pnpm run start:dev
```

The application will be available at:
- API: http://localhost:3000/api
- Swagger Docs: http://localhost:3000/api/docs
- Metrics: http://localhost:3000/metrics

## Docker Setup

### Build and Run with Docker Compose

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f niyaku-api

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Accessing Logs

Logs are written to the `./logs` directory and are mounted as a volume in Docker:

- `logs/database.log` - Database call logs
- `logs/error.log` - Error logs
- `logs/application.log` - General application logs

You can access logs from the host machine:
```bash
tail -f logs/application.log
tail -f logs/error.log
tail -f logs/database.log
```

## Production Deployment

### 1. Build Application

```bash
pnpm run build
```

### 2. Set Production Environment Variables

Ensure all environment variables are set with production values:
- Strong JWT_SECRET (minimum 32 characters)
- Production database credentials
- Proper ALLOWED_ORIGINS
- NODE_ENV=production

### 3. Run Migrations

```bash
pnpm run migration:run:prod
```

### 4. Start Application

```bash
pnpm run start:prod
```

Or with PM2:
```bash
pm2 start dist/main.js --name niyaku-api
```

## Database Setup

### Manual PostgreSQL Setup

1. Create database:
```sql
CREATE DATABASE niyaku_db;
```

2. Create user:
```sql
CREATE USER niyaku_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE niyaku_db TO niyaku_user;
```

### Using Docker

The `docker-compose.yml` automatically creates the database and user from environment variables.

## Redis Setup

### Manual Redis Setup

```bash
redis-server
```

### Using Docker

The `docker-compose.yml` automatically starts Redis.

## Logging Configuration

### Log Files Location

Logs are stored in the `logs/` directory:
- Created automatically on first log write
- Mounted as volume in Docker for easy access
- Rotate manually or implement log rotation

### Log Levels

- **DEBUG**: Detailed debugging information
- **INFO**: General informational messages
- **WARN**: Warning messages
- **ERROR**: Error messages with stack traces

### Accessing Logs

**Local Development**:
```bash
# View all logs
tail -f logs/application.log

# View errors only
tail -f logs/error.log

# View database queries
tail -f logs/database.log
```

**Docker**:
```bash
# View application logs
docker-compose logs -f niyaku-api

# Access log files directly
ls -la logs/
```

## Common Issues

### Port Already in Use

If port 3000 is already in use:
```bash
# Change PORT in .env file
PORT=3001
```

### Database Connection Failed

1. Check database is running:
```bash
docker-compose ps niyaku-db
```

2. Verify environment variables:
```bash
cat .env | grep DB_
```

3. Test connection:
```bash
psql -h localhost -U your_db_user -d niyaku_db
```

### Migration Errors

1. Check migration status:
```bash
pnpm run migration:show
```

2. Rollback if needed:
```bash
pnpm run migration:revert
```

### Logs Directory Permission Issues

If logs directory has permission issues:
```bash
chmod 755 logs/
chown -R $USER:$USER logs/
```

## Development Workflow

### 1. Create Migration

```bash
pnpm run migration:create --name YourMigrationName
```

### 2. Run Migrations

```bash
pnpm run migration:run
```

### 3. Generate Migration from Entity Changes

```bash
pnpm run migration:generate --name YourMigrationName
```

### 4. Revert Migration

```bash
pnpm run migration:revert
```

## Testing

### Run Tests

```bash
# Unit tests
pnpm run test

# E2E tests
pnpm run test:e2e

# Test coverage
pnpm run test:cov
```

## Monitoring

### Prometheus Metrics

Metrics are available at `/metrics` endpoint:
- Request counts
- Response times
- Error rates
- Custom business metrics

### Health Checks

Implement health check endpoints:
- `/health` - Application health
- `/health/db` - Database connectivity
- `/health/redis` - Redis connectivity

## Troubleshooting

### Application Won't Start

1. Check environment variables:
```bash
cat .env
```

2. Check database connection:
```bash
docker-compose logs niyaku-db
```

3. Check application logs:
```bash
tail -f logs/error.log
```

### Performance Issues

1. Check database logs:
```bash
tail -f logs/database.log
```

2. Review slow queries
3. Check Redis connectivity
4. Review application logs for errors

### Authentication Issues

1. Verify JWT_SECRET is set
2. Check token expiration settings
3. Review auth middleware logs
4. Verify user roles and permissions

## Next Steps

1. Review [Architecture Documentation](./ARCHITECTURE.md)
2. Read [Business Logic Documentation](./BUSINESS_LOGIC.md)
3. Check [Code Quality Review](./CODE_QUALITY.md)
4. Review [Issues and Improvements](./ISSUES.md) and [IMPROVEMENTS.md](./IMPROVEMENTS.md)

