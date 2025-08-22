import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { ChevronRight, ChevronLeft, Trophy, Target, Users, Calendar } from 'lucide-react';

interface OnboardingData {
  ageGroup: '10-12' | '13-15' | '16-18' | '19-25' | null;
  position: 'GOALKEEPER' | 'DEFENDER' | 'MIDFIELDER' | 'FORWARD' | null;
  goals: string[];
  trainingDays: number;
  teamCode?: string;
}

export default function OnboardingWizard() {
  const navigate = useNavigate();
  useAuth(); // For authentication check
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    ageGroup: null,
    position: null,
    goals: [],
    trainingDays: 3,
    teamCode: ''
  });

  const totalSteps = 4;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      // Save onboarding data to backend
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_BASE}/api/v1/users/onboarding`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await window.Clerk?.session?.getToken()}`
        },
        body: JSON.stringify({
          ...data,
          completedOnboarding: true
        })
      });

      if (response.ok) {
        localStorage.setItem('onboardingCompleted', 'true');
        navigate('/dashboard');
      } else {
        const errorData = await response.json();
        console.error('Onboarding failed:', errorData.error || 'Unknown error');
        // Show error to user
        alert('Failed to save onboarding data. Please try again.');
      }
    } catch (error) {
      console.error('Failed to save onboarding data:', error);
      alert('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleGoal = (goal: string) => {
    setData(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal]
    }));
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return data.ageGroup !== null;
      case 2:
        return data.position !== null;
      case 3:
        return data.goals.length > 0;
      case 4:
        return true; // Optional step
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-2xl font-bold text-gray-800">Welcome to Your Nutrition Journey!</h2>
            <span className="text-sm text-gray-500">Step {currentStep} of {totalSteps}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Age Group */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">What's your age group?</h3>
              <p className="text-gray-600 mb-6">This helps us customize nutrition recommendations for your development stage.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: '10-12', label: '10-12 years', description: 'Youth Development' },
                { value: '13-15', label: '13-15 years', description: 'Growth Phase' },
                { value: '16-18', label: '16-18 years', description: 'Performance Building' },
                { value: '19-25', label: '19-25 years', description: 'Peak Performance' }
              ].map((age) => (
                <button
                  key={age.value}
                  onClick={() => setData({ ...data, ageGroup: age.value as any })}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    data.ageGroup === age.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-left">
                    <div className="font-semibold">{age.label}</div>
                    <div className="text-sm text-gray-500">{age.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Position */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">What position do you play?</h3>
              <p className="text-gray-600 mb-6">Different positions have different energy and nutrition needs.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: 'GOALKEEPER', label: 'Goalkeeper', icon: '🥅' },
                { value: 'DEFENDER', label: 'Defender', icon: '🛡️' },
                { value: 'MIDFIELDER', label: 'Midfielder', icon: '⚡' },
                { value: 'FORWARD', label: 'Forward', icon: '⚽' }
              ].map((position) => (
                <button
                  key={position.value}
                  onClick={() => setData({ ...data, position: position.value as any })}
                  className={`p-6 rounded-lg border-2 transition-all ${
                    data.position === position.value
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-3xl mb-2">{position.icon}</div>
                  <div className="font-semibold">{position.label}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Goals */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">What are your nutrition goals?</h3>
              <p className="text-gray-600 mb-6">Select all that apply to personalize your experience.</p>
            </div>
            
            <div className="space-y-3">
              {[
                { value: 'performance', label: 'Improve Match Performance', icon: <Trophy className="w-5 h-5" /> },
                { value: 'energy', label: 'Increase Energy Levels', icon: <Target className="w-5 h-5" /> },
                { value: 'recovery', label: 'Faster Recovery', icon: <Calendar className="w-5 h-5" /> },
                { value: 'muscle', label: 'Build Muscle Mass', icon: <Users className="w-5 h-5" /> },
                { value: 'weight', label: 'Optimize Body Weight', icon: <Target className="w-5 h-5" /> },
                { value: 'habits', label: 'Develop Better Eating Habits', icon: <Trophy className="w-5 h-5" /> }
              ].map((goal) => (
                <button
                  key={goal.value}
                  onClick={() => toggleGoal(goal.value)}
                  className={`w-full p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
                    data.goals.includes(goal.value)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className={`${data.goals.includes(goal.value) ? 'text-blue-600' : 'text-gray-400'}`}>
                    {goal.icon}
                  </div>
                  <span className="font-medium">{goal.label}</span>
                  {data.goals.includes(goal.value) && (
                    <span className="ml-auto text-blue-600">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Training Schedule & Team */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">Final details</h3>
              <p className="text-gray-600 mb-6">Help us understand your training routine.</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How many days per week do you train?
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5, 6, 7].map((days) => (
                    <button
                      key={days}
                      onClick={() => setData({ ...data, trainingDays: days })}
                      className={`w-12 h-12 rounded-lg border-2 transition-all ${
                        data.trainingDays === days
                          ? 'border-blue-500 bg-blue-50 font-bold'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {days}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Team Code (Optional)
                </label>
                <input
                  type="text"
                  value={data.teamCode}
                  onChange={(e) => setData({ ...data, teamCode: e.target.value })}
                  placeholder="Enter code from your coach"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">
                  If your coach gave you a team code, enter it here to join your team.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all ${
              currentStep === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>

          <button
            onClick={handleNext}
            disabled={!isStepValid() || isLoading}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all ${
              !isStepValid()
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-green-500 text-white hover:from-blue-600 hover:to-green-600'
            }`}
          >
            {isLoading ? (
              <span>Setting up...</span>
            ) : currentStep === totalSteps ? (
              <>
                Complete Setup
                <Trophy className="w-5 h-5" />
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>

        {/* Skip Option */}
        {currentStep === 1 && (
          <div className="text-center mt-4">
            <button
              onClick={() => {
                localStorage.setItem('onboardingCompleted', 'true');
                navigate('/dashboard');
              }}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Skip for now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}