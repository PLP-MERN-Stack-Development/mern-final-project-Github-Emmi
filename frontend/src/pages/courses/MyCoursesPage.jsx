import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Star, Users, Clock, Award, Calendar, Plus, Edit, Eye, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchCourses } from '../../redux/slices/courseSlice';
import { Card, Button, Badge, Loader, EmptyState } from '../../components/ui';

const MyCoursesPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { courses, loading } = useSelector((state) => state.courses);
  const { user } = useSelector((state) => state.auth);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // Fetch only tutor's courses using tutor=me parameter
    dispatch(fetchCourses({ tutor: 'me', limit: 50 }));
  }, [dispatch]);

  const filteredCourses = courses.filter((course) => {
    if (filter === 'published') return course.isPublished;
    if (filter === 'draft') return !course.isPublished;
    return true;
  });

  const stats = {
    total: courses.length,
    published: courses.filter(c => c.isPublished).length,
    draft: courses.filter(c => !c.isPublished).length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-indigo-50">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white py-16 shadow-2xl"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-5xl font-bold mb-4"
              >
                My Courses
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="text-lg text-indigo-100"
              >
                Manage your courses and track student engagement
              </motion.p>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Button
                size="lg"
                onClick={() => navigate('/courses/create')}
                leftIcon={<Plus className="h-5 w-5" />}
                className="bg-white text-indigo-600 hover:bg-indigo-50 shadow-xl border-0"
              >
                Create New Course
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-xl border-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm font-medium mb-1">Total Courses</p>
                <p className="text-4xl font-bold">{stats.total}</p>
              </div>
              <div className="p-4 bg-white bg-opacity-20 rounded-2xl">
                <BookOpen className="h-8 w-8" />
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-xl border-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium mb-1">Published</p>
                <p className="text-4xl font-bold">{stats.published}</p>
              </div>
              <div className="p-4 bg-white bg-opacity-20 rounded-2xl">
                <Eye className="h-8 w-8" />
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-xl border-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm font-medium mb-1">Draft</p>
                <p className="text-4xl font-bold">{stats.draft}</p>
              </div>
              <div className="p-4 bg-white bg-opacity-20 rounded-2xl">
                <Edit className="h-8 w-8" />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-6 flex items-center gap-3"
        >
          <span className="text-sm font-medium text-gray-700">Filter:</span>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === 'all'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
            }`}
          >
            All ({stats.total})
          </button>
          <button
            onClick={() => setFilter('published')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === 'published'
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
            }`}
          >
            Published ({stats.published})
          </button>
          <button
            onClick={() => setFilter('draft')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === 'draft'
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
            }`}
          >
            Draft ({stats.draft})
          </button>
        </motion.div>

        {/* Loading State */}
        {loading && <Loader text="Loading your courses..." />}

        {/* Empty State */}
        {!loading && courses.length === 0 && (
          <EmptyState
            icon={BookOpen}
            title="No courses yet"
            description="Create your first course to start teaching"
            action={
              <Button onClick={() => navigate('/courses/create')} leftIcon={<Plus className="h-5 w-5" />}>
                Create Your First Course
              </Button>
            }
          />
        )}

        {/* Courses Grid - 2 Column Layout */}
        {!loading && filteredCourses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence>
              {filteredCourses.map((course, index) => (
                <MyCourseCard
                  key={course._id}
                  course={course}
                  navigate={navigate}
                  index={index}
                  user={user}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {!loading && filteredCourses.length === 0 && courses.length > 0 && (
          <EmptyState
            icon={BookOpen}
            title={`No ${filter} courses`}
            description={`You don't have any ${filter} courses yet`}
          />
        )}
      </div>
    </div>
  );
};

const MyCourseCard = ({ course, navigate, index, user }) => {
  const formatPrice = (price, currency) => {
    if (price === 0) return 'Free';
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency || 'NGN',
    }).format(price);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <Card className="h-full border-2 border-indigo-100 hover:border-indigo-300 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white overflow-hidden">
        {/* Course Image with Status Badge */}
        <div className="h-48 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 -mx-6 -mt-6 mb-4 flex items-center justify-center relative overflow-hidden">
          <motion.div
            initial={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.3 }}
          >
            <BookOpen className="h-16 w-16 text-white opacity-50" />
          </motion.div>
          <div className="absolute top-3 right-3 flex gap-2">
            <Badge
              variant={course.level === 'beginner' ? 'success' : course.level === 'intermediate' ? 'warning' : 'danger'}
              className="shadow-lg"
            >
              {course.level}
            </Badge>
            <Badge
              variant={course.isPublished ? 'success' : 'warning'}
              className="shadow-lg"
            >
              {course.isPublished ? 'Published' : 'Draft'}
            </Badge>
          </div>
        </div>

        {/* Course Info */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="info" className="bg-indigo-100 text-indigo-700">
              {course.category}
            </Badge>
            {user?.verifiedTutor && (
              <Badge variant="success" className="flex items-center gap-1">
                <Award className="h-3 w-3" />
                Verified
              </Badge>
            )}
          </div>

          <h3 className="text-xl font-bold text-gray-900 line-clamp-2">
            {course.title}
          </h3>

          <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
            {course.description}
          </p>

          {/* Course Meta */}
          <div className="grid grid-cols-2 gap-3 text-sm pt-2 border-t border-gray-100">
            <div className="flex items-center gap-1 text-gray-600">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="font-medium">{course.rating?.toFixed(1) || '0.0'}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-600">
              <Users className="h-4 w-4 text-indigo-600" />
              <span className="font-medium">{course.enrolledStudents?.length || 0} students</span>
            </div>
            <div className="flex items-center gap-1 text-gray-600">
              <Calendar className="h-4 w-4 text-purple-600" />
              <span className="font-medium text-xs">{formatDate(course.createdAt)}</span>
            </div>
            <div className="flex items-center gap-1 text-gray-600">
              <Clock className="h-4 w-4 text-green-600" />
              <span className="font-medium">{course.duration || '8'} weeks</span>
            </div>
          </div>

          {/* Price */}
          <div className="pt-3 border-t border-gray-100">
            <div className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {formatPrice(course.price, course.currency)}
            </div>
            <p className="text-xs text-gray-500">Course price</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-3 border-t border-gray-100">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/courses/${course._id}`);
              }}
              leftIcon={<Eye className="h-4 w-4" />}
              className="flex-1 border-2 border-indigo-300 text-indigo-700 hover:bg-indigo-50"
            >
              View
            </Button>
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/courses/${course._id}/edit`);
              }}
              leftIcon={<Edit className="h-4 w-4" />}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 border-0"
            >
              Edit
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default MyCoursesPage;
