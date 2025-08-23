import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

export default function LandingPage() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <div className="min-h-screen animated-gradient-hero relative overflow-hidden">
      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white opacity-10 rounded-full animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white opacity-10 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white opacity-5 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <nav className="bg-gradient-to-r from-purple-900/95 via-blue-900/95 to-indigo-900/95 backdrop-blur-sm shadow-2xl relative z-10 border-b-2 border-cyan-400/30">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg">
              JF
            </div>
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
          <div className="inline-block mb-4 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full text-white text-sm font-bold shadow-lg animate-pulse">
            #1 NUTRITION APP FOR YOUNG ATHLETES
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Fuel Your<br className="md:hidden" /> Football Journey
          </h2>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto px-4">
            Track nutrition, monitor performance, and reach your full potential as a junior football player
          </p>
        </header>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto mb-12 md:mb-16">
          <div className={`bg-vibrant-green rounded-2xl p-6 md:p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-2 border-emerald-400/30 neon-glow-green ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} style={{ transitionDelay: '200ms' }}>
            <div className="w-16 h-16 mb-4 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <div className="w-10 h-10 bg-gradient-to-br from-white to-emerald-100 rounded-lg shadow-inner"></div>
            </div>
            <h3 className="text-xl md:text-2xl font-bold mb-3 text-white">Smart Food Logging</h3>
            <p className="text-white/90 mb-4 text-sm md:text-base">
              Easy meal tracking with 5 daily meal types. Perfect for young athletes on the go.
            </p>
            <ul className="text-sm md:text-base text-white/80 space-y-2">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full"></div> Quick entry system
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full"></div> Location tracking
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full"></div> Meal notes
              </li>
            </ul>
          </div>

          <div className={`bg-vibrant-orange rounded-2xl p-6 md:p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-2 border-amber-400/30 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} style={{ transitionDelay: '400ms' }}>
            <div className="w-16 h-16 mb-4 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <div className="w-10 h-10 bg-gradient-to-br from-white to-amber-100 rounded-lg shadow-inner"></div>
            </div>
            <h3 className="text-xl md:text-2xl font-bold mb-3 text-white">Performance Metrics</h3>
            <p className="text-white/90 mb-4 text-sm md:text-base">
              Track energy levels, sleep, and training intensity to optimize your game.
            </p>
            <ul className="text-sm md:text-base text-white/80 space-y-2">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full"></div> Daily energy tracking
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full"></div> Sleep monitoring
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full"></div> Training logs
              </li>
            </ul>
          </div>

          <div className={`bg-vibrant-purple rounded-2xl p-6 md:p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-2 border-purple-400/30 neon-glow-purple ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} style={{ transitionDelay: '600ms' }}>
            <div className="w-16 h-16 mb-4 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <div className="w-10 h-10 bg-gradient-to-br from-white to-purple-100 rounded-lg shadow-inner"></div>
            </div>
            <h3 className="text-xl md:text-2xl font-bold mb-3 text-white">Team Insights</h3>
            <p className="text-white/90 mb-4 text-sm md:text-base">
              Coaches can monitor team nutrition and identify areas for improvement.
            </p>
            <ul className="text-sm md:text-base text-white/80 space-y-2">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full"></div> Team dashboard
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full"></div> Individual reports
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full"></div> Performance trends
              </li>
            </ul>
          </div>
        </div>

        <div className={`text-center transform transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} style={{ transitionDelay: '800ms' }}>
          <Link 
            to="/sign-up" 
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-white text-lg md:text-xl px-8 py-4 md:px-12 md:py-5 rounded-full font-bold hover:shadow-2xl transition-all transform hover:scale-105 shadow-xl min-h-[56px] group border-2 border-white/30"
          >
            <span>START FREE TRIAL</span>
          </Link>
          <p className="mt-6 text-white/90 text-sm md:text-base">No credit card required • For players aged 10-25</p>
        </div>
      </div>
    </div>
  )
}