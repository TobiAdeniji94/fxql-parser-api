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
      "EntryId": "a12bc345-d67e-8f90-gh12-34567ijkl890",,
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
