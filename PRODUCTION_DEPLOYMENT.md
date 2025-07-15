# Production Deployment Guide for Brevo API Server

This guide will help you deploy the Brevo API server to production so it works with your live website.

## Option 1: Deploy to a Cloud Platform (Recommended)

### Deploy to Railway

1. **Create a Railway account** at [railway.app](https://railway.app)

2. **Connect your GitHub repository** to Railway

3. **Set up environment variables** in Railway:
   ```
   BREVO_API_KEY=your-brevo-api-key
   NODE_ENV=production
   PORT=3001
   ```

4. **Configure the service**:
   - Set the start command to: `node brevo-subscribe.cjs`
   - Railway will automatically deploy your server

5. **Get your production URL** from Railway (e.g., `https://your-app.railway.app`)

### Deploy to Render

1. **Create a Render account** at [render.com](https://render.com)

2. **Create a new Web Service**:
   - Connect your GitHub repository
   - Set build command: `npm install`
   - Set start command: `node brevo-subscribe.cjs`

3. **Set environment variables**:
   ```
   BREVO_API_KEY=your-brevo-api-key
   NODE_ENV=production
   PORT=3001
   ```

4. **Deploy** and get your production URL

### Deploy to Heroku

1. **Install Heroku CLI** and create an account

2. **Create a new Heroku app**:
   ```bash
   heroku create your-brevo-api
   ```

3. **Set environment variables**:
   ```bash
   heroku config:set BREVO_API_KEY=your-brevo-api-key
   heroku config:set NODE_ENV=production
   ```

4. **Deploy**:
   ```bash
   git push heroku main
   ```

## Option 2: Deploy to Your Own Server

### Using PM2 (Recommended for VPS)

1. **Install PM2**:
   ```bash
   npm install -g pm2
   ```

2. **Create ecosystem file** (`ecosystem.config.js`):
   ```javascript
   module.exports = {
     apps: [{
       name: 'brevo-api',
       script: 'brevo-subscribe.cjs',
       instances: 1,
       autorestart: true,
       watch: false,
       max_memory_restart: '1G',
       env: {
         NODE_ENV: 'production',
         PORT: 3001,
         BREVO_API_KEY: 'your-brevo-api-key'
       }
     }]
   };
   ```

3. **Start the service**:
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

### Using Docker

1. **Create Dockerfile**:
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   EXPOSE 3001
   CMD ["node", "brevo-subscribe.cjs"]
   ```

2. **Build and run**:
   ```bash
   docker build -t brevo-api .
   docker run -d -p 3001:3001 --env-file .env brevo-api
   ```

## Update Your Frontend Configuration

Once you have your production API URL, update the `src/utils/brevoIntegration.ts` file:

```typescript
const getApiBaseUrl = (): string => {
  if (import.meta.env.PROD) {
    // Replace with your actual production API URL
    return 'https://your-api-domain.com'; // Your actual domain
  }
  // Development
  return 'http://localhost:3001';
};
```

## Update CORS Configuration

In `brevo-subscribe.cjs`, update the CORS origins to include your production domain:

```javascript
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com', 'https://www.your-domain.com'] // Your actual domain
    : ['http://localhost:3000', 'http://localhost:8083', 'http://localhost:5173'],
  credentials: true
}));
```

## Environment Variables for Production

Create a `.env` file on your production server:

```env
# Brevo Configuration
BREVO_API_KEY=your-actual-brevo-api-key

# Server Configuration
NODE_ENV=production
PORT=3001
HOST=0.0.0.0

# Optional: Custom domain
CUSTOM_DOMAIN=your-api-domain.com
```

## Testing Production Deployment

1. **Test the health endpoint**:
   ```bash
   curl https://your-api-domain.com/api/brevo-health
   ```

2. **Test subscription**:
   ```bash
   curl -X POST https://your-api-domain.com/api/subscribe-brevo \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","name":"Test User"}'
   ```

## Security Considerations

1. **Use HTTPS** in production
2. **Set up proper CORS** to only allow your domain
3. **Keep your API key secure** - never commit it to version control
4. **Consider rate limiting** for the API endpoints
5. **Set up monitoring** to track API usage and errors

## Monitoring and Logs

### Railway/Render/Heroku
- Use the platform's built-in logging
- Set up alerts for errors

### PM2
```bash
pm2 logs brevo-api
pm2 monit
```

### Docker
```bash
docker logs your-container-name
```

## Troubleshooting

### Common Issues

1. **CORS errors**: Make sure your domain is in the CORS origins list
2. **API key not found**: Check that `BREVO_API_KEY` is set in environment variables
3. **Port already in use**: Change the PORT environment variable
4. **Network errors**: Check firewall settings and ensure the port is open

### Debug Commands

```bash
# Check if server is running
curl http://localhost:3001/api/brevo-health

# Check environment variables
echo $BREVO_API_KEY

# Check logs
pm2 logs brevo-api
```

## Cost Considerations

- **Railway**: Free tier available, then $5/month
- **Render**: Free tier available, then $7/month
- **Heroku**: $7/month for basic dyno
- **VPS**: $5-20/month depending on provider

Choose the option that best fits your budget and technical requirements. 