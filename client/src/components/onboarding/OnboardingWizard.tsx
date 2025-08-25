import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '../../contexts/SupabaseAuthContext';
import { ChevronRight, ChevronLeft, Trophy, Target, Users, Calendar, Shield, UserCheck, Heart } from 'lucide-react';
import API from '../../lib/api';

interface OnboardingData {
  role: 'PLAYER' | 'COACH' | 'PARENT' | null;
  ageGroup: '10-12' | '13-15' | '16-18' | '19-25' | null;
  position: 'GOALKEEPER' | 'DEFENDER' | 'MIDFIELDER' | 'FORWARD' | null;
  goals: string[];
  trainingDays: number;
  teamCode?: string;
}

export default function OnboardingWizard() {
  const navigate = useNavigate();
  const { user } = useSupabaseAuth(); // For authentication check
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<OnboardingData>({
    role: null,
    ageGroup: null,
    position: null,
    goals: [],
    trainingDays: 3,
    teamCode: ''
  });

  // Adjust total steps based on role
  const totalSteps = data.role === 'COACH' ? 3 : data.role === 'PARENT' ? 2 : 5;

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
    setError(null);
    try {
      // Prepare data based on role
      const onboardingData: any = {
        role: data.role,
        completedOnboarding: true
      };

      if (data.role === 'PLAYER') {
        onboardingData.ageGroup = data.ageGroup;
        onboardingData.position = data.position;
        onboardingData.goals = data.goals;
        onboardingData.trainingDays = data.trainingDays;
        onboardingData.teamCode = data.teamCode;
      } else if (data.role === 'COACH') {
        onboardingData.ageGroup = data.ageGroup || '16-18'; // Default for coaches
        onboardingData.goals = data.goals;
      } else if (data.role === 'PARENT') {
        // Parents don't need additional data for now
      }

      const response = await API.users.onboarding(onboardingData);

      if (response.success) {
        localStorage.setItem('onboardingCompleted', 'true');
        localStorage.setItem('userRole', data.role || 'PLAYER');
        
        // Redirect based on role
        if (data.role === 'COACH') {
          navigate('/coach-dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(response.error || 'Failed to save onboarding data');
      }
    } catch (error) {
      console.error('Failed to save onboarding data:', error);
      setError('Network error. Please check your connection and try again.');
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
    if (data.role === 'COACH') {
      switch (currentStep) {
        case 1: return data.role !== null;
        case 2: return data.ageGroup !== null;
        case 3: return data.goals.length > 0;
        default: return false;
      }
    } else if (data.role === 'PARENT') {
      switch (currentStep) {
        case 1: return data.role !== null;
        case 2: return true; // Info step
        default: return false;
      }
    } else {
      // Player flow
      switch (currentStep) {
        case 1: return data.role !== null;
        case 2: return data.ageGroup !== null;
        case 3: return data.position !== null;
        case 4: return data.goals.length > 0;
        case 5: return true; // Optional step
        default: return false;
      }
    }
  };

  const getStepTitle = () => {
    if (currentStep === 1) return "What's your role?";
    
    if (data.role === 'COACH') {
      switch (currentStep) {
        case 2: return "Which age group do you coach?";
        case 3: return "What are your coaching goals?";
        default: return "";
      }
    } else if (data.role === 'PARENT') {
      switch (currentStep) {
        case 2: return "Parent Access Information";
        default: return "";
      }
    } else {
      // Player flow
      switch (currentStep) {
        case 2: return "What's your age group?";
        case 3: return "What position do you play?";
        case 4: return "What are your nutrition goals?";
        case 5: return "Final details";
        default: return "";
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-2xl font-bold text-gray-800">Welcome to Your Nutrition Journey!</h2>
            <span className="text-sm text-gray-500">Step {currentStep} of {totalSteps}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Step 1: Role Selection */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">{getStepTitle()}</h3>
              <p className="text-gray-600 mb-6">Choose how you'll be using the nutrition tracker.</p>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={() => setData({ ...data, role: 'PLAYER' })}
                className={`w-full p-6 rounded-lg border-2 transition-all flex items-center gap-4 ${
                  data.role === 'PLAYER'
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className={`p-3 rounded-lg ${data.role === 'PLAYER' ? 'bg-indigo-100' : 'bg-gray-100'}`}>
                  <UserCheck className={`w-6 h-6 ${data.role === 'PLAYER' ? 'text-indigo-600' : 'text-gray-600'}`} />
                </div>
                <div className="text-left flex-1">
                  <div className="font-semibold text-lg">I'm a Player</div>
                  <div className="text-sm text-gray-600">Track your nutrition and improve your performance</div>
                </div>
              </button>

              <button
                onClick={() => setData({ ...data, role: 'COACH' })}
                className={`w-full p-6 rounded-lg border-2 transition-all flex items-center gap-4 ${
                  data.role === 'COACH'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className={`p-3 rounded-lg ${data.role === 'COACH' ? 'bg-purple-100' : 'bg-gray-100'}`}>
                  <Shield className={`w-6 h-6 ${data.role === 'COACH' ? 'text-purple-600' : 'text-gray-600'}`} />
                </div>
                <div className="text-left flex-1">
                  <div className="font-semibold text-lg">I'm a Coach</div>
                  <div className="text-sm text-gray-600">Monitor your team's nutrition and provide guidance</div>
                </div>
              </button>

              <button
                onClick={() => setData({ ...data, role: 'PARENT' })}
                className={`w-full p-6 rounded-lg border-2 transition-all flex items-center gap-4 ${
                  data.role === 'PARENT'
                    ? 'border-pink-500 bg-pink-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className={`p-3 rounded-lg ${data.role === 'PARENT' ? 'bg-pink-100' : 'bg-gray-100'}`}>
                  <Heart className={`w-6 h-6 ${data.role === 'PARENT' ? 'text-pink-600' : 'text-gray-600'}`} />
                </div>
                <div className="text-left flex-1">
                  <div className="font-semibold text-lg">I'm a Parent</div>
                  <div className="text-sm text-gray-600">Support your child's nutrition journey (view-only access)</div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Player Flow - Step 2: Age Group */}
        {currentStep === 2 && data.role === 'PLAYER' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">{getStepTitle()}</h3>
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
                      ? 'border-indigo-500 bg-indigo-50'
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

        {/* Coach Flow - Step 2: Age Group */}
        {currentStep === 2 && data.role === 'COACH' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">{getStepTitle()}</h3>
              <p className="text-gray-600 mb-6">Select the primary age group you coach.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: '10-12', label: 'U12', description: 'Under 12 years' },
                { value: '13-15', label: 'U15', description: 'Under 15 years' },
                { value: '16-18', label: 'U18', description: 'Under 18 years' },
                { value: '19-25', label: 'Senior', description: 'Senior team' }
              ].map((age) => (
                <button
                  key={age.value}
                  onClick={() => setData({ ...data, ageGroup: age.value as any })}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    data.ageGroup === age.value
                      ? 'border-purple-500 bg-purple-50'
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

        {/* Parent Flow - Step 2: Information */}
        {currentStep === 2 && data.role === 'PARENT' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">{getStepTitle()}</h3>
              <p className="text-gray-600 mb-6">As a parent, you'll have view-only access to support your child.</p>
            </div>
            
            <div className="bg-pink-50 border border-pink-200 rounded-lg p-6 space-y-4">
              <h4 className="font-semibold text-pink-900">What you can do:</h4>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-pink-600 mt-1">✓</span>
                  <span>View your child's nutrition logs and scores</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-600 mt-1">✓</span>
                  <span>Monitor their performance metrics</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-600 mt-1">✓</span>
                  <span>See coach recommendations and feedback</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-600 mt-1">✓</span>
                  <span>Support healthy eating habits at home</span>
                </li>
              </ul>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-600">
                <strong>Note:</strong> Your child's coach will need to approve your parent access after you complete setup.
              </p>
            </div>
          </div>
        )}

        {/* Player Flow - Step 3: Position */}
        {currentStep === 3 && data.role === 'PLAYER' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">{getStepTitle()}</h3>
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

        {/* Coach Flow - Step 3: Goals */}
        {currentStep === 3 && data.role === 'COACH' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">{getStepTitle()}</h3>
              <p className="text-gray-600 mb-6">What do you want to achieve with your team?</p>
            </div>
            
            <div className="space-y-3">
              {[
                { value: 'team_performance', label: 'Improve Team Performance', icon: <Trophy className="w-5 h-5" /> },
                { value: 'injury_prevention', label: 'Reduce Injuries Through Nutrition', icon: <Shield className="w-5 h-5" /> },
                { value: 'education', label: 'Educate Players on Nutrition', icon: <Target className="w-5 h-5" /> },
                { value: 'monitoring', label: 'Monitor Player Health', icon: <Users className="w-5 h-5" /> },
                { value: 'recovery', label: 'Optimize Recovery', icon: <Calendar className="w-5 h-5" /> }
              ].map((goal) => (
                <button
                  key={goal.value}
                  onClick={() => toggleGoal(goal.value)}
                  className={`w-full p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
                    data.goals.includes(goal.value)
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className={`${data.goals.includes(goal.value) ? 'text-purple-600' : 'text-gray-400'}`}>
                    {goal.icon}
                  </div>
                  <span className="font-medium">{goal.label}</span>
                  {data.goals.includes(goal.value) && (
                    <span className="ml-auto text-purple-600">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Player Flow - Step 4: Goals */}
        {currentStep === 4 && data.role === 'PLAYER' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">{getStepTitle()}</h3>
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
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className={`${data.goals.includes(goal.value) ? 'text-indigo-600' : 'text-gray-400'}`}>
                    {goal.icon}
                  </div>
                  <span className="font-medium">{goal.label}</span>
                  {data.goals.includes(goal.value) && (
                    <span className="ml-auto text-indigo-600">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Player Flow - Step 5: Training Schedule & Team */}
        {currentStep === 5 && data.role === 'PLAYER' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">{getStepTitle()}</h3>
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
                          ? 'border-indigo-500 bg-indigo-50 font-bold'
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
                  onChange={(e) => setData({ ...data, teamCode: e.target.value.toUpperCase() })}
                  placeholder="Enter code from your coach"
                  maxLength={8}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-center text-lg"
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
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700'
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