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

// More permissive CORS for production
app.use(cors({
  origin: true, // Allow all origins for now
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

// Handle OPTIONS requests for CORS preflight
app.options('*', cors());

// Import backend routes
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Warning: Supabase credentials not fully configured');
}

const supabase = createClient(supabaseUrl || '', supabaseKey || '');

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  if (req.method === 'POST') {
    console.log('POST body:', req.body);
  }
  next();
});

// API Routes
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.get('/api/v1/health', (req, res) => {
  res.json({
    name: 'Junior Football Nutrition Tracker API',
    status: 'running',
    endpoints: ['/health', '/api/v1/health', '/api/v1/food', '/api/v1/feedback']
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

// User profile endpoints
app.get('/api/v1/users/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    res.json({ 
      success: true, 
      data: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || user.email?.split('@')[0],
        age: user.user_metadata?.age || 16,
        ageGroup: '16-18'
      }
    });
  } catch (error) {
    console.error('Error in GET /api/v1/users/profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Feedback endpoint - explicit route
app.post('/api/v1/feedback', async (req, res) => {
  console.log('Feedback endpoint hit!');
  console.log('Request method:', req.method);
  console.log('Request path:', req.path);
  console.log('Request body:', req.body);
  
  try {
    const authHeader = req.headers.authorization;
    const { type, message, rating, userAgent, url, timestamp } = req.body;
    
    // Log feedback for now (you can store in Supabase later)
    console.log('Feedback received:', {
      type,
      message,
      rating,
      userAgent,
      url,
      timestamp,
      hasAuth: !!authHeader
    });

    // If we have Supabase configured and auth, we could save to database
    if (authHeader && supabase) {
      const token = authHeader.replace('Bearer ', '');
      
      try {
        // Verify user with Supabase
        const { data: { user } } = await supabase.auth.getUser(token);
        
        if (user) {
          // Try to save to feedback table if it exists
          const { data, error } = await supabase
            .from('feedback')
            .insert([{
              user_id: user.id,
              type: type || 'general',
              message,
              rating,
              page_url: url,
              user_agent: userAgent,
              created_at: timestamp || new Date().toISOString()
            }])
            .select()
            .single();

          if (!error) {
            return res.json({ success: true, data });
          }
          // If table doesn't exist, just log it
          console.log('Could not save to database:', error?.message);
        }
      } catch (dbError) {
        console.log('Feedback database save failed:', dbError);
      }
    }
    
    // Return success even if we couldn't save to database
    res.json({ 
      success: true, 
      message: 'Feedback received. Thank you!' 
    });
  } catch (error) {
    console.error('Error in POST /api/v1/feedback:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to submit feedback',
      code: 'HTTP_500'
    });
  }
});

// Serve static files from the React app build directory
const clientBuildPath = path.join(__dirname, 'client', 'dist');
console.log('Attempting to serve static files from:', clientBuildPath);

// Check if build directory exists
const fs = require('fs');
if (fs.existsSync(clientBuildPath)) {
  console.log('Client build directory found!');
  app.use(express.static(clientBuildPath));
  
  // The "catchall" handler: for any request that doesn't match API routes,
  // send back the React app's index.html file.
  app.get('*', (req, res) => {
    const indexPath = path.join(clientBuildPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send('Frontend build not found. Please ensure the client has been built.');
    }
  });
} else {
  console.error('WARNING: Client build directory not found at:', clientBuildPath);
  console.error('Please run "npm run build" to build the client first.');
  
  // Fallback response when no build exists
  app.get('*', (req, res) => {
    res.status(503).json({
      error: 'Frontend not available',
      message: 'The client application has not been built. Please run npm run build.',
      path: clientBuildPath
    });
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Serving frontend from: ${clientBuildPath}`);
  console.log('API endpoints:');
  console.log('  GET  /health');
  console.log('  GET  /api/v1/health');
  console.log('  GET  /api/v1/food');
  console.log('  POST /api/v1/food');
  console.log('  GET  /api/v1/users/profile');
  console.log('  POST /api/v1/feedback');
});