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

// Feedback endpoint - explicit route with improved error handling
app.post('/api/v1/feedback', async (req, res) => {
  console.log('[FEEDBACK] Endpoint hit at:', new Date().toISOString());
  console.log('[FEEDBACK] Request body:', req.body);
  
  try {
    const authHeader = req.headers.authorization;
    const { type, message, rating, userAgent, url, timestamp } = req.body;
    
    // Validate required fields
    if (!message || !type) {
      return res.status(400).json({
        success: false,
        error: 'Message and type are required fields'
      });
    }
    
    // Create feedback object
    const feedbackData = {
      type: type || 'general',
      message,
      rating: rating || null,
      page_url: url || req.headers.referer || null,
      user_agent: userAgent || req.headers['user-agent'] || null,
      created_at: timestamp || new Date().toISOString()
    };
    
    // Try to save to database if authenticated
    let savedToDatabase = false;
    let userId = null;
    
    if (authHeader && supabase && supabaseUrl && supabaseKey) {
      const token = authHeader.replace('Bearer ', '');
      
      try {
        // Verify user with Supabase
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        
        if (user && !authError) {
          userId = user.id;
          feedbackData.user_id = userId;
          
          // Try to save to feedback table
          const { data, error } = await supabase
            .from('feedback')
            .insert([feedbackData])
            .select()
            .single();

          if (!error) {
            savedToDatabase = true;
            console.log('[FEEDBACK] Successfully saved to database:', data.id);
            
            // Return early with database success
            return res.json({ 
              success: true,
              message: 'Feedback saved successfully',
              id: data.id,
              savedToDatabase: true
            });
          } else {
            console.log('[FEEDBACK] Database save failed:', error.message);
            // Continue to fallback file storage
          }
        }
      } catch (dbError) {
        console.log('[FEEDBACK] Database operation error:', dbError.message);
        // Continue to fallback file storage
      }
    }
    
    // Fallback: Save to file system
    const fs = require('fs').promises;
    const feedbackDir = path.join(__dirname, 'feedback');
    
    try {
      // Ensure feedback directory exists
      await fs.mkdir(feedbackDir, { recursive: true });
      
      // Create filename with timestamp
      const feedbackId = `feedback_${Date.now()}_${type}`;
      const filename = `${feedbackId}.json`;
      const filepath = path.join(feedbackDir, filename);
      
      // Add user info if available
      feedbackData.user_id = userId;
      feedbackData.saved_to = 'filesystem';
      
      // Write feedback to file
      await fs.writeFile(filepath, JSON.stringify(feedbackData, null, 2), 'utf-8');
      
      console.log('[FEEDBACK] Saved to file:', filename);
      
      res.json({ 
        success: true, 
        message: 'Feedback received and saved. Thank you!',
        id: feedbackId,
        savedToDatabase: false,
        savedToFile: true
      });
    } catch (fileError) {
      console.error('[FEEDBACK] File save error:', fileError);
      
      // Even if file save fails, acknowledge receipt
      res.json({ 
        success: true, 
        message: 'Feedback received. Thank you!',
        savedToDatabase: false,
        savedToFile: false
      });
    }
  } catch (error) {
    console.error('[FEEDBACK] Critical error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to process feedback',
      code: 'HTTP_500'
    });
  }
});

// Serve static files from the React app build directory
const fs = require('fs');
const clientBuildPath = path.join(__dirname, 'client', 'dist');

console.log('=== Frontend Configuration ===');
console.log('Looking for client build at:', clientBuildPath);
console.log('Directory exists?', fs.existsSync(clientBuildPath));

if (fs.existsSync(clientBuildPath)) {
  const indexPath = path.join(clientBuildPath, 'index.html');
  console.log('Index.html exists?', fs.existsSync(indexPath));
  
  // List files in build directory
  const files = fs.readdirSync(clientBuildPath);
  console.log('Files in build directory:', files);
  
  // Serve static files
  app.use(express.static(clientBuildPath));
  
  // For any non-API route, serve the React app
  app.get('*', (req, res) => {
    // Skip API routes
    if (req.path.startsWith('/api/') || req.path.startsWith('/health')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    
    // Serve index.html for client routes
    if (fs.existsSync(indexPath)) {
      console.log(`Serving index.html for route: ${req.path}`);
      res.sendFile(indexPath);
    } else {
      res.status(500).send('index.html not found in build directory');
    }
  });
} else {
  console.error('ERROR: Client build directory not found!');
  console.error('Build command should create:', clientBuildPath);
  
  // Return error for all non-API routes
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/') || req.path.startsWith('/health')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    
    res.status(503).json({
      error: 'Frontend not built',
      message: 'Client build directory not found. The build process may have failed.',
      expected: clientBuildPath,
      exists: false
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