#!/bin/bash
# Run script for StellarID

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}StellarID - Decentralized Identity for Financial Inclusion${NC}"
echo "========================================================"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check dependencies
echo -e "\n${YELLOW}Checking dependencies...${NC}"

# Check Node.js
if command_exists node; then
    node_version=$(node -v)
    echo -e "✅ Node.js ${node_version} installed"
else
    echo -e "${RED}❌ Node.js not found. Please install Node.js (v14.x recommended).${NC}"
    exit 1
fi

# Check MongoDB
if command_exists mongod; then
    echo -e "✅ MongoDB installed"
else
    echo -e "${RED}❌ MongoDB not found. Please install MongoDB.${NC}"
    echo -e "   You can still proceed, but ensure MongoDB is running."
fi

# Check if MongoDB is running
if pgrep -x "mongod" >/dev/null; then
    echo -e "✅ MongoDB service is running"
else
    echo -e "${YELLOW}⚠️ MongoDB service is not running. Starting MongoDB...${NC}"
    if command_exists mongod; then
        mongod --fork --logpath /dev/null
        if [ $? -eq 0 ]; then
            echo -e "✅ MongoDB started successfully"
        else
            echo -e "${RED}❌ Failed to start MongoDB. Please start it manually.${NC}"
        fi
    fi
fi

# Check if .env files exist
if [ -f ./backend/.env ]; then
    echo -e "✅ Backend .env file found"
else
    echo -e "${YELLOW}⚠️ Backend .env file not found. Creating default .env...${NC}"
    mkdir -p backend
    cat > backend/.env << EOF
# Server configuration
PORT=5000
NODE_ENV=development

# MongoDB configuration
MONGO_URI=mongodb://localhost:27017/stellarid

# JWT configuration
JWT_SECRET=stellar_secret_key_for_jwt_auth_change_in_production
JWT_EXPIRES_IN=24h

# Stellar configuration
STELLAR_NETWORK=testnet

# CORS
CORS_ORIGIN=http://localhost:3000
EOF
    echo -e "✅ Created backend .env file"
fi

if [ -f ./frontend/.env ]; then
    echo -e "✅ Frontend .env file found"
else
    echo -e "${YELLOW}⚠️ Frontend .env file not found. Creating default .env...${NC}"
    mkdir -p frontend
    cat > frontend/.env << EOF
REACT_APP_API_URL=http://localhost:5000
REACT_APP_STELLAR_NETWORK=testnet
EOF
    echo -e "✅ Created frontend .env file"
fi

# Initialize database if needed
echo -e "\n${YELLOW}Would you like to initialize the database with default users? (y/n)${NC}"
read -n 1 init_db
echo ""

if [[ $init_db == "y" || $init_db == "Y" ]]; then
    echo -e "${YELLOW}Initializing database...${NC}"
    if [ -f ./db-init.js ]; then
        node ./db-init.js
    else
        echo -e "${RED}❌ Database initialization script not found.${NC}"
        echo -e "   Make sure db-init.js exists in the project root."
    fi
fi

# Check frontend and backend directories
if [ ! -d "./frontend" ]; then
    echo -e "${RED}❌ Frontend directory not found. Please make sure the project structure is correct.${NC}"
    exit 1
fi

if [ ! -d "./backend" ]; then
    echo -e "${RED}❌ Backend directory not found. Please make sure the project structure is correct.${NC}"
    exit 1
fi

# Install dependencies if needed
echo -e "\n${YELLOW}Installing dependencies...${NC}"

# Check if package.json exists
if [ -f "./package.json" ]; then
    echo -e "Installing root dependencies..."
    npm install
else
    echo -e "${RED}❌ Root package.json not found.${NC}"
    exit 1
fi

# Install frontend dependencies
if [ -f "./frontend/package.json" ]; then
    echo -e "Installing frontend dependencies..."
    (cd frontend && npm install)
else
    echo -e "${RED}❌ Frontend package.json not found.${NC}"
    exit 1
fi

# Start the application
echo -e "\n${GREEN}Starting StellarID...${NC}"
echo -e "This will start both the backend server and frontend application."
echo -e "${YELLOW}Press Ctrl+C to stop the application.${NC}"

# Start the application using concurrently
npm run dev

# Exit message
echo -e "\n${GREEN}StellarID application stopped.${NC}"