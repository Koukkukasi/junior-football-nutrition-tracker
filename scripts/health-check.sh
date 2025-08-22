#!/bin/bash

# Junior Football Nutrition Tracker - Health Check Script
# Monitors application health and sends alerts on failures

set -e

# Configuration
APP_URL="${APP_URL:-http://localhost:3001}"
FRONTEND_URL="${FRONTEND_URL:-http://localhost:5173}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5433}"
DB_NAME="${DB_NAME:-nutrition_tracker}"
DB_USER="${DB_USER:-nutrition_user}"
REDIS_HOST="${REDIS_HOST:-localhost}"
REDIS_PORT="${REDIS_PORT:-6379}"

# Alert configuration
ALERT_EMAIL="${ALERT_EMAIL:-admin@example.com}"
SLACK_WEBHOOK="${SLACK_WEBHOOK:-}"

# Thresholds
MAX_RESPONSE_TIME=2000  # milliseconds
MIN_FREE_MEMORY=500     # MB
MAX_CPU_USAGE=80        # percentage
MAX_DB_CONNECTIONS=90   # percentage

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Results storage
HEALTH_STATUS="healthy"
ISSUES=()

echo "================================================"
echo "Junior Football Nutrition Tracker - Health Check"
echo "Timestamp: $(date '+%Y-%m-%d %H:%M:%S')"
echo "================================================"

# Function to send alerts
send_alert() {
    local message="$1"
    local severity="$2"
    
    # Log to file
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [$severity] $message" >> /var/log/nutrition-tracker-health.log
    
    # Send to Slack if configured
    if [ -n "$SLACK_WEBHOOK" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\":warning: Health Check Alert [$severity]\\n$message\"}" \
            "$SLACK_WEBHOOK" 2>/dev/null || true
    fi
    
    # Send email if configured (requires mail command)
    if command -v mail &> /dev/null && [ -n "$ALERT_EMAIL" ]; then
        echo "$message" | mail -s "Nutrition Tracker Health Alert [$severity]" "$ALERT_EMAIL" 2>/dev/null || true
    fi
}

# 1. Check API server
echo -e "\n${YELLOW}1. Checking API Server...${NC}"
START_TIME=$(date +%s%3N)
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "$APP_URL/health" 2>/dev/null || echo "000")
END_TIME=$(date +%s%3N)
RESPONSE_TIME=$((END_TIME - START_TIME))

if [ "$HTTP_STATUS" = "200" ]; then
    echo -e "${GREEN}✓ API Server: Online${NC}"
    echo "  Response time: ${RESPONSE_TIME}ms"
    
    if [ $RESPONSE_TIME -gt $MAX_RESPONSE_TIME ]; then
        echo -e "${YELLOW}⚠ Warning: Response time exceeds threshold (${MAX_RESPONSE_TIME}ms)${NC}"
        ISSUES+=("API response time: ${RESPONSE_TIME}ms")
    fi
else
    echo -e "${RED}✗ API Server: Offline (HTTP $HTTP_STATUS)${NC}"
    HEALTH_STATUS="critical"
    ISSUES+=("API server offline: HTTP $HTTP_STATUS")
    send_alert "API Server is offline! HTTP Status: $HTTP_STATUS" "CRITICAL"
fi

# 2. Check Frontend
echo -e "\n${YELLOW}2. Checking Frontend...${NC}"
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 "$FRONTEND_URL" 2>/dev/null || echo "000")

if [ "$FRONTEND_STATUS" = "200" ]; then
    echo -e "${GREEN}✓ Frontend: Online${NC}"
else
    echo -e "${RED}✗ Frontend: Offline (HTTP $FRONTEND_STATUS)${NC}"
    HEALTH_STATUS="critical"
    ISSUES+=("Frontend offline: HTTP $FRONTEND_STATUS")
    send_alert "Frontend is offline! HTTP Status: $FRONTEND_STATUS" "CRITICAL"
fi

# 3. Check Database
echo -e "\n${YELLOW}3. Checking Database...${NC}"
DB_CHECK=$(PGPASSWORD="${DB_PASSWORD}" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" 2>/dev/null | grep -c "1" || echo "0")

if [ "$DB_CHECK" = "1" ]; then
    echo -e "${GREEN}✓ Database: Connected${NC}"
    
    # Check connection count
    CONNECTION_COUNT=$(PGPASSWORD="${DB_PASSWORD}" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT count(*) FROM pg_stat_activity;" 2>/dev/null | tr -d ' ' || echo "0")
    MAX_CONNECTIONS=$(PGPASSWORD="${DB_PASSWORD}" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SHOW max_connections;" 2>/dev/null | tr -d ' ' || echo "100")
    CONNECTION_PERCENT=$((CONNECTION_COUNT * 100 / MAX_CONNECTIONS))
    
    echo "  Active connections: $CONNECTION_COUNT / $MAX_CONNECTIONS ($CONNECTION_PERCENT%)"
    
    if [ $CONNECTION_PERCENT -gt $MAX_DB_CONNECTIONS ]; then
        echo -e "${YELLOW}⚠ Warning: High database connection usage${NC}"
        ISSUES+=("Database connections: $CONNECTION_PERCENT%")
        send_alert "High database connection usage: $CONNECTION_PERCENT%" "WARNING"
    fi
else
    echo -e "${RED}✗ Database: Disconnected${NC}"
    HEALTH_STATUS="critical"
    ISSUES+=("Database disconnected")
    send_alert "Database connection failed!" "CRITICAL"
fi

# 4. Check Redis (if configured)
if [ -n "$REDIS_HOST" ]; then
    echo -e "\n${YELLOW}4. Checking Redis Cache...${NC}"
    REDIS_CHECK=$(redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" ping 2>/dev/null || echo "FAIL")
    
    if [ "$REDIS_CHECK" = "PONG" ]; then
        echo -e "${GREEN}✓ Redis: Connected${NC}"
        
        # Check memory usage
        REDIS_MEMORY=$(redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" INFO memory | grep used_memory_human | cut -d: -f2 | tr -d '\r' || echo "0M")
        echo "  Memory usage: $REDIS_MEMORY"
    else
        echo -e "${YELLOW}⚠ Redis: Not connected (optional service)${NC}"
        ISSUES+=("Redis cache unavailable")
    fi
fi

# 5. Check System Resources
echo -e "\n${YELLOW}5. Checking System Resources...${NC}"

# Memory check
TOTAL_MEM=$(free -m | awk 'NR==2{print $2}')
USED_MEM=$(free -m | awk 'NR==2{print $3}')
FREE_MEM=$(free -m | awk 'NR==2{print $4}')
MEM_PERCENT=$((USED_MEM * 100 / TOTAL_MEM))

echo "Memory: ${USED_MEM}MB / ${TOTAL_MEM}MB (${MEM_PERCENT}% used)"

if [ $FREE_MEM -lt $MIN_FREE_MEMORY ]; then
    echo -e "${YELLOW}⚠ Warning: Low memory available${NC}"
    ISSUES+=("Low memory: ${FREE_MEM}MB free")
    send_alert "Low memory warning: Only ${FREE_MEM}MB free" "WARNING"
fi

# CPU check
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print int(100 - $1)}' || echo "0")
echo "CPU Usage: ${CPU_USAGE}%"

if [ $CPU_USAGE -gt $MAX_CPU_USAGE ]; then
    echo -e "${YELLOW}⚠ Warning: High CPU usage${NC}"
    ISSUES+=("High CPU: ${CPU_USAGE}%")
    send_alert "High CPU usage: ${CPU_USAGE}%" "WARNING"
fi

# Disk check
DISK_USAGE=$(df -h / | awk 'NR==2{print $5}' | tr -d '%')
echo "Disk Usage: ${DISK_USAGE}%"

if [ $DISK_USAGE -gt 80 ]; then
    echo -e "${YELLOW}⚠ Warning: High disk usage${NC}"
    ISSUES+=("High disk usage: ${DISK_USAGE}%")
    send_alert "High disk usage: ${DISK_USAGE}%" "WARNING"
fi

# 6. Check Application Logs for Errors
echo -e "\n${YELLOW}6. Checking Application Logs...${NC}"
if [ -f /var/log/nutrition-tracker.log ]; then
    ERROR_COUNT=$(tail -n 1000 /var/log/nutrition-tracker.log | grep -c "ERROR" || echo "0")
    WARNING_COUNT=$(tail -n 1000 /var/log/nutrition-tracker.log | grep -c "WARNING" || echo "0")
    
    echo "Recent errors: $ERROR_COUNT"
    echo "Recent warnings: $WARNING_COUNT"
    
    if [ $ERROR_COUNT -gt 10 ]; then
        echo -e "${YELLOW}⚠ High error rate detected${NC}"
        ISSUES+=("High error rate: $ERROR_COUNT errors")
        send_alert "High error rate in logs: $ERROR_COUNT errors in last 1000 lines" "WARNING"
    fi
else
    echo "Log file not found (expected for Docker deployments)"
fi

# 7. Check SSL Certificate (if HTTPS)
if [[ "$APP_URL" == https://* ]]; then
    echo -e "\n${YELLOW}7. Checking SSL Certificate...${NC}"
    DOMAIN=$(echo "$APP_URL" | sed -e 's|^[^/]*//||' -e 's|/.*$||')
    CERT_EXPIRY=$(echo | openssl s_client -servername "$DOMAIN" -connect "$DOMAIN:443" 2>/dev/null | openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2)
    
    if [ -n "$CERT_EXPIRY" ]; then
        EXPIRY_EPOCH=$(date -d "$CERT_EXPIRY" +%s 2>/dev/null || date -j -f "%b %d %H:%M:%S %Y %Z" "$CERT_EXPIRY" +%s 2>/dev/null || echo "0")
        CURRENT_EPOCH=$(date +%s)
        DAYS_LEFT=$(( (EXPIRY_EPOCH - CURRENT_EPOCH) / 86400 ))
        
        echo "SSL Certificate expires: $CERT_EXPIRY ($DAYS_LEFT days)"
        
        if [ $DAYS_LEFT -lt 30 ]; then
            echo -e "${YELLOW}⚠ SSL certificate expires soon${NC}"
            ISSUES+=("SSL cert expires in $DAYS_LEFT days")
            send_alert "SSL certificate expires in $DAYS_LEFT days!" "WARNING"
        fi
    fi
fi

# Summary
echo -e "\n================================================"
echo "Health Check Summary"
echo "================================================"

if [ "$HEALTH_STATUS" = "healthy" ] && [ ${#ISSUES[@]} -eq 0 ]; then
    echo -e "${GREEN}✓ All systems operational${NC}"
    echo "Status: HEALTHY"
else
    if [ "$HEALTH_STATUS" = "critical" ]; then
        echo -e "${RED}✗ Critical issues detected${NC}"
        echo "Status: CRITICAL"
    else
        echo -e "${YELLOW}⚠ Non-critical issues detected${NC}"
        echo "Status: DEGRADED"
    fi
    
    echo -e "\nIssues found:"
    for issue in "${ISSUES[@]}"; do
        echo "  - $issue"
    done
fi

echo -e "\nHealth check completed at $(date '+%Y-%m-%d %H:%M:%S')"

# Exit with appropriate code
if [ "$HEALTH_STATUS" = "critical" ]; then
    exit 2
elif [ ${#ISSUES[@]} -gt 0 ]; then
    exit 1
else
    exit 0
fi