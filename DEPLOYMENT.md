# Deployment Security Checklist

## ⚠️ BEFORE DEPLOYING TO GITHUB

### 1. Environment Variables Setup
- [ ] Remove all real credentials from `.env` files
- [ ] Use `.env.example` files as templates
- [ ] Set up environment variables in your deployment platform

### 2. Required Environment Variables

#### Backend (.env)
```
NODE_ENV=production
PORT=5000
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=strong_random_secret_minimum_32_characters
JWT_EXPIRE=30d
REDIS_HOST=your_redis_host
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_production_email
EMAIL_PASS=your_app_password
FRONTEND_URL=your_production_frontend_url
```

#### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=your_production_api_url
```

### 3. Security Best Practices
- [ ] Generate strong JWT secret (32+ characters)
- [ ] Use production MongoDB cluster
- [ ] Enable MongoDB authentication
- [ ] Use Redis password in production
- [ ] Set up proper CORS origins
- [ ] Enable rate limiting
- [ ] Use HTTPS in production

### 4. Deployment Platforms

#### Vercel (Frontend)
1. Connect GitHub repository
2. Set environment variables in Vercel dashboard
3. Deploy

#### Railway/Heroku (Backend)
1. Connect GitHub repository
2. Set environment variables in platform dashboard
3. Deploy

### 5. Post-Deployment
- [ ] Test all API endpoints
- [ ] Verify real-time features work
- [ ] Check file uploads
- [ ] Test authentication flow
- [ ] Monitor logs for errors

## 🚨 NEVER COMMIT
- Real database credentials
- API keys and secrets
- Email passwords
- JWT secrets
- Any production credentials