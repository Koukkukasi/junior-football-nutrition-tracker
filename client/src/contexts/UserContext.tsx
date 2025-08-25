import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useSupabaseAuth } from './SupabaseAuthContext';
import { supabase } from '../lib/supabase';

interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  age: number;
  ageGroup: '10-12' | '13-15' | '16-18' | '19-25';
  role: 'PLAYER' | 'COACH' | 'ADMIN';
  teamId?: string;
  preferences: {
    measurementUnit: 'metric' | 'imperial';
    language: 'en' | 'fi';
    notifications: boolean;
  };
}

interface NutritionRequirements {
  caloriesPerDay: number;
  proteinGramsPerKg: number;
  carbsPercentage: number;
  fatsPercentage: number;
  hydrationLiters: number;
  focus: string;
}

interface UserContextType {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile) => void;
  updateAge: (age: number) => void;
  getNutritionRequirements: () => NutritionRequirements;
  getAgeSpecificMultiplier: () => number;
  isLoading: boolean;
  loading: boolean; // Add loading for compatibility
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Age-specific nutrition requirements
const ageGroupRequirements: Record<string, NutritionRequirements> = {
  '10-12': {
    caloriesPerDay: 2000,
    proteinGramsPerKg: 1.0,
    carbsPercentage: 55,
    fatsPercentage: 30,
    hydrationLiters: 1.5,
    focus: 'Growth and development, adequate calcium and iron for bone health'
  },
  '13-15': {
    caloriesPerDay: 2400,
    proteinGramsPerKg: 1.2,
    carbsPercentage: 55,
    fatsPercentage: 30,
    hydrationLiters: 2.0,
    focus: 'Increased energy needs, muscle development during growth spurts'
  },
  '16-18': {
    caloriesPerDay: 2800,
    proteinGramsPerKg: 1.4,
    carbsPercentage: 60,
    fatsPercentage: 25,
    hydrationLiters: 2.5,
    focus: 'Peak performance, muscle recovery, competition preparation'
  },
  '19-25': {
    caloriesPerDay: 3000,
    proteinGramsPerKg: 1.6,
    carbsPercentage: 60,
    fatsPercentage: 25,
    hydrationLiters: 3.0,
    focus: 'Maintenance and optimization, professional development'
  }
};

export function UserProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useSupabaseAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(true); // Add loading state for compatibility

  useEffect(() => {
    const fetchProfile = async () => {
      if (!authLoading && user) {
        try {
          // Fetch profile from Supabase
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (profileData && !error) {
            const userProfile: UserProfile = {
              id: profileData.id,
              email: profileData.email,
              firstName: profileData.full_name?.split(' ')[0] || undefined,
              lastName: profileData.full_name?.split(' ')[1] || undefined,
              age: profileData.age || 14,
              ageGroup: determineAgeGroup(profileData.age || 14),
              role: profileData.role || 'PLAYER',
              teamId: profileData.team || undefined,
              preferences: {
                measurementUnit: 'metric',
                language: 'en',
                notifications: true
              }
            };
            setProfile(userProfile);
            localStorage.setItem('userProfile', JSON.stringify(userProfile));
          } else {
            // Fallback to localStorage or default
            const savedProfile = localStorage.getItem('userProfile');
            if (savedProfile) {
              setProfile(JSON.parse(savedProfile));
            } else {
              // Default profile for new users
              const defaultProfile: UserProfile = {
                id: user.id,
                email: user.email || '',
                firstName: undefined,
                lastName: undefined,
                age: 14,
                ageGroup: '13-15',
                role: 'PLAYER',
                preferences: {
                  measurementUnit: 'metric',
                  language: 'en',
                  notifications: true
                }
              };
              setProfile(defaultProfile);
              localStorage.setItem('userProfile', JSON.stringify(defaultProfile));
            }
          }
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
          // Fallback to localStorage
          const savedProfile = localStorage.getItem('userProfile');
          if (savedProfile) {
            setProfile(JSON.parse(savedProfile));
          }
        }
      }
      setIsLoading(false);
      setLoading(false);
    };

    fetchProfile();
  }, [authLoading, user]);

  const determineAgeGroup = (age: number): UserProfile['ageGroup'] => {
    if (age >= 10 && age <= 12) return '10-12';
    if (age >= 13 && age <= 15) return '13-15';
    if (age >= 16 && age <= 18) return '16-18';
    if (age >= 19 && age <= 25) return '19-25';
    return age < 10 ? '10-12' : '19-25';
  };

  const updateAge = (age: number) => {
    if (!profile) return;

    const updatedProfile = {
      ...profile,
      age,
      ageGroup: determineAgeGroup(age)
    };
    
    setProfile(updatedProfile);
    localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
  };

  const getNutritionRequirements = (): NutritionRequirements => {
    if (!profile) {
      return ageGroupRequirements['13-15']; // Default
    }
    return ageGroupRequirements[profile.ageGroup];
  };

  const getAgeSpecificMultiplier = (): number => {
    if (!profile) return 1.0;

    // Younger players get bonus points for healthy eating habits
    // Older players are held to higher standards
    switch (profile.ageGroup) {
      case '10-12':
        return 1.15; // 15% bonus - encouraging good habits
      case '13-15':
        return 1.10; // 10% bonus - building habits
      case '16-18':
        return 1.05; // 5% bonus - transitioning to adult standards
      case '19-25':
        return 1.00; // No bonus - professional standards
      default:
        return 1.0;
    }
  };

  const value = {
    profile,
    setProfile,
    updateAge,
    getNutritionRequirements,
    getAgeSpecificMultiplier,
    isLoading,
    loading
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserProfile() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserProfile must be used within a UserProvider');
  }
  return context;
}