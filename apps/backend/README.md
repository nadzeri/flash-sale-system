# User Management API - Course Material

## Overview
A comprehensive user management API built with Node.js, Express, PostgreSQL, and Drizzle ORM. This project serves as teaching material for "API Design with Node.js v5" course.

## Tech Stack
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **Testing**: Jest & Supertest
- **Security**: Helmet & CORS

## Features

### Day 1 - Foundation
- RESTful API design principles
- Express routing and middleware
- PostgreSQL setup with Drizzle ORM
- CRUD operations for users
- Error handling middleware
- Request validation with Zod

### Day 2 - Advanced Features
- User authentication (register/login)
- JWT-based authorization
- Protected routes
- Advanced endpoints:
  - **POST /users/password** - Change user password
  - **PUT /users/profile** - Update user profile

## API Endpoints

### Authentication (Public Routes)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Users (Protected Routes)
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/password` - Change password

## Database Schema

### Users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

## Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/user_management

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Server
PORT=3000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:5173
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v13 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the database:
   ```bash
   # Create database
   createdb user_management

   # Run migrations
   npm run db:push

   # Seed the database
   npm run db:seed
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Testing

Run the test suite:
```bash
npm test
```

Run specific test file:
```bash
npm test auth.test.ts
```

## API Usage Examples

### User Registration
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "johndoe",
    "password": "securePassword123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### User Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securePassword123"
  }'
```

### Get User Profile
```bash
curl -X GET http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update User Profile
```bash
curl -X PUT http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith"
  }'
```

### Change Password
```bash
curl -X PUT http://localhost:3000/api/users/password \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "oldPassword123",
    "newPassword": "newSecurePassword456"
  }'
```

## Project Structure

```
src/
├── controllers/          # Route handlers
│   ├── authController.ts
│   └── userController.ts
├── db/                  # Database configuration
│   ├── connection.ts
│   ├── schema.ts
│   └── seed.ts
├── middleware/          # Custom middleware
│   ├── auth.ts
│   ├── errorHandler.ts
│   └── validation.ts
├── routes/             # Route definitions
│   ├── authRoutes.ts
│   └── userRoutes.ts
├── utils/              # Utility functions
│   ├── jwt.ts
│   └── password.ts
├── index.ts            # Application entry point
└── server.ts           # Express app configuration
```

## Security Features

- Password hashing with bcrypt
- JWT-based authentication
- CORS protection
- Helmet security headers
- Input validation with Zod
- SQL injection prevention with Drizzle ORM

## Error Handling

The API includes comprehensive error handling:
- Validation errors (400)
- Authentication errors (401)
- Not found errors (404)
- Server errors (500)

All errors return consistent JSON responses with appropriate status codes and error messages.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License.