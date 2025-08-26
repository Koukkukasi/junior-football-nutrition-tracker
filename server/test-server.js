// Simple test server that connects directly to Supabase
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = 3001;

// Supabase client
const supabaseUrl = 'https://qlhkefgrafakbrcwquhv.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsaGtlZmdyYWZha2JyY3dxdWh2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjA5NTk4OCwiZXhwIjoyMDcxNjcxOTg4fQ.x-KyNMzD0uThpqKfsAqfxX0UmaiLvP2B23suoxQJiYM';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check
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

    res.json({ success: true, data: data || [] });
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
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }

    const { mealType, time, location, description, notes, date } = req.body;
    
    console.log('Creating food entry for user:', user.id);
    console.log('Data:', { mealType, time, location, description });

    // Save to Supabase
    const { data, error } = await supabase
      .from('food_entries')
      .insert({
        user_id: user.id,
        meal_type: mealType,
        time,
        location,
        description,
        notes,
        quality_score: 85, // Hardcoded for testing
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ success: false, error: error.message });
    }

    console.log('Food entry created:', data.id);
    res.status(201).json({ success: true, data });
  } catch (error) {
    console.error('Error creating food entry:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Test server running on http://localhost:${PORT}`);
  console.log('This server connects directly to Supabase, bypassing Prisma');
  console.log('API endpoints:');
  console.log('  GET  http://localhost:3001/health');
  console.log('  GET  http://localhost:3001/api/v1/food');
  console.log('  POST http://localhost:3001/api/v1/food');
});