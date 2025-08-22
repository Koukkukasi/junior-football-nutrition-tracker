# Junior Football Nutrition Tracker - Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Deployment Methods](#deployment-methods)
4. [Server Configuration](#server-configuration)
5. [SSL/TLS Setup](#ssltls-setup)
6. [Monitoring & Maintenance](#monitoring--maintenance)
7. [Troubleshooting](#troubleshooting)
8. [Rollback Procedures](#rollback-procedures)

## Prerequisites

### System Requirements
- **Node.js**: v20.x or higher
- **PostgreSQL**: v16 or higher
- **Redis**: v7.x (optional, for caching)
- **Docker**: v24.x (for containerized deployment)
- **Nginx**: Latest stable version
- **PM2**: For process management (non-Docker deployment)
- **Git**: For source code management
- **SSL Certificate**: Let's Encrypt or commercial certificate

### Server Requirements
- **OS**: Ubuntu 22.04 LTS or similar Linux distribution
- **RAM**: Minimum 2GB, recommended 4GB+
- **Storage**: 20GB minimum (including database growth)
- **CPU**: 2 cores minimum
- **Network**: Open ports 80, 443, 22 (SSH)

## Environment Setup

### 1. Clone Repository
```bash
git clone https://github.com/your-org/junior-football-nutrition-tracker.git
cd junior-football-nutrition-tracker
```

### 2. Environment Variables

Create `.env` files for production:

#### Server Environment (`server/.env.production`)
```env
# Database
DATABASE_URL=postgresql://nutrition_user:secure_password@localhost:5432/nutrition_tracker

# Authentication
CLERK_SECRET_KEY=sk_live_your_production_secret_key
CLERK_PUBLISHABLE_KEY=pk_live_your_production_publishable_key
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret

# Application
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-domain.com

# Redis (optional)
REDIS_URL=redis://localhost:6379

# Monitoring (optional)
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
NEW_RELIC_LICENSE_KEY=your_new_relic_key
```

#### Client Environment (`client/.env.production`)
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_live_your_production_key
VITE_API_URL=https://api.your-domain.com
VITE_APP_URL=https://your-domain.com

# Analytics (optional)
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

## Deployment Methods

### Method 1: Docker Deployment (Recommended)

#### Step 1: Build and Run with Docker Compose
```bash
# Copy production environment file
cp .env.production .env

# Build and start services
docker-compose -f docker-compose.production.yml up -d

# Check service status
docker-compose -f docker-compose.production.yml ps

# View logs
docker-compose -f docker-compose.production.yml logs -f
```

#### Step 2: Initialize Database
```bash
# Run migrations
docker-compose -f docker-compose.production.yml exec app npx prisma migrate deploy

# Seed initial data (optional)
docker-compose -f docker-compose.production.yml exec app npm run seed
```

### Method 2: Manual Deployment with PM2

#### Step 1: Install Dependencies
```bash
# Install PM2 globally
npm install -g pm2

# Install project dependencies
cd client && npm ci --production && npm run build && cd ..
cd server && npm ci --production && npx prisma generate && npm run build && cd ..
```

#### Step 2: Setup Database
```bash
# Create database
sudo -u postgres createdb nutrition_tracker
sudo -u postgres createuser nutrition_user

# Set password
sudo -u postgres psql -c "ALTER USER nutrition_user PASSWORD 'secure_password';"

# Grant privileges
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE nutrition_tracker TO nutrition_user;"

# Run migrations
cd server
npx prisma migrate deploy
cd ..
```

#### Step 3: Start Application with PM2
```bash
# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'nutrition-tracker-api',
    script: './server/dist/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}
EOF

# Start application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

### Method 3: GitHub Actions CI/CD

The repository includes a complete CI/CD pipeline. To use it:

1. **Configure GitHub Secrets**:
   ```
   DOCKER_USERNAME          # Docker Hub username
   DOCKER_PASSWORD          # Docker Hub password
   STAGING_HOST            # Staging server IP/hostname
   STAGING_USER            # SSH username for staging
   STAGING_SSH_KEY         # Private SSH key for staging
   PRODUCTION_HOST         # Production server IP/hostname
   PRODUCTION_USER         # SSH username for production
   PRODUCTION_SSH_KEY      # Private SSH key for production
   PRODUCTION_URL          # Production URL for health checks
   SLACK_WEBHOOK           # Slack webhook for notifications (optional)
   ```

2. **Deployment Triggers**:
   - Push to `develop` branch → Deploy to staging
   - Push to `main` branch → Deploy to production
   - Manual workflow dispatch available

## Server Configuration

### Nginx Configuration

Create `/etc/nginx/sites-available/nutrition-tracker`:

```nginx
upstream nutrition_api {
    server localhost:3001;
    keepalive 64;
}

server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Client app
    location / {
        root /var/www/nutrition-tracker/client;
        try_files $uri $uri/ /index.html;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API proxy
    location /api {
        proxy_pass http://nutrition_api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 90s;
        proxy_connect_timeout 90s;
        proxy_send_timeout 90s;
    }

    # WebSocket support for live features
    location /ws {
        proxy_pass http://nutrition_api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://nutrition_api/health;
        access_log off;
    }

    # Static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml application/atom+xml image/svg+xml text/javascript application/vnd.ms-fontobject application/x-font-ttf font/opentype;
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/nutrition-tracker /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## SSL/TLS Setup

### Using Let's Encrypt with Certbot

```bash
# Install Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Test automatic renewal
sudo certbot renew --dry-run

# Setup auto-renewal cron job (usually done automatically)
# Check: sudo systemctl status certbot.timer
```

## Monitoring & Maintenance

### 1. Health Checks

#### Application Health Endpoint
The application provides a health check endpoint at `/health`:
```bash
curl https://your-domain.com/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-20T10:00:00Z",
  "uptime": 3600,
  "database": "connected",
  "redis": "connected",
  "version": "1.0.0"
}
```

### 2. Monitoring Setup

#### PM2 Monitoring (Non-Docker)
```bash
# View process status
pm2 status

# Monitor CPU/Memory
pm2 monit

# View logs
pm2 logs nutrition-tracker-api

# Setup PM2 Plus (optional)
pm2 link <secret_key> <public_key>
```

#### Docker Monitoring
```bash
# View container stats
docker stats

# Check logs
docker-compose -f docker-compose.production.yml logs -f app

# Health status
docker-compose -f docker-compose.production.yml ps
```

### 3. Log Management

#### Log Rotation Setup
Create `/etc/logrotate.d/nutrition-tracker`:
```
/var/log/nutrition-tracker/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
```

### 4. Database Backup

#### Automated Backup Script
The deployment includes a backup script. Setup cron job:
```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /app/nutrition-tracker/scripts/backup.sh

# For Docker deployment
0 2 * * * docker-compose -f /app/nutrition-tracker/docker-compose.production.yml exec -T postgres pg_dump -U nutrition_user nutrition_tracker > /backups/db_$(date +\%Y\%m\%d).sql
```

#### Manual Backup
```bash
# PostgreSQL backup
pg_dump -h localhost -U nutrition_user -d nutrition_tracker > backup_$(date +%Y%m%d).sql

# Docker backup
docker-compose -f docker-compose.production.yml exec postgres pg_dump -U nutrition_user nutrition_tracker > backup_$(date +%Y%m%d).sql
```

### 5. Performance Monitoring

#### Application Metrics
- Response time: Target < 200ms for API calls
- Database query time: Monitor slow queries > 100ms
- Memory usage: Alert if > 80% of available RAM
- CPU usage: Alert if sustained > 70%

#### Setup monitoring alerts:
```bash
# Example with PM2
pm2 set pm2-health:max_memory_restart 1G
pm2 set pm2-health:min_uptime 10000
pm2 set pm2-health:max_restarts 10
```

## Troubleshooting

### Common Issues and Solutions

#### 1. Database Connection Issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test connection
psql -h localhost -U nutrition_user -d nutrition_tracker -c "SELECT 1;"

# Check logs
sudo tail -f /var/log/postgresql/postgresql-*.log
```

#### 2. Application Won't Start
```bash
# Check port availability
sudo lsof -i :3001

# Check environment variables
env | grep DATABASE_URL
env | grep CLERK

# Check logs
pm2 logs nutrition-tracker-api --lines 100
# or for Docker
docker-compose -f docker-compose.production.yml logs app --tail 100
```

#### 3. Nginx 502 Bad Gateway
```bash
# Check if app is running
curl http://localhost:3001/health

# Check Nginx error log
sudo tail -f /var/log/nginx/error.log

# Restart services
sudo systemctl restart nginx
pm2 restart nutrition-tracker-api
```

#### 4. High Memory Usage
```bash
# Check memory usage
free -h
pm2 monit

# Restart with memory limit
pm2 delete nutrition-tracker-api
pm2 start ecosystem.config.js --max-memory-restart 1G
```

#### 5. Slow Performance
```bash
# Check database indexes
psql -U nutrition_user -d nutrition_tracker -c "\di"

# Analyze slow queries
psql -U nutrition_user -d nutrition_tracker -c "SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;"

# Clear Redis cache (if using)
redis-cli FLUSHALL
```

## Rollback Procedures

### Quick Rollback Steps

#### 1. Docker Deployment Rollback
```bash
# Stop current deployment
docker-compose -f docker-compose.production.yml down

# Checkout previous version
git checkout <previous-tag-or-commit>

# Rebuild and deploy
docker-compose -f docker-compose.production.yml up -d --build
```

#### 2. PM2 Deployment Rollback
```bash
# Stop application
pm2 stop nutrition-tracker-api

# Checkout previous version
git checkout <previous-tag-or-commit>

# Rebuild
cd client && npm run build && cd ..
cd server && npm run build && cd ..

# Restart
pm2 restart nutrition-tracker-api
```

#### 3. Database Rollback
```bash
# Restore from backup
psql -h localhost -U nutrition_user -d nutrition_tracker < backup_20240120.sql

# Or with Docker
docker-compose -f docker-compose.production.yml exec -T postgres psql -U nutrition_user nutrition_tracker < backup_20240120.sql
```

### Emergency Maintenance Mode

Create a maintenance page (`/var/www/maintenance.html`):
```html
<!DOCTYPE html>
<html>
<head>
    <title>Maintenance</title>
    <style>
        body { font-family: Arial; text-align: center; padding: 50px; }
        h1 { color: #333; }
    </style>
</head>
<body>
    <h1>Under Maintenance</h1>
    <p>We'll be back shortly. Thank you for your patience!</p>
</body>
</html>
```

Enable maintenance mode in Nginx:
```nginx
# Add to server block
location / {
    return 503;
}

error_page 503 /maintenance.html;
location = /maintenance.html {
    root /var/www;
}
```

## Security Checklist

- [ ] All environment variables properly set
- [ ] Database password is strong and unique
- [ ] SSL/TLS certificates installed and valid
- [ ] Firewall configured (only necessary ports open)
- [ ] Regular security updates applied
- [ ] Database backups automated and tested
- [ ] Application logs monitored
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Security headers implemented
- [ ] Secrets rotated regularly
- [ ] Monitoring alerts configured

## Support and Resources

- **Documentation**: [GitHub Wiki](https://github.com/your-org/junior-football-nutrition-tracker/wiki)
- **Issue Tracker**: [GitHub Issues](https://github.com/your-org/junior-football-nutrition-tracker/issues)
- **Monitoring Dashboard**: Configure based on your monitoring solution
- **Team Contact**: devops@your-organization.com

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024-01-20 | Initial production release |
| 1.0.1 | TBD | Bug fixes and performance improvements |

---

*Last Updated: January 2024*
*Deployment Guide Version: 1.0.0*