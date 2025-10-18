# Foreign Exchange Query Language Parser API

The **Foreign Exchange Query Language (FXQL) Parser API** is a robust and scalable backend service that processes and validates FXQL (Foreign Exchange Query Language) statements, saves valid entries to a database, and provides a rate-limited, API-key-protected endpoint for external use.

## Features

- **Parse FXQL Statements**: Extracts and validates data from FXQL statements such as currency pairs, buy/sell prices, and cap amounts.
- **Error Handling**: Provides detailed custom error messages with unique error codes.
- **Rate Limiting**: Prevents abuse by limiting the number of requests per API key.
- **API Key Authentication**: Ensures only authorized clients can access the API.
- **Database Integration**: Saves valid FXQL entries to a PostgreSQL database.
- **Swagger API Documentation**: Auto-generated documentation for easy reference.

---

## Table of Contents

- [Installation](#installation)
- [Setup](#setup)
- [API Documentation](#api-documentation)
- [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)
- [How It Works](#how-it-works)
- [Testing](#testing)

---

## Installation

### Prerequisites

- **Node.js** (v16+)
- **PostgreSQL** (v14+)
- **Docker** (optional for containerized deployment)

### Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/TobiAdeniji94/fxql-parser-api.git
   cd fxql-parser-api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables by creating a `.env` file:
   ```bash
   touch .env
   ```

4. Populate the `.env` file (see [Environment Variables](#environment-variables)).

5. Run the project:
   ```bash
   npm run start:dev
   ```

---

## Setup

### **Running with Docker** 🐳

The application is fully containerized with **production-ready** Docker support including Redis, PostgreSQL, and the NestJS API.

#### Quick Start (Production)
```bash
# Build and start all services
docker-compose up -d

# Run database migrations
docker-compose exec app npm run migration:run

# View logs
docker-compose logs -f app
```

#### Development Mode (Hot Reload)
```bash
# Start with hot-reload enabled
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

**📖 For comprehensive Docker documentation, see [DOCKER.md](./DOCKER.md)**

**Features:**
- ✅ Multi-stage production Dockerfile (optimized image size)
- ✅ Non-root user (security best practice)
- ✅ Health checks for all services
- ✅ Resource limits (CPU/Memory)
- ✅ Redis integration for rate limiting
- ✅ Volume persistence for data
- ✅ Development mode with hot-reload

### **Deployed Endpoints**

- **Deployed API Base URL:** [`https://fxql-backend-akjc.onrender.com`](https://fxql-backend-akjc.onrender.com)
- **Swagger Docs (Deployed):** [`https://fxql-backend-akjc.onrender.com/api-docs`](https://fxql-backend-akjc.onrender.com/api-docs)
- **API in Local Environment:** http://localhost:5000/v1/fxql-statements
- **Swagger Docs in Local Environment:** http://localhost:5000/api-docs
- **Metrics Endpoint:** http://localhost:5000/metrics
  
---

## API Documentation

### **Endpoint**: `POST /v1/fxql-statements`

#### **Description**:
Processes FXQL statements, validates them, and saves valid entries to the database.

#### **Headers**:
- `x-api-key`: Required. A valid API key. Go to [How It Works](#how-it-works) to find out how to set it up.

#### **Request Body**:
```json
{
  "FXQL": "USD-GBP {\n  BUY 0.85\n  SELL 0.90\n  CAP 10000\n}"
}
```

#### **Responses**:

- **200 OK**:
  ```json
  {
    "message": "Rates Parsed Successfully.",
    "code": "FXQL-200",
    "data": [
      {
        "sourceCurrency": "USD",
        "destinationCurrency": "GBP",
        "buyPrice": 0.85,
        "sellPrice": 0.9,
        "capAmount": 10000,
        "EntryId": "ce8f6d9f-c002-4fa3-b0c3-22777b7a06b6",
        "createdAt": "2024-11-21T02:06:36.435Z"
      },
    ]
  }
  ```

- **400 Bad Request**:
  ```json
  {
    "message": "No valid FXQL statements found.",
    "code": "FXQL-400"
  }
  ```

- **403 Forbidden**:
  ```json
  {
    "message": "Invalid or missing API key",
    "code": "FXQL-403"
  }
  ```

- **500 Internal Server Error**:
  ```json
  {
    "message": "An unexpected error occurred while processing FXQL statements.",
    "code": "FXQL-500"
  }
  ```

---

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
DB_HOST=
DB_PORT=
DB_USERNAME=
DB_PASSWORD=
DB_NAME=
DB_SSL_ENABLED=       # Set to 'true' for production/hosted databases, 'false' for local development

# API Keys (comma-separated)
API_KEYS=

# Redis Configuration (Optional - for distributed rate limiting)
REDIS_ENABLED=false   # Set to 'true' to enable Redis-backed rate limiting
REDIS_URL=redis://localhost:6379

# Logging Configuration
LOG_LEVEL=info        # Options: error, warn, info, debug, trace
NODE_ENV=development  # Set to 'production' for JSON logs, 'development' for pretty logs
```

---

## **Database Schema**

### `fxql_entry` Table

| Column              | Type        | Description                              |
|---------------------|-------------|------------------------------------------|
| `EntryId`                | UUID        | Primary key                              |
| `sourceCurrency`   | CHAR(3)  | Source currency (e.g., USD)              |
| `destinationCurrency` | CHAR(3)  | Destination currency (e.g., GBP)       |
| `buyPrice`         | DECIMAL     | Buy rate                                 |
| `sellPrice`        | DECIMAL     | Sell rate                                |
| `capAmount`        | INTEGER     | Maximum transaction cap                  |
| `createdAt`        | TIMESTAMP   | Record creation timestamp                |

---

## How It Works

1. **API Key Authentication**:
   - The `ApiKeyGuard` checks the `x-api-key` header and validates it against the keys in `process.env.API_KEYS`. Use key1,key2,key3 as the value for API_KEYS in .env to test the Deployed API Base URL. In your local environment, you can use any value for API_KEYS.

2. **Parsing FXQL Statements**:
   - The `FxqlService` uses a regex to parse FXQL statements and validate them against specific rules (e.g., valid currencies, numeric buy/sell prices).

3. **Database Integration**:
   - Valid FXQL statements are saved to a PostgreSQL database using TypeORM.

4. **Error Handling**:
   - Custom exceptions ensure that all errors have structured responses with codes like `FXQL-400` or `FXQL-500`.

5. **Rate Limiting**:
   - The `ThrottlerModule` limits requests to 10 per minute per API key.

---

## Database Migrations

This project uses TypeORM migrations for production-safe schema management. Auto-sync is disabled in favor of versioned migrations.

### **Running Migrations**:
```bash
# Run pending migrations
npm run migration:run

# Revert last migration
npm run migration:revert

# Generate a new migration based on entity changes
npm run migration:generate -- src/database/migrations/MigrationName

# Create a blank migration file
npm run migration:create -- src/database/migrations/MigrationName
```

**Note:** Migrations are automatically run on application startup via `migrationsRun: true`.

---

## Validation Configuration

Business rules, currency codes, and rate limits are externalized in `config/validation-rules.yaml`. This allows hot-reloadable updates without code changes.

**Configuration file location:** `config/validation-rules.yaml`

**Versioning:** The config file includes a version field for tracking changes.

---

## API Versioning

All API endpoints are prefixed with `/v1` to support future versioning:
- Current version: **v1.0**
- Base path: `/v1`
- Example: `POST /v1/fxql-statements`

---

## Idempotency Support

The API supports idempotency keys to prevent duplicate processing of requests:

**Usage:**
```bash
curl -X POST https://api.example.com/v1/fxql-statements \
  -H "x-api-key: your-api-key" \
  -H "Idempotency-Key: unique-request-id-12345" \
  -H "Content-Type: application/json" \
  -d '{"FXQL": "USD-EUR { BUY 1.2 SELL 1.3 CAP 5000 }"}'
```

**Features:**
- Keys are valid for 24 hours
- Duplicate requests return the original cached response
- Response includes `X-Idempotency-Replayed: true` header for replayed responses
- Automatically cleaned up after expiration

---

## Table Partitioning

The `fxql_entries` table uses PostgreSQL range partitioning by `createdAt` for scalability:

**Partition Strategy:**
- Monthly partitions (e.g., `fxql_entries_y2025_m10`)
- Automatic partition creation on startup
- Manual partition creation: `npm run partition:create`

**Benefits:**
- Improved query performance for time-range queries
- Efficient data archival and purging
- Better index management

**Indexes:**
- `(sourceCurrency, destinationCurrency, createdAt)` - Currency pair lookups
- `(sourceCurrency)` - Source currency queries
- `(destinationCurrency)` - Destination currency queries

---

## Rate Limiting

**Default Limits (In-Memory):**
- 10 requests per minute per API key
- 3 requests per second burst limit

**Redis-Backed Rate Limiting (Optional):**

Enable distributed rate limiting with Redis:

```env
REDIS_ENABLED=true
REDIS_URL=redis://localhost:6379
```

**Benefits:**
- Consistent rate limiting across multiple instances
- Per-API-key tracking
- Configurable via `config/validation-rules.yaml`

---

## Error Code Taxonomy

The API uses granular error codes for better client handling:

**Success:**
- `FXQL-200` - Success

**Validation Errors:**
- `FXQL_E_INVALID_FORMAT` - Malformed FXQL syntax
- `FXQL_E_BAD_ISO` - Invalid currency code
- `FXQL_E_PRICE_OUT_OF_RANGE` - Price exceeds allowed range
- `FXQL_E_CAP_OUT_OF_RANGE` - Cap amount invalid
- `FXQL_E_EMPTY_STATEMENT` - No statements provided
- `FXQL_E_EXCEEDS_MAX_PAIRS` - Too many currency pairs
- `FXQL_E_MALFORMED_SYNTAX` - Syntax error

**Authentication Errors:**
- `FXQL_E_MISSING_API_KEY` - API key not provided
- `FXQL_E_INVALID_API_KEY` - API key invalid
- `FXQL_E_API_KEY_NOT_CONFIGURED` - Server configuration error

**Server Errors:**
- `FXQL_E_PARSING_FAILED` - Parsing error
- `FXQL_E_STORAGE_FAILED` - Database error
- `FXQL-500` - Internal server error

**Example Error Response:**
```json
{
  "message": "Invalid currency code",
  "code": "FXQL_E_BAD_ISO",
  "details": [
    {
      "field": "sourceCurrency",
      "value": "XXX",
      "message": "Currency code not in ISO 4217 list"
    }
  ],
  "timestamp": "2025-10-18T14:30:00.000Z"
}
```

---

## Structured Logging

The API uses **Pino** for high-performance structured JSON logging with request tracking:

**Features:**
- Automatic request ID generation (`X-Request-Id` header)
- Masked API keys in logs (shows first/last 4 chars)
- Structured JSON output in production
- Pretty-printed colorized logs in development
- Contextual logging (method, URL, status, duration)

**Log Levels:**
- `error` - HTTP 500+ errors
- `warn` - HTTP 400-499 errors
- `info` - HTTP 200-399 responses

**Environment Variable:**
```env
LOG_LEVEL=info  # Options: error, warn, info, debug, trace
```

**Sample Log Output (Production):**
```json
{
  "level": 30,
  "time": 1697654400000,
  "pid": 12345,
  "hostname": "api-server",
  "req": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "method": "POST",
    "url": "/v1/fxql-statements",
    "apiKey": "fxql...3a7f",
    "userAgent": "Mozilla/5.0...",
    "remoteAddress": "192.168.1.1"
  },
  "res": {
    "statusCode": 200,
    "requestId": "550e8400-e29b-41d4-a716-446655440000"
  },
  "responseTime": 45,
  "msg": "request completed"
}
```

---

## Prometheus Metrics

The API exposes Prometheus-compatible metrics at `/metrics` for monitoring:

**Available Metrics:**

| Metric | Type | Description |
|--------|------|-------------|
| `fxql_requests_total` | Counter | Total requests by method, endpoint, status |
| `fxql_requests_success_total` | Counter | Successful requests by API key |
| `fxql_requests_failure_total` | Counter | Failed requests by API key and error code |
| `fxql_entries_parsed_total` | Counter | Parsed entries by currency pair |
| `fxql_rate_limit_exceeded_total` | Counter | Rate limit violations by API key |
| `fxql_idempotency_hits_total` | Counter | Idempotency cache hits |
| `fxql_request_duration_seconds` | Histogram | Request latency distribution |
| `fxql_database_query_duration_seconds` | Histogram | Database query duration |
| `fxql_active_connections` | Gauge | Current active connections |

**Accessing Metrics:**
```bash
curl http://localhost:5000/metrics
```

**Example Output:**
```
# HELP fxql_requests_total Total number of FXQL requests
# TYPE fxql_requests_total counter
fxql_requests_total{method="POST",endpoint="/v1/fxql-statements",status_code="200",api_key="fxql...3a7f"} 1523

# HELP fxql_request_duration_seconds Duration of FXQL requests in seconds
# TYPE fxql_request_duration_seconds histogram
fxql_request_duration_seconds_bucket{method="POST",endpoint="/v1/fxql-statements",status_code="200",le="0.005"} 45
fxql_request_duration_seconds_bucket{method="POST",endpoint="/v1/fxql-statements",status_code="200",le="0.01"} 120
...
```

**Integration:**
Configure your Prometheus server to scrape:
```yaml
scrape_configs:
  - job_name: 'fxql-api'
    static_configs:
      - targets: ['api.example.com:5000']
    metrics_path: '/metrics'
    scrape_interval: 15s
```

---

## API Key Management

The API supports advanced API key management with scopes, rotation, and expiration:

**Features:**
- SHA-256 hashed key storage (secure)
- Scoped permissions (`read`, `write`, `admin`)
- Key expiration and rotation
- Usage tracking (last used timestamp)
- Key revocation

**Key Scopes:**
- `read` - Read-only operations
- `write` - Create/update operations
- `admin` - Full access including key management

**Database Schema (`api_keys` table):**
- `id` - Unique key identifier
- `keyHash` - SHA-256 hash of the key
- `name` - Friendly name
- `scopes` - Array of permissions
- `status` - `active`, `revoked`, `expired`
- `expiresAt` - Optional expiration date
- `lastUsedAt` - Last usage timestamp
- `lastRotatedAt` - Last rotation timestamp

**API Key Format:**
```
fxql_<64_hex_characters>
```

Example: `fxql_a1b2c3d4e5f6...`

**Migration Note:**
Run `npm run migration:run` to create the `api_keys` table. Existing environment variable keys (`.env` `API_KEYS`) continue to work for backward compatibility.

---

## Audit Logging

All API requests and security events are logged to the `audit_logs` table for compliance:

**Tracked Events:**
- `api_request` - All API requests
- `api_key_created` - New API key generation
- `api_key_rotated` - Key rotation
- `api_key_revoked` - Key revocation
- `rate_limit_exceeded` - Rate limit violations
- `authentication_failed` - Auth failures
- `validation_error` - Validation errors

**Audit Log Fields:**
- `id` - Unique log ID
- `action` - Event type
- `apiKeyId` - Associated API key
- `requestId` - Request trace ID
- `method`, `endpoint`, `statusCode` - Request details
- `errorCode` - Error identifier
- `requestPayloadHash` - SHA-256 hash of request body
- `metadata` - Additional context (JSON)
- `ipAddress`, `userAgent` - Client info
- `createdAt` - Timestamp

**Benefits:**
- Compliance audit trail
- Security incident investigation
- Usage analytics
- Debugging support

**Query Examples:**
```sql
-- Get all failed authentication attempts
SELECT * FROM audit_logs 
WHERE action = 'authentication_failed' 
ORDER BY "createdAt" DESC LIMIT 100;

-- Get activity for specific API key
SELECT * FROM audit_logs 
WHERE "apiKeyId" = 'uuid-here' 
ORDER BY "createdAt" DESC;
```

---

## Testing

**Unit Tests**:
   ```bash
   npm run test
   ```
---

## License

This project is licensed under the [MIT License](LICENSE).

---
