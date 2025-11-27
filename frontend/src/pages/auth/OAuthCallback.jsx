// frontend/src/pages/auth/OAuthCallback.jsx
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../redux/slices/authSlice';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const userStr = searchParams.get('user');
    const error = searchParams.get('error');

    if (error) {
      // Handle OAuth error
      console.error('OAuth Error:', error);
      navigate('/login?error=' + error);
      return;
    }

    if (token && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr));
        
        // Store token and user in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Update Redux state
        dispatch(setCredentials({ token, user }));
        
        // Redirect based on user role
        setTimeout(() => {
          switch (user.role) {
            case 'admin':
            case 'superadmin':
              navigate('/admin/dashboard');
              break;
            case 'tutor':
              navigate('/tutor/dashboard');
              break;
            default:
              navigate('/student/dashboard');
          }
        }, 1000);
      } catch (error) {
        console.error('Error parsing OAuth response:', error);
        navigate('/login?error=invalid_response');
      }
    } else {
      navigate('/login?error=missing_credentials');
    }
  }, [searchParams, navigate, dispatch]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <Loader2 className="h-16 w-16 text-white animate-spin mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">
          Completing Sign In...
        </h2>
        <p className="text-white/80">
          Please wait while we redirect you to your dashboard
        </p>
      </motion.div>
    </div>
  );
};

export default OAuthCallback;
