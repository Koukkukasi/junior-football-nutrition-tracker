import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';

export function useOnboarding() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isSignedIn, isLoaded } = useAuth();
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      // Skip check if not signed in or on certain pages
      if (!isLoaded || !isSignedIn) {
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
          // Verify with backend
          const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';
          const response = await fetch(`${API_BASE}/api/v1/users/profile`, {
            headers: {
              'Authorization': `Bearer ${await window.Clerk?.session?.getToken()}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            
            if (!data.user?.completedOnboarding) {
              // Redirect to onboarding
              navigate('/onboarding');
            } else {
              // Update local storage
              localStorage.setItem('onboardingCompleted', 'true');
            }
          } else if (response.status === 404) {
            // User not found, likely new user - redirect to onboarding
            navigate('/onboarding');
          }
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        // Don't block user on network errors
      } finally {
        setCheckingOnboarding(false);
      }
    };

    checkOnboardingStatus();
  }, [isSignedIn, isLoaded, navigate, location.pathname]);

  return { checkingOnboarding };
}