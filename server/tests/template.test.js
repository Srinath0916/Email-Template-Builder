const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');
const Template = require('../models/Template');

let token;
let userId;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/email-builder-test');
  
  const res = await request(app)
    .post('/api/auth/signup')
    .send({
      name: 'Template Test User',
      email: 'template@example.com',
      password: 'password123'
    });
  
  token = res.body.token;
  userId = res.body.user.id;
});

afterAll(async () => {
  await Template.deleteMany({});
  await User.deleteMany({});
  await mongoose.connection.close();
});

describe('Template API', () => {
  let templateId;

  describe('POST /api/templates', () => {
    it('should create a new template', async () => {
      const res = await request(app)
        .post('/api/templates')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Test Template',
          blocks: [
            { id: '1', type: 'text', content: 'Hello' }
          ]
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.template).toHaveProperty('name', 'Test Template');
      templateId = res.body.template._id;
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .post('/api/templates')
        .send({
          name: 'Test Template'
        });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/templates', () => {
    it('should get all user templates', async () => {
      const res = await request(app)
        .get('/api/templates')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.templates).toBeInstanceOf(Array);
      expect(res.body.templates.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/templates/:id', () => {
    it('should get a specific template', async () => {
      const res = await request(app)
        .get(`/api/templates/${templateId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.template).toHaveProperty('name', 'Test Template');
    });
  });

  describe('PUT /api/templates/:id', () => {
    it('should update a template', async () => {
      const res = await request(app)
        .put(`/api/templates/${templateId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Updated Template',
          blocks: []
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.template).toHaveProperty('name', 'Updated Template');
    });
  });

  describe('DELETE /api/templates/:id', () => {
    it('should delete a template', async () => {
      const res = await request(app)
        .delete(`/api/templates/${templateId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Template deleted successfully');
    });
  });
});
