// frontend/src/redux/slices/adminSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// ==================== USER MANAGEMENT ====================

export const fetchAllUsers = createAsyncThunk(
  'admin/fetchAllUsers',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/admin/users', { params });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
    }
  }
);

export const fetchUserById = createAsyncThunk(
  'admin/fetchUserById',
  async (userId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/admin/users/${userId}`);
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user');
    }
  }
);

export const createUser = createAsyncThunk(
  'admin/createUser',
  async (userData, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/admin/users', userData);
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create user');
    }
  }
);

export const updateUser = createAsyncThunk(
  'admin/updateUser',
  async ({ userId, updates }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/admin/users/${userId}`, updates);
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update user');
    }
  }
);

export const deleteUser = createAsyncThunk(
  'admin/deleteUser',
  async (userId, { rejectWithValue }) => {
    try {
      await api.delete(`/admin/users/${userId}`);
      return userId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete user');
    }
  }
);

// ==================== COURSE MANAGEMENT ====================

export const fetchAllCourses = createAsyncThunk(
  'admin/fetchAllCourses',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/admin/courses', { params });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch courses');
    }
  }
);

export const approveCourse = createAsyncThunk(
  'admin/approveCourse',
  async (courseId, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/api/admin/courses/${courseId}/approve`);
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to approve course');
    }
  }
);

export const rejectCourse = createAsyncThunk(
  'admin/rejectCourse',
  async ({ courseId, reason }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/api/admin/courses/${courseId}/reject`, { reason });
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reject course');
    }
  }
);

export const assignTutor = createAsyncThunk(
  'admin/assignTutor',
  async ({ courseId, tutorId }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/admin/courses/${courseId}/assign`, { tutorId });
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to assign tutor');
    }
  }
);

export const deleteCourse = createAsyncThunk(
  'admin/deleteCourse',
  async (courseId, { rejectWithValue }) => {
    try {
      await api.delete(`/admin/courses/${courseId}`);
      return courseId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete course');
    }
  }
);

// ==================== ASSIGNMENT OVERSIGHT ====================

export const fetchAllAssignments = createAsyncThunk(
  'admin/fetchAllAssignments',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/admin/assignments', { params });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch assignments');
    }
  }
);

export const deleteAssignment = createAsyncThunk(
  'admin/deleteAssignment',
  async (assignmentId, { rejectWithValue }) => {
    try {
      await api.delete(`/admin/assignments/${assignmentId}`);
      return assignmentId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete assignment');
    }
  }
);

// ==================== FEED MODERATION ====================

export const fetchAllPosts = createAsyncThunk(
  'admin/fetchAllPosts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const { data } = await api.get(`/admin/feeds${queryParams ? '?' + queryParams : ''}`);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch posts');
    }
  }
);

export const moderatePost = createAsyncThunk(
  'admin/moderatePost',
  async ({ postId, isHidden, reason }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/admin/feeds/${postId}/flag`, { isHidden, reason });
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to moderate post');
    }
  }
);

export const flagPost = createAsyncThunk(
  'admin/flagPost',
  async ({ postId, isHidden, reason }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/admin/feeds/${postId}/flag`, { isHidden, reason });
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to flag post');
    }
  }
);

// ==================== PAYMENTS ====================

export const fetchAllPayments = createAsyncThunk(
  'admin/fetchAllPayments',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/admin/payments', { params });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch payments');
    }
  }
);

export const issueRefund = createAsyncThunk(
  'admin/issueRefund',
  async ({ paymentId, reason }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/admin/payments/${paymentId}/refund`, { reason });
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to issue refund');
    }
  }
);

// ==================== SETTINGS ====================
// Note: Settings are typically environment variables, not database values
// These actions are placeholders for the UI

export const fetchSettings = createAsyncThunk(
  'admin/fetchSettings',
  async (_, { rejectWithValue }) => {
    try {
      // Settings are environment variables, return empty object
      // In a real app, you might fetch some config from backend
      return {};
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch settings');
    }
  }
);

export const updateSettings = createAsyncThunk(
  'admin/updateSettings',
  async (settings, { rejectWithValue }) => {
    try {
      // In a real app, you would update .env or config here
      // For now, just return the settings
      return settings;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update settings');
    }
  }
);

// ==================== ANALYTICS ====================

export const fetchPlatformOverview = createAsyncThunk(
  'admin/fetchPlatformOverview',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/admin/analytics/overview');
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch overview');
    }
  }
);

export const fetchUserGrowth = createAsyncThunk(
  'admin/fetchUserGrowth',
  async (months = 6, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/admin/analytics/user-growth', { params: { months } });
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user growth');
    }
  }
);

export const fetchRevenueAnalytics = createAsyncThunk(
  'admin/fetchRevenueAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/admin/analytics/revenue');
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch revenue analytics');
    }
  }
);

export const fetchEngagementStats = createAsyncThunk(
  'admin/fetchEngagementStats',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/admin/analytics/engagement');
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch engagement stats');
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    users: {
      list: [],
      total: 0,
      currentPage: 1,
      totalPages: 1,
      loading: false,
      error: null,
    },
    selectedUser: null,
    courses: {
      list: [],
      total: 0,
      currentPage: 1,
      totalPages: 1,
      loading: false,
      error: null,
    },
    assignments: {
      list: [],
      total: 0,
      currentPage: 1,
      totalPages: 1,
      loading: false,
      error: null,
    },
    posts: {
      list: [],
      total: 0,
      currentPage: 1,
      totalPages: 1,
      loading: false,
      error: null,
    },
    payments: {
      list: [],
      total: 0,
      totalRevenue: 0,
      currentPage: 1,
      totalPages: 1,
      loading: false,
      error: null,
    },
    analytics: {
      overview: null,
      userGrowth: [],
      revenue: null,
      engagement: null,
      loading: false,
      error: null,
    },
    settings: {
      data: {},
      loading: false,
      error: null,
    },
  },
  reducers: {
    clearError: (state) => {
      state.users.error = null;
      state.courses.error = null;
      state.assignments.error = null;
      state.posts.error = null;
      state.payments.error = null;
      state.analytics.error = null;
      state.settings.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Users
      .addCase(fetchAllUsers.pending, (state) => {
        state.users.loading = true;
        state.users.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.users.loading = false;
        state.users.list = action.payload.data;
        state.users.total = action.payload.total;
        state.users.currentPage = action.payload.currentPage;
        state.users.totalPages = action.payload.totalPages;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.users.loading = false;
        state.users.error = action.payload;
      })
      // Fetch User By ID
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.selectedUser = action.payload;
      })
      // Create User
      .addCase(createUser.fulfilled, (state, action) => {
        state.users.list.unshift(action.payload);
        state.users.total += 1;
      })
      // Update User
      .addCase(updateUser.fulfilled, (state, action) => {
        const index = state.users.list.findIndex((u) => u._id === action.payload._id);
        if (index !== -1) {
          state.users.list[index] = action.payload;
        }
      })
      // Delete User
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users.list = state.users.list.filter((u) => u._id !== action.payload);
        state.users.total -= 1;
      })
      // Fetch All Courses
      .addCase(fetchAllCourses.pending, (state) => {
        state.courses.loading = true;
        state.courses.error = null;
      })
      .addCase(fetchAllCourses.fulfilled, (state, action) => {
        state.courses.loading = false;
        state.courses.list = action.payload.data;
        state.courses.total = action.payload.total;
        state.courses.currentPage = action.payload.currentPage;
        state.courses.totalPages = action.payload.totalPages;
      })
      .addCase(fetchAllCourses.rejected, (state, action) => {
        state.courses.loading = false;
        state.courses.error = action.payload;
      })
      // Approve Course
      .addCase(approveCourse.fulfilled, (state, action) => {
        const index = state.courses.list.findIndex((c) => c._id === action.payload._id);
        if (index !== -1) {
          state.courses.list[index] = action.payload;
        }
      })
      // Reject Course
      .addCase(rejectCourse.fulfilled, (state, action) => {
        const index = state.courses.list.findIndex((c) => c._id === action.payload._id);
        if (index !== -1) {
          state.courses.list[index] = action.payload;
        }
      })
      // Delete Course
      .addCase(deleteCourse.fulfilled, (state, action) => {
        state.courses.list = state.courses.list.filter((c) => c._id !== action.payload);
        state.courses.total -= 1;
      })
      // Fetch All Assignments
      .addCase(fetchAllAssignments.pending, (state) => {
        state.assignments.loading = true;
        state.assignments.error = null;
      })
      .addCase(fetchAllAssignments.fulfilled, (state, action) => {
        state.assignments.loading = false;
        state.assignments.list = action.payload.data;
        state.assignments.total = action.payload.total;
        state.assignments.currentPage = action.payload.currentPage;
        state.assignments.totalPages = action.payload.totalPages;
      })
      .addCase(fetchAllAssignments.rejected, (state, action) => {
        state.assignments.loading = false;
        state.assignments.error = action.payload;
      })
      // Delete Assignment
      .addCase(deleteAssignment.fulfilled, (state, action) => {
        state.assignments.list = state.assignments.list.filter((a) => a._id !== action.payload);
        state.assignments.total -= 1;
      })
      // Fetch All Posts
      .addCase(fetchAllPosts.pending, (state) => {
        state.posts.loading = true;
        state.posts.error = null;
      })
      .addCase(fetchAllPosts.fulfilled, (state, action) => {
        state.posts.loading = false;
        state.posts.list = action.payload.data;
        state.posts.total = action.payload.pagination?.total || 0;
        state.posts.currentPage = action.payload.pagination?.page || 1;
        state.posts.totalPages = action.payload.pagination?.pages || 1;
      })
      .addCase(fetchAllPosts.rejected, (state, action) => {
        state.posts.loading = false;
        state.posts.error = action.payload;
      })
      // Moderate Post
      .addCase(moderatePost.fulfilled, (state, action) => {
        const index = state.posts.list.findIndex((p) => p._id === action.payload._id);
        if (index !== -1) {
          state.posts.list[index] = action.payload;
        }
      })
      // Fetch All Payments
      .addCase(fetchAllPayments.pending, (state) => {
        state.payments.loading = true;
        state.payments.error = null;
      })
      .addCase(fetchAllPayments.fulfilled, (state, action) => {
        state.payments.loading = false;
        state.payments.list = action.payload.data;
        state.payments.total = action.payload.total;
        state.payments.totalRevenue = action.payload.totalRevenue;
        state.payments.currentPage = action.payload.currentPage;
        state.payments.totalPages = action.payload.totalPages;
      })
      .addCase(fetchAllPayments.rejected, (state, action) => {
        state.payments.loading = false;
        state.payments.error = action.payload;
      })
      // Issue Refund
      .addCase(issueRefund.fulfilled, (state, action) => {
        const index = state.payments.list.findIndex((p) => p._id === action.payload._id);
        if (index !== -1) {
          state.payments.list[index] = action.payload;
        }
      })
      // Analytics - Overview
      .addCase(fetchPlatformOverview.pending, (state) => {
        state.analytics.loading = true;
        state.analytics.error = null;
      })
      .addCase(fetchPlatformOverview.fulfilled, (state, action) => {
        state.analytics.loading = false;
        state.analytics.overview = action.payload;
      })
      .addCase(fetchPlatformOverview.rejected, (state, action) => {
        state.analytics.loading = false;
        state.analytics.error = action.payload;
      })
      // Analytics - User Growth
      .addCase(fetchUserGrowth.fulfilled, (state, action) => {
        state.analytics.userGrowth = action.payload;
      })
      // Analytics - Revenue
      .addCase(fetchRevenueAnalytics.fulfilled, (state, action) => {
        state.analytics.revenue = action.payload;
      })
      // Analytics - Engagement
      .addCase(fetchEngagementStats.fulfilled, (state, action) => {
        state.analytics.engagement = action.payload;
      })
      // Settings
      .addCase(fetchSettings.pending, (state) => {
        state.settings.loading = true;
        state.settings.error = null;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.settings.loading = false;
        state.settings.data = action.payload;
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.settings.loading = false;
        state.settings.error = action.payload;
      })
      .addCase(updateSettings.fulfilled, (state, action) => {
        state.settings.data = action.payload;
      });
  },
});

export const { clearError } = adminSlice.actions;
export default adminSlice.reducer;
