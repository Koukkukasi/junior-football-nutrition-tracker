# Supabase Setup Guide for Production

## Important: Authentication Required
The food log functionality requires users to be authenticated. Make sure you:
1. Sign up/Sign in through the app's authentication flow
2. Complete the onboarding process

## Database Tables Setup

Run these SQL commands in your Supabase SQL editor:

### 1. Create food_entries table
```sql
CREATE TABLE IF NOT EXISTS food_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  meal_type TEXT,
  quality_score INTEGER,
  calories INTEGER,
  protein DECIMAL,
  carbs DECIMAL,
  fat DECIMAL,
  time TEXT,
  location TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create index for user_id for faster queries
CREATE INDEX idx_food_entries_user_id ON food_entries(user_id);
CREATE INDEX idx_food_entries_created_at ON food_entries(created_at DESC);

-- Enable Row Level Security
ALTER TABLE food_entries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own food entries" ON food_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own food entries" ON food_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own food entries" ON food_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own food entries" ON food_entries
  FOR DELETE USING (auth.uid() = user_id);
```

### 2. Create performance_entries table
```sql
CREATE TABLE IF NOT EXISTS performance_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  energy_level INTEGER,
  sleep_hours DECIMAL,
  training_intensity INTEGER,
  match_performance INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(user_id, date)
);

-- Create indexes
CREATE INDEX idx_performance_entries_user_id ON performance_entries(user_id);
CREATE INDEX idx_performance_entries_date ON performance_entries(date DESC);

-- Enable Row Level Security
ALTER TABLE performance_entries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own performance entries" ON performance_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own performance entries" ON performance_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own performance entries" ON performance_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own performance entries" ON performance_entries
  FOR DELETE USING (auth.uid() = user_id);
```

### 3. Create profiles table
```sql
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  age INTEGER,
  age_group TEXT,
  position TEXT,
  team_id TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create trigger to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 4. Create user_stats table (for gamification)
```sql
CREATE TABLE IF NOT EXISTS user_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_xp INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  total_meals_logged INTEGER DEFAULT 0,
  perfect_days INTEGER DEFAULT 0,
  last_login TIMESTAMP WITH TIME ZONE,
  last_activity TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(user_id)
);

-- Create index
CREATE INDEX idx_user_stats_user_id ON user_stats(user_id);

-- Enable Row Level Security
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own stats" ON user_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own stats" ON user_stats
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stats" ON user_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

## How to Apply These Changes

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Navigate to the SQL Editor (usually in the left sidebar)
4. Copy and paste each SQL block above
5. Run each block one by one
6. Verify tables are created in the Table Editor

## Testing the Setup

After creating the tables:

1. Sign up/Sign in to the app
2. Try creating a food entry
3. Check the browser console for any errors
4. If you see authentication errors, make sure you're signed in
5. If you see database errors, verify the tables were created correctly

## Troubleshooting

### "User not authenticated" Error
- Make sure you're signed in to the app
- Check that Supabase authentication is properly configured
- Verify your Supabase project URL and keys are correct

### "Relation does not exist" Error
- The tables haven't been created yet
- Run the SQL commands above in your Supabase dashboard

### "Permission denied" Error
- Row Level Security policies might not be set up
- Make sure all the CREATE POLICY commands ran successfully

## Environment Variables Needed

Make sure these are set in your deployment:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

These should be available from your Supabase project settings under API section.