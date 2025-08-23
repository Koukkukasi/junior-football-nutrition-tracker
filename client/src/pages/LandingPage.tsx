import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

export default function LandingPage() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header/Navigation */}
      <nav className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-lg">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/30">
              <span className="text-white font-bold">JF</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Nutrition Tracker</h1>
              <p className="text-xs text-white/70">Junior Football Edition</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link 
              to="/sign-in" 
              className="px-4 py-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all font-medium"
            >
              Sign In
            </Link>
            <Link 
              to="/sign-up" 
              className="px-4 py-2 bg-white text-purple-600 rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <header className={`text-center mb-16 transform transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="inline-block mb-6 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full text-white text-sm font-bold shadow-lg">
            FOR PLAYERS AGED 10-25
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Fuel Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Football Journey</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Track nutrition, monitor performance, and reach your full potential with personalized insights for junior football players
          </p>
        </header>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-16">
          <div className={`bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} style={{ transitionDelay: '200ms' }}>
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Food Logging</h3>
            <p className="text-gray-600 mb-4">
              Quick and easy meal tracking with instant nutrition scoring tailored for your age group
            </p>
            <ul className="text-sm text-gray-500 space-y-2">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                5 daily meal types
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                Real-time scoring
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                Age-specific recommendations
              </li>
            </ul>
          </div>

          <div className={`bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} style={{ transitionDelay: '400ms' }}>
            <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Performance Analytics</h3>
            <p className="text-gray-600 mb-4">
              Track energy levels, sleep quality, and training intensity to optimize your performance
            </p>
            <ul className="text-sm text-gray-500 space-y-2">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                Energy monitoring
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                Sleep tracking
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                Training correlation
              </li>
            </ul>
          </div>

          <div className={`bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} style={{ transitionDelay: '600ms' }}>
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Team Management</h3>
            <p className="text-gray-600 mb-4">
              Coaches can monitor team nutrition, track progress, and provide personalized guidance
            </p>
            <ul className="text-sm text-gray-500 space-y-2">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                Team dashboard
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                Player insights
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                Progress reports
              </li>
            </ul>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-16 max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">95%</div>
              <p className="text-gray-600 mt-2">Improved nutrition habits</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">4.8/5</div>
              <p className="text-gray-600 mt-2">Average energy increase</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-orange-600">500+</div>
              <p className="text-gray-600 mt-2">Active players</p>
            </div>
          </div>
        </div>

        {/* Age Groups Section */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">Tailored for Every Age Group</h3>
          <div className="grid md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 text-center">
              <div className="text-lg font-bold text-indigo-600 mb-2">10-12 Years</div>
              <p className="text-sm text-gray-600">Growth & Development Focus</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 text-center">
              <div className="text-lg font-bold text-purple-600 mb-2">13-15 Years</div>
              <p className="text-sm text-gray-600">Energy & Growth Support</p>
            </div>
            <div className="bg-gradient-to-br from-pink-50 to-orange-50 rounded-lg p-4 text-center">
              <div className="text-lg font-bold text-pink-600 mb-2">16-18 Years</div>
              <p className="text-sm text-gray-600">Performance Optimization</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg p-4 text-center">
              <div className="text-lg font-bold text-orange-600 mb-2">19-25 Years</div>
              <p className="text-sm text-gray-600">Professional Standards</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className={`text-center bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-xl p-12 shadow-xl transform transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} style={{ transitionDelay: '800ms' }}>
          <h3 className="text-3xl font-bold text-white mb-4">Ready to Level Up Your Game?</h3>
          <p className="text-white/90 mb-8 max-w-2xl mx-auto">
            Join hundreds of junior football players who are already tracking their nutrition and improving their performance
          </p>
          <Link 
            to="/sign-up" 
            className="inline-flex items-center justify-center bg-white text-purple-600 text-lg px-8 py-4 rounded-lg font-bold hover:shadow-lg transition-all transform hover:scale-105"
          >
            Start Free Trial
          </Link>
          <p className="mt-4 text-white/70 text-sm">No credit card required • Free for 30 days</p>
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-600">
              © {new Date().getFullYear()} Junior Football Nutrition Tracker. All rights reserved.
            </div>
            <div className="flex gap-6 text-sm">
              <Link to="/terms" className="text-gray-600 hover:text-indigo-600 transition-colors">
                Terms of Service
              </Link>
              <Link to="/privacy" className="text-gray-600 hover:text-indigo-600 transition-colors">
                Privacy Policy
              </Link>
              <a href="mailto:support@juniorfootballnutrition.com" className="text-gray-600 hover:text-indigo-600 transition-colors">
                Contact
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}