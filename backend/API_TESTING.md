# API Testing Guide with cURL Commands

This document contains cURL commands to test all API endpoints. Execute them in order as later commands depend on earlier ones.

**Base URL:** `http://localhost:3000`

**Note:** After each request, save the response data (tokens, IDs) for use in subsequent requests.

---

## 1. Authentication Endpoints

### Register User (Investor)
```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "investor@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "role": "investor"
  }'
```

**Save the response** - You'll get a user object. Save the `id` as `USER_ID`.

### Register Admin User
```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123",
    "firstName": "Admin",
    "lastName": "User",
    "role": "admin"
  }'
```

### Register Analyst User
```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "analyst@example.com",
    "password": "analyst123",
    "firstName": "Jane",
    "lastName": "Analyst",
    "role": "analyst"
  }'
```

### Login as Investor
```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "investor@example.com",
    "password": "password123"
  }'
```

**Save the token** from the response as `INVESTOR_TOKEN`.

### Login as Admin
```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

**Save the token** from the response as `ADMIN_TOKEN`.

### Login as Analyst
```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "analyst@example.com",
    "password": "analyst123"
  }'
```

**Save the token** from the response as `ANALYST_TOKEN`.

### Get User Profile (Protected)
```bash
curl -X GET http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer $INVESTOR_TOKEN"
```

---

## 2. User Management Endpoints (Admin Only)

### Get All Users
```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Get User by ID
```bash
curl -X GET http://localhost:3000/api/users/$USER_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Update User
```bash
curl -X PUT http://localhost:3000/api/users/$USER_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John Updated",
    "lastName": "Doe Updated"
  }'
```

### Delete User
```bash
curl -X DELETE http://localhost:3000/api/users/$USER_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## 3. Asset Management Endpoints

### Create Asset (Admin/Analyst)
```bash
curl -X POST http://localhost:3000/api/assets \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "AAPL",
    "name": "Apple Inc.",
    "type": "stock",
    "currentPrice": 175.50,
    "currency": "USD",
    "sector": "Technology",
    "marketCap": 2800000000000
  }'
```

**Save the asset ID** as `ASSET_ID_1`.

### Create More Assets
```bash
# Create MSFT
curl -X POST http://localhost:3000/api/assets \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "MSFT",
    "name": "Microsoft Corporation",
    "type": "stock",
    "currentPrice": 380.25,
    "currency": "USD",
    "sector": "Technology",
    "marketCap": 2850000000000
  }'

# Create SPY ETF
curl -X POST http://localhost:3000/api/assets \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "SPY",
    "name": "SPDR S&P 500 ETF Trust",
    "type": "etf",
    "currentPrice": 450.75,
    "currency": "USD",
    "sector": "Diversified"
  }'

# Create Bitcoin
curl -X POST http://localhost:3000/api/assets \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "BTC",
    "name": "Bitcoin",
    "type": "crypto",
    "currentPrice": 42000.00,
    "currency": "USD"
  }'
```

### Get All Assets (Public)
```bash
curl -X GET http://localhost:3000/api/assets
```

### Get Assets by Type
```bash
curl -X GET "http://localhost:3000/api/assets?type=stock"
```

### Get Asset by ID
```bash
curl -X GET http://localhost:3000/api/assets/$ASSET_ID_1
```

### Get Asset by Symbol (Public)
```bash
curl -X GET http://localhost:3000/api/assets/symbol/AAPL
```

### Update Asset
```bash
curl -X PUT http://localhost:3000/api/assets/$ASSET_ID_1 \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Apple Inc. (Updated)",
    "sector": "Technology & Services"
  }'
```

### Update Asset Price (Admin/Analyst)
```bash
curl -X PUT http://localhost:3000/api/assets/$ASSET_ID_1/price \
  -H "Authorization: Bearer $ANALYST_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "price": 180.00,
    "addToHistory": true
  }'
```

### Bulk Update Prices (Market Data Ingestion Simulation)
```bash
curl -X POST http://localhost:3000/api/assets/bulk-update-prices \
  -H "Authorization: Bearer $ANALYST_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "priceUpdates": [
      {
        "assetId": "$ASSET_ID_1",
        "price": 181.25
      },
      {
        "assetId": "$ASSET_ID_2",
        "price": 382.50
      }
    ]
  }'
```

### Delete Asset (Admin Only)
```bash
curl -X DELETE http://localhost:3000/api/assets/$ASSET_ID_1 \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## 4. Portfolio Management Endpoints (Protected)

### Create Portfolio
```bash
curl -X POST http://localhost:3000/api/portfolios \
  -H "Authorization: Bearer $INVESTOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Retirement Portfolio",
    "description": "Long-term investment portfolio for retirement",
    "initialInvestment": 10000,
    "totalValue": 10000,
    "currency": "USD",
    "riskProfile": "moderate"
  }'
```

**Save the portfolio ID** as `PORTFOLIO_ID_1`.

### Create Another Portfolio
```bash
curl -X POST http://localhost:3000/api/portfolios \
  -H "Authorization: Bearer $INVESTOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Growth Portfolio",
    "description": "Aggressive growth portfolio",
    "initialInvestment": 5000,
    "totalValue": 5000,
    "currency": "USD",
    "riskProfile": "aggressive"
  }'
```

### Get All Portfolios (User's own, or all if admin)
```bash
curl -X GET http://localhost:3000/api/portfolios \
  -H "Authorization: Bearer $INVESTOR_TOKEN"
```

### Get Portfolio by ID
```bash
curl -X GET http://localhost:3000/api/portfolios/$PORTFOLIO_ID_1 \
  -H "Authorization: Bearer $INVESTOR_TOKEN"
```

### Get Portfolio with Holdings
```bash
curl -X GET http://localhost:3000/api/portfolios/$PORTFOLIO_ID_1/holdings \
  -H "Authorization: Bearer $INVESTOR_TOKEN"
```

### Update Portfolio
```bash
curl -X PUT http://localhost:3000/api/portfolios/$PORTFOLIO_ID_1 \
  -H "Authorization: Bearer $INVESTOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Updated Retirement Portfolio",
    "description": "Updated description",
    "riskProfile": "conservative"
  }'
```

### Recalculate Portfolio Value
```bash
curl -X POST http://localhost:3000/api/portfolios/$PORTFOLIO_ID_1/recalculate \
  -H "Authorization: Bearer $INVESTOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "assetPrices": {
      "$ASSET_ID_1": 180.00,
      "$ASSET_ID_2": 385.00
    }
  }'
```

### Delete Portfolio
```bash
curl -X DELETE http://localhost:3000/api/portfolios/$PORTFOLIO_ID_1 \
  -H "Authorization: Bearer $INVESTOR_TOKEN"
```

---

## 5. Trade Management Endpoints (Protected)

### Create Buy Trade
```bash
curl -X POST http://localhost:3000/api/trades \
  -H "Authorization: Bearer $INVESTOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "portfolioId": "$PORTFOLIO_ID_1",
    "assetId": "$ASSET_ID_1",
    "type": "buy",
    "quantity": 10,
    "price": 175.50,
    "notes": "Initial purchase of Apple stock"
  }'
```

**Save the trade ID** as `TRADE_ID_1`.

### Create Sell Trade
```bash
curl -X POST http://localhost:3000/api/trades \
  -H "Authorization: Bearer $INVESTOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "portfolioId": "$PORTFOLIO_ID_1",
    "assetId": "$ASSET_ID_2",
    "type": "sell",
    "quantity": 5,
    "price": 380.25,
    "notes": "Selling Microsoft shares"
  }'
```

### Create Trade Without Price (Uses Asset Current Price)
```bash
curl -X POST http://localhost:3000/api/trades \
  -H "Authorization: Bearer $INVESTOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "portfolioId": "$PORTFOLIO_ID_1",
    "assetId": "$ASSET_ID_1",
    "type": "buy",
    "quantity": 5
  }'
```

### Get All Trades
```bash
curl -X GET http://localhost:3000/api/trades \
  -H "Authorization: Bearer $INVESTOR_TOKEN"
```

### Get Trade by ID
```bash
curl -X GET http://localhost:3000/api/trades/$TRADE_ID_1 \
  -H "Authorization: Bearer $INVESTOR_TOKEN"
```

### Get Trades by Portfolio
```bash
curl -X GET http://localhost:3000/api/trades/portfolio/$PORTFOLIO_ID_1 \
  -H "Authorization: Bearer $INVESTOR_TOKEN"
```

### Get Trade Statistics
```bash
curl -X GET http://localhost:3000/api/trades/stats \
  -H "Authorization: Bearer $INVESTOR_TOKEN"
```

### Update Trade (Before Execution)
```bash
curl -X PUT http://localhost:3000/api/trades/$TRADE_ID_1 \
  -H "Authorization: Bearer $INVESTOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 15,
    "notes": "Updated quantity"
  }'
```

### Execute Trade
```bash
curl -X POST http://localhost:3000/api/trades/$TRADE_ID_1/execute \
  -H "Authorization: Bearer $INVESTOR_TOKEN"
```

### Cancel Trade
```bash
curl -X POST http://localhost:3000/api/trades/$TRADE_ID_1/cancel \
  -H "Authorization: Bearer $INVESTOR_TOKEN"
```

### Delete Trade (Only if not executed)
```bash
curl -X DELETE http://localhost:3000/api/trades/$TRADE_ID_1 \
  -H "Authorization: Bearer $INVESTOR_TOKEN"
```

---

## 6. Health Check

### Health Check
```bash
curl -X GET http://localhost:3000/api/health
```

### Root Endpoint
```bash
curl -X GET http://localhost:3000/
```

---

## Complete Testing Flow Example

Here's a complete workflow to test the entire API:

```bash
# 1. Register and login
INVESTOR_TOKEN=$(curl -s -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"investor@example.com","password":"password123"}' \
  | jq -r '.data.token')

ADMIN_TOKEN=$(curl -s -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}' \
  | jq -r '.data.token')

# 2. Create assets
ASSET_ID_1=$(curl -s -X POST http://localhost:3000/api/assets \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"symbol":"AAPL","name":"Apple Inc.","type":"stock","currentPrice":175.50,"currency":"USD","sector":"Technology"}' \
  | jq -r '.data.id')

# 3. Create portfolio
PORTFOLIO_ID_1=$(curl -s -X POST http://localhost:3000/api/portfolios \
  -H "Authorization: Bearer $INVESTOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"My Portfolio","initialInvestment":10000,"totalValue":10000,"currency":"USD","riskProfile":"moderate"}' \
  | jq -r '.data.id')

# 4. Create trade
TRADE_ID_1=$(curl -s -X POST http://localhost:3000/api/trades \
  -H "Authorization: Bearer $INVESTOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"portfolioId\":\"$PORTFOLIO_ID_1\",\"assetId\":\"$ASSET_ID_1\",\"type\":\"buy\",\"quantity\":10,\"price\":175.50}" \
  | jq -r '.data.id')

# 5. Execute trade
curl -X POST http://localhost:3000/api/trades/$TRADE_ID_1/execute \
  -H "Authorization: Bearer $INVESTOR_TOKEN"

# 6. Check portfolio holdings
curl -X GET http://localhost:3000/api/portfolios/$PORTFOLIO_ID_1/holdings \
  -H "Authorization: Bearer $INVESTOR_TOKEN"
```

---

## Testing Error Cases

### Test Invalid Login
```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "investor@example.com",
    "password": "wrongpassword"
  }'
```

### Test Unauthorized Access
```bash
curl -X GET http://localhost:3000/api/portfolios \
  # Without Authorization header
```

### Test Invalid Token
```bash
curl -X GET http://localhost:3000/api/portfolios \
  -H "Authorization: Bearer invalid_token_here"
```

### Test Insufficient Permissions
```bash
# Try to create asset as investor (should fail)
curl -X POST http://localhost:3000/api/assets \
  -H "Authorization: Bearer $INVESTOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "TEST",
    "name": "Test Asset",
    "type": "stock",
    "currentPrice": 100
  }'
```

### Test Missing Required Fields
```bash
curl -X POST http://localhost:3000/api/portfolios \
  -H "Authorization: Bearer $INVESTOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Incomplete Portfolio"
  }'
```

---

## Notes

1. Replace variables like `$INVESTOR_TOKEN`, `$ASSET_ID_1`, etc. with actual values from previous responses
2. Use `jq` to parse JSON responses if available: `curl ... | jq`
3. All protected endpoints require a valid JWT token in the Authorization header
4. Portfolios are user-scoped (investors can only see their own portfolios)
5. Trades are scoped to portfolios (users can only access trades for their own portfolios)
6. Assets are public for reading, but only admin/analyst can modify
7. Users can only be managed by admins
