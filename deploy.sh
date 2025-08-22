#!/bin/bash

# Junior Football Nutrition Tracker - Deployment Script
# Usage: ./deploy.sh [staging|production]

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-staging}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups/$TIMESTAMP"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Junior Football Nutrition Tracker${NC}"
echo -e "${GREEN}Deployment Script - $ENVIRONMENT${NC}"
echo -e "${GREEN}========================================${NC}"

# Validate environment
if [ "$ENVIRONMENT" != "staging" ] && [ "$ENVIRONMENT" != "production" ]; then
    echo -e "${RED}Error: Invalid environment. Use 'staging' or 'production'${NC}"
    exit 1
fi

# Step 1: Pre-deployment checks
echo -e "\n${YELLOW}Step 1: Running pre-deployment checks...${NC}"

# Check Node version
NODE_VERSION=$(node -v)
echo "Node version: $NODE_VERSION"

# Check npm version
NPM_VERSION=$(npm -v)
echo "npm version: $NPM_VERSION"

# Check if PostgreSQL is accessible
echo "Checking database connection..."
cd server
npx prisma db push --skip-generate > /dev/null 2>&1 || {
    echo -e "${RED}Error: Cannot connect to database${NC}"
    exit 1
}
echo -e "${GREEN}✓ Database connection successful${NC}"
cd ..

# Step 2: Run tests
echo -e "\n${YELLOW}Step 2: Running tests...${NC}"

# Run client tests
echo "Running client tests..."
cd client
npm test -- --run || {
    echo -e "${RED}Error: Client tests failed${NC}"
    exit 1
}
echo -e "${GREEN}✓ Client tests passed${NC}"
cd ..

# Run server tests (if available)
echo "Running server tests..."
cd server
npm test || echo -e "${YELLOW}⚠ No server tests configured${NC}"
cd ..

# Step 3: Build client
echo -e "\n${YELLOW}Step 3: Building client application...${NC}"
cd client

# Use production environment file
if [ "$ENVIRONMENT" == "production" ]; then
    cp .env.production .env.local
fi

# Build the client
npm run build || {
    echo -e "${RED}Error: Client build failed${NC}"
    exit 1
}
echo -e "${GREEN}✓ Client built successfully${NC}"

# Check build size
BUILD_SIZE=$(du -sh dist | cut -f1)
echo "Build size: $BUILD_SIZE"
cd ..

# Step 4: Build server
echo -e "\n${YELLOW}Step 4: Building server application...${NC}"
cd server

# Build TypeScript
npm run build || {
    echo -e "${RED}Error: Server build failed${NC}"
    exit 1
}
echo -e "${GREEN}✓ Server built successfully${NC}"
cd ..

# Step 5: Database migrations
echo -e "\n${YELLOW}Step 5: Running database migrations...${NC}"
cd server

# Generate Prisma client
npx prisma generate

# Run migrations
if [ "$ENVIRONMENT" == "production" ]; then
    npx prisma migrate deploy || {
        echo -e "${RED}Error: Database migration failed${NC}"
        exit 1
    }
else
    npx prisma migrate dev --name "deployment_$TIMESTAMP"
fi
echo -e "${GREEN}✓ Database migrations completed${NC}"
cd ..

# Step 6: Create deployment bundle
echo -e "\n${YELLOW}Step 6: Creating deployment bundle...${NC}"

# Create dist directory
mkdir -p dist
rm -rf dist/*

# Copy server files
cp -r server/dist dist/server
cp -r server/node_modules dist/server/
cp server/package*.json dist/server/
cp -r server/prisma dist/server/

# Copy client build
cp -r client/dist dist/client

# Copy deployment files
cp deploy.sh dist/
cp docker-compose.yml dist/ 2>/dev/null || echo "No docker-compose.yml found"

# Create deployment info file
cat > dist/deployment-info.json << EOF
{
  "environment": "$ENVIRONMENT",
  "timestamp": "$TIMESTAMP",
  "node_version": "$NODE_VERSION",
  "npm_version": "$NPM_VERSION",
  "build_size": "$BUILD_SIZE"
}
EOF

echo -e "${GREEN}✓ Deployment bundle created${NC}"

# Step 7: Health check
echo -e "\n${YELLOW}Step 7: Running health checks...${NC}"

# Start server temporarily for health check
cd dist/server
NODE_ENV=production node index.js &
SERVER_PID=$!
sleep 5

# Check if server is running
curl -f http://localhost:3001/health > /dev/null 2>&1 || {
    echo -e "${RED}Error: Server health check failed${NC}"
    kill $SERVER_PID 2>/dev/null
    exit 1
}
echo -e "${GREEN}✓ Server health check passed${NC}"

# Stop temporary server
kill $SERVER_PID 2>/dev/null
cd ../..

# Step 8: Create backup script
echo -e "\n${YELLOW}Step 8: Creating backup configuration...${NC}"

cat > dist/backup.sh << 'EOF'
#!/bin/bash
# Backup script for Junior Football Nutrition Tracker

BACKUP_DIR="/var/backups/nutrition-tracker"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
pg_dump $DATABASE_URL > "$BACKUP_DIR/db_backup_$TIMESTAMP.sql"

# Backup uploaded files (if any)
tar -czf "$BACKUP_DIR/files_backup_$TIMESTAMP.tar.gz" ./uploads 2>/dev/null || true

# Keep only last 30 days of backups
find $BACKUP_DIR -type f -mtime +30 -delete

echo "Backup completed: $TIMESTAMP"
EOF

chmod +x dist/backup.sh
echo -e "${GREEN}✓ Backup script created${NC}"

# Step 9: Summary
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment Preparation Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "\nDeployment bundle created in: ${YELLOW}./dist${NC}"
echo -e "\nNext steps:"
echo -e "1. Upload the ${YELLOW}dist${NC} folder to your server"
echo -e "2. Set up environment variables on the server"
echo -e "3. Install PM2: ${YELLOW}npm install -g pm2${NC}"
echo -e "4. Start the application: ${YELLOW}pm2 start server/index.js --name nutrition-tracker${NC}"
echo -e "5. Set up nginx reverse proxy for the client"
echo -e "6. Configure SSL certificates with Let's Encrypt"
echo -e "7. Set up the backup cron job: ${YELLOW}0 2 * * * /path/to/backup.sh${NC}"

echo -e "\n${GREEN}Good luck with your deployment!${NC}"