# 🚀 Robo-Advisory Platform Backend API

> A production-ready RESTful API backend for a multi-asset robo-advisory platform. Features JWT authentication, role-based access control, portfolio management, trade execution, and JSON-based persistence. Built with Node.js and Express.js.

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.2-blue.svg)](https://expressjs.com/)
[![JWT](https://img.shields.io/badge/JWT-Auth-orange.svg)](https://jwt.io/)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

A comprehensive CRUD API for managing users, portfolios, assets, and trades in a robo-advisory investment platform. This API enables investors to track portfolios, execute trades, and manage multi-asset investments with secure authentication and role-based permissions.

## Features

- **User Management**: Registration, authentication, and user CRUD operations with JWT-based authentication
- **Portfolio Management**: Create and manage investment portfolios with holdings tracking
- **Asset Management**: Manage financial assets (stocks, ETFs, bonds, crypto, mutual funds) with price tracking
- **Trade Management**: Create, execute, and manage trades with portfolio rebalancing
- **Authentication & Authorization**: JWT-based auth with role-based access control (investor, analyst, admin)
- **JSON-based Persistence**: All data stored in JSON files (simulating database operations)

## Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration files
│   ├── controllers/      # Request handlers
│   ├── middleware/       # Auth and error handling middleware
│   ├── models/           # Data models and validation
│   ├── routes/           # API route definitions
│   ├── services/         # Business logic layer
│   ├── utils/            # Utility functions (JSON database)
│   ├── app.js            # Express app configuration
│   └── server.js         # Server entry point
├── data/                 # JSON data files (auto-generated)
├── .env.example          # Environment variables template
├── .gitignore
├── package.json
└── README.md
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Update `.env` with your configuration:
```env
PORT=3000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-in-production
CORS_ORIGIN=*
```

## Running the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:3000` (or the port specified in `.env`).

## API Endpoints

### Authentication

**Register User**
- `POST /api/users/register`
- Body: `{ email, password, firstName, lastName, role? }`

**Login**
- `POST /api/users/login`
- Body: `{ email, password }`
- Returns: `{ token, user }`

**Get Profile** (Protected)
- `GET /api/users/profile`
- Headers: `Authorization: Bearer <token>`

### Users (Admin Only)

- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Portfolios (Protected)

- `POST /api/portfolios` - Create portfolio
- `GET /api/portfolios` - Get all portfolios (user's own, or all if admin)
- `GET /api/portfolios/:id` - Get portfolio by ID
- `GET /api/portfolios/:id/holdings` - Get portfolio with holdings
- `PUT /api/portfolios/:id` - Update portfolio
- `DELETE /api/portfolios/:id` - Delete portfolio
- `POST /api/portfolios/:id/recalculate` - Recalculate portfolio value

### Assets

**Public (Read-only):**
- `GET /api/assets` - Get all assets
- `GET /api/assets/:id` - Get asset by ID
- `GET /api/assets/symbol/:symbol` - Get asset by symbol

**Protected (Admin/Analyst):**
- `POST /api/assets` - Create asset
- `PUT /api/assets/:id` - Update asset
- `PUT /api/assets/:id/price` - Update asset price
- `DELETE /api/assets/:id` - Delete asset
- `POST /api/assets/bulk-update-prices` - Bulk update prices (market data ingestion)

### Trades (Protected)

- `POST /api/trades` - Create trade
- `GET /api/trades` - Get all trades (user's own, or all if admin)
- `GET /api/trades/stats` - Get trade statistics
- `GET /api/trades/:id` - Get trade by ID
- `GET /api/trades/portfolio/:portfolioId` - Get trades by portfolio
- `PUT /api/trades/:id` - Update trade
- `POST /api/trades/:id/execute` - Execute trade
- `POST /api/trades/:id/cancel` - Cancel trade
- `DELETE /api/trades/:id` - Delete trade

### Health Check

- `GET /api/health` - API health check

## Data Models

### User
```javascript
{
  id: string,
  email: string,
  firstName: string,
  lastName: string,
  role: 'investor' | 'admin' | 'analyst',
  isActive: boolean,
  createdAt: string,
  updatedAt: string
}
```

### Portfolio
```javascript
{
  id: string,
  userId: string,
  name: string,
  description: string,
  totalValue: number,
  initialInvestment: number,
  currency: string,
  riskProfile: 'conservative' | 'moderate' | 'aggressive',
  isActive: boolean,
  createdAt: string,
  updatedAt: string
}
```

### Asset
```javascript
{
  id: string,
  symbol: string,
  name: string,
  type: 'stock' | 'etf' | 'bond' | 'crypto' | 'mutual_fund',
  currency: string,
  currentPrice: number,
  priceHistory: Array<{ price: number, timestamp: string }>,
  marketCap: number | null,
  sector: string | null,
  isActive: boolean,
  createdAt: string,
  updatedAt: string
}
```

### Trade
```javascript
{
  id: string,
  portfolioId: string,
  assetId: string,
  type: 'buy' | 'sell',
  quantity: number,
  price: number,
  totalAmount: number,
  status: 'pending' | 'executed' | 'failed' | 'cancelled',
  executedAt: string | null,
  notes: string,
  createdAt: string,
  updatedAt: string
}
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### User Roles

- **investor**: Can manage own portfolios and trades
- **analyst**: Can view assets and update prices
- **admin**: Full access to all resources

## Example Usage

### 1. Register and Login

```bash
# Register
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'

# Login
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### 2. Create a Portfolio

```bash
curl -X POST http://localhost:3000/api/portfolios \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{
    "name": "My Retirement Portfolio",
    "description": "Long-term investment portfolio",
    "initialInvestment": 10000,
    "riskProfile": "moderate"
  }'
```

### 3. Create an Asset

```bash
curl -X POST http://localhost:3000/api/assets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{
    "symbol": "AAPL",
    "name": "Apple Inc.",
    "type": "stock",
    "currentPrice": 150.00,
    "sector": "Technology"
  }'
```

### 4. Create a Trade

```bash
curl -X POST http://localhost:3000/api/trades \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{
    "portfolioId": "<portfolio-id>",
    "assetId": "<asset-id>",
    "type": "buy",
    "quantity": 10,
    "price": 150.00
  }'
```

### 5. Execute a Trade

```bash
curl -X POST http://localhost:3000/api/trades/<trade-id>/execute \
  -H "Authorization: Bearer <your-token>"
```

## Data Persistence

All data is stored in JSON files in the `data/` directory:
- `data/users.json` - User data
- `data/portfolios.json` - Portfolio data
- `data/assets.json` - Asset data
- `data/trades.json` - Trade data

The JSON database utility (`src/utils/jsonDb.js`) provides CRUD operations similar to a NoSQL database, with automatic ID generation and timestamp tracking.

## Error Handling

All endpoints return a consistent error format:

```json
{
  "success": false,
  "message": "Error message here"
}
```

## Development Notes

- The JSON database is file-based and not suitable for high-concurrency production environments
- For production, consider migrating to PostgreSQL, MongoDB, or another database
- JWT tokens expire after 24 hours
- Password hashing uses bcrypt with 10 salt rounds

## License

ISC
