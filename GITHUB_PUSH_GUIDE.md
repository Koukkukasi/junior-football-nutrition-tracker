# GitHub Push and Render Deployment Guide

## Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Create a new repository:
   - **Repository name**: `junior-football-nutrition-tracker`
   - **Description**: "Nutrition and performance tracking for junior football players"
   - **Visibility**: Choose Public or Private
   - **DO NOT** initialize with README, .gitignore, or license (we already have files)
   - Click "Create repository"

## Step 2: Push Code to GitHub

After creating the repository, GitHub will show you commands. Use these in your terminal:

```bash
# Navigate to project directory
cd C:\Users\ilmiv\junior-football-nutrition-tracker

# Add GitHub remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/junior-football-nutrition-tracker.git

# Push to GitHub
git branch -M main
git push -u origin main
```

If you're using GitHub with authentication, you may need to:
1. Enter your GitHub username
2. For password, use a Personal Access Token (not your GitHub password)
   - Create token at: https://github.com/settings/tokens/new
   - Select scopes: `repo` (full control of private repositories)

## Step 3: Deploy to Render

### Option A: Using Render Blueprint (Easiest)

1. Go to https://dashboard.render.com/blueprints
2. Click "New Blueprint Instance"
3. Connect your GitHub account if not already connected
4. Select your `junior-football-nutrition-tracker` repository
5. Render will detect the `render.yaml` file automatically
6. Click "Apply" to create both services

### Option B: Manual Service Creation

#### Deploy Backend First:

1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect GitHub and select your repository
4. Configure:
   - **Name**: `junior-football-nutrition-server`
   - **Root Directory**: `server`
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npm start`
5. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=3001
   DATABASE_URL=postgresql://postgres:[YOUR_SUPABASE_PASSWORD]@db.qlhkefgrafakbrcwquhv.supabase.co:5432/postgres
   SUPABASE_URL=https://qlhkefgrafakbrcwquhv.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=[YOUR_SERVICE_ROLE_KEY]
   FRONTEND_URL=https://junior-football-nutrition-client.onrender.com
   ```
6. Click "Create Web Service"

#### Deploy Frontend:

1. Click "New +" → "Static Site"
2. Select your repository again
3. Configure:
   - **Name**: `junior-football-nutrition-client`
   - **Root Directory**: `client`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Add Environment Variables:
   ```
   VITE_SUPABASE_URL=https://qlhkefgrafakbrcwquhv.supabase.co
   VITE_SUPABASE_ANON_KEY=[YOUR_ANON_KEY]
   VITE_API_URL=https://junior-football-nutrition-server.onrender.com
   ```
5. Click "Create Static Site"

## Step 4: Update Environment Variables

After both services are deployed:

1. Note your actual service URLs from Render dashboard
2. Update the Backend service:
   - Go to Environment tab
   - Update `FRONTEND_URL` with your actual frontend URL
   - Save changes (service will auto-redeploy)
3. Update the Frontend service:
   - Go to Environment tab
   - Update `VITE_API_URL` with your actual backend URL
   - Save and manually redeploy

## Step 5: Get Your Supabase Keys

You need these keys for the environment variables:

### Database Password:
1. Go to https://supabase.com/dashboard/project/qlhkefgrafakbrcwquhv/settings/database
2. Find your database password (you set this when creating the project)

### Anon Key:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsaGtlZmdyYWZha2JyY3dxdWh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgyNjcxNzgsImV4cCI6MjA1Mzg0MzE3OH0.Ri_pgYg40gvXyQl9O5itiBGT8hKRpOTFDCX2NpYJ9s4
```

### Service Role Key:
1. Go to https://supabase.com/dashboard/project/qlhkefgrafakbrcwquhv/settings/api
2. Copy the "service_role" key (keep this secret!)

## Step 6: Verify Deployment

Once deployed, test your application:

1. Visit your frontend URL: `https://junior-football-nutrition-client.onrender.com`
2. Try creating a new account
3. Sign in and test the dashboard
4. Check that API calls work correctly

## Troubleshooting

### If GitHub push fails:
```bash
# Check remote
git remote -v

# If you need to change the remote
git remote set-url origin https://github.com/YOUR_USERNAME/junior-football-nutrition-tracker.git
```

### If Render build fails:
- Check the Logs tab in Render dashboard
- Ensure all environment variables are set correctly
- Verify Node version compatibility (should be 18+)

### If CORS errors occur:
- Verify `FRONTEND_URL` in backend matches your actual frontend URL
- Check that URLs don't have trailing slashes
- Ensure the backend is actually running (check Render dashboard)

## Quick Commands Reference

```bash
# Check git status
git status

# See what will be pushed
git log --oneline -5

# Push any new changes
git add .
git commit -m "Your commit message"
git push

# Force push if needed (careful!)
git push -f origin main
```

## Next Steps

After successful deployment:
1. Set up a custom domain (optional)
2. Enable auto-deploy on Render for continuous deployment
3. Set up monitoring and alerts
4. Configure backup strategy for database

## Support

- Render Documentation: https://render.com/docs
- Supabase Documentation: https://supabase.com/docs
- GitHub Documentation: https://docs.github.com