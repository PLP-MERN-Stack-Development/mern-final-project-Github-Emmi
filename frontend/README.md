# EmmiDev-CodeBridge Frontend

React + Redux + TailwindCSS frontend application for the EmmiDev-CodeBridge learning platform.

## 🚀 Quick Start

### Prerequisites
- Node.js >= 16.x
- npm or yarn
- Backend server running on port 5000

### Installation

1. **Install dependencies**
```bash
npm install
```

2. **Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env` and update the values:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_PAYSTACK_PUBLIC_KEY=your-paystack-public-key
```

3. **Start development server**
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable components
│   │   ├── PrivateRoute.jsx    # Protected route wrapper
│   │   ├── RoleRoute.jsx       # Role-based access control
│   │   └── ConnectionStatus.jsx # Socket connection indicator
│   ├── pages/               # Page components
│   │   ├── auth/               # Login, Register
│   │   ├── student/            # Student dashboard
│   │   ├── tutor/              # Tutor dashboard
│   │   ├── admin/              # Admin dashboard
│   │   ├── courses/            # Course listing & details
│   │   ├── community/          # Social feed
│   │   ├── chat/               # Real-time chat
│   │   ├── notifications/      # Notifications center
│   │   └── profile/            # User profile
│   ├── redux/               # State management
│   │   ├── store.js            # Redux store configuration
│   │   └── slices/
│   │       └── authSlice.js    # Authentication state
│   ├── services/            # API & Socket services
│   │   ├── api.js              # Axios instance with interceptors
│   │   └── socket.js           # Socket.io client service
│   ├── hooks/               # Custom React hooks
│   │   └── useSocket.js        # Socket connection hook
│   ├── App.jsx              # Main app component
│   └── main.jsx             # Entry point
├── public/                  # Static assets
├── .env                     # Environment variables (gitignored)
├── .env.example             # Environment template
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## 🔌 Backend Connection

The frontend connects to the backend through:

1. **REST API** - Axios instance configured in `src/services/api.js`
   - Base URL: `VITE_API_URL` (default: http://localhost:5000/api)
   - Auto-includes JWT token from localStorage
   - Auto-redirects to login on 401 responses

2. **WebSocket** - Socket.io client in `src/services/socket.js`
   - Real-time chat messages
   - Live notifications
   - Typing indicators
   - Community feed updates

## 🔐 Authentication Flow

1. User registers/logs in via `/login` or `/register`
2. JWT token and user data stored in localStorage
3. Token included in all API requests via axios interceptor
4. Socket.io connects with token for real-time features
5. Role-based routing redirects users to appropriate dashboard

## 🎨 Styling

- **TailwindCSS v4** - Utility-first CSS framework
- **Heroicons** - Icon library
- **Gradient backgrounds** - Indigo, purple, pink themes
- **Responsive design** - Mobile-first approach

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

---

**Built with React + Vite + Redux + TailwindCSS by EmmiDev**

