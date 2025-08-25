import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Shield, Lock, Mail, Loader, UserCog, BarChart3, Users, ClipboardCheck } from 'lucide-react';

export default function AdminSignup() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [credentials, setCredentials] = useState({
    email: 'admin@fcinter.fi', // Pre-filled for convenience
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Sign in with Supabase
      const { data, error: authError } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            name: 'System Administrator',
            role: 'ADMIN'
          }
        }
      });

      if (authError) throw authError;
      if (!data.user) throw new Error('Failed to create admin account');

      // Admin account created - navigate to dashboard
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Admin signup error:', err);
      
      // Check if it's because account already exists
      if (err.message?.includes('already registered')) {
        setError('Admin account already exists. Please sign in instead.');
        setTimeout(() => navigate('/sign-in'), 2000);
      } else {
        setError(err.message || 'Failed to create admin account');
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Admin Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-4 rounded-full shadow-2xl">
              <Shield className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white">Admin Access</h1>
          <h2 className="text-xl text-gray-300 mt-2">Junior Football Nutrition Tracker</h2>
          <p className="mt-4 text-gray-400">
            System administration and team management portal
          </p>
        </div>

        {/* Admin Features */}
        <div className="bg-slate-800 rounded-lg p-6 shadow-xl border border-slate-700">
          <h3 className="text-white font-semibold mb-4">Admin Capabilities</h3>
          <div className="space-y-3">
            <div className="flex items-center text-gray-300">
              <Users className="h-5 w-5 mr-3 text-yellow-500" />
              <span>Manage all teams and players</span>
            </div>
            <div className="flex items-center text-gray-300">
              <BarChart3 className="h-5 w-5 mr-3 text-green-500" />
              <span>View system-wide analytics</span>
            </div>
            <div className="flex items-center text-gray-300">
              <UserCog className="h-5 w-5 mr-3 text-blue-500" />
              <span>Assign coaches to teams</span>
            </div>
            <div className="flex items-center text-gray-300">
              <ClipboardCheck className="h-5 w-5 mr-3 text-purple-500" />
              <span>Generate performance reports</span>
            </div>
          </div>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Create Admin Account</h3>
          
          {/* Email */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="inline h-4 w-4 mr-1" />
              Admin Email
            </label>
            <input
              type="email"
              required
              value={credentials.email}
              onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="admin@fcinter.fi"
            />
            <p className="text-xs text-gray-500 mt-1">Use admin@fcinter.fi for system admin</p>
          </div>

          {/* Password */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Lock className="inline h-4 w-4 mr-1" />
              Admin Password
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="Minimum 8 characters"
            />
            <p className="text-xs text-gray-500 mt-1">Use a strong, secure password</p>
          </div>

          {/* Security Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
            <p className="text-sm text-yellow-800">
              <Shield className="inline h-4 w-4 mr-1" />
              This account will have full system access. Keep credentials secure.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm mb-4">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || credentials.password.length < 8}
            className="w-full py-3 px-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold rounded-md hover:from-yellow-600 hover:to-orange-600 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <Loader className="animate-spin h-5 w-5 mr-2" />
                Creating Admin Account...
              </>
            ) : (
              <>
                <Shield className="h-5 w-5 mr-2" />
                Create Admin Account
              </>
            )}
          </button>

          {/* Alternative Options */}
          <div className="mt-6 text-center space-y-2">
            <button
              type="button"
              onClick={() => navigate('/sign-in')}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Already have admin account? Sign in
            </button>
            <br />
            <button
              type="button"
              onClick={() => navigate('/sign-up')}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Regular user? Use standard signup
            </button>
          </div>
        </form>

        {/* Admin Info */}
        <div className="bg-slate-800 rounded-lg p-6 text-center border border-slate-700">
          <p className="text-gray-400 text-sm">
            Admin accounts are restricted to system administrators only.
            For team coaches, use the regular signup with Coach role.
          </p>
          <div className="mt-4 flex justify-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-500">1</div>
              <div className="text-xs text-gray-400">Team Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">25+</div>
              <div className="text-xs text-gray-400">Players Expected</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">24/7</div>
              <div className="text-xs text-gray-400">Monitoring</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}