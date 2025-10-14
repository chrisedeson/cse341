const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Passport
const { passport } = require('./middleware/auth');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const projectRoutes = require('./routes/projects');
const applicationRoutes = require('./routes/applications');
const messageRoutes = require('./routes/messages');
const reviewRoutes = require('./routes/reviews');

// Middleware
// Configure Helmet with relaxed CSP for OAuth and Swagger
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", "https://github.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware for OAuth
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SkillSync API',
      version: '1.0.0',
      description: 'Developer Skill Matching Platform API',
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' ? process.env.BASE_URL || `https://skillsync-api-q8jx.onrender.com` : `http://localhost:${PORT}`,
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        githubAuth: {
          type: 'oauth2',
          flows: {
            authorizationCode: {
              authorizationUrl: 'https://github.com/login/oauth/authorize',
              tokenUrl: 'https://github.com/login/oauth/access_token',
              scopes: {
                'user:email': 'Access user email',
                'read:user': 'Read user profile',
              },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./routes/*.js', './models/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/reviews', reviewRoutes);

// Welcome endpoint
app.get('/', (req, res) => {
  const baseUrl = process.env.NODE_ENV === 'production' ? process.env.BASE_URL || `https://skillsync-api-q8jx.onrender.com` : `http://localhost:${PORT}`;
  res.status(200).json({
    message: 'Welcome to SkillSync API',
    version: '1.0.0',
    docs: `${baseUrl}/api-docs`
  });
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'SkillSync API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler (catch-all)
// Use an unpatterned middleware to avoid issues with newer path-to-regexp parsing
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
.then(() => {
  console.log('Connected to MongoDB Atlas');
  app.listen(PORT, () => {
    console.log(`SkillSync API server running on port ${PORT}`);
    console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
  });
})
.catch((error) => {
  console.error('MongoDB connection error:', error);
  process.exit(1);
});

module.exports = app;