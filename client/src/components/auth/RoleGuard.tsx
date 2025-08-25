import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '../../contexts/SupabaseAuthContext';
import { useUserProfile } from '../../contexts/UserContext';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: ('PLAYER' | 'COACH' | 'ADMIN')[];
  fallbackPath?: string;
}

export function RoleGuard({ children, allowedRoles, fallbackPath = '/dashboard' }: RoleGuardProps) {
  const { user, loading: authLoading } = useSupabaseAuth();
  const { profile, loading: profileLoading } = useUserProfile();
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (authLoading || profileLoading) return;

    if (!user) {
      navigate('/sign-in');
      return;
    }

    if (profile) {
      const userRole = profile.role || 'PLAYER';
      const hasAccess = allowedRoles.includes(userRole);
      
      if (!hasAccess) {
        console.warn(`Access denied: User role ${userRole} not in allowed roles:`, allowedRoles);
        navigate(fallbackPath);
      } else {
        setIsAuthorized(true);
      }
    }
  }, [user, profile, authLoading, profileLoading, allowedRoles, navigate, fallbackPath]);

  if (authLoading || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Checking permissions...</h2>
          <p className="text-gray-600">Please wait while we verify your access.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Convenience components for specific roles
export function AdminOnly({ children, fallbackPath }: Omit<RoleGuardProps, 'allowedRoles'>) {
  return (
    <RoleGuard allowedRoles={['ADMIN']} fallbackPath={fallbackPath}>
      {children}
    </RoleGuard>
  );
}

export function CoachOrAdmin({ children, fallbackPath }: Omit<RoleGuardProps, 'allowedRoles'>) {
  return (
    <RoleGuard allowedRoles={['COACH', 'ADMIN']} fallbackPath={fallbackPath}>
      {children}
    </RoleGuard>
  );
}