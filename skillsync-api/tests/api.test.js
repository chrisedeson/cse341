const request = require('supertest');const request = require('supertest');

const mongoose = require('mongoose');const mongoose = require('mongoose');

const app = require('./index');

// We need to start the server before running testsconst User = require('./models/User');

let app;const Project = require('./models/Project');

let server;

describe('SkillSync API Tests', () => {

beforeAll(async () => {  let server;

  // Connect to test database    let token;

  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://edesonchristopher_db_user:3WbPxBTgaGJwC6ix@cluster0.skp8rck.mongodb.net/skillsync_test?retryWrites=true&w=majority';  let userId;

    let projectId;

  await mongoose.connect(MONGODB_URI);

    beforeAll(async () => {

  // Import app after DB connection    // Connect to test database

  app = require('../index');    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/skillsync-test');

  server = app.listen(0); // Random port for testing

});    // Start server

    server = app.listen(3001);

afterAll(async () => {  });

  // Close server and database connection

  if (server) await new Promise(resolve => server.close(resolve));  afterAll(async () => {

  await mongoose.connection.close();    // Close server and database connection

});    await server.close();

    await mongoose.connection.close();

describe('SkillSync API Tests', () => {  });

  let token;

  let userId;  beforeEach(async () => {

  let projectId;    // Clear database before each test

  let applicationId;    await User.deleteMany({});

  let messageId;    await Project.deleteMany({});

  let reviewId;  });

  let otherUserId;

  describe('Authentication', () => {

  describe('Authentication Tests', () => {    test('should register a new user', async () => {

    test('GET / - should return welcome message', async () => {      const userData = {

      const response = await request(app)        name: 'Test User',

        .get('/')        email: 'test@example.com',

        .expect(200);        password: 'password123'

      };

      expect(response.body.message).toContain('Welcome to SkillSync API');

    });      const response = await request(app)

        .post('/api/users/register')

    test('GET /health - should return health status', async () => {        .send(userData)

      const response = await request(app)        .expect(201);

        .get('/health')

        .expect(200);      expect(response.body.success).toBe(true);

      expect(response.body.data.user.email).toBe(userData.email);

      expect(response.body.status).toBe('OK');      expect(response.body.data.token).toBeDefined();

    });    });



    test('POST /api/users/register - should register a new user', async () => {    test('should login user', async () => {

      const userData = {      // First register a user

        name: 'Test User',      const userData = {

        email: `test${Date.now()}@example.com`,        name: 'Test User',

        password: 'Password123'        email: 'test@example.com',

      };        password: 'password123'

      };

      const response = await request(app)

        .post('/api/users/register')      await request(app)

        .send(userData)        .post('/api/users/register')

        .expect(201);        .send(userData);



      expect(response.body.success).toBe(true);      // Then login

      expect(response.body.data.token).toBeDefined();      const response = await request(app)

      token = response.body.data.token;        .post('/api/users/login')

      userId = response.body.data.user._id;        .send({

    });          email: userData.email,

          password: userData.password

    test('POST /api/users/login - should login user', async () => {        })

      // Create another user for testing        .expect(200);

      const userData = {

        name: 'Other User',      expect(response.body.success).toBe(true);

        email: `other${Date.now()}@example.com`,      expect(response.body.data.token).toBeDefined();

        password: 'Password123'      token = response.body.data.token;

      };      userId = response.body.data.user._id;

    });

      const registerResponse = await request(app)

        .post('/api/users/register')    test('should not login with wrong password', async () => {

        .send(userData);      const response = await request(app)

        .post('/api/users/login')

      otherUserId = registerResponse.body.data.user._id;        .send({

          email: 'test@example.com',

      const response = await request(app)          password: 'wrongpassword'

        .post('/api/users/login')        })

        .send({        .expect(401);

          email: userData.email,

          password: userData.password      expect(response.body.success).toBe(false);

        })    });

        .expect(200);  });



      expect(response.body.success).toBe(true);  describe('Users API', () => {

      expect(response.body.data.token).toBeDefined();    beforeEach(async () => {

    });      // Register and login to get token

  });      const userData = {

        name: 'Test User',

  describe('Users API - GET Routes', () => {        email: 'test@example.com',

    test('GET /api/users - should get all users', async () => {        password: 'password123'

      const response = await request(app)      };

        .get('/api/users')

        .set('Authorization', `Bearer ${token}`)      const registerResponse = await request(app)

        .expect(200);        .post('/api/users/register')

        .send(userData);

      expect(response.body.success).toBe(true);

      expect(Array.isArray(response.body.data)).toBe(true);      const loginResponse = await request(app)

    });        .post('/api/users/login')

        .send({

    test('GET /api/users/:id - should get user by ID', async () => {          email: userData.email,

      const response = await request(app)          password: userData.password

        .get(`/api/users/${userId}`)        });

        .set('Authorization', `Bearer ${token}`)

        .expect(200);      token = loginResponse.body.data.token;

      userId = loginResponse.body.data.user._id;

      expect(response.body.success).toBe(true);    });

      expect(response.body.data._id).toBe(userId);

    });    test('should get user profile', async () => {

      const response = await request(app)

    test('GET /api/users/profile - should get current user profile', async () => {        .get('/api/users/profile')

      const response = await request(app)        .set('Authorization', `Bearer ${token}`)

        .get('/api/users/profile')        .expect(200);

        .set('Authorization', `Bearer ${token}`)

        .expect(200);      expect(response.body.success).toBe(true);

      expect(response.body.data.user.email).toBe('test@example.com');

      expect(response.body.success).toBe(true);    });

      expect(response.body.data._id).toBe(userId);

    });    test('should update user profile', async () => {

      const updateData = {

    test('GET /api/users/search - should search users by skills', async () => {        bio: 'Updated bio',

      const response = await request(app)        location: 'New York, NY'

        .get('/api/users/search?skills=JavaScript')      };

        .set('Authorization', `Bearer ${token}`)

        .expect(200);      const response = await request(app)

        .put('/api/users/profile')

      expect(response.body.success).toBe(true);        .set('Authorization', `Bearer ${token}`)

    });        .send(updateData)

  });        .expect(200);



  describe('Projects API - GET Routes', () => {      expect(response.body.success).toBe(true);

    beforeAll(async () => {      expect(response.body.data.user.bio).toBe(updateData.bio);

      // Create a test project      expect(response.body.data.user.location).toBe(updateData.location);

      const projectData = {    });

        title: 'Test Project',  });

        description: 'This is a test project for unit testing',

        category: 'web-development',  describe('Projects API', () => {

        requiredSkills: [    beforeEach(async () => {

          { name: 'JavaScript', level: 'intermediate', isRequired: true }      // Register and login to get token

        ]      const userData = {

      };        name: 'Test User',

        email: 'test@example.com',

      const response = await request(app)        password: 'password123'

        .post('/api/projects')      };

        .set('Authorization', `Bearer ${token}`)

        .send(projectData);      const registerResponse = await request(app)

        .post('/api/users/register')

      projectId = response.body.data._id;        .send(userData);

    });

      const loginResponse = await request(app)

    test('GET /api/projects - should get all projects', async () => {        .post('/api/users/login')

      const response = await request(app)        .send({

        .get('/api/projects')          email: userData.email,

        .expect(200);          password: userData.password

        });

      expect(response.body.success).toBe(true);

      expect(Array.isArray(response.body.data)).toBe(true);      token = loginResponse.body.data.token;

    });      userId = loginResponse.body.data.user._id;

    });

    test('GET /api/projects/:id - should get project by ID', async () => {

      const response = await request(app)    test('should create a new project', async () => {

        .get(`/api/projects/${projectId}`)      const projectData = {

        .expect(200);        title: 'Test Project',

        description: 'This is a test project description',

      expect(response.body.success).toBe(true);        category: 'web-development',

      expect(response.body.data._id).toBe(projectId);        requiredSkills: [

    });          { name: 'JavaScript', level: 'intermediate', isRequired: true }

        ]

    test('GET /api/projects/my/projects - should get current user projects', async () => {      };

      const response = await request(app)

        .get('/api/projects/my/projects')      const response = await request(app)

        .set('Authorization', `Bearer ${token}`)        .post('/api/projects')

        .expect(200);        .set('Authorization', `Bearer ${token}`)

        .send(projectData)

      expect(response.body.success).toBe(true);        .expect(201);

      expect(Array.isArray(response.body.data)).toBe(true);

    });      expect(response.body.success).toBe(true);

      expect(response.body.data.project.title).toBe(projectData.title);

    test('GET /api/projects/featured - should get featured projects', async () => {      expect(response.body.data.project.owner).toBe(userId);

      const response = await request(app)      projectId = response.body.data.project._id;

        .get('/api/projects/featured')    });

        .expect(200);

    test('should get all projects', async () => {

      expect(response.body.success).toBe(true);      // First create a project

    });      const projectData = {

  });        title: 'Test Project',

        description: 'This is a test project description',

  describe('Applications API - GET Routes', () => {        category: 'web-development',

    beforeAll(async () => {        requiredSkills: [

      // Create a test application          { name: 'JavaScript', level: 'intermediate', isRequired: true }

      const applicationData = {        ]

        project: projectId,      };

        coverLetter: 'This is my cover letter for the test application. I am very interested in this project.',

        proposedRole: 'Frontend Developer',      await request(app)

        skillsOffered: [        .post('/api/projects')

          { name: 'React', level: 'advanced' },        .set('Authorization', `Bearer ${token}`)

          { name: 'TypeScript', level: 'intermediate' }        .send(projectData);

        ],

        availability: {      // Then get all projects

          hoursPerWeek: 20,      const response = await request(app)

          startDate: new Date().toISOString()        .get('/api/projects')

        },        .set('Authorization', `Bearer ${token}`)

        expectedCompensation: {        .expect(200);

          amount: 50,

          currency: 'USD',      expect(response.body.success).toBe(true);

          type: 'hourly'      expect(response.body.data.projects.length).toBeGreaterThan(0);

        }    });

      };

    test('should get project by ID', async () => {

      const response = await request(app)      // First create a project

        .post('/api/applications')      const projectData = {

        .set('Authorization', `Bearer ${token}`)        title: 'Test Project',

        .send(applicationData);        description: 'This is a test project description',

        category: 'web-development',

      applicationId = response.body.data._id;        requiredSkills: [

    });          { name: 'JavaScript', level: 'intermediate', isRequired: true }

        ]

    test('GET /api/applications - should get all applications', async () => {      };

      const response = await request(app)

        .get('/api/applications')      const createResponse = await request(app)

        .set('Authorization', `Bearer ${token}`)        .post('/api/projects')

        .expect(200);        .set('Authorization', `Bearer ${token}`)

        .send(projectData);

      expect(response.body.success).toBe(true);

      expect(Array.isArray(response.body.data)).toBe(true);      projectId = createResponse.body.data.project._id;

    });

      // Then get the project by ID

    test('GET /api/applications/:id - should get application by ID', async () => {      const response = await request(app)

      const response = await request(app)        .get(`/api/projects/${projectId}`)

        .get(`/api/applications/${applicationId}`)        .set('Authorization', `Bearer ${token}`)

        .set('Authorization', `Bearer ${token}`)        .expect(200);

        .expect(200);

      expect(response.body.success).toBe(true);

      expect(response.body.success).toBe(true);      expect(response.body.data.project.title).toBe(projectData.title);

      expect(response.body.data._id).toBe(applicationId);    });

    });

    test('should update project', async () => {

    test('GET /api/applications/my/applications - should get user applications', async () => {      // First create a project

      const response = await request(app)      const projectData = {

        .get('/api/applications/my/applications')        title: 'Test Project',

        .set('Authorization', `Bearer ${token}`)        description: 'This is a test project description',

        .expect(200);        category: 'web-development',

        requiredSkills: [

      expect(response.body.success).toBe(true);          { name: 'JavaScript', level: 'intermediate', isRequired: true }

      expect(Array.isArray(response.body.data)).toBe(true);        ]

    });      };



    test('GET /api/applications/project/:projectId - should get project applications', async () => {      const createResponse = await request(app)

      const response = await request(app)        .post('/api/projects')

        .get(`/api/applications/project/${projectId}`)        .set('Authorization', `Bearer ${token}`)

        .set('Authorization', `Bearer ${token}`)        .send(projectData);

        .expect(200);

      projectId = createResponse.body.data.project._id;

      expect(response.body.success).toBe(true);

      expect(Array.isArray(response.body.data)).toBe(true);      // Then update the project

    });      const updateData = {

  });        title: 'Updated Project Title',

        status: 'in-progress'

  describe('Messages API - GET Routes', () => {      };

    beforeAll(async () => {

      // Create a test message      const response = await request(app)

      const messageData = {        .put(`/api/projects/${projectId}`)

        recipient: otherUserId,        .set('Authorization', `Bearer ${token}`)

        subject: 'Test Message Subject',        .send(updateData)

        content: 'This is the test message content for unit testing purposes.',        .expect(200);

        priority: 'normal',

        category: 'general'      expect(response.body.success).toBe(true);

      };      expect(response.body.data.project.title).toBe(updateData.title);

      expect(response.body.data.project.status).toBe(updateData.status);

      const response = await request(app)    });

        .post('/api/messages')  });

        .set('Authorization', `Bearer ${token}`)

        .send(messageData);  describe('Health Check', () => {

    test('should return health status', async () => {

      messageId = response.body.data._id;      const response = await request(app)

    });        .get('/health')

        .expect(200);

    test('GET /api/messages - should get user inbox', async () => {

      const response = await request(app)      expect(response.body.status).toBe('OK');

        .get('/api/messages?type=inbox')      expect(response.body.message).toBe('SkillSync API is running');

        .set('Authorization', `Bearer ${token}`)    });

        .expect(200);  });

});
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('GET /api/messages - should get sent messages', async () => {
      const response = await request(app)
        .get('/api/messages?type=sent')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('GET /api/messages/:id - should get message by ID', async () => {
      const response = await request(app)
        .get(`/api/messages/${messageId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(messageId);
    });

    test('GET /api/messages/unread/count - should get unread message count', async () => {
      const response = await request(app)
        .get('/api/messages/unread/count')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.unreadCount).toBeDefined();
    });

    test('GET /api/messages/conversation/:userId - should get conversation', async () => {
      const response = await request(app)
        .get(`/api/messages/conversation/${otherUserId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('Reviews API - GET Routes', () => {
    beforeAll(async () => {
      // Create a test review
      const reviewData = {
        project: projectId,
        reviewee: otherUserId,
        rating: 5,
        title: 'Excellent Work',
        comment: 'This person did an outstanding job on the project. Highly recommended for future collaborations.',
        categories: {
          communication: 5,
          technicalSkills: 5,
          reliability: 5,
          teamwork: 5,
          quality: 5
        },
        wouldWorkAgain: true,
        isPublic: true
      };

      const response = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${token}`)
        .send(reviewData);

      reviewId = response.body.data._id;
    });

    test('GET /api/reviews - should get all reviews', async () => {
      const response = await request(app)
        .get('/api/reviews')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('GET /api/reviews/:id - should get review by ID', async () => {
      const response = await request(app)
        .get(`/api/reviews/${reviewId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(reviewId);
    });

    test('GET /api/reviews/user/:userId - should get user reviews', async () => {
      const response = await request(app)
        .get(`/api/reviews/user/${otherUserId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.stats).toBeDefined();
    });

    test('GET /api/reviews/project/:projectId - should get project reviews', async () => {
      const response = await request(app)
        .get(`/api/reviews/project/${projectId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
});
