# Quick Supabase Setup - You're Already In!

Since you're already in your Supabase dashboard, here's what to do:

## 1️⃣ Create Your Project (2 minutes)

Click **"New Project"** and use these settings:
```
Project name: junior-football-nutrition
Database Password: [Click Generate or create your own - SAVE THIS!]
Region: Select closest to you
```
Click **"Create new project"** and wait 2-3 minutes.

## 2️⃣ While Waiting, Let's Test Your Local Setup

Open a terminal and run:
```bash
cd junior-football-nutrition-tracker/client
npm run dev
```

You'll see an error about missing Supabase variables - that's expected!

## 3️⃣ Once Project is Ready, Get Your Keys

Your project URL will be something like:
`https://xhmlxbeqnbkeebwbdvvc.supabase.co`

1. Go to **Settings** → **API**
2. Copy these two values:
   - **Project URL**: `https://[your-ref].supabase.co`
   - **anon public key**: `eyJ...` (long string)

## 4️⃣ Update Your Environment File

I'll update it for you once you give me the values, or you can edit:
`client/.env.local`

## 5️⃣ Run Database Setup

1. Click **SQL Editor** in sidebar
2. Click **New query**
3. Copy ALL content from: `supabase/schema.sql`
4. Paste and click **RUN**

That's it! Your org ID is: `xhmlxbeqnbkeebwbdvvc`

Let me know when your project is created and I'll help you with the next steps!