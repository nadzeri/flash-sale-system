# User Management API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
Most endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Authentication

#### Register New User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response (201 Created):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "username": "johndoe"
  },
  "token": "jwt-token-here"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK):**
```json
{
  "message": "Login successful",
  "token": "jwt-token-here",
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "username": "johndoe"
  }
}
```

### User Management

#### Get User Profile
```http
GET /users/profile
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "username": "johndoe",
    "firstName": "John",
    "lastName": "Doe",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

#### Update User Profile
```http
PUT /users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Smith"
}
```

**Response (200 OK):**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "username": "johndoe",
    "firstName": "Jane",
    "lastName": "Smith"
  }
}
```

#### Change Password
```http
PUT /users/password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "oldPassword123",
  "newPassword": "newSecurePassword456"
}
```

**Response (200 OK):**
```json
{
  "message": "Password changed successfully"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "error": "Authentication required",
  "message": "Please provide a valid token"
}
```

### 404 Not Found
```json
{
  "error": "User not found",
  "message": "The requested user does not exist"
}
```

### 409 Conflict
```json
{
  "error": "User already exists",
  "message": "A user with this email or username already exists"
}
```

### 500 Internal Server Error
```json
{
  "error": "Something went wrong!",
  "message": "An unexpected error occurred"
}
```

## SDK Examples

### JavaScript/TypeScript
```typescript
class UserManagementAPI {
  private baseURL = 'http://localhost:3000/api';
  private token: string | null = null;

  async login(email: string, password: string) {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    this.token = data.token;
    return data;
  }

  async register(userData: { email: string, username: string, password: string, firstName?: string, lastName?: string }) {
    const response = await fetch(`${this.baseURL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    const data = await response.json();
    this.token = data.token;
    return data;
  }

  async getUserProfile() {
    const response = await fetch(`${this.baseURL}/users/profile`, {
      headers: { 'Authorization': `Bearer ${this.token}` }
    });
    return response.json();
  }

  async updateUserProfile(profileData: { firstName?: string, lastName?: string }) {
    const response = await fetch(`${this.baseURL}/users/profile`, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(profileData)
    });
    return response.json();
  }

  async changePassword(currentPassword: string, newPassword: string) {
    const response = await fetch(`${this.baseURL}/users/password`, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ currentPassword, newPassword })
    });
    return response.json();
  }
}

// Usage
const api = new UserManagementAPI();
await api.login('user@example.com', 'password');
const profile = await api.getUserProfile();
await api.updateUserProfile({ firstName: 'Jane', lastName: 'Smith' });
```