import { Link } from 'react-router-dom'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <nav className="bg-white shadow-lg">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[#2563eb]">Junior Football Nutrition Tracker</h1>
          <div className="space-x-4">
            <Link 
              to="/sign-in" 
              className="text-gray-600 hover:text-gray-800 transition-colors font-medium"
            >
              Sign In
            </Link>
            <Link 
              to="/sign-up" 
              className="btn-primary"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-16">
        <header className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Fuel Your Football Journey
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Track nutrition, monitor performance, and reach your full potential as a junior football player
          </p>
        </header>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
          <div className="feature-card animate-slide-up">
            <div className="text-4xl mb-4">🍎</div>
            <h3 className="text-2xl font-semibold mb-3 text-gray-800">Smart Food Logging</h3>
            <p className="text-gray-600 mb-4">
              Easy meal tracking with 5 daily meal types. Perfect for young athletes on the go.
            </p>
            <ul className="text-sm text-gray-500 space-y-1">
              <li>✓ Quick entry system</li>
              <li>✓ Location tracking</li>
              <li>✓ Meal notes</li>
            </ul>
          </div>

          <div className="feature-card animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-2xl font-semibold mb-3 text-gray-800">Performance Metrics</h3>
            <p className="text-gray-600 mb-4">
              Track energy levels, sleep, and training intensity to optimize your game.
            </p>
            <ul className="text-sm text-gray-500 space-y-1">
              <li>✓ Daily energy tracking</li>
              <li>✓ Sleep monitoring</li>
              <li>✓ Training logs</li>
            </ul>
          </div>

          <div className="feature-card animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-2xl font-semibold mb-3 text-gray-800">Team Insights</h3>
            <p className="text-gray-600 mb-4">
              Coaches can monitor team nutrition and identify areas for improvement.
            </p>
            <ul className="text-sm text-gray-500 space-y-1">
              <li>✓ Team dashboard</li>
              <li>✓ Individual reports</li>
              <li>✓ Performance trends</li>
            </ul>
          </div>
        </div>

        <div className="text-center">
          <Link 
            to="/sign-up" 
            className="inline-block gradient-primary text-white text-lg px-10 py-4 rounded-lg font-semibold hover:shadow-xl transition-all transform hover:scale-105 shadow-lg"
          >
            Start Free Trial
          </Link>
          <p className="mt-4 text-gray-500">No credit card required • For players aged 10-25</p>
        </div>
      </div>
    </div>
  )
}