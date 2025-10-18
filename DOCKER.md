# Docker Deployment Guide

## Overview

The FXQL Parser API is fully containerized with Docker support for both **development** and **production** environments.

---

## Quick Start

### Production Mode
```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

### Development Mode
```bash
# Start with hot-reload enabled
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# Or use the shorthand
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# View logs with hot-reload
docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs -f app
```

---

## Architecture

### Services

| Service | Container | Port | Purpose |
|---------|-----------|------|---------|
| **app** | fxql-api | 5000 | NestJS API (main application) |
| **postgres** | fxql-postgres | 5432 | PostgreSQL database |
| **redis** | fxql-redis | 6379 | Rate limiting & caching |

### Network
- All services communicate via `fxql-network` (bridge network)
- Services reference each other by container name (e.g., `postgres`, `redis`)

### Volumes
- `pgdata` - PostgreSQL data persistence
- `redis_data` - Redis AOF persistence (production only)

---

## Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
# Database
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_secure_password
DB_DATABASE=fxql_db
DB_SSL_ENABLED=false

# API Keys
API_KEYS=fxql_your_api_key_here

# Redis
REDIS_ENABLED=true
REDIS_URL=redis://redis:6379

# Logging
NODE_ENV=production
LOG_LEVEL=info
```

**Security Note:** Use strong passwords and API keys in production!

---

## Production Deployment

### 1. Build Production Image
```bash
docker-compose build --no-cache
```

### 2. Start Services
```bash
docker-compose up -d
```

### 3. Run Database Migrations
```bash
docker-compose exec app npm run migration:run
```

### 4. Verify Health
```bash
# Check container health
docker-compose ps

# Test API health endpoint
curl http://localhost:5000/health

# View metrics
curl http://localhost:5000/metrics
```

### 5. View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f postgres
docker-compose logs -f redis
```

---

## Development Workflow

### 1. Start Development Environment
```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

**Features:**
- ✅ Hot-reload (code changes reflect immediately)
- ✅ Debug port exposed (9229)
- ✅ Source code mounted as volumes
- ✅ Faster health checks
- ✅ Development database (`fxql_dev`)

### 2. Install New Dependencies
```bash
# Enter container
docker-compose exec app sh

# Install package
npm install <package-name>

# Exit and rebuild
exit
docker-compose restart app
```

### 3. Run Tests
```bash
docker-compose exec app npm test
```

### 4. Debug with VSCode

Add to `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "attach",
      "name": "Docker: Attach to Node",
      "port": 9229,
      "address": "localhost",
      "localRoot": "${workspaceFolder}",
      "remoteRoot": "/app",
      "protocol": "inspector",
      "restart": true
    }
  ]
}
```

Start debugging:
1. Run `docker-compose -f docker-compose.yml -f docker-compose.dev.yml up`
2. In VSCode, press `F5` or select "Docker: Attach to Node"
3. Set breakpoints in your code

---

## Database Management

### Access PostgreSQL CLI
```bash
docker-compose exec postgres psql -U postgres -d fxql_db
```

### Run Migrations
```bash
# Run all pending migrations
docker-compose exec app npm run migration:run

# Revert last migration
docker-compose exec app npm run migration:revert

# Generate new migration
docker-compose exec app npm run migration:generate -- -n MigrationName
```

### Backup Database
```bash
# Create backup
docker-compose exec postgres pg_dump -U postgres fxql_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
docker-compose exec -T postgres psql -U postgres fxql_db < backup.sql
```

---

## Redis Management

### Access Redis CLI
```bash
docker-compose exec redis redis-cli
```

### Common Redis Commands
```bash
# Check connection
PING

# View all keys
KEYS *

# Get rate limit info for API key
GET rate-limit:fxql_your_api_key

# Clear all data
FLUSHALL

# View memory usage
INFO memory
```

---

## Resource Management

### View Resource Usage
```bash
docker stats
```

### Resource Limits (Configured)

| Service | CPU Limit | Memory Limit | CPU Reserved | Memory Reserved |
|---------|-----------|--------------|--------------|-----------------|
| app | 1.0 CPU | 512MB | 0.5 CPU | 256MB |
| postgres | 0.5 CPU | 512MB | 0.25 CPU | 256MB |
| redis | 0.25 CPU | 256MB | 0.1 CPU | 128MB |

### Scale Services
```bash
# Scale app to 3 instances
docker-compose up -d --scale app=3
```

---

## Troubleshooting

### Container Won't Start
```bash
# View detailed logs
docker-compose logs app

# Check container status
docker-compose ps

# Inspect container
docker inspect fxql-api
```

### Database Connection Issues
```bash
# Verify PostgreSQL is healthy
docker-compose exec postgres pg_isready

# Check database exists
docker-compose exec postgres psql -U postgres -l

# Test connection from app
docker-compose exec app node -e "console.log(process.env.DB_HOST)"
```

### Redis Connection Issues
```bash
# Test Redis connection
docker-compose exec redis redis-cli PING

# Check Redis logs
docker-compose logs redis
```

### Performance Issues
```bash
# Check resource usage
docker stats

# View app logs for slow queries
docker-compose logs app | grep "duration"

# Check PostgreSQL slow queries
docker-compose exec postgres psql -U postgres -d fxql_db -c "SELECT * FROM pg_stat_activity WHERE state = 'active';"
```

### Reset Everything
```bash
# Stop and remove containers, networks, volumes
docker-compose down -v

# Remove images
docker-compose down --rmi all -v

# Rebuild from scratch
docker-compose build --no-cache
docker-compose up -d
```

---

## Production Best Practices

### 1. Use Docker Secrets (Docker Swarm)
```yaml
secrets:
  db_password:
    external: true
  api_keys:
    external: true

services:
  app:
    secrets:
      - db_password
      - api_keys
```

### 2. Enable TLS/SSL
- Use a reverse proxy (Nginx, Traefik)
- Terminate SSL at the proxy
- Use Let's Encrypt for certificates

### 3. Monitoring
```bash
# Export Prometheus metrics
curl http://localhost:5000/metrics

# Configure Prometheus to scrape
scrape_configs:
  - job_name: 'fxql-api'
    static_configs:
      - targets: ['fxql-api:5000']
```

### 4. Log Aggregation
- Use ELK Stack, Datadog, or CloudWatch
- Configure Docker logging driver:
```yaml
logging:
  driver: "fluentd"
  options:
    fluentd-address: "localhost:24224"
```

### 5. Health Checks
All services have health checks configured:
- **App:** HTTP GET `/health` every 30s
- **Postgres:** `pg_isready` every 10s
- **Redis:** `redis-cli PING` every 10s

---

## Security Checklist

- ✅ Non-root user in Dockerfile (nestjs:1001)
- ✅ Multi-stage build (no dev dependencies in production)
- ✅ Environment variables (no hardcoded secrets)
- ✅ .dockerignore (excludes sensitive files)
- ✅ Resource limits (prevents DoS)
- ✅ Network isolation (bridge network)
- ✅ Health checks (automatic recovery)
- ✅ Log rotation (10MB max, 3 files)

**Additional Recommendations:**
- Use Docker Bench Security
- Scan images with Trivy or Clair
- Enable Docker Content Trust
- Use private registry for images

---

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Docker Build and Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Docker image
        run: docker-compose build
      
      - name: Run tests
        run: docker-compose run app npm test
      
      - name: Push to registry
        run: |
          docker tag fxql-api:latest registry.example.com/fxql-api:${{ github.sha }}
          docker push registry.example.com/fxql-api:${{ github.sha }}
```

---

## Useful Commands Reference

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Rebuild specific service
docker-compose build app

# View logs
docker-compose logs -f

# Execute command in container
docker-compose exec app sh

# Run migrations
docker-compose exec app npm run migration:run

# Access database
docker-compose exec postgres psql -U postgres -d fxql_db

# Access Redis
docker-compose exec redis redis-cli

# View resource usage
docker stats

# Clean up unused resources
docker system prune -a --volumes
```

---

## Support

For issues or questions:
- Check logs: `docker-compose logs`
- Review this guide
- Check the main README.md
- Review Docker documentation: https://docs.docker.com/
