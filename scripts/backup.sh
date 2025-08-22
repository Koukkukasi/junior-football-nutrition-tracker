#!/bin/bash

# Junior Football Nutrition Tracker - Database Backup Script
# This script creates automated backups of the PostgreSQL database

set -e

# Configuration
BACKUP_DIR="${BACKUP_DIR:-/backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DATE=$(date +%Y-%m-%d)
BACKUP_FILENAME="nutrition_tracker_${TIMESTAMP}.sql"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_FILENAME}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"

# Database configuration (from environment)
DB_HOST="${PGHOST:-postgres}"
DB_PORT="${PGPORT:-5432}"
DB_NAME="${PGDATABASE:-nutrition_tracker}"
DB_USER="${PGUSER:-nutrition_user}"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Create backup directory if it doesn't exist
mkdir -p "${BACKUP_DIR}"

echo -e "${GREEN}Starting database backup...${NC}"
echo "Timestamp: ${TIMESTAMP}"
echo "Database: ${DB_NAME}"
echo "Backup path: ${BACKUP_PATH}"

# Perform the backup
echo -e "${YELLOW}Creating backup...${NC}"
pg_dump \
    -h "${DB_HOST}" \
    -p "${DB_PORT}" \
    -U "${DB_USER}" \
    -d "${DB_NAME}" \
    --no-password \
    --verbose \
    --clean \
    --no-owner \
    --no-privileges \
    --if-exists \
    > "${BACKUP_PATH}"

# Check if backup was successful
if [ $? -eq 0 ]; then
    # Get backup size
    BACKUP_SIZE=$(du -h "${BACKUP_PATH}" | cut -f1)
    echo -e "${GREEN}✓ Backup created successfully${NC}"
    echo "Backup size: ${BACKUP_SIZE}"
    
    # Compress the backup
    echo -e "${YELLOW}Compressing backup...${NC}"
    gzip "${BACKUP_PATH}"
    COMPRESSED_PATH="${BACKUP_PATH}.gz"
    COMPRESSED_SIZE=$(du -h "${COMPRESSED_PATH}" | cut -f1)
    echo -e "${GREEN}✓ Backup compressed${NC}"
    echo "Compressed size: ${COMPRESSED_SIZE}"
    
    # Create a symlink to latest backup
    ln -sf "${COMPRESSED_PATH}" "${BACKUP_DIR}/latest.sql.gz"
    
    # Log backup details
    cat >> "${BACKUP_DIR}/backup.log" << EOF
${TIMESTAMP} | Success | ${BACKUP_FILENAME}.gz | ${COMPRESSED_SIZE}
EOF
    
else
    echo -e "${RED}✗ Backup failed${NC}"
    
    # Log failure
    cat >> "${BACKUP_DIR}/backup.log" << EOF
${TIMESTAMP} | Failed | Error during pg_dump
EOF
    
    exit 1
fi

# Clean up old backups
echo -e "${YELLOW}Cleaning up old backups...${NC}"
find "${BACKUP_DIR}" \
    -name "nutrition_tracker_*.sql.gz" \
    -type f \
    -mtime +${RETENTION_DAYS} \
    -exec rm {} \; \
    -exec echo "Deleted old backup: {}" \;

# Count remaining backups
BACKUP_COUNT=$(find "${BACKUP_DIR}" -name "nutrition_tracker_*.sql.gz" -type f | wc -l)
echo "Total backups retained: ${BACKUP_COUNT}"

# Check available disk space
DISK_USAGE=$(df -h "${BACKUP_DIR}" | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "${DISK_USAGE}" -gt 80 ]; then
    echo -e "${YELLOW}⚠ Warning: Disk usage is above 80% (${DISK_USAGE}%)${NC}"
    
    # Send alert (implement your alerting mechanism here)
    # Example: Send to monitoring system or email
fi

# Verify backup integrity (optional)
echo -e "${YELLOW}Verifying backup integrity...${NC}"
gunzip -t "${COMPRESSED_PATH}" 2>/dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Backup integrity verified${NC}"
else
    echo -e "${RED}✗ Backup integrity check failed${NC}"
    exit 1
fi

# Create daily summary (once per day)
DAILY_SUMMARY="${BACKUP_DIR}/daily_${DATE}.txt"
if [ ! -f "${DAILY_SUMMARY}" ]; then
    echo "Daily Backup Summary - ${DATE}" > "${DAILY_SUMMARY}"
    echo "================================" >> "${DAILY_SUMMARY}"
    echo "Total backups: ${BACKUP_COUNT}" >> "${DAILY_SUMMARY}"
    echo "Disk usage: ${DISK_USAGE}%" >> "${DAILY_SUMMARY}"
    echo "Latest backup: ${BACKUP_FILENAME}.gz (${COMPRESSED_SIZE})" >> "${DAILY_SUMMARY}"
    ls -lh "${BACKUP_DIR}"/nutrition_tracker_*.sql.gz >> "${DAILY_SUMMARY}" 2>/dev/null
fi

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Backup completed successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo "Backup file: ${COMPRESSED_PATH}"
echo "Retention: ${RETENTION_DAYS} days"
echo "Next backup: Check cron schedule"

# Exit successfully
exit 0