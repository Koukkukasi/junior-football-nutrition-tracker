import request from 'supertest';
import app from '../../src/app';

describe('Health Check Endpoint', () => {
  describe('GET /health', () => {
    it('should return 200 OK with status message', async () => {
      const response = await request(app)
        .get('/health')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toEqual({
        status: 'OK',
        message: 'Server is running'
      });
    });

    it('should respond quickly (under 100ms)', async () => {
      const startTime = Date.now();
      
      await request(app).get('/health');
      
      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(100);
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/non-existent-route')
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toEqual({
        error: 'Route not found'
      });
    });
  });
});