import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Shield, User, Mail, Calendar, MapPin, Loader } from 'lucide-react';
import API from '../lib/api';

type PlayerPosition = 'GOALKEEPER' | 'DEFENDER' | 'MIDFIELDER' | 'FORWARD';

export default function FCInterSignup() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    birthYear: '2012',
    position: '' as PlayerPosition | '',
    parentEmail: '',
    parentConsent: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Create Supabase auth account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            team: 'FC Inter p13 2012',
            role: 'PLAYER'
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create account');

      // Step 2: Complete onboarding with team assignment
      const onboardingData = {
        role: 'PLAYER',
        ageGroup: '13-15', // P13 players are 13 years old in 2025
        position: formData.position,
        goals: ['improve_performance', 'healthy_habits'],
        trainingDaysPerWeek: 3,
        teamCode: 'INTER-P13-C456', // Automatically use FC Inter team code
        parentEmail: formData.parentEmail || undefined
      };

      await API.users.onboarding(onboardingData);

      // Success! Navigate to dashboard
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || 'Failed to create account. Please try again.');
      setIsLoading(false);
    }
  };

  const calculateAge = () => {
    const currentYear = new Date().getFullYear();
    return currentYear - parseInt(formData.birthYear);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* FC Inter Branding */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-900 text-white p-4 rounded-full">
              <Shield className="h-12 w-12" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-blue-900">FC Inter Turku</h1>
          <h2 className="text-xl text-gray-700 mt-2">P13 (2012) Nutrition Tracker</h2>
          <p className="mt-4 text-gray-600">
            Join your team's nutrition program and improve your performance!
          </p>
        </div>

        {/* Signup Form */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          {step === 1 ? (
            <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Player Information</h3>
              
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <User className="inline h-4 w-4 mr-1" />
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your full name"
                />
              </div>

              {/* Birth Year */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Birth Year
                </label>
                <select
                  value={formData.birthYear}
                  onChange={(e) => setFormData({ ...formData, birthYear: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="2012">2012 (Age {calculateAge()})</option>
                  <option value="2011">2011 (Age {currentYear - 2011})</option>
                  <option value="2013">2013 (Age {currentYear - 2013})</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Most P13 players are born in 2012</p>
              </div>

              {/* Position */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  Your Position
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'GOALKEEPER', label: '🥅 Goalkeeper' },
                    { value: 'DEFENDER', label: '🛡️ Defender' },
                    { value: 'MIDFIELDER', label: '⚡ Midfielder' },
                    { value: 'FORWARD', label: '⚽ Forward' }
                  ].map((pos) => (
                    <button
                      key={pos.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, position: pos.value as PlayerPosition })}
                      className={`py-2 px-3 rounded-md border-2 transition-all ${
                        formData.position === pos.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {pos.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={!formData.name || !formData.position}
                className="w-full py-3 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Continue →
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Setup</h3>
              
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Mail className="inline h-4 w-4 mr-1" />
                  Your Email (or Parent's Email)
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="email@example.com"
                />
                <p className="text-xs text-gray-500 mt-1">You'll use this to sign in</p>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Choose a Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="At least 6 characters"
                />
              </div>

              {/* Parent Email (Optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parent's Email (Optional)
                </label>
                <input
                  type="email"
                  value={formData.parentEmail}
                  onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="parent@example.com"
                />
                <p className="text-xs text-gray-500 mt-1">For progress updates</p>
              </div>

              {/* Consent */}
              <div className="bg-blue-50 p-4 rounded-md">
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    required
                    checked={formData.parentConsent}
                    onChange={(e) => setFormData({ ...formData, parentConsent: e.target.checked })}
                    className="mt-1 mr-3"
                  />
                  <span className="text-sm text-gray-700">
                    I have my parent's permission to use this nutrition tracking app for 
                    improving my football performance and health.
                  </span>
                </label>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 px-4 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !formData.parentConsent}
                  className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <Loader className="animate-spin h-5 w-5 mr-2" />
                      Creating Account...
                    </>
                  ) : (
                    'Join Team! 🚀'
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Back to normal signup */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/auth')}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Not part of FC Inter? Use regular sign up
            </button>
          </div>
        </div>

        {/* Team Info */}
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-sm text-gray-600">
            By joining, you'll be automatically added to the
          </p>
          <p className="font-bold text-blue-900 mt-1">
            FC Inter p13 2012 Team
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Team Code: INTER-P13-C456
          </p>
        </div>
      </div>
    </div>
  );
}

// Add current year constant for age calculation
const currentYear = new Date().getFullYear();