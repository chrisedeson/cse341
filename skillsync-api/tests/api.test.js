const request = require('supertest');
const mongoose = require('mongoose');
const app = require('./index');
const User = require('./models/User');
const Project = require('./models/Project');

describe('SkillSync API Tests', () => {
  let server;
  let token;
  let userId;
  let projectId;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/skillsync-test');

    // Start server
    server = app.listen(3001);
  });

  afterAll(async () => {
    // Close server and database connection
    await server.close();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear database before each test
    await User.deleteMany({});
    await Project.deleteMany({});
  });

  describe('Authentication', () => {
    test('should register a new user', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/users/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.token).toBeDefined();
    });

    test('should login user', async () => {
      // First register a user
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      await request(app)
        .post('/api/users/register')
        .send(userData);

      // Then login
      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: userData.email,
          password: userData.password
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      token = response.body.data.token;
      userId = response.body.data.user._id;
    });

    test('should not login with wrong password', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Users API', () => {
    beforeEach(async () => {
      // Register and login to get token
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      const registerResponse = await request(app)
        .post('/api/users/register')
        .send(userData);

      const loginResponse = await request(app)
        .post('/api/users/login')
        .send({
          email: userData.email,
          password: userData.password
        });

      token = loginResponse.body.data.token;
      userId = loginResponse.body.data.user._id;
    });

    test('should get user profile', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('test@example.com');
    });

    test('should update user profile', async () => {
      const updateData = {
        bio: 'Updated bio',
        location: 'New York, NY'
      };

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.bio).toBe(updateData.bio);
      expect(response.body.data.user.location).toBe(updateData.location);
    });
  });

  describe('Projects API', () => {
    beforeEach(async () => {
      // Register and login to get token
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      const registerResponse = await request(app)
        .post('/api/users/register')
        .send(userData);

      const loginResponse = await request(app)
        .post('/api/users/login')
        .send({
          email: userData.email,
          password: userData.password
        });

      token = loginResponse.body.data.token;
      userId = loginResponse.body.data.user._id;
    });

    test('should create a new project', async () => {
      const projectData = {
        title: 'Test Project',
        description: 'This is a test project description',
        category: 'web-development',
        requiredSkills: [
          { name: 'JavaScript', level: 'intermediate', isRequired: true }
        ]
      };

      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${token}`)
        .send(projectData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.project.title).toBe(projectData.title);
      expect(response.body.data.project.owner).toBe(userId);
      projectId = response.body.data.project._id;
    });

    test('should get all projects', async () => {
      // First create a project
      const projectData = {
        title: 'Test Project',
        description: 'This is a test project description',
        category: 'web-development',
        requiredSkills: [
          { name: 'JavaScript', level: 'intermediate', isRequired: true }
        ]
      };

      await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${token}`)
        .send(projectData);

      // Then get all projects
      const response = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.projects.length).toBeGreaterThan(0);
    });

    test('should get project by ID', async () => {
      // First create a project
      const projectData = {
        title: 'Test Project',
        description: 'This is a test project description',
        category: 'web-development',
        requiredSkills: [
          { name: 'JavaScript', level: 'intermediate', isRequired: true }
        ]
      };

      const createResponse = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${token}`)
        .send(projectData);

      projectId = createResponse.body.data.project._id;

      // Then get the project by ID
      const response = await request(app)
        .get(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.project.title).toBe(projectData.title);
    });

    test('should update project', async () => {
      // First create a project
      const projectData = {
        title: 'Test Project',
        description: 'This is a test project description',
        category: 'web-development',
        requiredSkills: [
          { name: 'JavaScript', level: 'intermediate', isRequired: true }
        ]
      };

      const createResponse = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${token}`)
        .send(projectData);

      projectId = createResponse.body.data.project._id;

      // Then update the project
      const updateData = {
        title: 'Updated Project Title',
        status: 'in-progress'
      };

      const response = await request(app)
        .put(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.project.title).toBe(updateData.title);
      expect(response.body.data.project.status).toBe(updateData.status);
    });
  });

  describe('Health Check', () => {
    test('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('OK');
      expect(response.body.message).toBe('SkillSync API is running');
    });
  });
});