// Serverless API handler for Vercel
// This file handles all API routes under /api/*

// Import the Express app directly - it handles its own environment variables
const app = require('../server/dist/app').default;

// Export for Vercel serverless function
module.exports = (req, res) => {
  // Ensure proper CORS headers for production
  const allowedOrigins = [
    'https://www.juniorfootballnutrition.com',
    'https://juniorfootballnutrition.com',
    'https://junior-football-nutrition-tracker.vercel.app',
    'https://junior-nutrition-tracker-prod.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );
  
  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Log incoming requests for debugging
  console.log(`[API] ${req.method} ${req.url}`);
  
  // Pass the request to Express app
  return app(req, res);
};