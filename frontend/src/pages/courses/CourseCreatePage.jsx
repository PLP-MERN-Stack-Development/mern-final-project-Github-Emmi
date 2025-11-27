import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Plus,
  X,
  Sparkles,
  CheckCircle,
  DollarSign,
  Calendar,
  Users,
  Tag,
  Image,
  Clock,
  Video,
} from 'lucide-react';
import { format } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { Card, Button, Input, Textarea, Select, useToast } from '../../components/ui';
import api from '../../services/api';

const CourseCreatePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toast = useToast();
  const [creating, setCreating] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    currency: 'NGN',
    category: '',
    level: '',
    maxStudents: 50,
    startDate: '',
    endDate: '',
    tags: [],
    thumbnail: '',
    syllabus: [{ title: '', description: '', resources: [], order: 1 }],
    schedule: [], // New: Array of class sessions
  });

  const [tagInput, setTagInput] = useState('');
  const [scheduleModal, setScheduleModal] = useState(false);
  const [currentSession, setCurrentSession] = useState({
    topic: '',
    startTime: '',
    duration: 60
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStartDateSelect = (date) => {
    setSelectedStartDate(date);
    setShowStartDatePicker(false);
    if (date) {
      setFormData((prev) => ({ ...prev, startDate: date.toISOString() }));
    }
  };

  const handleEndDateSelect = (date) => {
    setSelectedEndDate(date);
    setShowEndDatePicker(false);
    if (date) {
      setFormData((prev) => ({ ...prev, endDate: date.toISOString() }));
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const addSyllabusItem = () => {
    setFormData((prev) => ({
      ...prev,
      syllabus: [
        ...prev.syllabus,
        { title: '', description: '', resources: [], order: prev.syllabus.length + 1 },
      ],
    }));
  };

  const removeSyllabusItem = (index) => {
    if (formData.syllabus.length > 1) {
      setFormData((prev) => ({
        ...prev,
        syllabus: prev.syllabus.filter((_, i) => i !== index),
      }));
    }
  };

  const handleSyllabusChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      syllabus: prev.syllabus.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addClassSession = () => {
    if (!currentSession.topic || !currentSession.startTime) {
      toast.error('Please fill in session topic and start time');
      return;
    }

    setFormData((prev) => ({
      ...prev,
      schedule: [
        ...prev.schedule,
        {
          topic: currentSession.topic,
          startTime: currentSession.startTime,
          duration: currentSession.duration
        }
      ],
    }));

    setCurrentSession({ topic: '', startTime: '', duration: 60 });
    setScheduleModal(false);
    toast.success('Class session added');
  };

  const removeClassSession = (index) => {
    setFormData((prev) => ({
      ...prev,
      schedule: prev.schedule.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e, isPublished = false) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setCreating(true);
      
      // Filter out empty syllabus items
      const filteredSyllabus = formData.syllabus.filter(
        (item) => item.title.trim() !== '' || item.description.trim() !== ''
      );

      const courseData = {
        ...formData,
        syllabus: filteredSyllabus.length > 0 ? filteredSyllabus : [],
        isPublished,
      };

      const { data } = await api.post('/courses', courseData);
      
      toast.success(isPublished ? 'Course published successfully!' : 'Course saved as draft!');
      navigate('/my-courses');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create course');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-indigo-100">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Create New Course
                </h1>
                <p className="text-gray-600 mt-1">Share your knowledge with students worldwide</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="shadow-xl border-2 border-indigo-100">
            <form onSubmit={(e) => handleSubmit(e, true)} className="space-y-8">
              {/* Course Title */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-indigo-600" />
                  Course Title *
                </label>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Advanced React Development"
                  required
                  className="border-2 border-gray-200 focus:border-indigo-500 rounded-xl"
                />
              </motion.div>

              {/* Description */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 }}
              >
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Description *
                </label>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe what students will learn in this course..."
                  rows={4}
                  required
                  className="border-2 border-gray-200 focus:border-indigo-500 rounded-xl resize-none"
                />
              </motion.div>

              {/* Category and Level */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Category *
                  </label>
                  <Select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="border-2 border-gray-200 focus:border-indigo-500 rounded-xl"
                    options={[
                      { value: '', label: 'Select category...' },
                      { value: 'Programming', label: 'Programming' },
                      { value: 'Web Development', label: 'Web Development' },
                      { value: 'Mobile Development', label: 'Mobile Development' },
                      { value: 'Data Science', label: 'Data Science' },
                      { value: 'Design', label: 'Design' },
                      { value: 'Business', label: 'Business' },
                      { value: 'Other', label: 'Other' },
                    ]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Level *
                  </label>
                  <Select
                    name="level"
                    value={formData.level}
                    onChange={handleChange}
                    required
                    className="border-2 border-gray-200 focus:border-indigo-500 rounded-xl"
                    options={[
                      { value: '', label: 'Select level...' },
                      { value: 'Beginner', label: 'Beginner' },
                      { value: 'Intermediate', label: 'Intermediate' },
                      { value: 'Advanced', label: 'Advanced' },
                    ]}
                  />
                </div>
              </motion.div>

              {/* Price and Max Students */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    Price (NGN)
                  </label>
                  <Input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    min="0"
                    placeholder="0"
                    className="border-2 border-gray-200 focus:border-indigo-500 rounded-xl"
                  />
                  <p className="text-xs text-gray-500 mt-1">Set to 0 for free course</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Users className="h-5 w-5 text-indigo-600" />
                    Max Students
                  </label>
                  <Input
                    type="number"
                    name="maxStudents"
                    value={formData.maxStudents}
                    onChange={handleChange}
                    min="1"
                    placeholder="50"
                    className="border-2 border-gray-200 focus:border-indigo-500 rounded-xl"
                  />
                </div>
              </motion.div>

              {/* Start and End Dates */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-purple-600" />
                    Start Date
                  </label>
                  <div
                    onClick={() => setShowStartDatePicker(!showStartDatePicker)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-indigo-300 cursor-pointer bg-white flex items-center justify-between"
                  >
                    <span className={selectedStartDate ? 'text-gray-900' : 'text-gray-400'}>
                      {selectedStartDate ? format(selectedStartDate, 'MMMM dd, yyyy') : 'Select start date...'}
                    </span>
                    <Calendar className="h-5 w-5 text-indigo-600" />
                  </div>

                  <AnimatePresence>
                    {showStartDatePicker && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-50 mt-2 bg-white rounded-xl shadow-2xl border-2 border-indigo-100 p-4"
                      >
                        <DayPicker
                          mode="single"
                          selected={selectedStartDate}
                          onSelect={handleStartDateSelect}
                          disabled={{ before: new Date() }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-purple-600" />
                    End Date
                  </label>
                  <div
                    onClick={() => setShowEndDatePicker(!showEndDatePicker)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-indigo-300 cursor-pointer bg-white flex items-center justify-between"
                  >
                    <span className={selectedEndDate ? 'text-gray-900' : 'text-gray-400'}>
                      {selectedEndDate ? format(selectedEndDate, 'MMMM dd, yyyy') : 'Select end date...'}
                    </span>
                    <Calendar className="h-5 w-5 text-indigo-600" />
                  </div>

                  <AnimatePresence>
                    {showEndDatePicker && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-50 mt-2 bg-white rounded-xl shadow-2xl border-2 border-indigo-100 p-4"
                      >
                        <DayPicker
                          mode="single"
                          selected={selectedEndDate}
                          onSelect={handleEndDateSelect}
                          disabled={{ before: selectedStartDate || new Date() }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>

              {/* Tags */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45 }}
                className="border-2 border-blue-100 rounded-xl p-6 bg-gradient-to-br from-blue-50 to-cyan-50"
              >
                <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Tag className="h-5 w-5 text-blue-600" />
                  Tags
                </label>
                <div className="flex gap-2 mb-3">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder="Add tags (press Enter)"
                    className="flex-1 border-2 border-blue-200 focus:border-blue-500 rounded-xl bg-white"
                  />
                  <Button
                    type="button"
                    onClick={addTag}
                    variant="outline"
                    className="border-2 border-blue-300 text-blue-700 hover:bg-blue-50"
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-blue-900"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Syllabus */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="border-2 border-purple-100 rounded-xl p-6 bg-gradient-to-br from-purple-50 to-pink-50"
              >
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-purple-600" />
                    Course Syllabus
                  </label>
                  <Button
                    type="button"
                    onClick={addSyllabusItem}
                    variant="outline"
                    size="sm"
                    leftIcon={<Plus className="h-4 w-4" />}
                    className="bg-white border-2 border-purple-300 text-purple-700 hover:bg-purple-50"
                  >
                    Add Module
                  </Button>
                </div>

                <div className="space-y-4">
                  <AnimatePresence>
                    {formData.syllabus.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white p-4 rounded-xl border-2 border-purple-100 shadow-sm"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-1 space-y-3">
                            <Input
                              placeholder={`Module ${index + 1} title`}
                              value={item.title}
                              onChange={(e) => handleSyllabusChange(index, 'title', e.target.value)}
                              className="border-2 border-gray-200 rounded-lg"
                            />
                            <Textarea
                              placeholder="Module description"
                              value={item.description}
                              onChange={(e) => handleSyllabusChange(index, 'description', e.target.value)}
                              rows={2}
                              className="border-2 border-gray-200 rounded-lg resize-none"
                            />
                          </div>
                          {formData.syllabus.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeSyllabusItem(index)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>

              {/* Class Schedule (Zoom Meetings) */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.55 }}
                className="border-2 border-green-100 rounded-xl p-6 bg-gradient-to-br from-green-50 to-emerald-50"
              >
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <Video className="h-5 w-5 text-green-600" />
                    Live Class Schedule (Zoom)
                  </label>
                  <Button
                    type="button"
                    onClick={() => setScheduleModal(true)}
                    variant="outline"
                    size="sm"
                    leftIcon={<Plus className="h-4 w-4" />}
                    className="bg-white border-2 border-green-300 text-green-700 hover:bg-green-50"
                  >
                    Add Session
                  </Button>
                </div>

                {formData.schedule.length > 0 ? (
                  <div className="space-y-3">
                    {formData.schedule.map((session, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white p-4 rounded-xl border-2 border-green-100 shadow-sm flex items-center justify-between"
                      >
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{session.topic}</h4>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(session.startTime).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric', 
                                year: 'numeric' 
                              })}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {new Date(session.startTime).toLocaleTimeString('en-US', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {session.duration} min
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeClassSession(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Video className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p>No class sessions scheduled yet</p>
                    <p className="text-sm">Add live Zoom sessions for your course</p>
                  </div>
                )}
              </motion.div>

              {/* Schedule Modal */}
              <AnimatePresence>
                {scheduleModal && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                    onClick={() => setScheduleModal(false)}
                  >
                    <motion.div
                      initial={{ scale: 0.9, y: 20 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0.9, y: 20 }}
                      className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-gray-900">Add Class Session</h3>
                        <button
                          onClick={() => setScheduleModal(false)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Session Topic *
                          </label>
                          <Input
                            value={currentSession.topic}
                            onChange={(e) => setCurrentSession({ ...currentSession, topic: e.target.value })}
                            placeholder="e.g., Introduction to React Hooks"
                            className="border-2 border-gray-200 rounded-xl"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Start Date & Time *
                          </label>
                          <Input
                            type="datetime-local"
                            value={currentSession.startTime}
                            onChange={(e) => setCurrentSession({ ...currentSession, startTime: e.target.value })}
                            className="border-2 border-gray-200 rounded-xl"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Duration (minutes) *
                          </label>
                          <Input
                            type="number"
                            value={currentSession.duration}
                            onChange={(e) => setCurrentSession({ ...currentSession, duration: parseInt(e.target.value) })}
                            min="30"
                            max="240"
                            placeholder="60"
                            className="border-2 border-gray-200 rounded-xl"
                          />
                        </div>

                        <div className="flex gap-3 pt-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setScheduleModal(false)}
                            className="flex-1 border-2 border-gray-300"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="button"
                            onClick={addClassSession}
                            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600"
                          >
                            Add Session
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Thumbnail URL */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Image className="h-5 w-5 text-indigo-600" />
                  Thumbnail URL (Optional)
                </label>
                <Input
                  name="thumbnail"
                  value={formData.thumbnail}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  className="border-2 border-gray-200 focus:border-indigo-500 rounded-xl"
                />
                <p className="text-xs text-gray-500 mt-1">Provide a URL to your course thumbnail image</p>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 }}
                className="flex justify-between items-center gap-3 pt-6 border-t-2 border-gray-200"
              >
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/my-courses')}
                  disabled={creating}
                  className="border-2 border-gray-300 hover:border-gray-400"
                >
                  Cancel
                </Button>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={(e) => handleSubmit(e, false)}
                    disabled={creating}
                    leftIcon={<BookOpen className="h-4 w-4" />}
                    className="border-2 border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                  >
                    {creating ? 'Saving...' : 'Save as Draft'}
                  </Button>
                  <Button
                    type="submit"
                    disabled={creating}
                    leftIcon={<CheckCircle className="h-4 w-4" />}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg border-0"
                  >
                    {creating ? 'Publishing...' : 'Publish Course'}
                  </Button>
                </div>
              </motion.div>
            </form>
          </Card>
        </motion.div>

        {/* Tips Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="mt-6 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 border-2 border-amber-200 shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-semibold text-amber-900">Tips for Creating Great Courses</h3>
            </div>
            <ul className="space-y-2 text-sm text-amber-900">
              {[
                'Write a clear, compelling title that describes what students will learn',
                'Provide a detailed description outlining course objectives and outcomes',
                'Structure your syllabus with logical progression from basics to advanced',
                'Set realistic pricing based on course depth and your expertise level',
                'Use high-quality thumbnail images to attract more students',
                'Add relevant tags to help students discover your course',
              ].map((tip, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.75 + index * 0.05 }}
                  className="flex items-start gap-2"
                >
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>{tip}</span>
                </motion.li>
              ))}
            </ul>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default CourseCreatePage;
