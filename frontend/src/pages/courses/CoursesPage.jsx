import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, BookOpen, Star, Users, Clock, ChevronRight, User, Award, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchCourses, setFilters } from '../../redux/slices/courseSlice';
import { Card, Button, Input, Select, Badge, Loader, EmptyState } from '../../components/ui';

const CoursesPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { courses, loading, filters, pagination } = useSelector((state) => state.courses);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchCourses({ page: 1, limit: 12, ...filters }));
  }, [dispatch, filters]);

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(setFilters({ search: searchTerm }));
  };

  const handleFilterChange = (key, value) => {
    dispatch(setFilters({ [key]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-16 shadow-2xl"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-100"
          >
            Explore Courses
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-indigo-100"
          >
            Learn from expert tutors and advance your career
          </motion.p>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="mb-8 shadow-xl border-2 border-indigo-100 bg-white">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
              <Input
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="h-5 w-5 text-indigo-600" />}
                className="flex-1 border-2 border-gray-200 focus:border-indigo-500 rounded-xl"
              />
              
              <Select
                options={[
                  { value: '', label: 'All Categories' },
                  { value: 'programming', label: 'Programming' },
                  { value: 'design', label: 'Design' },
                  { value: 'business', label: 'Business' },
                  { value: 'data-science', label: 'Data Science' },
                ]}
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="md:w-48 border-2 border-gray-200 focus:border-indigo-500 rounded-xl"
              />

              <Select
                options={[
                  { value: '', label: 'All Levels' },
                  { value: 'beginner', label: 'Beginner' },
                  { value: 'intermediate', label: 'Intermediate' },
                  { value: 'advanced', label: 'Advanced' },
                ]}
                value={filters.level}
                onChange={(e) => handleFilterChange('level', e.target.value)}
                className="md:w-48 border-2 border-gray-200 focus:border-indigo-500 rounded-xl"
              />

              <Button
                type="submit"
                leftIcon={<Search className="h-5 w-5" />}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                Search
              </Button>
            </form>
          </Card>
        </motion.div>

        {/* Loading State */}
        {loading && <Loader text="Loading courses..." />}

        {/* Empty State */}
        {!loading && courses.length === 0 && (
          <EmptyState
            icon={BookOpen}
            title="No courses found"
            description="Try adjusting your filters or search terms"
            action={
              <Button onClick={() => dispatch(setFilters({ category: '', level: '', search: '' }))}>
                Clear Filters
              </Button>
            }
          />
        )}

        {/* Courses Grid - 2 Column Layout */}
        {!loading && courses.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <AnimatePresence>
                {courses.map((course, index) => (
                  <CourseCard
                    key={course._id}
                    course={course}
                    navigate={navigate}
                    index={index}
                  />
                ))}
              </AnimatePresence>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex justify-center gap-3 items-center"
              >
                <Button
                  variant="outline"
                  disabled={pagination.page === 1}
                  onClick={() => dispatch(fetchCourses({ ...filters, page: pagination.page - 1 }))}
                  className="border-2 border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                >
                  Previous
                </Button>
                <span className="px-4 py-2 text-gray-700 font-medium">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={pagination.page === pagination.totalPages}
                  onClick={() => dispatch(fetchCourses({ ...filters, page: pagination.page + 1 }))}
                  className="border-2 border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                >
                  Next
                </Button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const CourseCard = ({ course, navigate, index }) => {
  const formatPrice = (price, currency) => {
    if (price === 0) return 'Free';
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency || 'NGN',
    }).format(price);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <Card
        hover
        className="cursor-pointer h-full border-2 border-indigo-100 hover:border-indigo-300 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white overflow-hidden"
        onClick={() => navigate(`/courses/${course._id}`)}
      >
        {/* Course Image */}
        <div className="h-48 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 -mx-6 -mt-6 mb-4 flex items-center justify-center relative overflow-hidden">
          <motion.div
            initial={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.3 }}
          >
            <BookOpen className="h-16 w-16 text-white opacity-50" />
          </motion.div>
          <div className="absolute top-3 right-3">
            <Badge
              variant={course.level === 'beginner' ? 'success' : course.level === 'intermediate' ? 'warning' : 'danger'}
              className="shadow-lg"
            >
              {course.level}
            </Badge>
          </div>
        </div>

        {/* Course Info */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="info" className="bg-indigo-100 text-indigo-700">
              {course.category}
            </Badge>
            {course.tutor?.verifiedTutor && (
              <Badge variant="success" className="flex items-center gap-1">
                <Award className="h-3 w-3" />
                Verified
              </Badge>
            )}
          </div>

          <h3 className="text-xl font-bold text-gray-900 line-clamp-2 hover:text-indigo-600 transition-colors">
            {course.title}
          </h3>

          <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
            {course.description}
          </p>

          {/* Course Meta */}
          <div className="flex items-center justify-between text-sm text-gray-500 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="font-medium">{course.rating?.toFixed(1) || '4.5'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4 text-indigo-600" />
              <span className="font-medium">{course.enrolledStudents?.length || 0} students</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-purple-600" />
              <span className="font-medium">
                {course.duration || '8'} weeks
              </span>
            </div>
          </div>

          {/* Tutor and Price */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md">
                {course.tutor?.name?.[0]?.toUpperCase() || course.tutorId?.name?.[0]?.toUpperCase() || 'T'}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {course.tutor?.name || course.tutorId?.name || 'Tutor'}
                </p>
                <p className="text-xs text-gray-500">Instructor</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {formatPrice(course.price, course.currency)}
              </div>
              <p className="text-xs text-gray-500">Total price</p>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default CoursesPage;
