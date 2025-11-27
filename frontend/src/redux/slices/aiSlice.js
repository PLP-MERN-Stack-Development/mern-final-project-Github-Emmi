// frontend/src/redux/slices/aiSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks
export const getStudyRecommendations = createAsyncThunk(
  'ai/getStudyRecommendations',
  async ({ courseId, studentProgress }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/ai/recommendations', { courseId, studentProgress });
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get recommendations');
    }
  }
);

export const getResourceRecommendations = createAsyncThunk(
  'ai/getResourceRecommendations',
  async ({ topic, level }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/ai/resources', { topic, level });
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get resource recommendations');
    }
  }
);

export const analyzePerformance = createAsyncThunk(
  'ai/analyzePerformance',
  async ({ courseId, studentId }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/ai/analyze-performance', { courseId, studentId });
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to analyze performance');
    }
  }
);

export const generateStudyPlan = createAsyncThunk(
  'ai/generateStudyPlan',
  async ({ courseId, weeksAvailable, hoursPerWeek }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/ai/study-plan', { courseId, weeksAvailable, hoursPerWeek });
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to generate study plan');
    }
  }
);

export const askAI = createAsyncThunk(
  'ai/askAI',
  async ({ question, context }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/ai/ask', { question, context });
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get AI response');
    }
  }
);

export const preGradeAssignment = createAsyncThunk(
  'ai/preGradeAssignment',
  async ({ submissionId, rubric }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/ai/pre-grade', { submissionId, rubric });
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to pre-grade assignment');
    }
  }
);

const aiSlice = createSlice({
  name: 'ai',
  initialState: {
    recommendations: [],
    resources: [],
    performance: null,
    studyPlan: null,
    chatHistory: [],
    preGradeResults: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    addChatMessage: (state, action) => {
      state.chatHistory.push(action.payload);
    },
    clearChatHistory: (state) => {
      state.chatHistory = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Study Recommendations
      .addCase(getStudyRecommendations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getStudyRecommendations.fulfilled, (state, action) => {
        state.loading = false;
        state.recommendations = action.payload;
      })
      .addCase(getStudyRecommendations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Resource Recommendations
      .addCase(getResourceRecommendations.fulfilled, (state, action) => {
        state.resources = action.payload;
      })
      // Analyze Performance
      .addCase(analyzePerformance.fulfilled, (state, action) => {
        state.performance = action.payload;
      })
      // Generate Study Plan
      .addCase(generateStudyPlan.fulfilled, (state, action) => {
        state.studyPlan = action.payload;
      })
      // Ask AI
      .addCase(askAI.fulfilled, (state, action) => {
        state.chatHistory.push({
          role: 'assistant',
          content: action.payload.answer,
          timestamp: new Date().toISOString(),
        });
      })
      // Pre-grade Assignment
      .addCase(preGradeAssignment.fulfilled, (state, action) => {
        state.preGradeResults = action.payload;
      });
  },
});

export const { clearError, addChatMessage, clearChatHistory } = aiSlice.actions;
export default aiSlice.reducer;
