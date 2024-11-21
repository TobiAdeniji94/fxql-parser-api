# FXQL Parser API

The **FXQL Parser API** is a robust and scalable backend service that processes and validates FXQL (Foreign Exchange Query Language) statements, saves valid entries to a database, and provides a rate-limited, API-key-protected endpoint for external use.

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
   cd fxql-parser
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

### **Running with Docker**

1. Build and start the application:
   ```bash
   docker-compose up --build
   ```

2. Access the application:
   - API: [http://localhost:${PORT}/fxql-statements](http://localhost:5000/fxql-statements)
   - Swagger Docs: [http://localhost:${PORT}/api-docs](http://localhost:5000/docs)
   - Deployed API Base URL: `https://fxql-backend-akjc.onrender.com/`
---

## API Documentation

### **Endpoint**: `POST /fxql-statements`

#### **Description**:
Processes FXQL statements, validates them, and saves valid entries to the database.

#### **Headers**:
- `x-api-key`: Required. A valid API key.

#### **Request Body**:
```json
{
  "FXQL": "USD-GBP {\n  BUY 0.85\n  SELL 0.90\n  CAP 10000\n}\n\nEUR-JPY {\n  BUY 145.20\n  SELL 146.50\n  CAP 50000\n}\n\nNGN-USD {\n  BUY 0.0022\n  SELL 0.0023\n  CAP 2000000\n}"
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
        "capAmount": 10000
      },
      {
        "sourceCurrency": "EUR",
        "destinationCurrency": "JPY",
        "buyPrice": 145.2,
        "sellPrice": 146.5,
        "capAmount": 50000
      },
      {
        "sourceCurrency": "NGN",
        "destinationCurrency": "USD",
        "buyPrice": 0.0022,
        "sellPrice": 0.0023,
        "capAmount": 2000000
      }
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
DB_HOST=
DB_PORT=
DB_USERNAME=
DB_PASSWORD=
DB_NAME=
API_KEYS=
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
   - The `ApiKeyGuard` checks the `x-api-key` header and validates it against the keys in `process.env.API_KEYS`. Use key1,key2,key3 as the value for API_KEYS in .env to test the Deployed API Base URL. You can make it what you want in your local environment.

2. **Parsing FXQL Statements**:
   - The `FxqlService` uses a regex to parse FXQL statements and validate them against specific rules (e.g., valid currencies, numeric buy/sell prices).

3. **Database Integration**:
   - Valid FXQL statements are saved to a PostgreSQL database using TypeORM.

4. **Error Handling**:
   - Custom exceptions ensure that all errors have structured responses with codes like `FXQL-400` or `FXQL-500`.

5. **Rate Limiting**:
   - The `ThrottlerModule` limits requests to 10 per minute per API key.

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
