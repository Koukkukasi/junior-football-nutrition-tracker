// Vercel serverless function handler - Simplified for production
const express = require('express');
const cors = require('cors');

// Create Express app
const app = express();

// Basic middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://junior-football-nutrition-tracker.vercel.app',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }))

// Temporary in-memory storage (will reset on each deployment)
// This is for demo purposes - production should use a database
const storage = {
  foodEntries: [],
  performanceData: []
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// User routes (demo mode - returns mock data)
app.get('/api/v1/users/profile', async (req, res) => {
  // Return mock user profile for demo
  res.json({
    success: true,
    data: {
      id: 'demo-user',
      name: 'Demo Player',
      age: 16,
      ageGroup: '16-18',
      position: 'Midfielder',
      team: 'Demo Team'
    }
  });
});

app.post('/api/v1/users/onboarding', async (req, res) => {
  // Mock onboarding completion
  res.json({
    success: true,
    message: 'Onboarding completed successfully'
  });
});

// Food entries routes (using /api/v1/food to match client)
app.get('/api/v1/food', async (req, res) => {
  // Return stored entries (demo mode - no auth required)
  res.json({
    success: true,
    data: storage.foodEntries
  });
});

app.post('/api/v1/food', async (req, res) => {
  // Store food entry (demo mode - no auth required)
  const entry = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  storage.foodEntries.push(entry);
  
  res.json({
    success: true,
    data: entry
  });
});

app.put('/api/v1/food/:id', async (req, res) => {
  const { id } = req.params;
  const index = storage.foodEntries.findIndex(e => e.id === id);
  
  if (index !== -1) {
    storage.foodEntries[index] = {
      ...storage.foodEntries[index],
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    res.json({
      success: true,
      data: storage.foodEntries[index]
    });
  } else {
    res.status(404).json({
      success: false,
      error: 'Food entry not found'
    });
  }
});

app.delete('/api/v1/food/:id', async (req, res) => {
  const { id } = req.params;
  const initialLength = storage.foodEntries.length;
  storage.foodEntries = storage.foodEntries.filter(e => e.id !== id);
  
  if (storage.foodEntries.length < initialLength) {
    res.json({
      success: true,
      message: 'Food entry deleted'
    });
  } else {
    res.status(404).json({
      success: false,
      error: 'Food entry not found'
    });
  }
});

// Performance metrics routes (matching client's /api/v1/performance)
app.get('/api/v1/performance', async (req, res) => {
  // Return stored performance data (demo mode - no auth required)
  res.json({
    success: true,
    data: storage.performanceData
  });
});

app.post('/api/v1/performance', async (req, res) => {
  // Store performance data (demo mode - no auth required)
  const entry = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  storage.performanceData.push(entry);
  
  res.json({
    success: true,
    data: entry
  });
});

// Teams routes
app.get('/api/v1/teams', async (req, res) => {
  res.status(401).json({
    error: 'Authentication required',
    message: 'Please sign in to view teams'
  });
});

// Catch all handler for undefined routes
app.all('/api/*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.url} not found`
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Export for Vercel serverless function
module.exports = app;

// Also export as default for Vercel
module.exports.default = app;