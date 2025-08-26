const express = require('express');
const app = express();

app.get('/test', (req, res) => {
  console.log('Test route hit');
  res.json({ message: 'Test works' });
});

app.use((req, res) => {
  console.log('404 for:', req.url);
  res.status(404).json({ error: 'Not found' });
});

app.listen(3002, () => {
  console.log('Test server running on 3002');
});