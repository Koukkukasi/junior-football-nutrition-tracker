try {
  console.log('Testing food routes import...');
  const foodRoutes = require('./dist/routes/food.routes').default;
  console.log('Food routes imported:', typeof foodRoutes);
  console.log('Stack length:', foodRoutes.stack.length);
  foodRoutes.stack.forEach((layer, i) => {
    console.log(`Route ${i}: ${layer.route?.path || 'middleware'} - methods:`, layer.route?.methods);
  });
} catch (error) {
  console.error('Error importing food routes:', error);
}