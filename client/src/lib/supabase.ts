import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: window.localStorage,
  },
})

// Database types
export interface Profile {
  id: string
  email: string
  full_name?: string
  age?: number
  position?: string
  team?: string
  role: 'PLAYER' | 'COACH' | 'PARENT' | 'ADMIN'
  created_at: string
  updated_at: string
}

export interface FoodEntry {
  id: string
  user_id: string
  description: string
  meal_type: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK' | 'PRE_GAME' | 'POST_GAME'
  calories?: number
  protein?: number
  carbs?: number
  fat?: number
  quality_score: number
  created_at: string
}

export interface PerformanceEntry {
  id: string
  user_id: string
  date: string
  energy_level: number
  sleep_hours: number
  training_intensity?: number
  match_performance?: number
  notes?: string
  created_at: string
}