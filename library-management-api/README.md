# Library Management API

A comprehensive RESTful API for managing library books and members with borrowing functionality.

## Live Demo

**API Base URL**: https://library-management-api-ca0s.onrender.com/  
**Interactive Documentation**: https://library-management-api-ca0s.onrender.com/api-docs

## Features

- **Book Management**: Full CRUD operations for books with advanced search and filtering
- **Member Management**: Complete member lifecycle management
- **Borrowing System**: Book borrowing and returning functionality
- **Data Validation**: Comprehensive input validation using express-validator
- **Error Handling**: Robust error handling with meaningful responses
- **API Documentation**: Auto-generated Swagger/OpenAPI documentation
- **Database**: MongoDB with Mongoose ODM

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **ODM**: Mongoose
- **Validation**: Express-validator
- **Documentation**: Swagger/OpenAPI
- **Environment**: dotenv

## API Endpoints

### Books

- `GET /api/books` - Get all books (with pagination and filtering)
- `GET /api/books/:id` - Get book by ID
- `GET /api/books/genre/:genre` - Get books by genre
- `POST /api/books` - Create new book
- `PUT /api/books/:id` - Update book
- `DELETE /api/books/:id` - Delete book

### Members

- `GET /api/members` - Get all members (with pagination and filtering)
- `GET /api/members/:id` - Get member by ID
- `POST /api/members` - Create new member
- `PUT /api/members/:id` - Update member
- `DELETE /api/members/:id` - Delete member

### Borrowing

- `POST /api/members/:memberId/borrow/:bookId` - Borrow a book
- `POST /api/members/:memberId/return/:bookId` - Return a book

## Data Models

### Book Schema (11 fields)

- `title` (String, required)
- `author` (String, required)
- `isbn` (String, required, unique)
- `genre` (String, enum, required)
- `publishedYear` (Number, required)
- `availableCopies` (Number, required)
- `totalCopies` (Number, required)
- `description` (String, optional)
- `publisher` (String, optional)
- `language` (String, default: 'English')
- `pageCount` (Number, optional)

### Member Schema (10+ fields)

- `firstName` (String, required)
- `lastName` (String, required)
- `email` (String, required, unique)
- `phone` (String, required)
- `address` (Object with street, city, state, zipCode)
- `membershipDate` (Date, default: now)
- `membershipType` (String, enum)
- `borrowedBooks` (Array of borrowed book records)
- `isActive` (Boolean, default: true)
- `fines` (Number, default: 0)

## Query Parameters

### Books

- `page` - Page number for pagination
- `limit` - Number of items per page
- `genre` - Filter by genre
- `author` - Filter by author (partial match)
- `search` - Text search across title, author, and description

### Members

- `page` - Page number for pagination
- `limit` - Number of items per page
- `membershipType` - Filter by membership type
- `isActive` - Filter by active status

## Response Format

All API responses follow this structure:

```json
{
  "success": true/false,
  "message": "Response message",
  "data": {}, // Response data
  "pagination": {}, // For paginated responses
  "errors": [] // For validation errors
}
```

## Quick Start & Testing

### Try the Live API:

```bash
# Get all books
curl https://library-management-api-ca0s.onrender.com/api/books

# Get all members
curl https://library-management-api-ca0s.onrender.com/api/members

# Or visit the interactive documentation
# https://library-management-api-ca0s.onrender.com/api-docs
```

## Validation

The API includes comprehensive validation for:

- Required fields
- Data types and formats
- String lengths
- Email format
- Phone number format
- ISBN format
- ZIP code format
- Date ranges

## Error Handling

The API handles various error scenarios:

- Validation errors (400)
- Not found errors (404)
- Duplicate key errors (400)
- Server errors (500)
- Business logic errors (400)

## API Documentation

Interactive API documentation is available at `/api-docs` when the server is running.

## Development

Run in development mode with auto-restart:

```bash
npm run dev
```

Generate Swagger documentation:

```bash
npm run swagger
```
