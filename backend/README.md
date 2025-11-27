# EmmiDev-CodeBridge Backend API

A comprehensive MERN-based learning management platform backend with real-time features, Zoom integration, AI-powered recommendations, and payment processing.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role-based access control (student, tutor, admin, superadmin)
- **Course Management**: Complete CRUD operations for courses with enrollment, ratings, and progress tracking
- **Zoom Integration**: Create and manage live classes with Zoom API
- **Assignment System**: Assignment creation, file submission, auto-grading assistance with AI
- **Payment Integration**: Paystack integration for course payments with webhook verification
- **Community Feed**: Social features with posts, likes, comments, and media uploads
- **Real-time Chat**: Socket.io powered group chat for courses and direct messaging
- **Notifications**: In-app notification system with real-time updates
- **AI Recommendations**: OpenAI-powered study recommendations, resource suggestions, and performance analysis
- **File Uploads**: Cloudinary integration for media and document uploads

## 📋 Prerequisites

- Node.js >= 16.x
- MongoDB >= 5.x
- npm or yarn

## 🛠️ Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd emmidev-codebridge/backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
# Server
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/emmidev-codebridge

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Zoom API
ZOOM_ACCOUNT_ID=your-account-id
ZOOM_CLIENT_ID=your-client-id
ZOOM_CLIENT_SECRET=your-client-secret

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# Paystack
PAYSTACK_SECRET_KEY=your-paystack-secret
PAYSTACK_PUBLIC_KEY=your-paystack-public-key

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:5000`

## 📊 Seed Database

To populate the database with sample data:
```bash
node seed.js
```

**Sample Accounts:**
- Admin: `admin@emmidevcode.com` / `password123`
- Tutor: `emmidev@emmidevcode.com` / `password123`
- Student: `john@student.com` / `password123`

## 📚 API Documentation

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/register` | Register new user | Public |
| POST | `/login` | Login user | Public |
| GET | `/me` | Get current user | Private |
| PUT | `/profile` | Update profile | Private |
| PUT | `/password` | Change password | Private |
| POST | `/logout` | Logout user | Private |

### Course Routes (`/api/courses`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/` | Get all courses | Public |
| GET | `/:id` | Get single course | Public |
| POST | `/` | Create course | Tutor |
| PUT | `/:id` | Update course | Tutor |
| DELETE | `/:id` | Delete course | Tutor |
| POST | `/:id/enroll` | Enroll in course | Student |
| GET | `/:id/schedule` | Get course schedule | Enrolled |
| POST | `/:id/rating` | Add course rating | Student |

### Zoom Routes (`/api/zoom`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/create` | Create Zoom meeting | Tutor |
| GET | `/meeting/:meetingId` | Get meeting details | Private |
| PUT | `/meeting/:meetingId` | Update meeting | Tutor |
| DELETE | `/meeting/:meetingId` | Delete meeting | Tutor |
| POST | `/webhook` | Zoom webhook handler | Public |

### Assignment Routes (`/api/assignments`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/` | Create assignment | Tutor |
| GET | `/course/:courseId` | Get course assignments | Enrolled |
| GET | `/:id` | Get assignment details | Private |
| POST | `/:id/submit` | Submit assignment | Student |
| GET | `/:id/submissions` | Get all submissions | Tutor |
| PUT | `/submission/:id/grade` | Grade submission | Tutor |
| GET | `/my-submissions` | Get my submissions | Student |

### Feed Routes (`/api/feeds`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/` | Get all posts | Public |
| GET | `/:id` | Get single post | Public |
| POST | `/` | Create post | Private |
| PUT | `/:id` | Update post | Author |
| DELETE | `/:id` | Delete post | Author |
| POST | `/:id/like` | Toggle like | Private |
| POST | `/:id/comment` | Add comment | Private |
| DELETE | `/:postId/comment/:commentId` | Delete comment | Author |

### Chat Routes (`/api/chat`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/rooms` | Get user's chat rooms | Private |
| GET | `/rooms/:roomId/messages` | Get room messages | Private |
| POST | `/rooms/direct` | Create direct room | Private |
| DELETE | `/messages/:messageId` | Delete message | Private |

### Notification Routes (`/api/notifications`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/` | Get notifications | Private |
| GET | `/unread-count` | Get unread count | Private |
| PUT | `/mark-all-read` | Mark all as read | Private |
| PUT | `/:id/read` | Mark as read | Private |
| DELETE | `/:id` | Delete notification | Private |

### Payment Routes (`/api/payments`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/init` | Initialize payment | Private |
| GET | `/verify/:reference` | Verify payment | Private |
| GET | `/history` | Get payment history | Private |
| POST | `/webhook` | Paystack webhook | Public |

### AI Routes (`/api/ai`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/recommend` | Get study recommendations | Private |
| POST | `/resources` | Get resource recommendations | Private |
| GET | `/performance-analysis/:courseId` | Analyze performance | Private |
| POST | `/study-plan` | Generate study plan | Private |
| POST | `/ask` | Ask AI a question | Private |
| POST | `/pre-grade/:submissionId` | Pre-grade submission | Tutor |

## 🔌 Socket.io Events

### Client → Server

- `joinRoom` - Join a chat room
- `leaveRoom` - Leave a chat room
- `sendMessage` - Send message to room
- `typing` - Typing indicator
- `stopTyping` - Stop typing
- `markAsRead` - Mark message as read
- `signalOffer`, `signalAnswer`, `iceCandidate` - WebRTC signaling
- `joinNotifications` - Subscribe to notifications

### Server → Client

- `newMessage` - New message in room
- `userJoined` - User joined room
- `userLeft` - User left room
- `userTyping` - User is typing
- `userStoppedTyping` - User stopped typing
- `messageRead` - Message marked as read
- `newNotification` - New notification
- `postCreated` - New post in feed
- `postLikeUpdated` - Post like updated
- `commentAdded` - Comment added to post

## 🗂️ Project Structure

```
backend/
├── config/          # Configuration files (DB, Cloudinary)
├── controllers/     # Route controllers
├── middleware/      # Custom middleware (auth, upload, rate limit)
├── models/          # Mongoose models
├── routes/          # API routes
├── services/        # Business logic (Zoom, AI, Socket)
├── utils/           # Utility functions (email, JWT, cloudinary)
├── server.js        # Application entry point
├── seed.js          # Database seeding script
└── .env.example     # Environment variables template
```

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Rate limiting on API endpoints
- Input validation
- Webhook signature verification
- CORS configuration
- Environment variable protection

## 🧪 Testing

```bash
npm test
```

## 📦 Deployment

### Render / Railway / Heroku

1. Set environment variables in platform dashboard
2. Connect GitHub repository
3. Deploy automatically on push

### Docker

```bash
docker build -t emmidev-backend .
docker run -p 5000:5000 --env-file .env emmidev-backend
```

### MongoDB Atlas Setup

1. Create cluster at mongodb.com
2. Get connection string
3. Add to `MONGODB_URI` in `.env`
4. Whitelist IP addresses

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

MIT License - see LICENSE file for details

## 👨‍💻 Author

**EmmiDev** - Full Stack Developer
- YouTube: [@EmmiDevCodes](https://youtube.com/@EmmiDevCodes)
- Email: emmidev@emmidevcode.com

## 🙏 Acknowledgments

- MongoDB for database
- Cloudinary for media storage
- Zoom for video conferencing
- OpenAI for AI features
- Paystack for payment processing
