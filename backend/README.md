# Campus Digitization Backend

A comprehensive Express + TypeScript backend for the campus digitization platform, providing REST APIs and real-time Socket.IO functionality. Built with Supabase for database operations, JWT authentication, and AI integration.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Real-time Communication**: Socket.IO for live notifications and updates
- **AI Integration**: OpenAI-powered chat, summarization, and recommendations
- **Predictive Analytics**: Student risk assessment and intervention management
- **Schedule Optimization**: Intelligent class scheduling with conflict detection
- **Attendance Management**: API endpoints for external attendance system integration
- **Comprehensive API**: RESTful endpoints for all platform features

## 🛠 Tech Stack

- **Runtime**: Node.js 18+ with TypeScript
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT with bcrypt password hashing
- **Real-time**: Socket.IO
- **AI**: OpenAI API integration
- **Validation**: Joi
- **Logging**: Winston
- **Testing**: Jest
- **Containerization**: Docker

## 📋 Prerequisites

- Node.js 18 or higher
- npm or yarn
- Supabase account and project
- OpenAI API key (optional, for AI features)

## 🔧 Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   ```bash
   cp env.example .env
   ```

4. **Configure environment variables**
   Edit `.env` file with your configuration:

   ```env
   # Server Configuration
   PORT=4000
   NODE_ENV=development

   # Supabase Configuration
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

   # JWT Configuration
   JWT_SECRET=supersecretkey
   JWT_EXPIRES_IN=7d

   # OpenAI Configuration (optional)
   OPENAI_API_KEY=your-openai-api-key

   # Socket.IO Configuration
   SOCKET_ORIGIN=http://localhost:5173
   ```

5. **Set up Supabase Database**

   Create the following tables in your Supabase project:

   ```sql
   -- Users table
   CREATE TABLE users (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     name TEXT NOT NULL,
     email TEXT UNIQUE NOT NULL,
     password_hash TEXT NOT NULL,
     role TEXT CHECK (role IN ('student', 'teacher', 'admin')) NOT NULL,
     courses UUID[] DEFAULT '{}',
     attendance_rate DECIMAL(5,2) DEFAULT 0,
     metadata JSONB DEFAULT '{}',
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Courses table
   CREATE TABLE courses (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     name TEXT NOT NULL,
     description TEXT,
     teacher_id UUID REFERENCES users(id),
     students UUID[] DEFAULT '{}',
     schedule TEXT,
     room TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Notifications table
   CREATE TABLE notifications (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     title TEXT NOT NULL,
     body TEXT NOT NULL,
     recipient_id TEXT NOT NULL, -- user ID or 'all'
     read_by UUID[] DEFAULT '{}',
     link TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Lectures table
   CREATE TABLE lectures (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     course_id UUID REFERENCES courses(id),
     teacher_id UUID REFERENCES users(id),
     date DATE NOT NULL,
     recording_url TEXT,
     transcript TEXT,
     summary_id UUID,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Summaries table
   CREATE TABLE summaries (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     lecture_id UUID REFERENCES lectures(id),
     bullets TEXT[] NOT NULL,
     transcript TEXT NOT NULL,
     generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Recommendations table
   CREATE TABLE recommendations (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES users(id),
     resource_title TEXT NOT NULL,
     resource_url TEXT NOT NULL,
     reason TEXT NOT NULL,
     feedback JSONB,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Schedules table
   CREATE TABLE schedules (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     date DATE NOT NULL,
     start_time TIME NOT NULL,
     end_time TIME NOT NULL,
     room TEXT NOT NULL,
     course_id UUID REFERENCES courses(id),
     teacher_id UUID REFERENCES users(id),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Interventions table
   CREATE TABLE interventions (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     student_id UUID REFERENCES users(id),
     triggered_by UUID REFERENCES users(id),
     reason TEXT NOT NULL,
     status TEXT CHECK (status IN ('open', 'closed')) DEFAULT 'open',
     actions JSONB DEFAULT '[]',
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Attendance events table
   CREATE TABLE attendance_events (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     class_id TEXT NOT NULL,
     timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
     students JSONB NOT NULL,
     recorded_by UUID REFERENCES users(id),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- AI conversations table
   CREATE TABLE ai_conversations (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES users(id),
     title TEXT NOT NULL,
     messages JSONB DEFAULT '[]',
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

6. **Seed the database**
   ```bash
   npm run seed
   ```

## 🚀 Running the Application

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm run build
npm start
```

### Docker

```bash
# Build and run with Docker Compose
docker-compose up --build

# Or build and run individual container
docker build -t campus-backend .
docker run -p 4000:4000 --env-file .env campus-backend
```

## 📚 API Documentation

### Authentication Endpoints

#### `POST /api/auth/login`

Login with email and password.

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### `POST /api/auth/register`

Register a new user (admin only).

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student"
}
```

#### `GET /api/auth/me`

Get current user information (requires authentication).

### User Management

#### `GET /api/users`

List all users with pagination (admin only).

- Query params: `page`, `limit`, `role`, `search`

#### `GET /api/users/:id`

Get user by ID.

#### `PUT /api/users/:id`

Update user information.

#### `DELETE /api/users/:id`

Delete user (admin only).

### Notifications

#### `GET /api/notifications`

Get user notifications with pagination.

- Query params: `page`, `limit`, `unread_only`

#### `POST /api/notifications`

Create notification (teacher/admin only).

```json
{
  "title": "Important Announcement",
  "body": "Please read this important update",
  "to": "user-id-or-all",
  "link": "/announcements/123"
}
```

#### `POST /api/notifications/:id/read`

Mark notification as read.

### AI Features

#### `POST /api/ai/chat`

Send message to AI assistant.

```json
{
  "userId": "user-id",
  "message": "Hello, can you help me with calculus?",
  "conversationId": "optional-conversation-id"
}
```

#### `GET /api/ai/conversations`

Get user's AI conversations.

- Query param: `userId`

#### `POST /api/ai/lectures/:id/summarize`

Generate summary for lecture.

#### `GET /api/ai/lectures/:id/summary`

Get lecture summary.

### Schedule Management

#### `GET /api/schedule`

Get schedules with filters.

- Query params: `page`, `limit`, `date`, `course_id`, `teacher_id`

#### `POST /api/schedule`

Create new schedule (teacher/admin only).

#### `POST /api/schedule/optimize`

Optimize schedule (admin only).

```json
{
  "teachers": ["teacher-id-1", "teacher-id-2"],
  "rooms": ["room-1", "room-2"],
  "constraints": {
    "max_hours_per_day": 8,
    "preferred_times": ["09:00-10:00", "14:00-15:00"]
  }
}
```

### Predictive Analytics

#### `POST /api/predictive/assess`

Assess student risk level.

```json
{
  "userId": "student-id",
  "batch": false
}
```

#### `GET /api/predictive/insights/:userId`

Get student insights and recommendations.

#### `GET /api/predictive/interventions`

Get interventions with filters.

#### `POST /api/predictive/interventions`

Create intervention (teacher/admin only).

### Attendance

#### `POST /api/attendance/events`

Receive attendance events from external system.

```json
{
  "classId": "course-123",
  "timestamp": "2024-01-15T10:00:00Z",
  "students": [
    { "userId": "student-1", "status": "present" },
    { "userId": "student-2", "status": "absent" }
  ]
}
```

#### `GET /api/attendance/stats`

Get attendance statistics.

### Recommendations

#### `GET /api/recommendations`

Get personalized recommendations.

- Query param: `userId`

#### `POST /api/recommendations/:id/feedback`

Record recommendation feedback.

```json
{
  "useful": true
}
```

## 🔌 Socket.IO Events

### Client Events

#### `authenticate`

Authenticate with JWT token.

```json
{
  "token": "jwt-token"
}
```

#### `presence`

Update presence status.

```json
{
  "token": "jwt-token",
  "classId": "optional-class-id"
}
```

### Server Events

#### `notification`

New notification received.

```json
{
  "id": "notification-id",
  "title": "Notification Title",
  "body": "Notification Body",
  "link": "/optional-link"
}
```

#### `engagement_update`

Class engagement score update.

```json
{
  "classId": "class-id",
  "score": 85,
  "timestamp": "2024-01-15T10:00:00Z"
}
```

#### `ai_alert`

AI-generated alert for user.

```json
{
  "message": "Alert message",
  "timestamp": "2024-01-15T10:00:00Z"
}
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📊 Monitoring & Logging

The application includes comprehensive logging with Winston:

- **Console output** in development
- **Structured JSON logs** in production
- **Request/response logging**
- **Error tracking**
- **Performance metrics**

## 🔒 Security Features

- **Helmet.js** for security headers
- **CORS** configuration
- **Rate limiting** on all endpoints
- **JWT token validation**
- **Password hashing** with bcrypt
- **Input validation** with Joi
- **SQL injection protection** (Supabase)
- **XSS protection**

## 🌐 Environment Variables

| Variable                    | Description               | Default                 |
| --------------------------- | ------------------------- | ----------------------- |
| `PORT`                      | Server port               | `4000`                  |
| `NODE_ENV`                  | Environment               | `development`           |
| `SUPABASE_URL`              | Supabase project URL      | Required                |
| `SUPABASE_ANON_KEY`         | Supabase anonymous key    | Required                |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Required                |
| `JWT_SECRET`                | JWT signing secret        | Required                |
| `JWT_EXPIRES_IN`            | JWT expiration time       | `7d`                    |
| `OPENAI_API_KEY`            | OpenAI API key            | Optional                |
| `SOCKET_ORIGIN`             | Socket.IO allowed origin  | `http://localhost:5173` |

## 🚀 Deployment

### Docker Deployment

1. **Build the image**

   ```bash
   docker build -t campus-backend .
   ```

2. **Run with environment variables**
   ```bash
   docker run -p 4000:4000 \
     -e SUPABASE_URL=your-url \
     -e SUPABASE_ANON_KEY=your-key \
     -e SUPABASE_SERVICE_ROLE_KEY=your-service-key \
     -e JWT_SECRET=your-secret \
     campus-backend
   ```

### Docker Compose Deployment

```bash
# Copy environment variables
cp env.example .env

# Edit .env with your configuration

# Start services
docker-compose up -d
```

### Production Considerations

- Use a reverse proxy (nginx) for SSL termination
- Set up proper logging and monitoring
- Configure environment-specific variables
- Use a process manager (PM2) for Node.js
- Set up database backups
- Configure rate limiting appropriately
- Use HTTPS in production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Check the API documentation
- Review the logs for error details
- Ensure all environment variables are set correctly

## 🔄 Changelog

### Version 1.0.0

- Initial release
- Complete REST API implementation
- Socket.IO real-time features
- AI integration with OpenAI
- Predictive analytics
- Schedule optimization
- Comprehensive authentication system
- Docker support
