import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { 
  UtensilsCrossed, 
  TrendingUp, 
  Users, 
  Zap, 
  Moon, 
  Activity,
  CheckCircle,
  Target,
  Trophy
} from 'lucide-react'

export default function LandingPage() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Modern Fixed Header - Matches Layout.tsx */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-lg z-50">
        <div className="flex items-center justify-between h-full px-4 lg:px-6">
          {/* Logo and App Name - Matches Layout.tsx exactly */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/30">
              <span className="text-white font-bold">JF</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Nutrition Tracker</h1>
              <p className="text-xs text-white/70">Junior Football Edition</p>
            </div>
          </div>
          
          {/* Navigation Buttons */}
          <div className="flex items-center gap-3">
            <Link 
              to="/sign-in" 
              className="px-4 py-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all font-medium active:bg-white/20 touch-manipulation"
            >
              Sign In
            </Link>
            <Link 
              to="/sign-up" 
              className="px-4 py-2 bg-white text-purple-600 rounded-lg font-semibold hover:shadow-lg transition-all hover:scale-105 active:scale-100 touch-manipulation"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content with proper spacing for fixed header */}
      <div className="pt-20 px-4">
        <div className="container mx-auto">
          {/* Modern Hero Section */}
          <div className={`text-center mb-16 transform transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            {/* Age Badge - More vibrant */}
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full text-sm font-semibold mb-6 shadow-lg">
              FOR PLAYERS AGED 10-25
            </div>
            
            {/* Main Heading with Gradient */}
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Fuel Your
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Football Journey
              </span>
            </h2>
            
            {/* Subheading */}
            <p className="text-xl md:text-2xl text-gray-700 mb-10 max-w-3xl mx-auto leading-relaxed">
              Track nutrition, monitor performance, and reach your full potential with 
              <span className="font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> personalized insights </span>
              for junior football players
            </p>
            
            {/* CTA Buttons - Dashboard Style */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <Link 
                to="/sign-up" 
                className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold text-lg hover:shadow-xl transition-all hover:scale-105 hover:-translate-y-1 active:scale-100 active:translate-y-0 touch-manipulation"
              >
                Start Free Trial
              </Link>
              <Link 
                to="/sign-in" 
                className="px-8 py-4 bg-white/80 backdrop-blur-sm text-purple-600 rounded-lg font-semibold text-lg hover:shadow-xl transition-all hover:scale-105 hover:-translate-y-1 border-2 border-purple-200 active:scale-100 active:translate-y-0 touch-manipulation"
              >
                Sign In
              </Link>
            </div>
            
            <p className="text-gray-600">No credit card required • Free for 30 days</p>
          </div>

          {/* Modern Feature Cards - Dashboard Style */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* Smart Food Logging Card */}
            <div className={`bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl p-8 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 hover:scale-105 transform duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} style={{ transitionDelay: '200ms' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <UtensilsCrossed size={40} color="white" />
                </div>
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold">
                  Core Feature
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-3">Smart Food Logging</h3>
              <p className="text-white/90 mb-6">
                Quick and easy meal tracking with instant nutrition scoring tailored for your age group
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-white/30 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm">5 daily meal types</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-white/30 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm">Real-time scoring</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-white/30 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm">Age-specific recommendations</span>
                </div>
              </div>
            </div>

            {/* Performance Analytics Card */}
            <div className={`bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-8 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 hover:scale-105 transform duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} style={{ transitionDelay: '400ms' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-10 h-10 text-white" />
                </div>
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold">
                  Analytics
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-3">Performance Analytics</h3>
              <p className="text-white/90 mb-6">
                Track energy levels, sleep quality, and training intensity to optimize your performance
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-white/30 rounded-full flex items-center justify-center">
                    <Zap className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm">Energy monitoring</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-white/30 rounded-full flex items-center justify-center">
                    <Moon className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm">Sleep tracking</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-white/30 rounded-full flex items-center justify-center">
                    <Activity className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm">Training correlation</span>
                </div>
              </div>
            </div>

            {/* Team Management Card */}
            <div className={`bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-8 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 hover:scale-105 transform duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} style={{ transitionDelay: '600ms' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <Users className="w-10 h-10 text-white" />
                </div>
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold">
                  Pro Feature
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-3">Team Management</h3>
              <p className="text-white/90 mb-6">
                Coaches can monitor team nutrition, track progress, and provide personalized guidance
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-white/30 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm">Team dashboard</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-white/30 rounded-full flex items-center justify-center">
                    <Target className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm">Player insights</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-white/30 rounded-full flex items-center justify-center">
                    <Trophy className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm">Progress reports</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section - Dashboard Style */}
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-12 mb-16 shadow-xl">
            <h3 className="text-3xl font-bold text-center text-white mb-10">Trusted by Athletes Worldwide</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center bg-white/20 backdrop-blur-sm rounded-lg p-6">
                <div className="text-4xl font-bold text-white mb-2">95%</div>
                <p className="text-white/90">Improved nutrition habits</p>
              </div>
              <div className="text-center bg-white/20 backdrop-blur-sm rounded-lg p-6">
                <div className="text-4xl font-bold text-white mb-2">4.8/5</div>
                <p className="text-white/90">Average energy increase</p>
              </div>
              <div className="text-center bg-white/20 backdrop-blur-sm rounded-lg p-6">
                <div className="text-4xl font-bold text-white mb-2">500+</div>
                <p className="text-white/90">Active players</p>
              </div>
            </div>
          </div>

          {/* Age Groups Section - Vibrant Cards */}
          <div className="mb-16">
            <h3 className="text-3xl font-bold text-center mb-4">
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Tailored for Every Age Group
              </span>
            </h3>
            <p className="text-center text-gray-600 mb-10 max-w-2xl mx-auto">
              Age-specific nutrition guidance that grows with your football journey
            </p>
            
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 hover:scale-105">
                <div className="text-center">
                  <div className="text-2xl font-bold mb-2">10-12 Years</div>
                  <p className="text-white/90">Growth & Development Focus</p>
                  <div className="mt-4 p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Target className="w-6 h-6 mx-auto text-white" />
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 hover:scale-105">
                <div className="text-center">
                  <div className="text-2xl font-bold mb-2">13-15 Years</div>
                  <p className="text-white/90">Energy & Growth Support</p>
                  <div className="mt-4 p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Target className="w-6 h-6 mx-auto text-white" />
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-pink-500 to-orange-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 hover:scale-105">
                <div className="text-center">
                  <div className="text-2xl font-bold mb-2">16-18 Years</div>
                  <p className="text-white/90">Performance Optimization</p>
                  <div className="mt-4 p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Target className="w-6 h-6 mx-auto text-white" />
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-orange-500 to-yellow-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 hover:scale-105">
                <div className="text-center">
                  <div className="text-2xl font-bold mb-2">19-25 Years</div>
                  <p className="text-white/90">Professional Standards</p>
                  <div className="mt-4 p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Target className="w-6 h-6 mx-auto text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modern CTA Section */}
          <div className={`text-center bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 rounded-2xl p-12 shadow-xl transform transition-all duration-1000 hover:shadow-2xl ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} style={{ transitionDelay: '800ms' }}>
            <div className="max-w-4xl mx-auto">
              <h3 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to Level Up Your Game?</h3>
              <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
                Join hundreds of junior football players who are already tracking their nutrition and improving their performance with personalized insights
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Link 
                  to="/sign-up" 
                  className="px-8 py-4 bg-white text-purple-600 rounded-lg font-semibold text-lg hover:shadow-xl transition-all hover:scale-105 hover:-translate-y-1"
                >
                  Start Free Trial
                </Link>
                <Link 
                  to="/sign-in" 
                  className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white rounded-lg font-semibold text-lg hover:shadow-xl transition-all hover:scale-105 hover:-translate-y-1 border-2 border-white/30"
                >
                  Sign In
                </Link>
              </div>
              
              <div className="flex flex-wrap justify-center gap-6 text-white/90">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-white/30 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-white/30 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                  <span>Free for 30 days</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-white/30 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                  <span>Cancel anytime</span>
                </div>
              </div>
            </div>
          </div>

          {/* Modern Footer - Dashboard Style */}
          <footer className="mt-24 bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 rounded-t-3xl p-12 text-white">
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-3 gap-8 mb-8">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/30">
                      <span className="text-white font-bold">JF</span>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold">Nutrition Tracker</h4>
                      <p className="text-xs text-white/70">Junior Football Edition</p>
                    </div>
                  </div>
                  <p className="text-white/80 text-sm">
                    Empowering the next generation of football players with personalized nutrition insights and performance tracking.
                  </p>
                </div>
                
                <div>
                  <h5 className="font-semibold mb-4">Quick Links</h5>
                  <div className="space-y-2">
                    <Link to="/sign-up" className="block text-white/80 hover:text-white transition-colors">Get Started</Link>
                    <Link to="/sign-in" className="block text-white/80 hover:text-white transition-colors">Sign In</Link>
                    <Link to="/terms" className="block text-white/80 hover:text-white transition-colors">Terms of Service</Link>
                    <Link to="/privacy" className="block text-white/80 hover:text-white transition-colors">Privacy Policy</Link>
                  </div>
                </div>
                
                <div>
                  <h5 className="font-semibold mb-4">Support</h5>
                  <div className="space-y-2">
                    <a href="mailto:support@juniorfootballnutrition.com" className="block text-white/80 hover:text-white transition-colors">
                      support@juniorfootballnutrition.com
                    </a>
                    <p className="text-white/60 text-sm">
                      Available Monday-Friday<br />
                      9:00 AM - 5:00 PM EST
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-white/20 pt-8 text-center text-white/60 text-sm">
                © 2025 Junior Football Nutrition Tracker. All rights reserved.
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  )
}