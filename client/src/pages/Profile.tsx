import { useState, useEffect } from 'react';
import { useUserProfile } from '../contexts/UserContext';

export default function Profile() {
  const { profile, updateAge, getNutritionRequirements, getAgeSpecificMultiplier } = useUserProfile();
  const [age, setAge] = useState(profile?.age || 14);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setAge(profile.age);
    }
  }, [profile]);

  const handleAgeUpdate = () => {
    updateAge(age);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const requirements = getNutritionRequirements();
  const multiplier = getAgeSpecificMultiplier();

  const getAgeGroupColor = (ageGroup: string) => {
    switch (ageGroup) {
      case '10-12': return 'bg-green-100 text-green-700 border-green-300';
      case '13-15': return 'bg-blue-100 text-blue-700 border-blue-300';
      case '16-18': return 'bg-purple-100 text-purple-700 border-purple-300';
      case '19-25': return 'bg-orange-100 text-orange-700 border-orange-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  if (!profile) {
    return <div>Loading profile...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Player Profile</h1>
        <p className="text-gray-600 mt-2">Manage your profile and nutrition settings</p>
      </div>

      {/* Success Message */}
      {saved && (
        <div className="mb-6 p-4 bg-green-100 border border-green-300 rounded-lg text-green-700">
          ✅ Profile updated successfully!
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Profile Information */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-blue-500">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Personal Information</h2>
            <span className="text-3xl">👤</span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  value={profile.firstName || ''}
                  disabled
                  className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={profile.lastName || ''}
                  disabled
                  className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Age (10-25 years)
              </label>
              <div className="flex gap-3">
                <input
                  type="number"
                  min="10"
                  max="25"
                  value={age}
                  onChange={(e) => setAge(Math.min(25, Math.max(10, parseInt(e.target.value) || 10)))}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleAgeUpdate}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Update Age
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Age Group
              </label>
              <div className={`inline-block px-4 py-2 rounded-full border-2 font-semibold ${getAgeGroupColor(profile.ageGroup)}`}>
                {profile.ageGroup} years
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <div className="inline-block px-4 py-2 bg-gray-100 rounded-lg">
                {profile.role === 'player' ? '⚽ Player' : '📋 Coach'}
              </div>
            </div>
          </div>
        </div>

        {/* Nutrition Requirements */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-green-500">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Age-Specific Nutrition</h2>
            <span className="text-3xl">🎯</span>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-700">Daily Calories</span>
                <span className="text-xl font-bold text-blue-600">{requirements.caloriesPerDay}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
                  style={{ width: `${(requirements.caloriesPerDay / 3500) * 100}%` }}
                />
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-700">Protein (g/kg)</span>
                <span className="text-xl font-bold text-green-600">{requirements.proteinGramsPerKg}</span>
              </div>
              <p className="text-xs text-gray-600">
                For your weight, aim for {Math.round(requirements.proteinGramsPerKg * 50)}g daily
              </p>
            </div>

            <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-700">Hydration</span>
                <span className="text-xl font-bold text-yellow-600">{requirements.hydrationLiters}L</span>
              </div>
              <p className="text-xs text-gray-600">
                Increase by 0.5-1L on training days
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="text-xs text-gray-600">Carbs</div>
                <div className="text-lg font-bold text-purple-600">{requirements.carbsPercentage}%</div>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <div className="text-xs text-gray-600">Fats</div>
                <div className="text-lg font-bold text-orange-600">{requirements.fatsPercentage}%</div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">Focus Area</h3>
              <p className="text-sm text-gray-600">{requirements.focus}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Scoring Bonus Information */}
      <div className="mt-6 bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Age-Adjusted Scoring</h2>
          <span className="text-3xl">🏆</span>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-700 mb-3">Your Scoring Bonus</h3>
            <div className="flex items-center gap-3">
              <div className="text-4xl font-bold text-purple-600">
                +{Math.round((multiplier - 1) * 100)}%
              </div>
              <div className="text-sm text-gray-600">
                {multiplier > 1 
                  ? 'Bonus for building healthy habits!' 
                  : 'Professional standards applied'}
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-700 mb-3">Age Group Benefits</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              {profile.ageGroup === '10-12' && (
                <>
                  <li>• Extra points for healthy choices</li>
                  <li>• Calcium intake tracking</li>
                  <li>• Gentle feedback on poor choices</li>
                </>
              )}
              {profile.ageGroup === '13-15' && (
                <>
                  <li>• Growth-focused nutrition</li>
                  <li>• Portion size recognition</li>
                  <li>• Protein emphasis</li>
                </>
              )}
              {profile.ageGroup === '16-18' && (
                <>
                  <li>• Performance optimization</li>
                  <li>• Recovery food bonuses</li>
                  <li>• Competition preparation</li>
                </>
              )}
              {profile.ageGroup === '19-25' && (
                <>
                  <li>• Professional standards</li>
                  <li>• No scoring bonuses</li>
                  <li>• Elite athlete expectations</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}