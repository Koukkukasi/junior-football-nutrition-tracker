# Render Environment Variables - Ready to Copy

## Backend Service Environment Variables

Copy and paste these exactly as shown into your Render backend service:

```
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://postgres:fev@7RLmVedM2rS@db.qlhkefgrafakbrcwquhv.supabase.co:5432/postgres
SUPABASE_URL=https://qlhkefgrafakbrcwquhv.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsaGtlZmdyYWZha2JyY3dxdWh2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjA5NTk4OCwiZXhwIjoyMDcxNjcxOTg4fQ.x-KyNMzD0uThpqKfsAqfxX0UmaiLvP2B23suoxQJiYM
FRONTEND_URL=https://junior-football-nutrition-client.onrender.com
```

## Frontend Service Environment Variables

Copy and paste these exactly as shown into your Render frontend service:

```
VITE_SUPABASE_URL=https://qlhkefgrafakbrcwquhv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsaGtlZmdyYWZha2JyY3dxdWh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgyNjcxNzgsImV4cCI6MjA1Mzg0MzE3OH0.Ri_pgYg40gvXyQl9O5itiBGT8hKRpOTFDCX2NpYJ9s4
VITE_API_URL=https://junior-football-nutrition-server.onrender.com
```

## ⚠️ IMPORTANT: Get Your Service Role Key

You still need to get the SERVICE_ROLE_KEY from Supabase:

1. Go to: https://supabase.com/dashboard/project/qlhkefgrafakbrcwquhv/settings/api
2. Find the "service_role" key (it's different from the anon key)
3. Copy it and replace `[YOU_NEED_TO_GET_THIS_FROM_SUPABASE_DASHBOARD]` above
4. Keep this key SECRET - never commit it to GitHub!

## How to Add These in Render

### For Backend Service:
1. Go to your backend service in Render dashboard
2. Click on "Environment" tab
3. Click "Add Environment Variable"
4. Add each variable one by one (key and value)
5. Click "Save Changes"

### For Frontend Service:
1. Go to your frontend service in Render dashboard  
2. Click on "Environment" tab
3. Click "Add Environment Variable"
4. Add each variable one by one (key and value)
5. Click "Save Changes"

## After Adding Environment Variables

1. The backend service will automatically redeploy
2. You may need to manually trigger a redeploy for the frontend
3. Wait for both services to be fully deployed (green status)
4. Test your application at the frontend URL

## Verify Everything Works

Once deployed, test:
1. Visit: https://junior-football-nutrition-client.onrender.com
2. Create a new account
3. Sign in
4. Check that the dashboard loads
5. Try creating a food entry

## Troubleshooting

If you get database connection errors:
- Double-check the DATABASE_URL password is correct: `fev@7RLmVedM2rS`
- Ensure there are no extra spaces in the environment variable
- Check Render logs for specific error messages

If you get CORS errors:
- Verify FRONTEND_URL matches your actual deployed frontend URL
- Check that backend is running (should show as "Live" in Render)
- Look at backend logs in Render dashboard