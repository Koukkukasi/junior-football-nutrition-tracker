// Production server that serves both frontend and backend
const express = require('express');
const path = require('path');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

// Security and optimization middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.jsdelivr.net"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://*.supabase.co", "https://*.supabase.in"],
    },
  },
}));
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(morgan('combined'));

// Import backend routes
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Warning: Supabase credentials not fully configured');
}

const supabase = createClient(supabaseUrl || '', supabaseKey || '');

// API Routes
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.get('/api/v1/health', (req, res) => {
  res.json({
    name: 'Junior Football Nutrition Tracker API',
    status: 'running',
    endpoints: ['/health', '/api/v1/health', '/api/v1/food']
  });
});

// Food entries endpoints
app.get('/api/v1/food', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Verify user with Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Fetch food entries for the user
    const { data, error } = await supabase
      .from('food_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching food entries:', error);
      return res.status(500).json({ error: 'Failed to fetch food entries' });
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error in GET /api/v1/food:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/v1/food', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Verify user with Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const { mealType, time, location, description, notes, date } = req.body;

    // Insert food entry
    const { data, error } = await supabase
      .from('food_entries')
      .insert([{
        user_id: user.id,
        meal_type: mealType,
        time,
        location,
        description,
        notes,
        created_at: date || new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating food entry:', error);
      return res.status(500).json({ 
        success: false, 
        error: error.message,
        code: 'HTTP_500'
      });
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error in POST /api/v1/food:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      code: 'HTTP_500'
    });
  }
});

// Serve static files from the React app build directory
const clientBuildPath = path.join(__dirname, 'client', 'dist');
app.use(express.static(clientBuildPath));

// The "catchall" handler: for any request that doesn't match API routes,
// send back the React app's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Serving frontend from: ${clientBuildPath}`);
  console.log('API endpoints:');
  console.log('  GET  /health');
  console.log('  GET  /api/v1/health');
  console.log('  GET  /api/v1/food');
  console.log('  POST /api/v1/food');
});