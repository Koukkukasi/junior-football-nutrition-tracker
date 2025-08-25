# Render Deployment Guide

## Prerequisites
1. GitHub account with repository
2. Render account (sign up at https://render.com)
3. Supabase project already configured

## Step 1: Push Code to GitHub

First, initialize git and push your code:

```bash
cd junior-football-nutrition-tracker
git init
git add .
git commit -m "Initial commit with Supabase authentication"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/junior-football-nutrition-tracker.git
git push -u origin main
```

## Step 2: Deploy to Render

### Option A: Using Render Blueprint (Recommended)

1. Go to https://dashboard.render.com/blueprints
2. Click "New Blueprint Instance"
3. Connect your GitHub repository
4. Select the repository and branch
5. Render will automatically detect the `render.yaml` file
6. Review the services and click "Apply"

### Option B: Manual Setup

#### Deploy the Client (Static Site)

1. Go to https://dashboard.render.com
2. Click "New +" → "Static Site"
3. Connect your GitHub repository
4. Configure:
   - **Name**: junior-football-nutrition-client
   - **Root Directory**: client
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: dist
5. Add Environment Variables:
   - `VITE_SUPABASE_URL`: Your Supabase URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Key
   - `VITE_API_URL`: (Will be added after server deployment)
6. Click "Create Static Site"

#### Deploy the Server (Web Service)

1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: junior-football-nutrition-server
   - **Root Directory**: server
   - **Environment**: Node
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npm start`
4. Add Environment Variables:
   - `NODE_ENV`: production
   - `PORT`: 3001
   - `DATABASE_URL`: Your Supabase database URL with password
   - `SUPABASE_URL`: Your Supabase URL
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase Service Role Key
   - `FRONTEND_URL`: (URL of your deployed client)
5. Click "Create Web Service"

## Step 3: Update Environment Variables

After both services are deployed:

1. **Update Client Environment**:
   - Go to client service settings
   - Update `VITE_API_URL` with your server URL (e.g., https://junior-football-nutrition-server.onrender.com)
   - Redeploy the client

2. **Update Server Environment**:
   - Go to server service settings
   - Update `FRONTEND_URL` with your client URL (e.g., https://junior-football-nutrition-client.onrender.com)
   - The server will auto-redeploy

## Step 4: Configure CORS

The server is already configured to accept requests from the `FRONTEND_URL` environment variable.

## Step 5: Test Your Deployment

1. Visit your client URL
2. Try signing up with a new account
3. Sign in and test the dashboard
4. Check that all features work correctly

## Environment Variables Summary

### Client (.env for local / Environment Variables in Render)
```
VITE_SUPABASE_URL=https://qlhkefgrafakbrcwquhv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_API_URL=https://your-server.onrender.com
```

### Server (.env for local / Environment Variables in Render)
```
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.qlhkefgrafakbrcwquhv.supabase.co:5432/postgres
SUPABASE_URL=https://qlhkefgrafakbrcwquhv.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
FRONTEND_URL=https://your-client.onrender.com
```

## Troubleshooting

### Build Failures
- Check the build logs in Render dashboard
- Ensure all dependencies are in `package.json` (not devDependencies for production deps)
- Verify Node version compatibility

### CORS Issues
- Ensure `FRONTEND_URL` is correctly set in server environment
- Check that the URL includes the protocol (https://)
- No trailing slash in URLs

### Database Connection
- Verify `DATABASE_URL` includes the correct password
- Check Supabase dashboard for connection pooling settings
- Ensure database is accessible from Render servers

### Authentication Issues
- Verify all Supabase keys are correctly set
- Check Supabase dashboard for any auth configuration issues
- Ensure email confirmation is configured as needed

## Monitoring

1. **Render Dashboard**: Monitor service health, logs, and metrics
2. **Supabase Dashboard**: Monitor database usage and auth events
3. **Application Logs**: Check server logs for any errors

## Automatic Deployments

Render automatically deploys when you push to your connected GitHub branch:
- Push to main branch → Production deployment
- Create PR → Preview deployment (if enabled)

## Cost Considerations

- **Render Free Tier**: 
  - Static sites: Free with 100GB bandwidth
  - Web services: Free but spin down after 15 minutes of inactivity
- **Render Paid**: 
  - $7/month per service for always-on
  - Better performance and no cold starts
- **Supabase Free Tier**: 
  - 500MB database
  - 50,000 monthly active users
  - 2GB bandwidth

## Next Steps

1. Set up custom domain (optional)
2. Configure monitoring and alerts
3. Set up CI/CD pipeline
4. Add error tracking (e.g., Sentry)
5. Configure backup strategy