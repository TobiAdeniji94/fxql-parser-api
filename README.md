### FXQL Parser Documentation

---

## **Project Overview**

The FXQL Parser is a backend application developed in NestJS and TypeScript that parses and validates Foreign Exchange Query Language (FXQL) statements. These statements are submitted by Bureau De Change (BDC) operations to standardize and manage exchange rate information in a centralized system.

---

### Access the API

- API Base URL: `https://fxql-backend-akjc.onrender.com/`

---

### Swagger Documentation

- API Base URL: `https://fxql-backend-akjc.onrender.com/api-docs`

---

## **Technical Specifications**

- **Framework:** NestJS
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** TypeORM

---

## **Core Features**

1. **API Endpoint to Accept FXQL Statements**:
   - Parse and validate FXQL syntax.
   - Respond with success or error messages.
   - Save valid FXQL data in the database.

2. **Validation Rules**:
   - FXQL statements must follow a strict syntax.
   - Each statement must include valid currency pairs, buy/sell rates, and cap amounts.

3. **Database Storage**:
   - Parsed and validated FXQL data is stored in PostgreSQL for future reference.

---

## **Installation Instructions**

### Prerequisites

- Node.js v16+ installed.
- PostgreSQL server running.

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
DB_HOST=
DB_PORT=
DB_USERNAME=
DB_PASSWORD=
DB_NAME=
API_KEYS=
```

### Install Dependencies

```bash
npm install
```

## **API Endpoints**

### **POST** `/fxql-statements`

Accepts FXQL statements for parsing and validation.

#### Request Body

```json
{
  "FXQL": "USD-GBP {\n  BUY 100\n  SELL 200\n  CAP 93800\n}"
}
```

#### Success Response (200 OK)

```json
{
  "message": "FXQL Statement Parsed Successfully.",
  "code": "FXQL-200",
  "data": [
    {
      "EntryId": "a12bc345-d67e-8f90-gh12-34567ijkl890",
      "SourceCurrency": "USD",
      "DestinationCurrency": "GBP",
      "SellPrice": 200,
      "BuyPrice": 100,
      "CapAmount": 93800
    }
  ]
}
```

#### Error Response (4XX/5XX)

```json
{
  "message": "Invalid FXQL statement: 'usd' should be 'USD'",
  "code": "FXQL-400"
}
```

---

## **Validation Rules**

1. **Currency Pair**:
   - Must be exactly 3 uppercase characters (e.g., USD, GBP).
   - Invalid: `usd`, `US`, `USDT`.

2. **Buy/Sell Amount**:
   - Numeric value.
   - Positive float for `BUY` and `SELL`.
   - Invalid: Negative values, non-numeric strings.

3. **Cap Amount**:
   - Positive integer or zero.
   - Indicates the maximum transaction amount.

4. **Structure**:
   - Statements must have valid formatting.
   - Multiple statements separated by a single newline.

---

## **Database Schema**

### `fxql_entry` Table

| Column              | Type        | Description                              |
|---------------------|-------------|------------------------------------------|
| `EntryId`                | UUID        | Primary key                              |
| `sourceCurrency`   | VARCHAR(3)  | Source currency (e.g., USD)              |
| `destinationCurrency` | VARCHAR(3)  | Destination currency (e.g., GBP)       |
| `buyPrice`         | DECIMAL     | Buy rate                                 |
| `sellPrice`        | DECIMAL     | Sell rate                                |
| `capAmount`        | INTEGER     | Maximum transaction cap                  |
| `createdAt`        | TIMESTAMP   | Record creation timestamp                |

---

## **How to Run**

### Start the Server

```bash
npm run start:dev
```

### Access the API in Local Environment

- API Base URL: `http://localhost:${PORT}/api-docs`

---

## **Testing**

Run the test suite:

```bash
npm test
```


Here's a comprehensive **README.md** for your project:

---

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
- [Project Structure](#project-structure)
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
| `sourceCurrency`   | VARCHAR(3)  | Source currency (e.g., USD)              |
| `destinationCurrency` | VARCHAR(3)  | Destination currency (e.g., GBP)       |
| `buyPrice`         | DECIMAL     | Buy rate                                 |
| `sellPrice`        | DECIMAL     | Sell rate                                |
| `capAmount`        | INTEGER     | Maximum transaction cap                  |
| `createdAt`        | TIMESTAMP   | Record creation timestamp                |

---

## Project Structure

```plaintext
fxql-parser/
├── src/
│   ├── common/
│   │   ├── guards/
│   │   │   └── api-key.guard.ts  # Protects routes with API key validation
│   │   └── exceptions/
│   │       └── custom.exceptions.ts # Custom exceptions for structured error handling
│   ├── database/
│   │   └── database.module.ts   # Database connection module
│   ├── fxql/
│   │   ├── dto/
│   │   │   └── create-fxql.dto.ts # DTO for FXQL parsing
│   │   ├── entities/
│   │   │   └── fxql-entry.entity.ts # Entity for FXQL entries
│   │   ├── fxql.controller.ts  # Handles API requests
│   │   ├── fxql.service.ts     # Business logic for FXQL processing
│   │   └── fxql.module.ts      # FXQL feature module
│   └── app.module.ts           # Main application module
├── .env                         # Environment variables
├── Dockerfile                   # Docker build configuration
├── docker-compose.yml           # Docker Compose configuration
├── package.json                 # Dependencies and scripts
└── README.md                    # Project documentation
```

---

## How It Works

1. **API Key Authentication**:
   - The `ApiKeyGuard` checks the `x-api-key` header and validates it against the keys in `process.env.API_KEYS`.

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
