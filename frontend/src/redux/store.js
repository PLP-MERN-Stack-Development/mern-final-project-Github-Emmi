// frontend/src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import courseReducer from './slices/courseSlice';
import assignmentReducer from './slices/assignmentSlice';
import feedReducer from './slices/feedSlice';
import notificationReducer from './slices/notificationSlice';
import chatReducer from './slices/chatSlice';
import aiReducer from './slices/aiSlice';
import adminReducer from './slices/adminSlice';
import achievementReducer from './slices/achievementSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    courses: courseReducer,
    assignments: assignmentReducer,
    feed: feedReducer,
    notifications: notificationReducer,
    chat: chatReducer,
    ai: aiReducer,
    admin: adminReducer,
    achievements: achievementReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
