# Deployment Guide: Render & Vercel

## Deployment Architecture Options

### Option 1: Deploy Everything to Render (Recommended)
- **Backend**: Node.js/Express on Render
- **Frontend**: Served by Express from Render
- **Pros**: Simple, single deployment, one database connection
- **Cons**: Frontend not on CDN

### Option 2: Separate Deployment
- **Backend**: Render (Node.js)
- **Frontend**: Vercel (Static Files)
- **Pros**: Optimized serving, CDN benefits
- **Cons**: Requires CORS setup, two deployments

---

## Option 1: Deploy Everything to Render (Recommended for Beginners)

### Prerequisites
- Render account (https://render.com)
- MongoDB Atlas account (https://www.mongodb.com/cloud/atlas)
- GitHub repository with your code

### Step 1: Setup MongoDB Atlas

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get your connection string:
   - Click "Connect" → "Connect your application"
   - Copy the URI (looks like: `mongodb+srv://username:password@cluster.mongodb.net/society-maintenance`)
4. Update username and password in the connection string
5. Keep this string safe - you'll need it for Render

### Step 2: Prepare Your App

1. Update `backend/server.js` to allow Render's domain:
   ```javascript
   app.use(cors({
     origin: ['http://localhost:5000', 'https://your-app.onrender.com'],
     credentials: true,
   }));
   ```

2. Create a `Procfile` in your project root:
   ```
   web: node backend/server.js
   ```

3. Update `package.json` scripts to include:
   ```json
   "start": "node backend/server.js",
   "dev": "nodemon backend/server.js"
   ```

4. Ensure `.gitignore` includes:
   ```
   node_modules/
   .env
   uploads/
   ```

5. Commit to GitHub:
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

### Step 3: Deploy to Render

1. Go to https://render.com and sign up
2. Click "New" → "Web Service"
3. Select your GitHub repository
4. Fill in the details:
   - **Name**: `society-maintenance-tracker`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (or Paid for better performance)

5. Click "Advanced" and add Environment Variables:
   ```
   MONGODB_URI = mongodb+srv://username:password@cluster.mongodb.net/society-maintenance
   JWT_SECRET = your_very_secret_key_here
   JWT_EXPIRE = 30d
   NODE_ENV = production
   EMAIL_USER = your_email@gmail.com
   EMAIL_PASSWORD = your_app_password
   ```

6. Click "Create Web Service"
7. Wait for deployment (5-10 minutes)
8. Your app will be at: `https://society-maintenance-tracker.onrender.com`

### Step 4: Seed Database

Once deployed, run the seed script to populate demo data:

```bash
# On your local machine
MONGODB_URI="your_atlas_connection_string" npm run seed
```

Or manually create an admin account through the app's registration.

---

## Option 2: Separate Deployment (Backend on Render + Frontend on Vercel)

### Part A: Deploy Backend to Render

Follow Option 1, Steps 1-4 above.

### Part B: Deploy Frontend to Vercel

#### Step 1: Create Frontend Folder Structure

1. Create `frontend/.vercelignore`:
   ```
   node_modules/
   .git/
   ```

2. Create `frontend/package.json`:
   ```json
   {
     "name": "society-maintenance-frontend",
     "version": "1.0.0",
     "description": "Frontend for Society Maintenance Tracker",
     "scripts": {
       "build": "echo 'Frontend build complete'",
       "start": "python -m http.server 3000 || npx http-server"
     }
   }
   ```

#### Step 2: Update API URLs in Frontend

Update `frontend/js/auth.js`, `frontend/js/complaints.js`, `frontend/js/admin.js`:

```javascript
// Change from:
const API_BASE = 'http://localhost:5000/api';

// To:
const API_BASE = 'https://your-render-app.onrender.com/api';
```

#### Step 3: Deploy to Vercel

1. Go to https://vercel.com and sign up
2. Click "New Project"
3. Select your GitHub repository
4. For "Root Directory", set to `frontend/`
5. Click "Deploy"
6. Your frontend will be at: `https://your-app.vercel.app`

#### Step 4: Enable CORS on Render

Update `backend/server.js`:
```javascript
app.use(cors({
  origin: [
    'http://localhost:5000',
    'http://localhost:3000',
    'https://your-app.vercel.app',
    'https://your-render-app.onrender.com'
  ],
  credentials: true,
}));
```

---

## Environment Variables Checklist

### For Render:
```
MONGODB_URI = mongodb+srv://...
JWT_SECRET = your_secret_key
JWT_EXPIRE = 30d
NODE_ENV = production
PORT = (auto-assigned, don't set)
EMAIL_USER = (optional)
EMAIL_PASSWORD = (optional)
OVERDUE_THRESHOLD = 7
```

### For Vercel (Frontend):
```
VITE_API_URL = https://your-render-app.onrender.com/api
```

---

## Domain Setup (Optional)

### Connect Custom Domain to Render:
1. On Render dashboard, go to your service
2. Settings → Custom Domain
3. Add your domain (e.g., `app.yourdomain.com`)
4. Update DNS records as shown

### Connect Custom Domain to Vercel:
1. On Vercel dashboard, go to your project
2. Settings → Domains
3. Add your domain
4. Update DNS records as shown

---

## Troubleshooting

### Issue: "Failed to connect to MongoDB"
- **Solution**: Check `MONGODB_URI` in Render environment variables
- Ensure MongoDB Atlas has whitelisted Render's IP (0.0.0.0/0)

### Issue: "CORS error"
- **Solution**: Update CORS origins in `backend/server.js`
- Redeploy after changes

### Issue: "Module not found"
- **Solution**: Ensure all dependencies are in `package.json`
- Run `npm install` before committing

### Issue: "File upload not working"
- **Solution**: Use cloud storage (AWS S3, Cloudinary) instead of local `/uploads`
- Render's file system is ephemeral (files deleted on redeploy)

---

## Production Recommendations

1. **Use Cloud Storage**: 
   - Replace local `/uploads` with **Cloudinary** or **AWS S3**
   - Render deletes local files on each deployment

2. **Email Service**:
   - Use Gmail with App Password OR SendGrid API
   - Test emails after deployment

3. **Database Backups**:
   - Enable automatic backups in MongoDB Atlas
   - Monitor growth (free tier has 512MB limit)

4. **SSL/TLS**:
   - Both Render and Vercel provide free SSL certificates
   - Automatically renewed

5. **Performance Optimization**:
   - Enable caching headers
   - Use CDN for static assets
   - Monitor response times in Render dashboard

6. **Monitoring & Logs**:
   - Check Render logs for errors
   - Set up alerts for failures

---

## Quick Deploy Checklist

- [ ] Code pushed to GitHub
- [ ] MongoDB Atlas cluster created
- [ ] Render account created
- [ ] Environment variables configured
- [ ] CORS origins updated
- [ ] Procfile created
- [ ] `.env` in `.gitignore`
- [ ] Database seeded with demo data
- [ ] Email service configured (optional)
- [ ] Custom domain connected (optional)
- [ ] SSL certificate working
- [ ] Monitoring enabled
- [ ] Backup strategy in place

---

## Support & Resources

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **MongoDB Atlas**: https://docs.atlas.mongodb.com
- **Express CORS**: https://expressjs.com/en/resources/middleware/cors.html

