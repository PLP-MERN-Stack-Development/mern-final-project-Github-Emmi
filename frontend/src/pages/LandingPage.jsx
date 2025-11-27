// frontend/src/pages/LandingPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, useInView } from 'framer-motion';
import { 
  BookOpen, 
  Users, 
  Sparkles, 
  Video, 
  Globe, 
  Award,
  ArrowRight,
  Play,
  MessageCircle,
  TrendingUp,
  Star,
  Menu,
  X,
  Github,
  Linkedin,
  Youtube,
  Twitter
} from 'lucide-react';

// Import custom components
import { AnimatedBackground, FeatureCard, CourseCard, TestimonialCard, PostPreview } from '../components/landing';
import GradientButton from '../components/ui/GradientButton';
import ThemeToggle from '../components/ui/ThemeToggle';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
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

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};


// Navigation Bar
const Navbar = ({ isAuthenticated, user, navigate }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getDashboardLink = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'admin':
      case 'superadmin':
        return '/admin/dashboard';
      case 'tutor':
        return '/tutor/dashboard';
      default:
        return '/student/dashboard';
    }
  };

  const navLinks = [
    { href: '#features', label: 'Features' },
    { href: '#courses', label: 'Courses' },
    { href: '#community', label: 'Community' },
    { href: '#testimonials', label: 'Testimonials' },
  ];

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg shadow-2xl shadow-indigo-500/10 border-b border-white/10' 
        : 'bg-transparent'
    }`}>
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <Award className={`h-8 w-8 transition-colors ${
              isScrolled ? 'text-indigo-600' : 'text-white'
            } group-hover:scale-110 transition-transform`} />
            <span className={`text-xl font-bold transition-colors ${
              isScrolled ? 'text-gray-900 dark:text-white' : 'text-white'
            }`}>
              EmmiDev CodeBridge
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`relative font-medium transition-colors ${
                  isScrolled 
                    ? 'text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400' 
                    : 'text-white/90 hover:text-white'
                } group`}
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 group-hover:w-full transition-all duration-300" />
              </a>
            ))}
            
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {isAuthenticated ? (
              <Link 
                to={getDashboardLink()}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg hover:shadow-indigo-500/50 hover:scale-105 transition-all duration-300"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link 
                  to="/login"
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    isScrolled 
                      ? 'text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400' 
                      : 'text-white hover:text-white/80'
                  }`}
                >
                  Login
                </Link>
                <Link 
                  to="/register"
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg hover:shadow-indigo-500/50 hover:scale-105 transition-all duration-300"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <button 
              className="p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className={`h-6 w-6 ${isScrolled ? 'text-gray-900 dark:text-white' : 'text-white'}`} />
              ) : (
                <Menu className={`h-6 w-6 ${isScrolled ? 'text-gray-900 dark:text-white' : 'text-white'}`} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 shadow-lg border-t border-gray-200 dark:border-slate-800 animate-slide-down">
          <div className="px-4 py-6 space-y-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="block text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            
            {isAuthenticated ? (
              <Link 
                to={getDashboardLink()}
                className="block w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold text-center hover:shadow-lg transition-all"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link 
                  to="/login"
                  className="block w-full text-center text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  to="/register"
                  className="block w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold text-center hover:shadow-lg transition-all"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

// Hero Section
const HeroSection = ({ navigate, isAuthenticated }) => {
  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/student/dashboard');
    } else {
      navigate('/register');
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <AnimatedBackground />
      
      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-32 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-5xl md:text-7xl font-bold text-white mb-6"
        >
          Empowering the Next Generation
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-pink-200">
            of African Developers
          </span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto"
        >
          Learn. Build. Connect. Launch your career in tech with live classes, 
          AI-powered learning, and a vibrant community.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <button
            onClick={handleGetStarted}
            className="group bg-white text-indigo-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition shadow-2xl flex items-center space-x-2"
          >
            <span>Start Learning Now</span>
            <ArrowRight className="group-hover:translate-x-1 transition" />
          </button>
          <button className="group bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/10 transition flex items-center space-x-2">
            <Play className="h-5 w-5" />
            <span>Watch Demo</span>
          </button>
        </motion.div>

        {/* Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
          className="grid grid-cols-3 gap-8 mt-20 max-w-3xl mx-auto"
        >
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">5,000+</div>
            <div className="text-white/80">Active Learners</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">100+</div>
            <div className="text-white/80">Expert Tutors</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">200+</div>
            <div className="text-white/80">Courses</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const LandingPage = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const navigate = useNavigate();


  return (
    <div className="min-h-screen">
      <Navbar isAuthenticated={isAuthenticated} user={user} navigate={navigate} />
      <HeroSection navigate={navigate} isAuthenticated={isAuthenticated} />
      <FeaturesSection />
      <CoursesSection navigate={navigate} />
      <CommunitySection />
      <TestimonialsSection />
      <Footer />
    </div>
  );
};

// Features Section
const FeaturesSection = () => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const features = [
    {
      icon: Video,
      title: "Live Zoom Classes",
      description: "Interactive sessions with verified tutors, screen sharing, and real-time collaboration",
      gradient: "from-blue-500 to-cyan-600"
    },
    {
      icon: Sparkles,
      title: "AI Study Assistant",
      description: "Personalized recommendations, study plans, and instant answers powered by AI",
      gradient: "from-purple-500 to-pink-600"
    },
    {
      icon: Users,
      title: "Vibrant Community",
      description: "Share projects, ask questions, and network with fellow developers across Africa",
      gradient: "from-pink-500 to-rose-600"
    },
    {
      icon: BookOpen,
      title: "Rich Course Library",
      description: "Access 200+ courses covering web dev, mobile, AI, and more",
      gradient: "from-indigo-500 to-purple-600"
    },
    {
      icon: TrendingUp,
      title: "Track Your Progress",
      description: "Detailed analytics, certificates, and achievements to showcase your growth",
      gradient: "from-green-500 to-emerald-600"
    },
    {
      icon: Globe,
      title: "Learn Anywhere",
      description: "Optimized for African internet speeds with offline-capable features",
      gradient: "from-orange-500 to-amber-600"
    }
  ];

  return (
    <section id="features" className="py-24 bg-gray-50 dark:bg-slate-900" ref={ref}>
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Everything You Need to Succeed
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            A complete learning ecosystem designed for African developers
          </p>
        </motion.div>

        <motion.div 
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div key={index} variants={fadeInUp}>
              <FeatureCard {...feature} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// Courses Section
const CoursesSection = ({ navigate }) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const courses = [
    {
      id: 1,
      title: "Full Stack Web Development",
      instructor: "Emmanuel Adeyemi",
      duration: "12 weeks",
      price: "₦50,000",
      rating: 4.9,
      students: "1.2k",
      gradient: "from-indigo-500 to-purple-600"
    },
    {
      id: 2,
      title: "Mobile App Development",
      instructor: "Sarah Johnson",
      duration: "10 weeks",
      price: "₦45,000",
      rating: 4.8,
      students: "890",
      gradient: "from-cyan-500 to-blue-600"
    },
    {
      id: 3,
      title: "AI & Machine Learning",
      instructor: "Dr. James Obi",
      duration: "16 weeks",
      price: "₦60,000",
      rating: 4.9,
      students: "650",
      gradient: "from-purple-500 to-pink-600"
    }
  ];

  return (
    <section id="courses" className="py-24 bg-white dark:bg-slate-900" ref={ref}>
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Explore Top Courses
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Learn from industry experts and build real-world projects
          </p>
        </motion.div>

        <motion.div 
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {courses.map((course) => (
            <motion.div key={course.id} variants={scaleIn}>
              <CourseCard {...course} />
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center mt-12"
        >
          <GradientButton 
            to="/courses"
            icon={ArrowRight}
            iconPosition="right"
            size="lg"
          >
            View All Courses
          </GradientButton>
        </motion.div>
      </div>
    </section>
  );
};

// Community Section
const CommunitySection = () => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const posts = [
    {
      name: "Chioma Eze",
      timestamp: "2 hours ago",
      content: "Just completed my first React project! The community here is amazing. Special thanks to @mentor_kwesi for the guidance! 🚀",
      likes: 45,
      comments: 12
    },
    {
      name: "Yusuf Ibrahim",
      timestamp: "5 hours ago",
      content: "Looking for study partners for the upcoming Data Structures bootcamp. Who's in? 💪",
      likes: 32,
      comments: 18
    },
    {
      name: "Aisha Kamara",
      timestamp: "1 day ago",
      content: "Just got my first freelance client thanks to the portfolio tips from this platform! Dreams do come true! 🎉",
      likes: 124,
      comments: 34
    }
  ];

  return (
    <section id="community" className="py-24 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-900" ref={ref}>
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Join the Conversation
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Share your journey, ask questions, and celebrate wins together
          </p>
        </motion.div>

        <motion.div 
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={scaleIn}
          className="max-w-3xl mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-slate-700"
        >
          <motion.div 
            variants={staggerContainer}
            className="space-y-4"
          >
            {posts.map((post, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <PostPreview {...post} />
              </motion.div>
            ))}
          </motion.div>
          
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-700 text-center">
            <Link 
              to="/community" 
              className="inline-flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold transition-colors group"
            >
              <span>View All Posts</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// Testimonials Section with auto-scroll
const TestimonialsSection = () => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const testimonials = [
    {
      name: "Chinedu Okafor",
      role: "Senior Backend Developer at Flutterwave",
      avatar: "https://ui-avatars.com/api/?name=Chinedu+Okafor&background=4F46E5&color=fff",
      content: "From struggling to find a tech job in Lagos to becoming a Senior Backend Developer at Flutterwave! EmmiDev CodeBridge gave me the skills and confidence I needed. The MERN stack course was incredibly detailed and practical.",
      rating: 5,
      location: "Lagos, Nigeria"
    },
    {
      name: "Aisha Abdullahi",
      role: "Full Stack Developer at Paystack",
      avatar: "https://ui-avatars.com/api/?name=Aisha+Abdullahi&background=10B981&color=fff",
      content: "I was a civil engineer before discovering my passion for coding. Within 8 months of joining EmmiDev CodeBridge, I landed my dream job at Paystack. The community support and AI-powered learning tools made all the difference!",
      rating: 5,
      location: "Abuja, Nigeria"
    },
    {
      name: "Emeka Nwankwo",
      role: "Mobile App Developer (Freelance)",
      avatar: "https://ui-avatars.com/api/?name=Emeka+Nwankwo&background=F59E0B&color=fff",
      content: "Now earning $3,000+ monthly as a freelance React Native developer! EmmiDev taught me not just coding, but how to build a sustainable career. I went from zero to building apps for international clients.",
      rating: 5,
      location: "Port Harcourt, Nigeria"
    },
    {
      name: "Fatima Bello",
      role: "Data Scientist at Andela",
      avatar: "https://ui-avatars.com/api/?name=Fatima+Bello&background=EC4899&color=fff",
      content: "The Python for Data Science course changed my life! I transitioned from teaching to tech and now work remotely for Andela. The instructors are world-class and truly care about student success.",
      rating: 5,
      location: "Kano, Nigeria"
    },
    {
      name: "Oluwaseun Adeyemi",
      role: "Frontend Engineer at Interswitch",
      avatar: "https://ui-avatars.com/api/?name=Oluwaseun+Adeyemi&background=8B5CF6&color=fff",
      content: "Started as a complete beginner with no tech background. Today, I'm building enterprise applications at Interswitch. EmmiDev's project-based learning approach is what set them apart. Real skills, real results!",
      rating: 5,
      location: "Ibadan, Nigeria"
    },
    {
      name: "Ngozi Okonkwo",
      role: "DevOps Engineer at Kuda Bank",
      avatar: "https://ui-avatars.com/api/?name=Ngozi+Okonkwo&background=06B6D4&color=fff",
      content: "From working in a pharmacy to becoming a DevOps Engineer! The career transition seemed impossible until I found EmmiDev CodeBridge. The mentorship program connected me with industry professionals who guided my journey.",
      rating: 5,
      location: "Enugu, Nigeria"
    },
    {
      name: "Ibrahim Musa",
      role: "Software Engineer at Microsoft (Remote)",
      avatar: "https://ui-avatars.com/api/?name=Ibrahim+Musa&background=EF4444&color=fff",
      content: "Living my dream! Working remotely for Microsoft from Lagos. EmmiDev CodeBridge prepared me for technical interviews and gave me the confidence to apply to top tech companies. The AI study assistant was invaluable!",
      rating: 5,
      location: "Lagos, Nigeria"
    },
    {
      name: "Blessing Okoro",
      role: "Full Stack Developer & Tech Entrepreneur",
      avatar: "https://ui-avatars.com/api/?name=Blessing+Okoro&background=F97316&color=fff",
      content: "Not only did I get a job, but I also launched my own tech startup! EmmiDev taught me full-stack development and entrepreneurial thinking. Now I employ 5 developers and we're building amazing products for African businesses.",
      rating: 5,
      location: "Calabar, Nigeria"
    }
  ];

  return (
    <section id="testimonials" className="py-24 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-900 dark:via-purple-900 dark:to-pink-900 relative overflow-hidden" ref={ref}>
      <div className="absolute inset-0 bg-grid-white/10"></div>
      
      <div className="w-full px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Success Stories
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Hear from developers who transformed their careers with EmmiDev CodeBridge
          </p>
        </motion.div>

        {/* Auto-scrolling Testimonials */}
        <div className="relative">
          <div className="overflow-hidden">
            <motion.div
              className="flex gap-6"
              animate={{
                x: [0, -2400]
              }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 40,
                  ease: "linear"
                }
              }}
            >
              {/* Duplicate testimonials for seamless loop */}
              {[...testimonials, ...testimonials].map((testimonial, index) => (
                <div key={index} className="flex-shrink-0 w-96">
                  <TestimonialCard {...testimonial} />
                </div>
              ))}
            </motion.div>
          </div>
          
          {/* Gradient overlays for fade effect */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-indigo-600 to-transparent pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-purple-600 to-transparent pointer-events-none"></div>
        </div>

        <div className="text-center mt-12">
          <GradientButton variant="secondary" size="lg" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
            Read More Stories <ArrowRight className="ml-2 h-5 w-5" />
          </GradientButton>
        </div>
      </div>
    </section>
  );
};


// Footer
const Footer = () => {
  const footerLinks = {
    quickLinks: [
      { label: "Features", href: "#features" },
      { label: "Courses", href: "#courses" },
      { label: "Community", href: "#community" },
      { label: "About Us", to: "/about" }
    ],
    resources: [
      { label: "Documentation", href: "#" },
      { label: "Blog", href: "#" },
      { label: "FAQs", href: "#" },
      { label: "Support", href: "#" }
    ],
    legal: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "Cookie Policy", href: "#" }
    ]
  };

  const socialLinks = [
    { icon: Twitter, label: "Twitter", href: "https://twitter.com/emmidev" },
    { icon: Linkedin, label: "LinkedIn", href: "https://linkedin.com/company/emmidev" },
    { icon: Github, label: "GitHub", href: "https://github.com/emmidev" },
    { icon: Youtube, label: "YouTube", href: "https://youtube.com/@emmidev" }
  ];

  return (
    <footer className="bg-slate-900 dark:bg-black text-white py-16 border-t border-slate-800">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-5 gap-8 mb-12">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/50">
                <Award className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                EmmiDev
              </span>
            </div>
            <p className="text-gray-400 mb-6 max-w-sm">
              Empowering African developers to reach their full potential through world-class education and community support.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-slate-800 hover:bg-gradient-to-br hover:from-indigo-500 hover:to-purple-500 rounded-lg flex items-center justify-center transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/50 hover:-translate-y-1"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-3">
              {footerLinks.quickLinks.map((link, index) => (
                <li key={index}>
                  {link.to ? (
                    <Link to={link.to} className="text-gray-400 hover:text-indigo-400 transition-colors">
                      {link.label}
                    </Link>
                  ) : (
                    <a href={link.href} className="text-gray-400 hover:text-indigo-400 transition-colors">
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-white mb-4">Resources</h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="text-gray-400 hover:text-indigo-400 transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="text-gray-400 hover:text-indigo-400 transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} EmmiDev CodeBridge. All rights reserved.
          </p>
          
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <span>Made with</span>
            <span className="text-red-500 animate-pulse">❤️</span>
            <span>for African developers</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingPage;