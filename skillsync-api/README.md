# SkillSync API

A REST API for a Developer Skill Matching Platform built with Node.js, Express, and MongoDB.

**Live API**: https://skillsync-api-q8jx.onrender.com

## Tech Stack

- Backend: Node.js, Express.js
- Database: MongoDB Atlas with Mongoose
- Authentication: JWT
- Validation: express-validator
- Documentation: Swagger/OpenAPI

## Getting Started

### Prerequisites

- Node.js (v14+)
- MongoDB Atlas account

### Installation

1. Clone the repo and install dependencies:
   ```bash
   git clone <repository-url>
   cd skillsync-api
   npm install
   ```

2. Set up environment variables in `.env`:
   ```
   NODE_ENV=development
   PORT=3000
   MONGODB_URI=your-mongodb-uri
   JWT_SECRET=your-secret
   JWT_EXPIRE=30d
   ```

3. Start the server:
   ```bash
   npm run dev  # Development
   npm start    # Production
   ```

API available at `http://localhost:3000`

## API Documentation

Visit `http://localhost:3000/api-docs` for Swagger docs.

### Key Endpoints

- `POST /api/users/register` - Register user
- `POST /api/users/login` - Login
- `GET /api/users` - Get users
- `GET /api/projects` - Get projects
- `POST /api/projects` - Create project

## Testing

```bash
npm test
```
