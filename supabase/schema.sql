-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  age INTEGER CHECK (age >= 10 AND age <= 25),
  position TEXT,
  team TEXT,
  role TEXT DEFAULT 'PLAYER' CHECK (role IN ('PLAYER', 'COACH', 'PARENT', 'ADMIN')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create food_entries table
CREATE TABLE food_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('BREAKFAST', 'LUNCH', 'DINNER', 'SNACK', 'PRE_GAME', 'POST_GAME')),
  calories INTEGER,
  protein DECIMAL(10,2),
  carbs DECIMAL(10,2),
  fat DECIMAL(10,2),
  quality_score INTEGER NOT NULL CHECK (quality_score >= 0 AND quality_score <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create performance_entries table
CREATE TABLE performance_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  energy_level INTEGER NOT NULL CHECK (energy_level >= 1 AND energy_level <= 10),
  sleep_hours DECIMAL(3,1) CHECK (sleep_hours >= 0 AND sleep_hours <= 24),
  training_intensity INTEGER CHECK (training_intensity >= 1 AND training_intensity <= 10),
  match_performance INTEGER CHECK (match_performance >= 1 AND match_performance <= 10),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Create indexes for better performance
CREATE INDEX idx_food_entries_user_id ON food_entries(user_id);
CREATE INDEX idx_food_entries_created_at ON food_entries(created_at DESC);
CREATE INDEX idx_performance_entries_user_id ON performance_entries(user_id);
CREATE INDEX idx_performance_entries_date ON performance_entries(date DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_entries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create RLS policies for food_entries
CREATE POLICY "Users can view own food entries" ON food_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own food entries" ON food_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own food entries" ON food_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own food entries" ON food_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for performance_entries
CREATE POLICY "Users can view own performance entries" ON performance_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own performance entries" ON performance_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own performance entries" ON performance_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own performance entries" ON performance_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to handle profile creation on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic profile creation
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating updated_at on profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();