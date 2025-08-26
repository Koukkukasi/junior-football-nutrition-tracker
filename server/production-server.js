// Production server that connects directly to Supabase (no Prisma/Docker required)
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3001;

// Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://qlhkefgrafakbrcwquhv.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsaGtlZmdyYWZha2JyY3dxdWh2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjA5NTk4OCwiZXhwIjoyMDcxNjcxOTg4fQ.x-KyNMzD0uThpqKfsAqfxX0UmaiLvP2B23suoxQJiYM';

console.log('Starting production server with Supabase URL:', supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// CORS configuration for production
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);
    
    // Allow any localhost port for development
    if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      return callback(null, true);
    }
    
    // Allow production URLs
    const allowedOrigins = [
      'https://junior-football-nutrition-client.onrender.com',
      'https://junior-football-nutrition-tracker.vercel.app',
      'https://junior-football-nutrition.netlify.app'
    ];
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Log blocked origins but allow them for now to prevent issues
    console.log('CORS request from:', origin, '- allowing for debugging');
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    name: 'Junior Football Nutrition Tracker API',
    status: 'running',
    endpoints: ['/health', '/api/v1/health', '/api/v1/food']
  });
});

// Health check endpoints
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'healthy', api: 'v1', timestamp: new Date().toISOString() });
});

// GET food entries
app.get('/api/v1/food', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    // Get user from token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      console.error('Auth error:', authError);
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }

    // Get food entries from Supabase
    const { data, error } = await supabase
      .from('food_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ success: false, error: error.message });
    }

    // Format the response to match what the frontend expects
    const formattedData = (data || []).map(entry => ({
      id: entry.id,
      user_id: entry.user_id,
      mealType: entry.meal_type,
      meal_type: entry.meal_type,
      time: new Date(entry.created_at).toTimeString().slice(0, 5),
      description: entry.description,
      quality_score: entry.quality_score,
      created_at: entry.created_at,
      createdAt: entry.created_at,
      date: entry.created_at
    }));

    res.json({ success: true, data: formattedData });
  } catch (error) {
    console.error('Error fetching food entries:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST food entry
app.post('/api/v1/food', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }

    // Get user from token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      console.error('Auth error:', authError);
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }

    const { mealType, time, description } = req.body;
    
    console.log('Creating food entry for user:', user.id);
    console.log('Data:', { mealType, time, description });

    // Convert mealType to lowercase to match database constraint
    // Frontend sends: BREAKFAST, LUNCH, DINNER, etc.
    // Database expects: breakfast, lunch, dinner, etc.
    const normalizedMealType = mealType ? mealType.toLowerCase() : 'breakfast';

    // Combine today's date with the provided time for created_at
    const today = new Date();
    let createdAt = new Date().toISOString();
    
    if (time) {
      const [hours, minutes] = time.split(':');
      today.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      createdAt = today.toISOString();
    }

    console.log('Normalized meal_type for database:', normalizedMealType);

    // Save to Supabase (only with basic columns that exist)
    const { data, error } = await supabase
      .from('food_entries')
      .insert({
        user_id: user.id,
        meal_type: normalizedMealType, // Use lowercase version
        description,
        quality_score: 85, // Hardcoded for testing
        created_at: createdAt
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ success: false, error: error.message });
    }

    console.log('Food entry created:', data.id);
    // Include the time in the response
    const responseData = {
      ...data,
      mealType: data.meal_type,
      time: time || new Date(data.created_at).toTimeString().slice(0, 5)
    };
    res.status(201).json({ success: true, data: responseData });
  } catch (error) {
    console.error('Error creating food entry:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Catch all other routes - using simple function to avoid path-to-regexp issues
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not found', 
    message: `Route ${req.originalUrl} not found`,
    availableEndpoints: ['/', '/health', '/api/v1/health', '/api/v1/food'] 
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`Production server running on port ${PORT}`);
  console.log('Environment:', process.env.NODE_ENV || 'production');
  console.log('This server connects directly to Supabase, bypassing Prisma');
  console.log('API endpoints:');
  console.log(`  GET  /health`);
  console.log(`  GET  /api/v1/health`);
  console.log(`  GET  /api/v1/food`);
  console.log(`  POST /api/v1/food`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});