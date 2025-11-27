// frontend/src/hooks/useSocket.js
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import socketService from '../services/socket';

export const useSocket = () => {
  const { token, user, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated && token) {
      // Connect to socket when user is authenticated
      socketService.connect(token);

      // Subscribe to notifications
      if (user?._id) {
        socketService.subscribeToNotifications(user._id);
      }

      return () => {
        // Disconnect when component unmounts or user logs out
        socketService.disconnect();
      };
    }
  }, [isAuthenticated, token, user?._id]);

  return socketService;
};
