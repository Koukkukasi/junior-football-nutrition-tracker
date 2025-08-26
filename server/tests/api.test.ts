import request from 'supertest';
import app from '../src/setup-api';

describe('API Integration Tests', () => {
  let authToken: string;
  let userId: string;
  let teamId: string;
  let foodEntryId: string;

  // Test authentication
  describe('Authentication', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          password: 'Test123!',
          name: 'Test User',
          age: 15,
          role: 'PLAYER'
        });
      
      expect(response.status).toBe(201);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('token');
      
      authToken = response.body.data.token;
      userId = response.body.data.user.id;
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Test123!'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('token');
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPassword'
        });
      
      expect(response.status).toBe(401);
    });
  });

  // Test user endpoints
  describe('User Endpoints', () => {
    it('should get user profile', async () => {
      const response = await request(app)
        .get(`/api/v1/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(userId);
    });

    it('should update user profile', async () => {
      const response = await request(app)
        .put(`/api/v1/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Name'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe('Updated Name');
    });

    it('should get user dashboard', async () => {
      const response = await request(app)
        .get(`/api/v1/users/${userId}/dashboard`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('todayScore');
      expect(response.body.data).toHaveProperty('weeklyAverage');
    });
  });

  // Test team endpoints
  describe('Team Endpoints', () => {
    it('should create a team', async () => {
      const response = await request(app)
        .post('/api/v1/teams')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Team FC',
          description: 'Test team for integration tests'
        });
      
      expect(response.status).toBe(201);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('inviteCode');
      
      teamId = response.body.data.id;
    });

    it('should get team details', async () => {
      const response = await request(app)
        .get(`/api/v1/teams/${teamId}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe(teamId);
    });

    it('should get team statistics', async () => {
      const response = await request(app)
        .get(`/api/v1/teams/${teamId}/statistics`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('averageNutritionScore');
    });
  });

  // Test food entry endpoints
  describe('Food Entry Endpoints', () => {
    it('should create a food entry', async () => {
      const response = await request(app)
        .post('/api/v1/food-entries')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          date: new Date().toISOString(),
          mealType: 'LUNCH',
          time: '12:30',
          location: 'School cafeteria',
          description: 'Chicken salad with whole grain bread',
          notes: 'Felt energized after'
        });
      
      expect(response.status).toBe(201);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('nutritionScore');
      
      foodEntryId = response.body.data.id;
    });

    it('should list food entries', async () => {
      const response = await request(app)
        .get('/api/v1/food-entries')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ limit: 10, page: 1 });
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.meta).toHaveProperty('total');
    });

    it('should update a food entry', async () => {
      const response = await request(app)
        .put(`/api/v1/food-entries/${foodEntryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          notes: 'Updated notes'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.data.notes).toBe('Updated notes');
    });
  });

  // Test nutrition analysis
  describe('Nutrition Analysis', () => {
    it('should analyze food description', async () => {
      const response = await request(app)
        .post('/api/v1/nutrition/analyze')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Grilled chicken breast with brown rice and steamed broccoli',
          ageGroup: '13-15'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('nutritionScore');
      expect(response.body.data).toHaveProperty('quality');
      expect(response.body.data).toHaveProperty('calories');
    });
  });

  // Test validation
  describe('Validation', () => {
    it('should reject invalid email format', async () => {
      const response = await request(app)
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: 'invalid-email',
          name: 'Test User',
          age: 15,
          role: 'PLAYER'
        });
      
      expect(response.status).toBe(422);
      expect(response.body.error.message).toContain('Validation failed');
    });

    it('should reject age outside valid range', async () => {
      const response = await request(app)
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: 'test2@example.com',
          name: 'Test User',
          age: 5, // Too young
          role: 'PLAYER'
        });
      
      expect(response.status).toBe(422);
    });

    it('should reject invalid meal type', async () => {
      const response = await request(app)
        .post('/api/v1/food-entries')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          date: new Date().toISOString(),
          mealType: 'INVALID_TYPE',
          time: '12:30',
          description: 'Test food'
        });
      
      expect(response.status).toBe(422);
    });
  });

  // Test rate limiting
  describe('Rate Limiting', () => {
    it('should enforce rate limits', async () => {
      // Make many requests quickly
      const promises = Array(150).fill(null).map(() =>
        request(app)
          .get('/api/v1/users')
          .set('Authorization', `Bearer ${authToken}`)
      );
      
      const responses = await Promise.all(promises);
      const rateLimited = responses.some(r => r.status === 429);
      
      expect(rateLimited).toBe(true);
    });
  });

  // Test authorization
  describe('Authorization', () => {
    it('should deny access without token', async () => {
      const response = await request(app)
        .get('/api/v1/users');
      
      expect(response.status).toBe(401);
    });

    it('should deny access with invalid token', async () => {
      const response = await request(app)
        .get('/api/v1/users')
        .set('Authorization', 'Bearer invalid-token');
      
      expect(response.status).toBe(401);
    });

    it('should enforce role-based access', async () => {
      // Try to access admin-only endpoint as player
      const response = await request(app)
        .delete(`/api/v1/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(403);
    });
  });

  // Cleanup
  afterAll(async () => {
    // Clean up test data
    if (foodEntryId) {
      await request(app)
        .delete(`/api/v1/food-entries/${foodEntryId}`)
        .set('Authorization', `Bearer ${authToken}`);
    }
    
    if (teamId) {
      await request(app)
        .delete(`/api/v1/teams/${teamId}`)
        .set('Authorization', `Bearer ${authToken}`);
    }
  });
});