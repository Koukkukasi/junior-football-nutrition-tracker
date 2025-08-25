# Supabase Setup - Step by Step Guide

## 📋 Quick Setup Checklist

Follow these steps in order to set up your Supabase project:

## Step 1: Create Supabase Account

1. **Open your browser** and go to: https://supabase.com
2. **Click** "Start your project" (green button)
3. **Sign up** with:
   - GitHub (recommended) OR
   - Email and password

## Step 2: Create New Project

1. **Click** "New Project" button
2. **Fill in the details:**
   ```
   Project name: junior-football-nutrition
   Database Password: [Generate a strong password - SAVE THIS!]
   Region: [Choose closest to you, e.g., "North Virginia (us-east-1)"]
   Pricing Plan: Free (default)
   ```
3. **Click** "Create new project"
4. **Wait** 2-3 minutes for project to be created (you'll see a loading screen)

## Step 3: Get Your API Keys

Once your project is ready:

1. **Go to** Settings (gear icon in left sidebar)
2. **Click** "API" in the settings menu
3. **Copy these values:**

   ### Project URL
   ```
   Look for: "Project URL"
   Example: https://abcdefghijk.supabase.co
   Copy this entire URL
   ```

   ### Anon/Public Key
   ```
   Look for: "anon public" key
   Example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   Copy this entire long string
   ```

## Step 4: Update Your Environment File

1. **Open** the file: `client/.env.local`
2. **Replace** the placeholder values:

```env
# Replace these with your actual values from Step 3
VITE_SUPABASE_URL=https://abcdefghijk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZi...
VITE_API_URL=http://localhost:3001
```

## Step 5: Set Up Database Tables

1. **In Supabase Dashboard**, click "SQL Editor" (left sidebar)
2. **Click** "New query" button
3. **Copy** the ENTIRE contents of the file: `supabase/schema.sql`
4. **Paste** it into the SQL editor
5. **Click** "Run" button (or press F5)
6. **Wait** for success message (should see green checkmark)

## Step 6: Verify Setup

Check that everything was created:

1. **Go to** "Table Editor" in left sidebar
2. **You should see** these tables:
   - `profiles`
   - `food_entries`
   - `performance_entries`

3. **Go to** "Authentication" → "Policies"
4. **You should see** RLS policies for each table

## Step 7: Enable Email Auth (Optional but Recommended)

1. **Go to** "Authentication" → "Providers"
2. **Email** should be enabled by default
3. **Optional:** Enable social providers (Google, GitHub, etc.)

## Step 8: Get Database Connection String (for Backend)

1. **Go to** Settings → Database
2. **Find** "Connection string" section
3. **Copy** the URI (starts with `postgresql://`)
4. **Create** `server/.env` file:

```env
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
NODE_ENV=development
PORT=3001
```

Replace `[YOUR-PASSWORD]` with the database password you created in Step 2
Replace `[YOUR-PROJECT-REF]` with your project reference (the part before .supabase.co)

## 🎯 Quick Copy-Paste Commands

After setup, test your application:

```bash
# Terminal 1 - Start Backend
cd server
npm install
npx prisma generate
npx prisma db push
npm run dev

# Terminal 2 - Start Frontend
cd client
npm install
npm run dev
```

## ✅ Success Checklist

- [ ] Supabase account created
- [ ] Project "junior-football-nutrition" created
- [ ] Project URL copied to `.env.local`
- [ ] Anon key copied to `.env.local`
- [ ] Database schema executed successfully
- [ ] Tables visible in Table Editor
- [ ] Backend `.env` configured with database URL

## 🚀 What's Next?

Once everything above is complete:

1. **Test locally** - Run both frontend and backend
2. **Create a test account** - Sign up through your app
3. **Verify in Supabase** - Check Authentication → Users to see your test user
4. **Ready for deployment** - Move on to Render deployment

## 🆘 Troubleshooting

### "Missing Supabase environment variables" error
- Double-check `.env.local` file exists in `client` folder
- Ensure no typos in variable names
- Restart dev server after changing .env file

### Database connection issues
- Verify DATABASE_URL has correct password
- Check project is active in Supabase dashboard
- Ensure you're using the right project reference

### Tables not created
- Make sure you ran the ENTIRE schema.sql file
- Check for any error messages in SQL editor
- Try running the schema in smaller chunks if needed

## 📝 Important URLs

After setup, bookmark these:
- **Your Supabase Dashboard**: https://app.supabase.com/project/[your-project-ref]
- **Your App (local)**: http://localhost:5173
- **Your API (local)**: http://localhost:3001

---

**Time Estimate**: 5-10 minutes total
**Difficulty**: Easy - just copy and paste!

Need help? The hardest part is just waiting for the project to create. Everything else is copy-paste!