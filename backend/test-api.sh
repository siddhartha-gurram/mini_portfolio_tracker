#!/bin/bash

# API Testing Script for Robo-Advisory Platform
# Usage: ./test-api.sh [base_url]
# Example: ./test-api.sh http://localhost:3000

BASE_URL="${1:-http://localhost:3000}"
API_URL="${BASE_URL}/api"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting API Testing...${NC}\n"

# Function to make API call and show result
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local headers=$4
    local description=$5
    
    echo -e "${YELLOW}Testing: ${description}${NC}"
    echo -e "  ${method} ${endpoint}"
    
    if [ -n "$data" ]; then
        if [ -n "$headers" ]; then
            response=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X "$method" "$endpoint" \
                -H "Content-Type: application/json" \
                -H "$headers" \
                -d "$data")
        else
            response=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X "$method" "$endpoint" \
                -H "Content-Type: application/json" \
                -d "$data")
        fi
    else
        if [ -n "$headers" ]; then
            response=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X "$method" "$endpoint" \
                -H "$headers")
        else
            response=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X "$method" "$endpoint")
        fi
    fi
    
    http_code=$(echo "$response" | grep -o "HTTP_CODE:[0-9]*" | cut -d: -f2)
    body=$(echo "$response" | sed -E 's/HTTP_CODE:[0-9]*$//')
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "  ${GREEN}✓ Success (HTTP $http_code)${NC}"
        echo "  Response: $body" | head -c 200
        echo ""
    else
        echo -e "  ${RED}✗ Failed (HTTP $http_code)${NC}"
        echo "  Response: $body"
    fi
    echo ""
    
    # Extract token or ID if needed
    if echo "$body" | grep -q "token"; then
        echo "$body" | grep -o '"token":"[^"]*"' | cut -d'"' -f4
    elif echo "$body" | grep -q '"id":'; then
        echo "$body" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4
    fi
}

# 1. User Registration and Login
echo -e "${GREEN}=== 1. Authentication Tests ===${NC}\n"

echo "Registering investor user..."
INVESTOR_REGISTER=$(test_endpoint "POST" "${API_URL}/users/register" \
    '{"email":"investor@test.com","password":"password123","firstName":"John","lastName":"Doe","role":"investor"}' \
    "" \
    "Register Investor")

echo "Registering admin user..."
ADMIN_REGISTER=$(test_endpoint "POST" "${API_URL}/users/register" \
    '{"email":"admin@test.com","password":"admin123","firstName":"Admin","lastName":"User","role":"admin"}' \
    "" \
    "Register Admin")

echo "Logging in as investor..."
INVESTOR_TOKEN=$(test_endpoint "POST" "${API_URL}/users/login" \
    '{"email":"investor@test.com","password":"password123"}' \
    "" \
    "Login Investor")

echo "Logging in as admin..."
ADMIN_TOKEN=$(test_endpoint "POST" "${API_URL}/users/login" \
    '{"email":"admin@test.com","password":"admin123"}' \
    "" \
    "Login Admin")

# Extract tokens
INVESTOR_TOKEN=$(echo "$INVESTOR_TOKEN" | grep -o "Bearer [^ ]*" | head -1 | cut -d' ' -f2 || echo "")
ADMIN_TOKEN=$(echo "$ADMIN_TOKEN" | grep -o "Bearer [^ ]*" | head -1 | cut -d' ' -f2 || echo "")

if [ -z "$INVESTOR_TOKEN" ]; then
    INVESTOR_TOKEN=$(curl -s -X POST "${API_URL}/users/login" \
        -H "Content-Type: application/json" \
        -d '{"email":"investor@test.com","password":"password123"}' | \
        grep -o '"token":"[^"]*"' | cut -d'"' -f4)
fi

if [ -z "$ADMIN_TOKEN" ]; then
    ADMIN_TOKEN=$(curl -s -X POST "${API_URL}/users/login" \
        -H "Content-Type: application/json" \
        -d '{"email":"admin@test.com","password":"admin123"}' | \
        grep -o '"token":"[^"]*"' | cut -d'"' -f4)
fi

echo -e "${GREEN}Investor Token: ${INVESTOR_TOKEN:0:20}...${NC}"
echo -e "${GREEN}Admin Token: ${ADMIN_TOKEN:0:20}...${NC}\n"

# 2. User Management
echo -e "${GREEN}=== 2. User Management Tests ===${NC}\n"

test_endpoint "GET" "${API_URL}/users/profile" \
    "" \
    "Authorization: Bearer $INVESTOR_TOKEN" \
    "Get User Profile"

USER_ID=$(curl -s -X GET "${API_URL}/users/profile" \
    -H "Authorization: Bearer $INVESTOR_TOKEN" | \
    grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

test_endpoint "GET" "${API_URL}/users" \
    "" \
    "Authorization: Bearer $ADMIN_TOKEN" \
    "Get All Users (Admin)"

# 3. Asset Management
echo -e "${GREEN}=== 3. Asset Management Tests ===${NC}\n"

test_endpoint "POST" "${API_URL}/assets" \
    '{"symbol":"AAPL","name":"Apple Inc.","type":"stock","currentPrice":175.50,"currency":"USD","sector":"Technology"}' \
    "Authorization: Bearer $ADMIN_TOKEN" \
    "Create Asset (AAPL)"

ASSET_ID_1=$(curl -s -X POST "${API_URL}/assets" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"symbol":"AAPL","name":"Apple Inc.","type":"stock","currentPrice":175.50,"currency":"USD","sector":"Technology"}' | \
    grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

test_endpoint "POST" "${API_URL}/assets" \
    '{"symbol":"MSFT","name":"Microsoft Corporation","type":"stock","currentPrice":380.25,"currency":"USD","sector":"Technology"}' \
    "Authorization: Bearer $ADMIN_TOKEN" \
    "Create Asset (MSFT)"

ASSET_ID_2=$(curl -s -X POST "${API_URL}/assets" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"symbol":"MSFT","name":"Microsoft Corporation","type":"stock","currentPrice":380.25,"currency":"USD","sector":"Technology"}' | \
    grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

test_endpoint "GET" "${API_URL}/assets" \
    "" \
    "" \
    "Get All Assets (Public)"

test_endpoint "GET" "${API_URL}/assets/${ASSET_ID_1}" \
    "" \
    "" \
    "Get Asset by ID"

test_endpoint "GET" "${API_URL}/assets/symbol/AAPL" \
    "" \
    "" \
    "Get Asset by Symbol"

test_endpoint "PUT" "${API_URL}/assets/${ASSET_ID_1}/price" \
    '{"price":180.00,"addToHistory":true}' \
    "Authorization: Bearer $ADMIN_TOKEN" \
    "Update Asset Price"

# 4. Portfolio Management
echo -e "${GREEN}=== 4. Portfolio Management Tests ===${NC}\n"

test_endpoint "POST" "${API_URL}/portfolios" \
    '{"name":"My Retirement Portfolio","description":"Long-term investment","initialInvestment":10000,"totalValue":10000,"currency":"USD","riskProfile":"moderate"}' \
    "Authorization: Bearer $INVESTOR_TOKEN" \
    "Create Portfolio"

PORTFOLIO_ID_1=$(curl -s -X POST "${API_URL}/portfolios" \
    -H "Authorization: Bearer $INVESTOR_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"name":"My Retirement Portfolio","description":"Long-term investment","initialInvestment":10000,"totalValue":10000,"currency":"USD","riskProfile":"moderate"}' | \
    grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

test_endpoint "GET" "${API_URL}/portfolios" \
    "" \
    "Authorization: Bearer $INVESTOR_TOKEN" \
    "Get All Portfolios"

test_endpoint "GET" "${API_URL}/portfolios/${PORTFOLIO_ID_1}" \
    "" \
    "Authorization: Bearer $INVESTOR_TOKEN" \
    "Get Portfolio by ID"

test_endpoint "GET" "${API_URL}/portfolios/${PORTFOLIO_ID_1}/holdings" \
    "" \
    "Authorization: Bearer $INVESTOR_TOKEN" \
    "Get Portfolio with Holdings"

test_endpoint "PUT" "${API_URL}/portfolios/${PORTFOLIO_ID_1}" \
    '{"name":"Updated Portfolio Name","riskProfile":"aggressive"}' \
    "Authorization: Bearer $INVESTOR_TOKEN" \
    "Update Portfolio"

# 5. Trade Management
echo -e "${GREEN}=== 5. Trade Management Tests ===${NC}\n"

test_endpoint "POST" "${API_URL}/trades" \
    "{\"portfolioId\":\"${PORTFOLIO_ID_1}\",\"assetId\":\"${ASSET_ID_1}\",\"type\":\"buy\",\"quantity\":10,\"price\":175.50,\"notes\":\"Initial purchase\"}" \
    "Authorization: Bearer $INVESTOR_TOKEN" \
    "Create Buy Trade"

TRADE_ID_1=$(curl -s -X POST "${API_URL}/trades" \
    -H "Authorization: Bearer $INVESTOR_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"portfolioId\":\"${PORTFOLIO_ID_1}\",\"assetId\":\"${ASSET_ID_1}\",\"type\":\"buy\",\"quantity\":10,\"price\":175.50,\"notes\":\"Initial purchase\"}" | \
    grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

test_endpoint "GET" "${API_URL}/trades" \
    "" \
    "Authorization: Bearer $INVESTOR_TOKEN" \
    "Get All Trades"

test_endpoint "GET" "${API_URL}/trades/${TRADE_ID_1}" \
    "" \
    "Authorization: Bearer $INVESTOR_TOKEN" \
    "Get Trade by ID"

test_endpoint "GET" "${API_URL}/trades/portfolio/${PORTFOLIO_ID_1}" \
    "" \
    "Authorization: Bearer $INVESTOR_TOKEN" \
    "Get Trades by Portfolio"

test_endpoint "GET" "${API_URL}/trades/stats" \
    "" \
    "Authorization: Bearer $INVESTOR_TOKEN" \
    "Get Trade Statistics"

test_endpoint "POST" "${API_URL}/trades/${TRADE_ID_1}/execute" \
    "" \
    "Authorization: Bearer $INVESTOR_TOKEN" \
    "Execute Trade"

test_endpoint "GET" "${API_URL}/portfolios/${PORTFOLIO_ID_1}/holdings" \
    "" \
    "Authorization: Bearer $INVESTOR_TOKEN" \
    "Get Portfolio Holdings After Trade Execution"

# 6. Health Check
echo -e "${GREEN}=== 6. Health Check ===${NC}\n"

test_endpoint "GET" "${API_URL}/health" \
    "" \
    "" \
    "Health Check"

test_endpoint "GET" "${BASE_URL}/" \
    "" \
    "" \
    "Root Endpoint"

echo -e "${GREEN}=== Testing Complete ===${NC}\n"
echo -e "Investor Token: ${INVESTOR_TOKEN:0:30}..."
echo -e "Admin Token: ${ADMIN_TOKEN:0:30}..."
echo -e "Portfolio ID: ${PORTFOLIO_ID_1}"
echo -e "Asset IDs: ${ASSET_ID_1}, ${ASSET_ID_2}"
echo -e "Trade ID: ${TRADE_ID_1}"
