# Database Password Setup

## Important: Update Your Database Password

The server/.env file needs the database password that was created when you set up your Supabase project.

### Steps to Configure:

1. **Find your database password:**
   - This was the password you created when setting up the Supabase project
   - If you forgot it, you can reset it in the Supabase dashboard:
     - Go to Settings > Database
     - Click "Reset database password"
     - Save the new password securely

2. **Update the server/.env file:**
   - Open `server/.env`
   - Replace `YOUR_DATABASE_PASSWORD` in the DATABASE_URL with your actual password
   - The URL format should be:
     ```
     DATABASE_URL="postgresql://postgres:[YOUR_PASSWORD]@db.qlhkefgrafakbrcwquhv.supabase.co:5432/postgres"
     ```

3. **Keep your password secure:**
   - Never commit the .env file with real passwords to git
   - Store passwords securely in a password manager
   - Use environment variables in production

## Note:
The server-side database connection is only needed if you're using server-side operations. The client-side authentication through Supabase SDK is already working with the configured API keys.