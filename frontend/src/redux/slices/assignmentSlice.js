// frontend/src/redux/slices/assignmentSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks
export const fetchCourseAssignments = createAsyncThunk(
  'assignments/fetchCourseAssignments',
  async (courseId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/assignments/course/${courseId}`);
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch assignments');
    }
  }
);

export const fetchAssignmentById = createAsyncThunk(
  'assignments/fetchAssignmentById',
  async (assignmentId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/assignments/${assignmentId}`);
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch assignment');
    }
  }
);

export const createAssignment = createAsyncThunk(
  'assignments/createAssignment',
  async (assignmentData, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/assignments', assignmentData);
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create assignment');
    }
  }
);

export const submitAssignment = createAsyncThunk(
  'assignments/submitAssignment',
  async ({ assignmentId, formData }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/assignments/${assignmentId}/submit`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit assignment');
    }
  }
);

export const fetchAssignmentSubmissions = createAsyncThunk(
  'assignments/fetchSubmissions',
  async (assignmentId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/assignments/${assignmentId}/submissions`);
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch submissions');
    }
  }
);

export const gradeSubmission = createAsyncThunk(
  'assignments/gradeSubmission',
  async ({ submissionId, data: gradeData }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/assignments/submission/${submissionId}/grade`, gradeData);
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to grade submission');
    }
  }
);

export const fetchMySubmissions = createAsyncThunk(
  'assignments/fetchMySubmissions',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/assignments/my-submissions');
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch submissions');
    }
  }
);

export const fetchTutorAssignments = createAsyncThunk(
  'assignments/fetchTutorAssignments',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/assignments/tutor/my-assignments');
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch tutor assignments');
    }
  }
);

const assignmentSlice = createSlice({
  name: 'assignments',
  initialState: {
    assignments: [],
    currentAssignment: null,
    submissions: [],
    mySubmissions: [],
    loading: false,
    creating: false,
    submitting: false,
    grading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentAssignment: (state) => {
      state.currentAssignment = null;
      state.submissions = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Course Assignments
      .addCase(fetchCourseAssignments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourseAssignments.fulfilled, (state, action) => {
        state.loading = false;
        state.assignments = action.payload;
      })
      .addCase(fetchCourseAssignments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Assignment By ID
      .addCase(fetchAssignmentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssignmentById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAssignment = action.payload;
      })
      .addCase(fetchAssignmentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Assignment
      .addCase(createAssignment.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createAssignment.fulfilled, (state, action) => {
        state.creating = false;
        state.assignments.unshift(action.payload);
      })
      .addCase(createAssignment.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload;
      })
      // Submit Assignment
      .addCase(submitAssignment.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(submitAssignment.fulfilled, (state, action) => {
        state.submitting = false;
        state.mySubmissions.unshift(action.payload);
      })
      .addCase(submitAssignment.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })
      // Fetch Submissions
      .addCase(fetchAssignmentSubmissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssignmentSubmissions.fulfilled, (state, action) => {
        state.loading = false;
        state.submissions = action.payload;
      })
      .addCase(fetchAssignmentSubmissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Grade Submission
      .addCase(gradeSubmission.pending, (state) => {
        state.grading = true;
        state.error = null;
      })
      .addCase(gradeSubmission.fulfilled, (state, action) => {
        state.grading = false;
        const index = state.submissions.findIndex((s) => s._id === action.payload._id);
        if (index !== -1) {
          state.submissions[index] = action.payload;
        }
      })
      .addCase(gradeSubmission.rejected, (state, action) => {
        state.grading = false;
        state.error = action.payload;
      })
      // Fetch My Submissions
      .addCase(fetchMySubmissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMySubmissions.fulfilled, (state, action) => {
        state.loading = false;
        state.mySubmissions = action.payload;
      })
      .addCase(fetchMySubmissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Tutor Assignments
      .addCase(fetchTutorAssignments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTutorAssignments.fulfilled, (state, action) => {
        state.loading = false;
        state.assignments = action.payload;
      })
      .addCase(fetchTutorAssignments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearCurrentAssignment } = assignmentSlice.actions;
export default assignmentSlice.reducer;
