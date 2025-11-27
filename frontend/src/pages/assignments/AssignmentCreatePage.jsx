import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DocumentPlusIcon, 
  CalendarIcon, 
  PaperClipIcon, 
  PlusIcon, 
  XMarkIcon,
  ClockIcon,
  SparklesIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  BellAlertIcon
} from '@heroicons/react/24/outline';
import { createAssignment } from '../../redux/slices/assignmentSlice';
import { fetchCourses } from '../../redux/slices/courseSlice';
import { Card, Button, Input, Textarea, FileUpload, useToast } from '../../components/ui';

const AssignmentCreatePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { courseId: routeCourseId } = useParams();
  const { creating } = useSelector((state) => state.assignments);
  const { courses } = useSelector((state) => state.courses);
  const { user } = useSelector((state) => state.auth);
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    courseId: routeCourseId || '',
    title: '',
    description: '',
    instructions: '',
    dueDate: '',
    maxScore: 100,
    allowLateSubmission: false,
    lateSubmissionPenalty: 0,
    isPublished: true
  });
  const [files, setFiles] = useState([]);
  const [rubric, setRubric] = useState([
    { criterion: '', maxPoints: 0, description: '' }
  ]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('23:59');

  // Filter courses to show only tutor's courses
  const tutorCourses = courses.filter(course => 
    course.tutorId === user?.id || course.tutorId?._id === user?.id
  );

  useEffect(() => {
    // Fetch courses if not already loaded and user is tutor
    if ((user?.role === 'tutor' || user?.role === 'admin') && courses.length === 0) {
      dispatch(fetchCourses());
    }
  }, [dispatch, user, courses.length]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setShowDatePicker(false);
    
    // Combine date and time
    if (date) {
      const [hours, minutes] = selectedTime.split(':');
      const combinedDateTime = new Date(date);
      combinedDateTime.setHours(parseInt(hours), parseInt(minutes));
      
      // Format as datetime-local string
      const year = combinedDateTime.getFullYear();
      const month = String(combinedDateTime.getMonth() + 1).padStart(2, '0');
      const day = String(combinedDateTime.getDate()).padStart(2, '0');
      const formattedDateTime = `${year}-${month}-${day}T${selectedTime}`;
      
      setFormData(prev => ({ ...prev, dueDate: formattedDateTime }));
    }
  };

  const handleTimeChange = (e) => {
    const time = e.target.value;
    setSelectedTime(time);
    
    // Update formData if date is already selected
    if (selectedDate) {
      const [hours, minutes] = time.split(':');
      const combinedDateTime = new Date(selectedDate);
      combinedDateTime.setHours(parseInt(hours), parseInt(minutes));
      
      const year = combinedDateTime.getFullYear();
      const month = String(combinedDateTime.getMonth() + 1).padStart(2, '0');
      const day = String(combinedDateTime.getDate()).padStart(2, '0');
      const formattedDateTime = `${year}-${month}-${day}T${time}`;
      
      setFormData(prev => ({ ...prev, dueDate: formattedDateTime }));
    }
  };

  const handleRubricChange = (index, field, value) => {
    const newRubric = [...rubric];
    newRubric[index][field] = value;
    setRubric(newRubric);
  };

  const addRubricCriterion = () => {
    setRubric([...rubric, { criterion: '', maxPoints: 0, description: '' }]);
  };

  const removeRubricCriterion = (index) => {
    if (rubric.length > 1) {
      setRubric(rubric.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e, publishStatus) => {
    e.preventDefault();

    // Validation
    if (!formData.courseId) {
      addToast('Please select a course', 'error');
      return;
    }

    if (!formData.title.trim()) {
      addToast('Please provide a title', 'error');
      return;
    }

    if (!formData.description.trim()) {
      addToast('Please provide a description', 'error');
      return;
    }

    if (!formData.dueDate) {
      addToast('Please select a due date', 'error');
      return;
    }

    // Check if due date is in the future
    const dueDate = new Date(formData.dueDate);
    const now = new Date();
    if (dueDate < now) {
      addToast('Due date must be in the future', 'error');
      return;
    }

    try {
      // Filter out empty rubric criteria
      const validRubric = rubric.filter(
        r => r.criterion.trim() && r.maxPoints > 0
      );

      const submitData = {
        ...formData,
        isPublished: publishStatus,
        rubric: validRubric.length > 0 ? validRubric : undefined
      };

      await dispatch(createAssignment(submitData)).unwrap();
      
      addToast(
        publishStatus 
          ? 'Assignment created and published successfully! Students have been notified.' 
          : 'Assignment saved as draft successfully!', 
        'success'
      );
      navigate('/tutor/assignments');
    } catch (error) {
      addToast(error || 'Failed to create assignment', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate(formData.courseId ? `/courses/${formData.courseId}` : '/tutor/assignments')}
            className="text-indigo-600 hover:text-indigo-700 mb-4 flex items-center gap-2 font-medium transition-colors"
          >
            ← Back
          </button>
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-indigo-100">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
                <DocumentPlusIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Create Assignment
                </h1>
                <p className="text-gray-600 mt-1">Design a new assignment for your students</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Create Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="shadow-xl border border-indigo-100">
            <form onSubmit={(e) => handleSubmit(e, true)} className="space-y-8">
              {/* Course Selection (if not from course page) */}
              {!routeCourseId && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Select Course *
                  </label>
                  <select
                    name="courseId"
                    value={formData.courseId}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white shadow-sm"
                    required
                  >
                    <option value="">Choose a course...</option>
                    {tutorCourses.map((course) => (
                      <option key={course._id} value={course._id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                </motion.div>
              )}

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
            >
              <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <SparklesIcon className="h-5 w-5 text-indigo-600" />
                Assignment Title *
              </label>
              <Input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Week 1 Project - Build a Calculator"
                className="border-2 border-gray-200 focus:border-indigo-500 rounded-xl"
                required
              />
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Description *
              </label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Provide a brief overview of the assignment..."
                rows={4}
                className="border-2 border-gray-200 focus:border-indigo-500 rounded-xl resize-none"
                required
              />
            </motion.div>

            {/* Instructions */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
            >
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Detailed Instructions
              </label>
              <Textarea
                name="instructions"
                value={formData.instructions}
                onChange={handleChange}
                placeholder="Provide step-by-step instructions, requirements, and expectations..."
                rows={8}
                className="border-2 border-gray-200 focus:border-indigo-500 rounded-xl resize-none"
              />
              <p className="text-xs text-gray-500 mt-2">
                Include objectives, requirements, submission format, and any specific guidelines
              </p>
            </motion.div>

            {/* Due Date and Points Row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {/* Enhanced Due Date Picker */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-indigo-600" />
                  Due Date & Time *
                </label>
                
                <div className="space-y-3">
                  {/* Date Display/Trigger */}
                  <div
                    onClick={() => setShowDatePicker(!showDatePicker)}
                    className="relative cursor-pointer"
                  >
                    <div className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white shadow-sm hover:border-indigo-300 transition-all flex items-center justify-between">
                      <span className={selectedDate ? 'text-gray-900 font-medium' : 'text-gray-400'}>
                        {selectedDate 
                          ? format(selectedDate, 'MMMM dd, yyyy')
                          : 'Select a date...'
                        }
                      </span>
                      <CalendarIcon className="h-5 w-5 text-indigo-600" />
                    </div>
                  </div>

                  {/* Date Picker Dropdown */}
                  <AnimatePresence>
                    {showDatePicker && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-50 bg-white rounded-xl shadow-2xl border-2 border-indigo-100 p-4 mt-2"
                      >
                        <DayPicker
                          mode="single"
                          selected={selectedDate}
                          onSelect={handleDateSelect}
                          disabled={{ before: new Date() }}
                          className="rdp-custom"
                          modifiersStyles={{
                            selected: {
                              backgroundColor: '#6366f1',
                              color: 'white',
                            },
                          }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Time Picker */}
                  <div className="flex items-center gap-3">
                    <ClockIcon className="h-5 w-5 text-indigo-600" />
                    <input
                      type="time"
                      value={selectedTime}
                      onChange={handleTimeChange}
                      className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white shadow-sm"
                    />
                  </div>

                  {/* Preview */}
                  {selectedDate && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-2 text-sm bg-indigo-50 text-indigo-700 px-3 py-2 rounded-lg border border-indigo-200"
                    >
                      <CheckCircleIcon className="h-4 w-4" />
                      Due: {format(selectedDate, 'MMM dd, yyyy')} at {selectedTime}
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Max Score */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Maximum Score *
                </label>
                <Input
                  type="number"
                  name="maxScore"
                  value={formData.maxScore}
                  onChange={handleChange}
                  min="1"
                  max="1000"
                  className="border-2 border-gray-200 focus:border-indigo-500 rounded-xl"
                  required
                />
                <p className="text-xs text-gray-500 mt-2">
                  Total points possible for this assignment
                </p>
              </div>
            </motion.div>

            {/* Late Submission Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="border-2 border-indigo-100 rounded-xl p-6 bg-gradient-to-br from-indigo-50 to-purple-50"
            >
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <ClockIcon className="h-5 w-5 text-indigo-600" />
                Late Submission Settings
              </h3>
              
              <div className="flex items-center gap-3 mb-4">
                <input
                  type="checkbox"
                  id="allowLateSubmission"
                  name="allowLateSubmission"
                  checked={formData.allowLateSubmission}
                  onChange={handleChange}
                  className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="allowLateSubmission" className="text-sm font-medium text-gray-900 cursor-pointer">
                  Allow late submissions
                </label>
              </div>

              <AnimatePresence>
                {formData.allowLateSubmission && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Late Penalty (%)
                    </label>
                    <Input
                      type="number"
                      name="lateSubmissionPenalty"
                      value={formData.lateSubmissionPenalty}
                      onChange={handleChange}
                      min="0"
                      max="100"
                      placeholder="e.g., 10"
                      className="border-2 border-indigo-200 focus:border-indigo-500 rounded-xl bg-white"
                    />
                    <p className="text-xs text-gray-600 mt-2">
                      Percentage deducted from the score for late submissions
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Grading Rubric */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="border-2 border-purple-100 rounded-xl p-6 bg-gradient-to-br from-purple-50 to-pink-50"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <SparklesIcon className="h-5 w-5 text-purple-600" />
                  Grading Rubric (Optional)
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addRubricCriterion}
                  leftIcon={<PlusIcon className="h-4 w-4" />}
                  className="bg-white hover:bg-purple-50 border-purple-200 text-purple-700"
                >
                  Add Criterion
                </Button>
              </div>

              <div className="space-y-3">
                <AnimatePresence>
                  {rubric.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex gap-3 items-start bg-white p-4 rounded-xl border-2 border-purple-100 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex-1 space-y-3">
                        <Input
                          placeholder="Criterion name (e.g., Code Quality)"
                          value={item.criterion}
                          onChange={(e) => handleRubricChange(index, 'criterion', e.target.value)}
                          className="border-2 border-gray-200 rounded-lg"
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <Input
                            type="number"
                            placeholder="Max points"
                            value={item.maxPoints}
                            onChange={(e) => handleRubricChange(index, 'maxPoints', Number(e.target.value))}
                            min="0"
                            className="border-2 border-gray-200 rounded-lg"
                          />
                          <Input
                            placeholder="Description (optional)"
                            value={item.description}
                            onChange={(e) => handleRubricChange(index, 'description', e.target.value)}
                            className="border-2 border-gray-200 rounded-lg"
                          />
                        </div>
                      </div>
                      {rubric.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRubricCriterion(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Attachments */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="border-2 border-blue-100 rounded-xl p-6 bg-gradient-to-br from-blue-50 to-cyan-50"
            >
              <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <PaperClipIcon className="h-5 w-5 text-blue-600" />
                Attachments (Optional)
              </label>
              <FileUpload
                files={files}
                onChange={setFiles}
                accept=".pdf,.doc,.docx,.txt,.zip,.jpg,.jpeg,.png"
                maxSize={10}
                multiple
                className="border-2 border-dashed border-blue-300 rounded-xl hover:border-blue-500 transition-colors bg-white"
              />
              <p className="text-xs text-gray-500 mt-2">
                Upload reference materials, instructions, or starter files (max 10MB each)
              </p>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex justify-between items-center gap-3 pt-6 border-t-2 border-gray-200"
            >
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/tutor/assignments')}
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
                  leftIcon={<DocumentTextIcon className="h-4 w-4" />}
                  className="border-2 border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                >
                  {creating ? 'Saving...' : 'Save as Draft'}
                </Button>
                <Button
                  type="submit"
                  disabled={creating}
                  leftIcon={<BellAlertIcon className="h-4 w-4" />}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg border-0"
                >
                  {creating ? 'Publishing...' : 'Publish Assignment'}
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
                <SparklesIcon className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-semibold text-amber-900">Tips for Creating Assignments</h3>
            </div>
            <ul className="space-y-2 text-sm text-amber-900">
              <motion.li
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.75 }}
                className="flex items-start gap-2"
              >
                <CheckCircleIcon className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Be clear and specific about what you expect from students</span>
              </motion.li>
              <motion.li
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
                className="flex items-start gap-2"
              >
                <CheckCircleIcon className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Use the rubric feature to define grading criteria upfront</span>
              </motion.li>
              <motion.li
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.85 }}
                className="flex items-start gap-2"
              >
                <CheckCircleIcon className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Set realistic due dates considering the complexity of the task</span>
              </motion.li>
              <motion.li
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 }}
                className="flex items-start gap-2"
              >
                <CheckCircleIcon className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Save as draft to review later, or publish immediately to notify students</span>
              </motion.li>
              <motion.li
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.95 }}
                className="flex items-start gap-2"
              >
                <CheckCircleIcon className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Attach reference materials, starter code, or examples when helpful</span>
              </motion.li>
              <motion.li
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.0 }}
                className="flex items-start gap-2"
              >
                <BellAlertIcon className="h-4 w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                <span className="font-medium">Students receive in-app notifications when you publish an assignment</span>
              </motion.li>
            </ul>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AssignmentCreatePage;
