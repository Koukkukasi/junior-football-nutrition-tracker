import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';

export function useOnboarding() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useSupabaseAuth();
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      // Skip check if not signed in or still loading
      if (loading || !user) {
        setCheckingOnboarding(false);
        return;
      }

      // Skip if already on onboarding page
      if (location.pathname === '/onboarding') {
        setCheckingOnboarding(false);
        return;
      }

      // Skip for auth pages
      if (location.pathname.startsWith('/sign-')) {
        setCheckingOnboarding(false);
        return;
      }

      try {
        // Check local storage first for quick check
        const onboardingCompleted = localStorage.getItem('onboardingCompleted');
        
        if (onboardingCompleted !== 'true') {
          // For now, just set onboarding as completed
          // In production, you'd check the profile data
          localStorage.setItem('onboardingCompleted', 'true');
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        // Don't block user on network errors
      } finally {
        setCheckingOnboarding(false);
      }
    };

    checkOnboardingStatus();
  }, [user, loading, navigate, location.pathname]);

  return { checkingOnboarding };
}