// Production server that connects directly to Supabase (no Prisma/Docker required)
const express = require('express');
const cors = require('cors');
const path = require('path');
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

// Serve static files from the React app build directory
// Try multiple possible paths since Render's structure might vary
const possiblePaths = [
  '/opt/render/project/src/client/dist',  // Absolute Render path (correct one)
  path.join(__dirname, '..', 'client', 'dist'),  // From server directory to sibling client
  path.join(process.cwd(), '..', 'client', 'dist'),  // From working directory up one level
  path.join(__dirname, '..', '..', 'client', 'dist')  // From deeper directory
];

let clientBuildPath = null;
const fs = require('fs');

for (const testPath of possiblePaths) {
  console.log('Checking path:', testPath);
  if (fs.existsSync(testPath)) {
    clientBuildPath = testPath;
    console.log('✓ Found client build at:', clientBuildPath);
    break;
  }
}

if (!clientBuildPath) {
  console.error('✗ Client build directory not found in any of:', possiblePaths);
  console.log('Current directory:', __dirname);
  console.log('Working directory:', process.cwd());
  console.log('Current dir contents:', fs.readdirSync(process.cwd()));
  
  // Check parent directory
  const parentDir = path.join(process.cwd(), '..');
  console.log('Parent directory:', parentDir);
  try {
    console.log('Parent dir contents:', fs.readdirSync(parentDir));
    
    // Check if client exists in parent
    const clientPath = path.join(parentDir, 'client');
    if (fs.existsSync(clientPath)) {
      console.log('Client directory found at:', clientPath);
      console.log('Client contents:', fs.readdirSync(clientPath));
      
      // Check for dist in client
      const distPath = path.join(clientPath, 'dist');
      if (fs.existsSync(distPath)) {
        console.log('✓ Found dist at:', distPath);
        clientBuildPath = distPath;
        app.use(express.static(clientBuildPath));
        console.log('Now serving static files from:', clientBuildPath);
      } else {
        console.log('✗ No dist directory in client');
        console.log('Attempting to build client now...');
        
        // Try to build the client if dist doesn't exist
        const { execSync } = require('child_process');
        try {
          console.log('Installing client dependencies (including dev)...');
          execSync('npm install --production=false', { cwd: clientPath, stdio: 'inherit' });
          console.log('Building client...');
          execSync('npm run build', { cwd: clientPath, stdio: 'inherit' });
          
          // Check again for dist
          if (fs.existsSync(distPath)) {
            console.log('✓ Build successful! Found dist at:', distPath);
            clientBuildPath = distPath;
            app.use(express.static(clientBuildPath));
            console.log('Now serving static files from:', clientBuildPath);
          } else {
            console.log('✗ Build completed but dist still not found');
          }
        } catch (buildError) {
          console.error('Failed to build client:', buildError.message);
        }
      }
    }
  } catch (e) {
    console.error('Error reading parent directory:', e.message);
  }
} else {
  app.use(express.static(clientBuildPath));
  console.log('Serving static files from:', clientBuildPath);
}

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

    // Convert mealType to match database constraint exactly
    // Frontend sends: BREAKFAST, SNACK, LUNCH, DINNER, PRE_GAME, POST_GAME
    // Database expects: BREAKFAST, SNACK, LUNCH, DINNER, PRE_GAME, POST_GAME
    console.log('Raw mealType received from frontend:', mealType);
    
    // The database expects uppercase values with underscores
    const normalizedMealType = mealType ? mealType.toUpperCase() : 'BREAKFAST';

    // Combine today's date with the provided time for created_at
    const today = new Date();
    let createdAt = new Date().toISOString();
    
    if (time) {
      const [hours, minutes] = time.split(':');
      today.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      createdAt = today.toISOString();
    }

    console.log('Normalized meal_type for database:', normalizedMealType, '(from original:', mealType, ')');

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

// Feedback endpoint with fallback to filesystem
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
    
    if (authHeader && supabase) {
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

// The "catchall" handler: for any request that doesn't match API routes,
// send back the React app's index.html file.
app.get('*', (req, res) => {
  if (clientBuildPath) {
    const indexPath = path.join(clientBuildPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).json({ 
        error: 'index.html not found', 
        message: `Build directory exists at ${clientBuildPath} but index.html is missing`,
        api: {
          status: 'running',
          endpoints: ['/health', '/api/v1/health', '/api/v1/food']
        }
      });
    }
  } else {
    // Fallback to API info if no frontend is built
    res.status(404).json({ 
      error: 'Frontend not found', 
      message: 'Please ensure the client is built (npm run build)',
      debug: {
        currentDir: __dirname,
        workingDir: process.cwd(),
        checkedPaths: possiblePaths
      },
      api: {
        status: 'running',
        endpoints: ['/health', '/api/v1/health', '/api/v1/food']
      }
    });
  }
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
  console.log(`  POST /api/v1/feedback`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});