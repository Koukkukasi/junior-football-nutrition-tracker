/**
 * Direct Supabase API integration for data persistence
 * This bypasses the backend server and directly interacts with Supabase
 */

import { supabase } from './supabase';

interface FoodEntry {
  id?: string;
  user_id?: string;
  description: string;
  meal_type?: string;
  mealType?: string;  // Support both naming conventions
  quality_score?: number;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  time?: string;
  location?: string;
  notes?: string;
  created_at?: string;
}

interface PerformanceEntry {
  id?: string;
  user_id?: string;
  date: string;
  energy_level: number;
  sleep_hours: number;
  training_intensity?: number;
  match_performance?: number;
  notes?: string;
}

export const supabaseAPI = {
  // Food entries
  food: {
    // Get all food entries for current user
    async getEntries() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('food_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data };
    },

    // Create new food entry
    async create(entry: FoodEntry) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Calculate quality score based on description
      const { analyzeFoodQuality } = await import('./food-database');
      const analysis = analyzeFoodQuality(entry.description);
      
      // Map quality to score (0-100)
      const qualityScores = {
        excellent: 90,
        good: 70,
        fair: 50,
        poor: 30
      };

      const { data, error } = await supabase
        .from('food_entries')
        .insert({
          user_id: user.id,
          description: entry.description,
          meal_type: entry.meal_type || entry.mealType,
          quality_score: qualityScores[analysis.quality],
          calories: entry.calories,
          protein: entry.protein,
          carbs: entry.carbs,
          fat: entry.fat,
          time: entry.time,
          location: entry.location,
          notes: entry.notes
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase food.create error:', error);
        throw error;
      }
      return { success: true, data };
    },

    // Update food entry
    async update(id: string, updates: Partial<FoodEntry>) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('food_entries')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    },

    // Delete food entry
    async delete(id: string) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('food_entries')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      return { success: true };
    }
  },

  // Performance entries
  performance: {
    // Get all performance entries
    async getEntries() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('performance_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      return { success: true, data };
    },

    // Create or update performance entry for a date
    async upsert(entry: PerformanceEntry) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('performance_entries')
        .upsert({
          user_id: user.id,
          date: entry.date,
          energy_level: entry.energy_level,
          sleep_hours: entry.sleep_hours,
          training_intensity: entry.training_intensity,
          match_performance: entry.match_performance,
          notes: entry.notes
        }, {
          onConflict: 'user_id,date'
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    },

    // Get performance entry for specific date
    async getByDate(date: string) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('performance_entries')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', date)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows found
      return { success: true, data };
    }
  },

  // Profile management
  profile: {
    // Get current user profile
    async get() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return { success: true, data };
    },

    // Update user profile
    async update(updates: any) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    }
  },

  // User stats and gamification
  userStats: {
    // Get or create user stats
    async get() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // First try to get existing stats
      let { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // If no stats exist, create them
      if (error && error.code === 'PGRST116') {
        const { data: newStats, error: createError } = await supabase
          .from('user_stats')
          .insert({
            user_id: user.id,
            total_xp: 0,
            current_streak: 0,
            longest_streak: 0,
            total_meals_logged: 0,
            perfect_days: 0,
            last_login: new Date().toISOString()
          })
          .select()
          .single();

        if (createError) throw createError;
        return { success: true, data: newStats };
      }

      if (error) throw error;
      return { success: true, data };
    },

    // Update XP and stats
    async addXP(xpToAdd: number, mealLogged: boolean = false, isPerfectDay: boolean = false) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get current stats
      const { data: currentStats } = await this.get();
      
      const updates: any = {
        total_xp: (currentStats.total_xp || 0) + xpToAdd,
        last_activity: new Date().toISOString()
      };

      if (mealLogged) {
        updates.total_meals_logged = (currentStats.total_meals_logged || 0) + 1;
      }

      if (isPerfectDay) {
        updates.perfect_days = (currentStats.perfect_days || 0) + 1;
      }

      const { data, error } = await supabase
        .from('user_stats')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    },

    // Update streak
    async updateStreak() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: currentStats } = await this.get();
      
      // Check if user logged food today
      const today = new Date().toDateString();
      const lastActivity = currentStats.last_activity ? new Date(currentStats.last_activity).toDateString() : null;
      
      let newStreak = currentStats.current_streak || 0;
      
      if (lastActivity !== today) {
        // Check if it's consecutive day
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastActivity === yesterday.toDateString()) {
          newStreak += 1;
        } else {
          newStreak = 1; // Reset streak
        }
      }

      const updates: any = {
        current_streak: newStreak,
        last_activity: new Date().toISOString()
      };

      // Update longest streak if needed
      if (newStreak > (currentStats.longest_streak || 0)) {
        updates.longest_streak = newStreak;
      }

      const { data, error } = await supabase
        .from('user_stats')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    }
  },

  // Analytics data
  analytics: {
    // Get analytics data for the current user
    async getData(days: number = 7) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get food entries
      const { data: foodEntries, error: foodError } = await supabase
        .from('food_entries')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (foodError) throw foodError;

      // Get performance entries
      const { data: performanceEntries, error: perfError } = await supabase
        .from('performance_entries')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: false });

      if (perfError) throw perfError;

      return { 
        success: true, 
        data: {
          foodEntries: foodEntries || [],
          performanceEntries: performanceEntries || []
        }
      };
    }
  }
};