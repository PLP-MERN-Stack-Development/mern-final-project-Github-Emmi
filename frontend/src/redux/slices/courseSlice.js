// frontend/src/redux/slices/courseSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks
export const fetchCourses = createAsyncThunk(
  'courses/fetchCourses',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/courses', { params });
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch courses');
    }
  }
);

export const fetchCourseById = createAsyncThunk(
  'courses/fetchCourseById',
  async (courseId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/courses/${courseId}`);
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch course');
    }
  }
);

export const createCourse = createAsyncThunk(
  'courses/createCourse',
  async (courseData, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/courses', courseData);
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create course');
    }
  }
);

export const updateCourse = createAsyncThunk(
  'courses/updateCourse',
  async ({ courseId, courseData }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/courses/${courseId}`, courseData);
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update course');
    }
  }
);

export const deleteCourse = createAsyncThunk(
  'courses/deleteCourse',
  async (courseId, { rejectWithValue }) => {
    try {
      await api.delete(`/courses/${courseId}`);
      return courseId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete course');
    }
  }
);

export const enrollCourse = createAsyncThunk(
  'courses/enrollCourse',
  async (courseId, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/courses/${courseId}/enroll`);
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to enroll in course');
    }
  }
);

export const fetchCourseSchedule = createAsyncThunk(
  'courses/fetchCourseSchedule',
  async (courseId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/courses/${courseId}/schedule`);
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch schedule');
    }
  }
);

export const rateCourse = createAsyncThunk(
  'courses/rateCourse',
  async ({ courseId, rating, review }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/courses/${courseId}/rate`, { rating, review });
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to rate course');
    }
  }
);

const courseSlice = createSlice({
  name: 'courses',
  initialState: {
    courses: [],
    currentCourse: null,
    schedule: [],
    loading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    },
    filters: {
      category: '',
      level: '',
      search: '',
    },
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearCurrentCourse: (state) => {
      state.currentCourse = null;
      state.schedule = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Courses
      .addCase(fetchCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = action.payload.courses || action.payload;
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Course By ID
      .addCase(fetchCourseById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourseById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCourse = action.payload;
      })
      .addCase(fetchCourseById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Course
      .addCase(createCourse.fulfilled, (state, action) => {
        state.courses.unshift(action.payload);
      })
      // Update Course
      .addCase(updateCourse.fulfilled, (state, action) => {
        const index = state.courses.findIndex((c) => c._id === action.payload._id);
        if (index !== -1) {
          state.courses[index] = action.payload;
        }
        if (state.currentCourse?._id === action.payload._id) {
          state.currentCourse = action.payload;
        }
      })
      // Delete Course
      .addCase(deleteCourse.fulfilled, (state, action) => {
        state.courses = state.courses.filter((c) => c._id !== action.payload);
      })
      // Fetch Schedule
      .addCase(fetchCourseSchedule.fulfilled, (state, action) => {
        state.schedule = action.payload;
      })
      // Rate Course
      .addCase(rateCourse.fulfilled, (state, action) => {
        if (state.currentCourse?._id === action.payload._id) {
          state.currentCourse = action.payload;
        }
      });
  },
});

export const { clearError, setFilters, clearCurrentCourse } = courseSlice.actions;
export default courseSlice.reducer;
