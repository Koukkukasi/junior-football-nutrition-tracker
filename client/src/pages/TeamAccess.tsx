import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Shield, UserPlus, LogIn } from 'lucide-react';

export default function TeamAccess() {
  const navigate = useNavigate();
  const [accessMode, setAccessMode] = useState<'player' | 'coach' | null>(null);
  const [formData, setFormData] = useState({
    teamCode: '',
    playerName: '',
    jerseyNumber: '',
    coachEmail: '',
    coachPassword: ''
  });

  const handlePlayerAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Create a pseudo-email from team code and jersey number
      // Use a valid email format that Supabase will accept
      const pseudoEmail = `player${formData.jerseyNumber}.${formData.teamCode.toLowerCase()}@nutritiontracker.app`;
      const defaultPassword = `${formData.teamCode}-${formData.jerseyNumber}-2025`;
      
      // Import Supabase client directly
      const { supabase } = await import('../lib/supabase');
      
      // Try to sign up directly with Supabase
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: pseudoEmail,
        password: defaultPassword,
        options: {
          data: {
            full_name: formData.playerName,
            jersey_number: formData.jerseyNumber,
            team_code: formData.teamCode,
            is_team_account: true,
            role: 'PLAYER'
          }
        }
      });
      
      if (signUpError && signUpError.message?.includes('already registered')) {
        // User exists, try to sign in
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: pseudoEmail,
          password: defaultPassword
        });
        
        if (signInError) {
          console.error('Sign in error:', signInError);
          alert('Failed to sign in. Please try again or contact your coach.');
          return;
        }
        
        // Store player info and navigate
        localStorage.setItem('teamPlayer', JSON.stringify({
          name: formData.playerName,
          jerseyNumber: formData.jerseyNumber,
          teamCode: formData.teamCode,
          email: pseudoEmail,
          isTeamAccount: true
        }));
        
        // Navigate directly to dashboard
        navigate('/dashboard');
      } else if (signUpError) {
        console.error('Sign up error:', signUpError);
        alert('Failed to create account. Please try again.');
      } else {
        // Sign up successful, store info and navigate
        localStorage.setItem('teamPlayer', JSON.stringify({
          name: formData.playerName,
          jerseyNumber: formData.jerseyNumber,
          teamCode: formData.teamCode,
          email: pseudoEmail,
          isTeamAccount: true
        }));
        
        // Navigate to dashboard
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error joining team:', error);
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Mode Selection */}
        {!accessMode && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h1 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Team Access
            </h1>
            <p className="text-gray-600 text-center mb-8">
              Choose how you want to access the nutrition tracker
            </p>

            <div className="space-y-4">
              <button
                onClick={() => setAccessMode('player')}
                className="w-full p-6 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all group"
              >
                <Users className="w-12 h-12 mx-auto mb-3" />
                <h3 className="text-xl font-bold mb-1">I'm a Player</h3>
                <p className="text-sm opacity-90">Join with team code (no email needed)</p>
              </button>

              <button
                onClick={() => setAccessMode('coach')}
                className="w-full p-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all group"
              >
                <Shield className="w-12 h-12 mx-auto mb-3" />
                <h3 className="text-xl font-bold mb-1">I'm a Coach</h3>
                <p className="text-sm opacity-90">Sign in with email to manage team</p>
              </button>
            </div>

            <div className="mt-8 text-center">
              <a
                href="/auth/sign-in"
                className="text-sm text-gray-600 hover:text-indigo-600"
              >
                Have an email account? Sign in normally →
              </a>
            </div>
          </div>
        )}

        {/* Player Access Form */}
        {accessMode === 'player' && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <button
              onClick={() => setAccessMode(null)}
              className="mb-4 text-gray-600 hover:text-gray-800"
            >
              ← Back
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserPlus className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold">Player Access</h2>
              <p className="text-gray-600 mt-2">Enter your team code to join</p>
            </div>

            <form onSubmit={handlePlayerAccess} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Team Code
                </label>
                <input
                  type="text"
                  required
                  maxLength={20}
                  placeholder="Ask your coach for the code"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={formData.teamCode}
                  onChange={(e) => setFormData({ ...formData, teamCode: e.target.value.toUpperCase() })}
                />
                <p className="text-xs text-gray-500 mt-1">Example: INTER2012 or EAGLES-2025</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={formData.playerName}
                  onChange={(e) => setFormData({ ...formData, playerName: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jersey Number
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="99"
                  placeholder="Your jersey number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={formData.jerseyNumber}
                  onChange={(e) => setFormData({ ...formData, jerseyNumber: e.target.value })}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
              >
                Join Team
              </button>
            </form>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>No email needed!</strong> Just ask your coach for the team code and you can start tracking your nutrition right away.
              </p>
            </div>
          </div>
        )}

        {/* Coach Access */}
        {accessMode === 'coach' && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <button
              onClick={() => setAccessMode(null)}
              className="mb-4 text-gray-600 hover:text-gray-800"
            >
              ← Back
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold">Coach Access</h2>
              <p className="text-gray-600 mt-2">Manage your team's nutrition</p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => navigate('/auth/sign-in')}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <LogIn className="w-5 h-5" />
                Sign In as Coach
              </button>

              <button
                onClick={() => navigate('/auth/sign-up')}
                className="w-full py-3 border-2 border-purple-500 text-purple-600 font-semibold rounded-lg hover:bg-purple-50 transition-all"
              >
                Create Coach Account
              </button>
            </div>

            <div className="mt-6 p-4 bg-purple-50 rounded-lg">
              <h3 className="font-semibold text-purple-900 mb-2">Coach Features:</h3>
              <ul className="text-sm text-purple-800 space-y-1">
                <li>• Create team with unique access code</li>
                <li>• Monitor all players' nutrition</li>
                <li>• View team analytics and reports</li>
                <li>• Send notifications to players</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}