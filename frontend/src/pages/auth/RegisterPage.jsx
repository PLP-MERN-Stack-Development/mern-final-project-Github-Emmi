// frontend/src/pages/auth/RegisterPage.jsx
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { register, clearError } from '../../redux/slices/authSlice';
import { Eye, EyeOff, Mail, Lock, User, FileText, GraduationCap, BookOpen, Award, CheckCircle } from 'lucide-react';
import AnimatedBackground from '../../components/landing/AnimatedBackground';
import GradientButton from '../../components/ui/GradientButton';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated, user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    bio: '',
  });

  const [validationError, setValidationError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '', color: '' });

  useEffect(() => {
    if (isAuthenticated) {
      // Redirect based on user role
      switch (user?.role) {
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
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    // Clear error when component unmounts
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear validation error when user types
    setValidationError('');
    
    // Calculate password strength
    if (name === 'password') {
      calculatePasswordStrength(value);
    }
  };

  const calculatePasswordStrength = (password) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z\d]/.test(password)) score++;

    const strengths = [
      { score: 0, label: '', color: '' },
      { score: 1, label: 'Very Weak', color: 'bg-red-500' },
      { score: 2, label: 'Weak', color: 'bg-orange-500' },
      { score: 3, label: 'Fair', color: 'bg-yellow-500' },
      { score: 4, label: 'Good', color: 'bg-lime-500' },
      { score: 5, label: 'Strong', color: 'bg-green-500' },
    ];

    setPasswordStrength(strengths[score]);
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setValidationError('Passwords do not match');
      return false;
    }
    if (formData.password.length < 6) {
      setValidationError('Password must be at least 6 characters long');
      return false;
    }
    if (formData.name.trim().length < 2) {
      setValidationError('Name must be at least 2 characters long');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const { confirmPassword, ...registerData } = formData;
    dispatch(register(registerData));
  };

  return (
    <div className="min-h-screen flex bg-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <AnimatedBackground />

      {/* Left Side - Promo Panel */}
      {/* Left Side - Promo Panel */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="hidden lg:flex lg:w-1/2 relative z-10 items-center justify-center p-12"
      >
        <div className="max-w-xl">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex items-center space-x-2 mb-8"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/50">
              <Award className="h-7 w-7 text-white" />
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              EmmiDev
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-5xl font-bold text-white mb-6 leading-tight"
          >
            Start Your Tech Journey Today
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-xl text-gray-300 mb-12"
          >
            Join thousands of African developers transforming their careers through world-class education.
          </motion.p>

          {/* Benefits */}
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="space-y-4 mb-10"
          >
            {[
              'Access to 100+ premium courses',
              'Learn from industry experts',
              'Get AI-powered study assistance',
              'Join a vibrant tech community',
              'Earn certificates on completion'
            ].map((benefit, index) => (
              <motion.div 
                key={index}
                variants={fadeInUp}
                className="flex items-center space-x-3"
              >
                <CheckCircle className="h-6 w-6 text-green-400 flex-shrink-0" />
                <span className="text-gray-300">{benefit}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="grid grid-cols-3 gap-6"
          >
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-1">
                10K+
              </div>
              <div className="text-sm text-gray-400">Active Students</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-1">
                150+
              </div>
              <div className="text-sm text-gray-400">Courses</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-red-400 bg-clip-text text-transparent mb-1">
                95%
              </div>
              <div className="text-sm text-gray-400">Success Rate</div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Side - Register Form */}
      <motion.div 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10"
      >
        <div className="w-full max-w-md">
          {/* Glassmorphism Card */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8 md:p-10">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">
                Create Account
              </h2>
              <p className="text-gray-300">
                Start learning for free today
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              {(error || validationError) && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/20 backdrop-blur-sm border border-red-500/50 text-red-200 px-4 py-3 rounded-xl flex items-center space-x-2"
                  role="alert"
                >
                  <span className="text-red-400">⚠️</span>
                  <span className="text-sm">{error || validationError}</span>
                </motion.div>
              )}

              {/* Full Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-200 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="block w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-3">
                  I want to join as
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'student' })}
                    className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                      formData.role === 'student'
                        ? 'bg-indigo-500/30 border-indigo-500 shadow-lg shadow-indigo-500/20'
                        : 'bg-white/5 border-white/20 hover:bg-white/10'
                    }`}
                  >
                    <GraduationCap className="h-8 w-8 text-white mb-2" />
                    <span className="text-white font-medium text-sm">Student</span>
                    <span className="text-gray-400 text-xs mt-1">Learn & Grow</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'tutor' })}
                    className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                      formData.role === 'tutor'
                        ? 'bg-purple-500/30 border-purple-500 shadow-lg shadow-purple-500/20'
                        : 'bg-white/5 border-white/20 hover:bg-white/10'
                    }`}
                  >
                    <BookOpen className="h-8 w-8 text-white mb-2" />
                    <span className="text-white font-medium text-sm">Tutor</span>
                    <span className="text-gray-400 text-xs mt-1">Teach & Earn</span>
                  </button>
                </div>
                {formData.role === 'tutor' && (
                  <p className="mt-2 text-xs text-gray-400 bg-purple-500/10 border border-purple-500/30 rounded-lg p-2">
                    ℹ️ Tutor accounts require admin verification before creating courses
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full pl-12 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-200 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-400">Password Strength</span>
                      <span className={`text-xs font-medium ${
                        passwordStrength.score >= 4 ? 'text-green-400' : 
                        passwordStrength.score >= 3 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="flex space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-1.5 flex-1 rounded-full transition-all ${
                            i < passwordStrength.score ? passwordStrength.color : 'bg-white/20'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-200 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="block w-full pl-12 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-200 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Bio (Optional) */}
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-200 mb-2">
                  Bio <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <div className="relative">
                  <div className="absolute top-3 left-0 pl-4 pointer-events-none">
                    <FileText className="h-5 w-5 text-gray-400" />
                  </div>
                  <textarea
                    id="bio"
                    name="bio"
                    rows="3"
                    value={formData.bio}
                    onChange={handleChange}
                    className="block w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </div>

              {/* Submit Button */}
              <GradientButton
                type="submit"
                disabled={loading}
                className="w-full py-3.5 text-base font-semibold mt-6"
                size="lg"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Creating account...</span>
                  </div>
                ) : (
                  'Create Account'
                )}
              </GradientButton>

              {/* Terms */}
              <p className="text-xs text-center text-gray-400 mt-4">
                By signing up, you agree to our{' '}
                <a href="#" className="text-indigo-400 hover:text-indigo-300">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-indigo-400 hover:text-indigo-300">Privacy Policy</a>
              </p>

              {/* Sign In Link */}
              <div className="text-center pt-4">
                <p className="text-sm text-gray-300">
                  Already have an account?{' '}
                  <Link to="/login" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
                    Sign in
                  </Link>
                </p>
              </div>
            </form>
          </div>

          {/* Back to Home Link */}
          <div className="text-center mt-6">
            <Link to="/" className="text-sm text-gray-400 hover:text-gray-200 transition-colors">
              ← Back to homepage
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
