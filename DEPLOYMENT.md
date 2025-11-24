# Deployment Guide

## Production Deployment Checklist

### 1. Environment Variables
Update `.env` for production:
```bash
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/email-builder
JWT_SECRET=use_a_strong_random_secret_minimum_32_characters
NODE_ENV=production
```

### 2. Security Hardening

#### Update JWT Secret
```bash
# Generate a strong secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### Add Rate Limiting
Install: `npm install express-rate-limit`

Add to `server/server.js`:
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

#### Add Helmet for Security Headers
Install: `npm install helmet`

Add to `server/server.js`:
```javascript
const helmet = require('helmet');
app.use(helmet());
```

### 3. Database Setup

#### MongoDB Atlas (Recommended)
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Add database user
4. Whitelist IP addresses
5. Get connection string
6. Update MONGODB_URI in .env

#### Local MongoDB
- Ensure MongoDB is running as a service
- Configure authentication
- Set up regular backups

### 4. Build Frontend

```bash
cd client
npm run build
```

This creates an optimized production build in `client/build/`

### 5. Serve Frontend from Backend

Update `server/server.js`:
```javascript
const path = require('path');

// Serve static files from React build
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}
```

### 6. Deployment Options

#### Option A: Heroku

1. Install Heroku CLI
2. Create Heroku app:
```bash
heroku create your-app-name
```

3. Add MongoDB addon or use Atlas:
```bash
heroku addons:create mongolab
```

4. Set environment variables:
```bash
heroku config:set JWT_SECRET=your_secret
heroku config:set NODE_ENV=production
```

5. Create `Procfile`:
```
web: node server/server.js
```

6. Deploy:
```bash
git push heroku main
```

#### Option B: DigitalOcean/AWS/VPS

1. Set up Node.js on server
2. Install MongoDB or use Atlas
3. Clone repository
4. Install dependencies: `npm run install-all`
5. Build frontend: `cd client && npm run build`
6. Set environment variables
7. Use PM2 for process management:
```bash
npm install -g pm2
pm2 start server/server.js --name email-builder
pm2 startup
pm2 save
```

8. Set up Nginx as reverse proxy:
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

9. Set up SSL with Let's Encrypt:
```bash
sudo certbot --nginx -d yourdomain.com
```

#### Option C: Vercel (Frontend) + Heroku (Backend)

Frontend (Vercel):
1. Push to GitHub
2. Import project in Vercel
3. Set root directory to `client`
4. Add environment variable: `REACT_APP_API_URL=https://your-backend.herokuapp.com`

Backend (Heroku):
- Follow Heroku steps above

#### Option D: Docker

Create `Dockerfile`:
```dockerfile
FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

WORKDIR /app/client
RUN npm install && npm run build

WORKDIR /app

EXPOSE 5000

CMD ["node", "server/server.js"]
```

Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/email-builder
      - JWT_SECRET=your_secret
      - NODE_ENV=production
    depends_on:
      - mongo
  
  mongo:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

volumes:
  mongo-data:
```

Deploy:
```bash
docker-compose up -d
```

### 7. Monitoring & Logging

#### Add Logging
Install: `npm install winston`

Create `server/utils/logger.js`:
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;
```

#### Health Check Endpoint
Already included: `GET /api/health`

### 8. Backup Strategy

#### Database Backups
```bash
# MongoDB dump
mongodump --uri="mongodb://localhost:27017/email-builder" --out=/backup/

# Restore
mongorestore --uri="mongodb://localhost:27017/email-builder" /backup/
```

#### Automated Backups
Set up cron job:
```bash
0 2 * * * mongodump --uri="$MONGODB_URI" --out=/backups/$(date +\%Y\%m\%d)
```

### 9. Performance Optimization

- Enable gzip compression
- Add CDN for static assets
- Implement caching headers
- Use connection pooling
- Add database indexes
- Implement pagination for templates list

### 10. Post-Deployment Testing

- [ ] Test signup/login
- [ ] Test template creation
- [ ] Test drag-and-drop
- [ ] Test template saving
- [ ] Test template loading
- [ ] Test HTML export
- [ ] Test on mobile devices
- [ ] Check error handling
- [ ] Verify security headers
- [ ] Test rate limiting

## Maintenance

### Regular Tasks
- Monitor error logs
- Check database performance
- Update dependencies: `npm audit fix`
- Review security advisories
- Backup database regularly
- Monitor server resources

### Scaling Considerations
- Add Redis for session management
- Implement load balancing
- Use CDN for static assets
- Database read replicas
- Horizontal scaling with PM2 cluster mode

## Support

For issues or questions:
- Check logs: `pm2 logs email-builder`
- Monitor: `pm2 monit`
- Restart: `pm2 restart email-builder`
