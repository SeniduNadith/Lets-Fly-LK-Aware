# DynamicBiz Security Awareness Application - API Documentation

## Overview
This document provides comprehensive documentation for all API endpoints in the DynamicBiz Security Awareness Application. The API is built with Express.js and provides full CRUD operations for all features.

## Base URL
```
http://localhost:3001/api
```

## Authentication
All protected endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## API Endpoints

### 🔐 Authentication (`/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/auth/login` | User login | ❌ |
| `POST` | `/auth/register` | User registration (Admin only) | ✅ Admin |
| `GET` | `/auth/profile` | Get user profile | ✅ |
| `PUT` | `/auth/profile` | Update user profile | ✅ |
| `PUT` | `/auth/change-password` | Change password | ✅ |
| `POST` | `/auth/logout` | User logout | ✅ |

### 📋 Policies (`/policies`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/policies` | Get all policies (with filtering) | ✅ |
| `GET` | `/policies/stats` | Get policy statistics | ✅ |
| `GET` | `/policies/:id` | Get policy by ID | ✅ |
| `POST` | `/policies` | Create new policy | ✅ Admin |
| `PUT` | `/policies/:id` | Update policy | ✅ Admin |
| `DELETE` | `/policies/:id` | Delete policy (soft delete) | ✅ Admin |
| `POST` | `/policies/:id/acknowledge` | Acknowledge policy | ✅ |

### 📝 Quizzes (`/quizzes`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/quizzes` | Get all quizzes (with filtering) | ✅ |
| `GET` | `/quizzes/:id` | Get quiz by ID with questions | ✅ |
| `POST` | `/quizzes/:id/start` | Start a new quiz attempt | ✅ |
| `POST` | `/quizzes/:id/attempt` | Submit quiz attempt | ✅ |
| `GET` | `/quizzes/:id/results` | Get quiz results | ✅ |
| `POST` | `/quizzes` | Create new quiz | ✅ Admin |
| `PUT` | `/quizzes/:id` | Update quiz | ✅ Admin |
| `DELETE` | `/quizzes/:id` | Delete quiz | ✅ Admin |

### 🎮 Games (`/games`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/games` | Get all games (with filtering) | ✅ |
| `GET` | `/games/history` | Get user's game history | ✅ |
| `GET` | `/games/:id` | Get game by ID | ✅ |
| `POST` | `/games/:id/start` | Start a new game session | ✅ |
| `POST` | `/games/:id/attempt` | Submit game attempt | ✅ |
| `GET` | `/games/:id/results` | Get game results | ✅ |
| `GET` | `/games/:gameId/leaderboard` | Get game leaderboard | ✅ |
| `POST` | `/games` | Create new game | ✅ Admin |
| `PUT` | `/games/:id` | Update game | ✅ Admin |
| `DELETE` | `/games/:id` | Delete game | ✅ Admin |

### 📚 Training (`/training`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/training` | Get all training modules | ✅ |
| `GET` | `/training/progress` | Get user's training progress | ✅ |
| `GET` | `/training/:id` | Get training module by ID | ✅ |
| `POST` | `/training/:id/start` | Start training module | ✅ |
| `PUT` | `/training/:id/progress` | Update training progress | ✅ |
| `POST` | `/training/:id/complete` | Complete training module | ✅ |
| `POST` | `/training` | Create new training module | ✅ Admin |
| `PUT` | `/training/:id` | Update training module | ✅ Admin |
| `DELETE` | `/training/:id` | Delete training module | ✅ Admin |

### 📊 Reports (`/reports`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/reports/dashboard` | Get dashboard statistics | ✅ |
| `GET` | `/reports/compliance` | Get compliance report | ✅ |
| `GET` | `/reports/training-progress` | Get training progress report | ✅ |
| `GET` | `/reports/quiz-performance` | Get quiz performance report | ✅ |
| `GET` | `/reports/policy-acknowledgments` | Get policy acknowledgment report | ✅ |
| `POST` | `/reports/export` | Export report data | ✅ |

### 💡 Security Facts (`/facts`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/facts` | Get all security facts | ✅ |
| `GET` | `/facts/random` | Get random security fact | ✅ |
| `GET` | `/facts/categories` | Get fact categories | ✅ |
| `GET` | `/facts/category/:category` | Get facts by category | ✅ |
| `GET` | `/facts/:id` | Get security fact by ID | ✅ |
| `POST` | `/facts` | Create new security fact | ✅ Admin |
| `PUT` | `/facts/:id` | Update security fact | ✅ Admin |
| `DELETE` | `/facts/:id` | Delete security fact | ✅ Admin |

### 👤 Profile (`/profile`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/profile` | Get user profile | ✅ |
| `PUT` | `/profile` | Update user profile | ✅ |
| `PUT` | `/profile/password` | Change password | ✅ |
| `GET` | `/profile/preferences` | Get user preferences | ✅ |
| `PUT` | `/profile/preferences` | Update user preferences | ✅ |
| `GET` | `/profile/activity` | Get user activity history | ✅ |
| `PUT` | `/profile/mfa` | Toggle MFA | ✅ |
| `GET` | `/profile/stats` | Get user statistics | ✅ |

## Request/Response Examples

### Login Request
```json
POST /api/auth/login
{
  "username": "admin",
  "password": "admin123"
}
```

### Login Response
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "admin",
      "role": "admin",
      "department": "IT"
    }
  }
}
```

### Get Policies Request
```json
GET /api/policies?category=General&priority=high
Authorization: Bearer <token>
```

### Get Policies Response
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Acceptable Use Policy",
      "content": "This policy outlines the acceptable use...",
      "category": "General",
      "priority": "high",
      "status": "published",
      "acknowledged": false
    }
  ],
  "count": 1
}
```

### Create Quiz Request
```json
POST /api/quizzes
Authorization: Bearer <token>
{
  "title": "Basic Security Quiz",
  "description": "Test your basic security knowledge",
  "role_id": 1,
  "category": "General",
  "difficulty": "beginner",
  "time_limit": 30,
  "passing_score": 70,
  "questions": [
    {
      "question_text": "What is a strong password?",
      "question_type": "multiple_choice",
      "points": 1,
      "answers": [
        {
          "answer_text": "Password123",
          "is_correct": false
        },
        {
          "answer_text": "MyName123!",
          "is_correct": true
        }
      ]
    }
  ]
}
```

## Error Responses

### Standard Error Format
```json
{
  "error": "Error message description"
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

## Filtering and Pagination

### Query Parameters
Most list endpoints support filtering:
- `category` - Filter by category
- `status` - Filter by status
- `priority` - Filter by priority
- `search` - Search in title/description
- `limit` - Number of items per page
- `offset` - Number of items to skip

### Example with Filtering
```
GET /api/policies?category=Data%20Security&priority=high&search=encryption&limit=10&offset=0
```

## Real-time Features

### Socket.IO Events
The application supports real-time updates via Socket.IO:

- `join-role` - Join role-based room
- `quiz-submitted` - Quiz submission updates
- `game-completed` - Game completion updates
- `policy-acknowledged` - Policy acknowledgment updates

## Security Features

- **JWT Authentication** - Secure token-based authentication
- **Role-Based Access Control** - Different permissions for different user roles
- **Rate Limiting** - API rate limiting to prevent abuse
- **Input Validation** - Comprehensive input validation and sanitization
- **Audit Logging** - All user actions are logged for compliance
- **MFA Support** - Multi-factor authentication support

## Database Schema

The API works with the following MySQL tables:
- `users` - User accounts and authentication
- `roles` - User roles and permissions
- `policies` - Security policies
- `policy_acknowledgments` - Policy acknowledgments
- `quizzes` - Security quizzes
- `quiz_questions` - Quiz questions
- `quiz_answers` - Quiz answer options
- `quiz_attempts` - User quiz attempts
- `mini_games` - Security mini-games
- `game_attempts` - User game attempts
- `security_facts` - Security tips and facts
- `training_modules` - Training modules
- `training_progress` - User training progress
- `audit_logs` - System audit logs

## Testing the API

### Health Check
```bash
curl http://localhost:3001/health
```

### Login Test
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

### Get Policies (with token)
```bash
curl http://localhost:3001/api/policies \
  -H "Authorization: Bearer <your-token>"
```

## Development Notes

- All endpoints return consistent JSON responses
- Error handling is centralized and standardized
- Database queries use parameterized statements for security
- Logging is comprehensive for debugging and monitoring
- The API supports both development and production environments

## Support

For API support or questions, please refer to the main project documentation or contact the development team.
