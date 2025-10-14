const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const User = require('../models/User');
const Project = require('../models/Project');

let server;

describe('SkillSync API Tests', () => {
  beforeAll(async () => {
    const MONGODB_URI =
      process.env.MONGODB_URI ||
      'mongodb+srv://edesonchristopher_db_user:3WbPxBTgaGJwC6ix@cluster0.skp8rck.mongodb.net/skillsync_test?retryWrites=true&w=majority';

    // Only connect if not already connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGODB_URI);
    }
    server = app.listen(3001);
  });

  afterAll(async () => {
    if (server) {
      await new Promise(resolve => server.close(resolve));
    }
    await mongoose.disconnect();
  }, 30000);

  let token;
  let userId;
  let projectId;
  let otherUserId;
  let applicationId;
  let messageId;
  let reviewId;

  describe('Authentication Tests', () => {
    test('GET / - should return welcome message', async () => {
      const response = await request(app).get('/').expect(200);
      expect(response.body.message).toContain('Welcome to SkillSync API');
    });

    test('GET /health - should return health status', async () => {
      const response = await request(app).get('/health').expect(200);
      expect(response.body.status).toBe('OK');
    });

    test('POST /api/users/register - should register a new user', async () => {
      const userData = {
        name: 'Test User',
        email: `test${Date.now()}@example.com`,
        password: 'Password123!',
        skills: ['JavaScript', 'Node.js']
      };

      const response = await request(app)
        .post('/api/users/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      token = response.body.data.token;
      userId = response.body.data.user._id;
    }, 10000);

    test('should login user', async () => {
      const uniqueEmail = `testlogin${Date.now()}@example.com`;
      const userData = {
        name: 'Login Test User',
        email: uniqueEmail,
        password: 'Password123!',
        skills: ['JavaScript']
      };

      // First register the user
      await request(app).post('/api/users/register').send(userData).expect(201);

      // Then try to login
      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: userData.email,
          password: userData.password,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
    }, 10000);

    test('should not login with wrong password', async () => {
      const uniqueEmail = `testwrong${Date.now()}@example.com`;
      
      // Register user first
      await request(app).post('/api/users/register').send({
        name: 'Test User',
        email: uniqueEmail,
        password: 'Password123!',
        skills: ['JavaScript']
      }).expect(201);

      // Try to login with wrong password
      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: uniqueEmail,
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    }, 10000);
  });

  describe('Users API', () => {
    let testToken;
    let testUserId;

    beforeAll(async () => {
      // Create a test user for this suite
      const uniqueEmail = `userapi${Date.now()}@example.com`;
      const userData = {
        name: 'User API Test',
        email: uniqueEmail,
        password: 'Password123!',
        skills: ['JavaScript', 'Testing']
      };

      const response = await request(app)
        .post('/api/users/register')
        .send(userData);

      testToken = response.body.data.token;
      testUserId = response.body.data.user._id;
    });

    test('GET /api/users - should get all users', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.users)).toBe(true);
    });

    test('GET /api/users/:id - should get user by ID', async () => {
      const response = await request(app)
        .get(`/api/users/${testUserId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user._id).toBe(testUserId);
    });

    test('GET /api/users/profile - should get current user profile', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user._id).toBe(testUserId);
    });

    test('should update user profile', async () => {
      const updateData = {
        bio: 'Updated bio',
        location: 'New York, NY',
      };

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${testToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.bio).toBe(updateData.bio);
      expect(response.body.data.user.location).toBe(updateData.location);
    });
  });

  describe('Projects API', () => {
    let projectToken;
    let projectUserId;
    let testProjectId;

    beforeAll(async () => {
      const uniqueEmail = `projectapi${Date.now()}@example.com`;
      const userData = {
        name: 'Project Test User',
        email: uniqueEmail,
        password: 'Password123!',
        skills: ['JavaScript', 'Node.js']
      };

      const registerResponse = await request(app)
        .post('/api/users/register')
        .send(userData);

      projectToken = registerResponse.body.data.token;
      projectUserId = registerResponse.body.data.user._id;
    });

    test('should create a new project', async () => {
      const projectData = {
        title: 'Test Project',
        description: 'This is a test project description that is long enough to meet validation requirements',
        category: 'web-development',
        requiredSkills: [
          { name: 'JavaScript', level: 'intermediate', isRequired: true },
        ],
      };

      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${projectToken}`)
        .send(projectData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.project.title).toBe(projectData.title);
      // Owner might be populated, check if it's an object or string
      const ownerId = typeof response.body.data.project.owner === 'object' 
        ? response.body.data.project.owner._id 
        : response.body.data.project.owner;
      expect(ownerId).toBe(projectUserId);
      testProjectId = response.body.data.project._id;
    }, 10000);

    test('should get all projects', async () => {
      const response = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${projectToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.projects)).toBe(true);
    });
  });

  describe('Messages API - GET Routes', () => {
    let msgToken;

    beforeAll(async () => {
      const uniqueEmail = `msgapi${Date.now()}@example.com`;
      const userData = {
        name: 'Message Test User',
        email: uniqueEmail,
        password: 'Password123!',
        skills: ['JavaScript']
      };

      const response = await request(app)
        .post('/api/users/register')
        .send(userData);

      msgToken = response.body.data.token;
    });

    test('GET /api/messages - should get user inbox', async () => {
      const response = await request(app)
        .get('/api/messages?type=inbox')
        .set('Authorization', `Bearer ${msgToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('GET /api/messages - should get sent messages', async () => {
      const response = await request(app)
        .get('/api/messages?type=sent')
        .set('Authorization', `Bearer ${msgToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('GET /api/messages/unread/count - should get unread message count', async () => {
      const response = await request(app)
        .get('/api/messages/unread/count')
        .set('Authorization', `Bearer ${msgToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.unreadCount).toBeDefined();
    });
  });

  describe('Reviews API - GET Routes', () => {
    test('GET /api/reviews - should get all reviews', async () => {
      const response = await request(app).get('/api/reviews').expect(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
});
