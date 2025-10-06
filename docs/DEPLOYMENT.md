# Deployment Guide

## Overview

This guide covers deploying the Future Sight application to production environments.

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Git
- Domain name (optional)
- SSL certificate (recommended)

## Environment Setup

### 1. Server Requirements

**Minimum Requirements:**
- 2 CPU cores
- 4GB RAM  
- 20GB storage
- Ubuntu 20.04+ or similar

**Recommended:**
- 4 CPU cores
- 8GB RAM
- 50GB SSD storage

### 2. Environment Variables

Copy and configure environment variables:

```bash
# Server
cp server/.env.example server/.env

# Edit server/.env with production values:
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://yourdomain.com
NASA_API_KEY=your_actual_nasa_api_key
```

## Deployment Options

### Option 1: Traditional VPS Deployment

#### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx for reverse proxy
sudo apt install nginx -y
```

#### 2. Application Deployment

```bash
# Clone repository
git clone <your-repo-url>
cd NASA

# Install dependencies
npm run install-deps

# Build frontend
cd client
npm run build
cd ..

# Start backend with PM2
cd server
pm2 start index.js --name "weather-risk-api"
cd ..
```

#### 3. Nginx Configuration

Create `/etc/nginx/sites-available/weather-risk`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend (React build)
    location / {
        root /path/to/NASA/client/build;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/weather-risk /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 4. SSL Certificate (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### Option 2: Docker Deployment

#### 1. Create Dockerfiles

**Frontend Dockerfile** (`client/Dockerfile`):
```dockerfile
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Backend Dockerfile** (`server/Dockerfile`):
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3001
USER node
CMD ["node", "index.js"]
```

#### 2. Docker Compose

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  frontend:
    build: ./client
    ports:
      - "80:80"
    depends_on:
      - backend

  backend:
    build: ./server
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - NASA_API_KEY=${NASA_API_KEY}
    volumes:
      - ./server/.env:/app/.env

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
```

#### 3. Deploy with Docker

```bash
# Build and start containers
docker-compose up -d

# View logs
docker-compose logs -f

# Scale backend if needed
docker-compose up -d --scale backend=3
```

### Option 3: Cloud Platform Deployment

#### Vercel (Frontend) + Railway (Backend)

**Frontend (Vercel):**
1. Connect GitHub repository to Vercel
2. Set build command: `cd client && npm run build`
3. Set output directory: `client/build`
4. Add environment variable: `REACT_APP_API_URL`

**Backend (Railway):**
1. Connect GitHub repository to Railway
2. Set start command: `cd server && npm start`
3. Add environment variables from `.env.example`

#### AWS/Azure/GCP

Use respective platform documentation for:
- Static site hosting (frontend)
- Container/serverless deployment (backend)
- Load balancing and CDN setup

## Performance Optimization

### 1. Caching Strategy

```javascript
// Add Redis for advanced caching
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_URL);

// Cache NASA data responses
const cacheMiddleware = (duration) => {
  return async (req, res, next) => {
    const key = req.originalUrl;
    const cached = await client.get(key);
    
    if (cached) {
      return res.json(JSON.parse(cached));
    }
    
    res.sendResponse = res.json;
    res.json = (body) => {
      client.setex(key, duration, JSON.stringify(body));
      res.sendResponse(body);
    };
    
    next();
  };
};
```

### 2. Database Integration

For production, consider adding PostgreSQL:

```javascript
// Database schema for caching results
CREATE TABLE weather_analysis (
  id SERIAL PRIMARY KEY,
  location_hash VARCHAR(64) NOT NULL,
  query_params JSONB NOT NULL,
  results JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_location_hash ON weather_analysis(location_hash);
CREATE INDEX idx_expires_at ON weather_analysis(expires_at);
```

### 3. CDN Setup

Configure CDN for static assets:
- Frontend build files
- Chart.js libraries
- NASA data visualizations

## Monitoring and Logging

### 1. Application Monitoring

```javascript
// Add monitoring middleware
const monitoring = require('./middleware/monitoring');

app.use(monitoring({
  serviceName: 'weather-risk-api',
  environment: process.env.NODE_ENV
}));
```

### 2. Error Tracking

Integrate error tracking service:
```javascript
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV
});

app.use(Sentry.Handlers.errorHandler());
```

### 3. Log Management

Configure structured logging:
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});
```

## Security Considerations

### 1. Environment Security

- Use environment variables for secrets
- Implement API key rotation
- Secure server access with SSH keys
- Regular security updates

### 2. Application Security

```javascript
// Enhanced security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  }
}));

// Rate limiting by IP and API key
const createRateLimiter = (windowMs, max) => {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false
  });
};
```

### 3. Data Protection

- Implement data encryption at rest
- Use HTTPS everywhere
- Regular security audits
- Backup and disaster recovery plans

## Scaling Considerations

### Horizontal Scaling

```yaml
# Load balancer configuration
services:
  backend:
    deploy:
      replicas: 3
    environment:
      - NODE_ENV=production
  
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - backend
```

### Database Scaling

- Read replicas for historical data
- Partitioning by location/time
- Caching layers (Redis/Memcached)

### CDN and Caching

- Global CDN distribution
- Edge caching for API responses
- Browser caching strategies

## Maintenance

### 1. Updates and Patches

```bash
# Automated deployment script
#!/bin/bash
git pull origin main
npm run install-deps
cd client && npm run build && cd ..
pm2 restart weather-risk-api
pm2 save
```

### 2. Backup Strategy

- Daily database backups
- Application code versioning
- Configuration backups
- Disaster recovery testing

### 3. Health Checks

```javascript
// Comprehensive health check
app.get('/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: await checkDatabase(),
      redis: await checkRedis(),
      nasaApi: await checkNASAAPI()
    }
  };
  
  const isHealthy = Object.values(health.services).every(s => s.status === 'up');
  res.status(isHealthy ? 200 : 503).json(health);
});
```

## Troubleshooting

### Common Issues

1. **High Memory Usage**: Implement data streaming for large datasets
2. **Slow API Responses**: Add caching and optimize database queries  
3. **SSL Certificate Issues**: Check certificate renewal automation
4. **Rate Limiting**: Monitor usage patterns and adjust limits

### Debugging

```bash
# View application logs
pm2 logs weather-risk-api

# Monitor resource usage
pm2 monit

# Database performance
EXPLAIN ANALYZE SELECT * FROM weather_analysis WHERE location_hash = 'hash';
```