// frontend/src/components/ConnectionStatus.jsx
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import socketService from '../services/socket';

const ConnectionStatus = () => {
  const [isConnected, setIsConnected] = useState(false);
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated) return;

    const checkConnection = () => {
      setIsConnected(socketService.connected);
    };

    // Check immediately
    checkConnection();

    // Check periodically
    const interval = setInterval(checkConnection, 3000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  if (!isAuthenticated || isConnected) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded-lg shadow-lg text-sm">
      <div className="flex items-center">
        <div className="animate-pulse mr-2">●</div>
        Connecting to server...
      </div>
    </div>
  );
};

export default ConnectionStatus;
