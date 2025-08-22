# Public Access & Deployment Guide for Test Team

## 🎯 Goal: Make Your App Accessible to Test Team Members

This guide covers multiple options for sharing your Junior Football Nutrition Tracker with test team members on their phones.

---

## Option 1: Ngrok (Immediate Testing - 5 Minutes)

### What is Ngrok?
Ngrok creates a secure public tunnel to your local development server. Perfect for quick testing sessions.

### Setup Steps:

#### 1. Install Ngrok
```bash
# Option A: Download from https://ngrok.com/download
# Option B: Install via npm
npm install -g ngrok

# Option C: Install via chocolatey (Windows)
choco install ngrok
```

#### 2. Create Free Account
- Go to https://ngrok.com/signup
- Sign up for free account
- Get your auth token from dashboard

#### 3. Configure Ngrok
```bash
# Add your auth token
ngrok config add-authtoken YOUR_AUTH_TOKEN
```

#### 4. Start Your Local Servers
```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend  
cd client
npm run dev
```

#### 5. Create Public Tunnel
```bash
# Terminal 3: Create tunnel to frontend (port 5176)
ngrok http 5176

# You'll get output like:
# Forwarding: https://abc123xyz.ngrok-free.app -> http://localhost:5176
```

#### 6. Update Backend URL in Frontend
Create `.env.local` in client folder:
```env
VITE_API_URL=http://localhost:3001
```

#### 7. Share with Team
Send this to your test team:
```
🎯 Test App URL: https://abc123xyz.ngrok-free.app

📱 Test Account:
Email: ilmivalta@gmail.com
Password: TestPass123!

Or use invitation link:
https://abc123xyz.ngrok-free.app/sign-up?invite=test2024&email=your-email@gmail.com
```

### Ngrok Limitations (Free Tier):
- URL changes each restart
- 8-hour session limit
- 40 connections/minute
- Shows ngrok warning page (users must click "Visit Site")

---

## Option 2: Vercel + Render Deployment (Recommended - 30 Minutes)

### Overview
- **Frontend**: Vercel (instant deploys, great DX)
- **Backend**: Render.com (free tier, auto-deploy)
- **Database**: Neon.tech or Supabase (PostgreSQL)

### Part A: Database Setup (Neon.tech)

#### 1. Create Neon Account
- Go to https://neon.tech
- Sign up with GitHub
- Create new project "nutrition-tracker"

#### 2. Get Database URL
```
postgresql://username:password@host/database?sslmode=require
```

#### 3. Update Prisma Schema
Already configured in your `server/prisma/schema.prisma`

### Part B: Backend Deployment (Render)

#### 1. Prepare Backend for Deployment

Create `server/render.yaml`:
```yaml
services:
  - type: web
    name: nutrition-tracker-api
    runtime: node
    buildCommand: npm install && npx prisma generate && npx prisma migrate deploy
    startCommand: npm start
    envVars:
      - key: DATABASE_URL
        sync: false
      - key: CLERK_SECRET_KEY
        sync: false
      - key: FRONTEND_URL
        sync: false
      - key: NODE_ENV
        value: production
```

Update `server/package.json`:
```json
{
  "scripts": {
    "start": "node dist/server.js",
    "build": "tsc",
    "postinstall": "npx prisma generate"
  }
}
```

Create `server/src/server.ts` if not exists:
```typescript
import app from './app';

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

#### 2. Deploy to Render

1. Push code to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_GITHUB_REPO
git push -u origin main
```

2. Go to https://render.com
3. Connect GitHub account
4. New → Web Service
5. Select your repository
6. Configure:
   - Name: `nutrition-tracker-api`
   - Root Directory: `server`
   - Build Command: `npm install && npx prisma generate && npx prisma migrate deploy`
   - Start Command: `npm start`

7. Add Environment Variables:
   - `DATABASE_URL`: Your Neon PostgreSQL URL
   - `CLERK_SECRET_KEY`: From Clerk Dashboard
   - `FRONTEND_URL`: Will add after Vercel deploy
   - `NODE_ENV`: production

8. Click "Create Web Service"

Your backend URL will be: `https://nutrition-tracker-api.onrender.com`

### Part C: Frontend Deployment (Vercel)

#### 1. Prepare Frontend

Create `client/vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

Update `client/.env.production`:
```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key
VITE_API_URL=https://nutrition-tracker-api.onrender.com
```

#### 2. Deploy to Vercel

**Option A: Via CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# In client directory
cd client
vercel

# Follow prompts:
# - Link to existing project? No
# - What's your project name? nutrition-tracker
# - In which directory? ./
# - Override settings? No
```

**Option B: Via GitHub Integration**
1. Go to https://vercel.com
2. Sign in with GitHub
3. Import Project → Select your repo
4. Configure:
   - Framework Preset: Vite
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Output Directory: `dist`

5. Add Environment Variables:
   - `VITE_CLERK_PUBLISHABLE_KEY`
   - `VITE_API_URL`: Your Render backend URL

6. Click "Deploy"

Your frontend URL will be: `https://nutrition-tracker.vercel.app`

#### 3. Update Backend CORS

Go back to Render dashboard and update `FRONTEND_URL`:
```
FRONTEND_URL=https://nutrition-tracker.vercel.app
```

### Part D: Final Configuration

#### 1. Update Clerk Settings
- Go to Clerk Dashboard
- Add production URLs to allowed origins:
  - `https://nutrition-tracker.vercel.app`
  - `https://nutrition-tracker-api.onrender.com`

#### 2. Run Database Migrations
```bash
# Locally with production database
cd server
DATABASE_URL="your-neon-url" npx prisma migrate deploy
```

---

## Option 3: All-in-One Deployment (Railway)

### Simpler Alternative - Railway.app

1. Go to https://railway.app
2. Login with GitHub
3. New Project → Deploy from GitHub Repo
4. Railway automatically:
   - Detects monorepo structure
   - Creates services for frontend/backend
   - Provisions PostgreSQL
   - Configures environment variables

5. Add environment variables in Railway dashboard
6. Get public URLs for both services

**Pros**: Easier setup, everything in one place
**Cons**: Limited free tier ($5 credit/month)

---

## 📱 Creating Test Team Invitations

### After Deployment:

#### 1. Generate Invitation Links

Create `scripts/generate-invites.js`:
```javascript
const baseUrl = 'https://nutrition-tracker.vercel.app';
const testUsers = [
  'player1@test.com',
  'player2@test.com',
  'player3@test.com'
];

testUsers.forEach(email => {
  const inviteCode = Math.random().toString(36).substring(7);
  const inviteUrl = `${baseUrl}/sign-up?invite=${inviteCode}&email=${encodeURIComponent(email)}&role=PLAYER&team=TEST-TEAM-2024`;
  
  console.log(`
📧 ${email}
🔗 ${inviteUrl}
  `);
});
```

#### 2. Share with Team

Create a message template:
```
🎯 Junior Football Nutrition Tracker - Beta Testing

Hi [Name]!

You're invited to test our new nutrition tracking app designed for junior football players.

📱 Your personal invitation link:
[INVITATION_URL]

✅ Getting Started:
1. Click your invitation link
2. Create your password
3. Complete the quick setup (4 steps)
4. Start tracking your meals!

💡 What to Test:
- Log your daily meals
- Check nutrition scores
- Track performance metrics
- Use the feedback widget (bottom-right)

🐛 Found a bug or have feedback?
Use the in-app feedback button!

Thanks for helping us build something great!

The Development Team
```

---

## 🚀 Quick Deployment Checklist

### Pre-Deployment:
- [ ] Code committed to GitHub
- [ ] Environment variables documented
- [ ] Database schema finalized
- [ ] Authentication configured (Clerk)

### Deployment Steps:
- [ ] Set up database (Neon/Supabase)
- [ ] Deploy backend (Render)
- [ ] Deploy frontend (Vercel)
- [ ] Configure CORS
- [ ] Update environment variables
- [ ] Test deployment

### Post-Deployment:
- [ ] Generate test user invitations
- [ ] Create testing instructions
- [ ] Share with team
- [ ] Monitor feedback

---

## 🔧 Troubleshooting

### Common Issues:

#### 1. CORS Errors
- Ensure backend CORS includes frontend URL
- Check if credentials: true is set
- Verify API URL in frontend env

#### 2. Database Connection
- Check DATABASE_URL format
- Ensure SSL is required: `?sslmode=require`
- Run migrations: `npx prisma migrate deploy`

#### 3. Authentication Issues
- Verify Clerk keys (public vs secret)
- Check allowed origins in Clerk dashboard
- Ensure tokens are passed in headers

#### 4. Build Failures
- Check Node version compatibility
- Ensure all dependencies are in package.json
- Verify build commands in deployment config

---

## 📞 Support Resources

### Documentation:
- Vercel Docs: https://vercel.com/docs
- Render Docs: https://render.com/docs
- Railway Docs: https://docs.railway.app
- Ngrok Docs: https://ngrok.com/docs

### Free Tier Limits:
- **Vercel**: Unlimited deployments, 100GB bandwidth
- **Render**: 750 hours/month, auto-sleep after 15 min
- **Neon**: 0.5GB storage, 1 compute hour/day
- **Railway**: $5 credit/month
- **Ngrok**: 1 online ngrok process, 40 connections/minute

---

## 📋 Next Steps

1. **For Immediate Testing**: Use Ngrok (Option 1)
2. **For Team Testing**: Deploy to Vercel + Render (Option 2)
3. **For Simplicity**: Use Railway (Option 3)

### Recommended Approach:
1. Start with Ngrok for quick validation
2. Set up Vercel + Render for ongoing testing
3. Gather feedback and iterate
4. Consider paid tiers for production

---

## 📝 Team Testing Template

Once deployed, create a testing document:

```markdown
# Nutrition Tracker - Beta Testing Guide

## Access Information
- **App URL**: https://your-app.vercel.app
- **Your Invitation**: [Personal invitation link]
- **Test Period**: [Start date] - [End date]

## Test Scenarios
1. Sign up with invitation link
2. Complete onboarding wizard
3. Log breakfast, lunch, dinner
4. Check nutrition scores
5. View weekly analytics
6. Test on mobile and desktop
7. Try offline mode

## Feedback Needed
- UI/UX issues
- Performance problems
- Feature requests
- Bug reports
- General impressions

## How to Report
- Use in-app feedback widget
- Or email: your-email@gmail.com
- Include screenshots if possible

Thank you for testing!
```

---

Remember: Start simple with Ngrok, then move to proper deployment when ready for sustained team testing!