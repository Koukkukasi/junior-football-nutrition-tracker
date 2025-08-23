import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

export default function LandingPage() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-400 to-green-400 relative overflow-hidden">
      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white opacity-10 rounded-full animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white opacity-10 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white opacity-5 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <nav className="bg-white/95 backdrop-blur-sm shadow-lg relative z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent flex items-center gap-2">
            <span className="text-3xl">⚽</span>
            <span className="hidden sm:inline">Junior Football Nutrition Tracker</span>
            <span className="sm:hidden">JFNT</span>
          </h1>
          <div className="flex items-center gap-2 md:gap-4">
            <Link 
              to="/sign-in" 
              className="px-4 py-2 md:px-6 md:py-3 text-gray-700 hover:text-gray-900 transition-all font-medium text-sm md:text-base min-h-[44px] flex items-center justify-center hover:bg-gray-50 rounded-lg"
            >
              Sign In
            </Link>
            <Link 
              to="/sign-up" 
              className="px-4 py-2 md:px-6 md:py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all transform hover:scale-105 text-sm md:text-base min-h-[44px] flex items-center justify-center"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 md:py-16 relative z-10">
        <header className={`text-center mb-12 md:mb-16 transform transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="inline-block mb-4 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-semibold">
            🏆 #1 Nutrition App for Young Athletes
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Fuel Your<br className="md:hidden" /> Football Journey
          </h2>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto px-4">
            Track nutrition, monitor performance, and reach your full potential as a junior football player
          </p>
        </header>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto mb-12 md:mb-16">
          <div className={`bg-white/95 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-white/50 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} style={{ transitionDelay: '200ms' }}>
            <div className="text-5xl mb-4 transform transition-transform duration-300 hover:scale-110 hover:rotate-12">🍎</div>
            <h3 className="text-xl md:text-2xl font-bold mb-3 bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">Smart Food Logging</h3>
            <p className="text-gray-700 mb-4 text-sm md:text-base">
              Easy meal tracking with 5 daily meal types. Perfect for young athletes on the go.
            </p>
            <ul className="text-sm md:text-base text-gray-600 space-y-2">
              <li className="flex items-center gap-2">
                <span className="text-green-500 font-bold">✓</span> Quick entry system
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500 font-bold">✓</span> Location tracking
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500 font-bold">✓</span> Meal notes
              </li>
            </ul>
          </div>

          <div className={`bg-white/95 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-white/50 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} style={{ transitionDelay: '400ms' }}>
            <div className="text-5xl mb-4 transform transition-transform duration-300 hover:scale-110 hover:rotate-12">⚡</div>
            <h3 className="text-xl md:text-2xl font-bold mb-3 bg-gradient-to-r from-yellow-600 to-orange-500 bg-clip-text text-transparent">Performance Metrics</h3>
            <p className="text-gray-700 mb-4 text-sm md:text-base">
              Track energy levels, sleep, and training intensity to optimize your game.
            </p>
            <ul className="text-sm md:text-base text-gray-600 space-y-2">
              <li className="flex items-center gap-2">
                <span className="text-yellow-500 font-bold">✓</span> Daily energy tracking
              </li>
              <li className="flex items-center gap-2">
                <span className="text-yellow-500 font-bold">✓</span> Sleep monitoring
              </li>
              <li className="flex items-center gap-2">
                <span className="text-yellow-500 font-bold">✓</span> Training logs
              </li>
            </ul>
          </div>

          <div className={`bg-white/95 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-white/50 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} style={{ transitionDelay: '600ms' }}>
            <div className="text-5xl mb-4 transform transition-transform duration-300 hover:scale-110 hover:rotate-12">👥</div>
            <h3 className="text-xl md:text-2xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">Team Insights</h3>
            <p className="text-gray-700 mb-4 text-sm md:text-base">
              Coaches can monitor team nutrition and identify areas for improvement.
            </p>
            <ul className="text-sm md:text-base text-gray-600 space-y-2">
              <li className="flex items-center gap-2">
                <span className="text-purple-500 font-bold">✓</span> Team dashboard
              </li>
              <li className="flex items-center gap-2">
                <span className="text-purple-500 font-bold">✓</span> Individual reports
              </li>
              <li className="flex items-center gap-2">
                <span className="text-purple-500 font-bold">✓</span> Performance trends
              </li>
            </ul>
          </div>
        </div>

        <div className={`text-center transform transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} style={{ transitionDelay: '800ms' }}>
          <Link 
            to="/sign-up" 
            className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 text-lg md:text-xl px-8 py-4 md:px-12 md:py-5 rounded-full font-bold hover:shadow-2xl transition-all transform hover:scale-105 shadow-xl min-h-[56px] group"
          >
            <span>Start Free Trial</span>
            <span className="text-2xl transform transition-transform group-hover:translate-x-1">→</span>
          </Link>
          <p className="mt-6 text-white/90 text-sm md:text-base">No credit card required • For players aged 10-25</p>
        </div>
      </div>
    </div>
  )
}