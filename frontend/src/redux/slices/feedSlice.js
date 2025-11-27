// frontend/src/redux/slices/feedSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks
export const fetchPosts = createAsyncThunk(
  'feed/fetchPosts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/feeds', { params });
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch posts');
    }
  }
);

export const fetchPostById = createAsyncThunk(
  'feed/fetchPostById',
  async (postId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/feeds/${postId}`);
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch post');
    }
  }
);

export const createPost = createAsyncThunk(
  'feed/createPost',
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/feeds', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create post');
    }
  }
);

export const updatePost = createAsyncThunk(
  'feed/updatePost',
  async ({ postId, postData }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/feeds/${postId}`, postData);
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update post');
    }
  }
);

export const deletePost = createAsyncThunk(
  'feed/deletePost',
  async (postId, { rejectWithValue }) => {
    try {
      await api.delete(`/feeds/${postId}`);
      return postId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete post');
    }
  }
);

export const likePost = createAsyncThunk(
  'feed/likePost',
  async (postId, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/feeds/${postId}/like`);
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to like post');
    }
  }
);

export const addComment = createAsyncThunk(
  'feed/addComment',
  async ({ postId, text }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/feeds/${postId}/comment`, { text });
      return { postId, comment: data.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add comment');
    }
  }
);

export const deleteComment = createAsyncThunk(
  'feed/deleteComment',
  async ({ postId, commentId }, { rejectWithValue }) => {
    try {
      await api.delete(`/feeds/${postId}/comment/${commentId}`);
      return { postId, commentId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete comment');
    }
  }
);

const feedSlice = createSlice({
  name: 'feed',
  initialState: {
    posts: [],
    currentPost: null,
    loading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    },
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    addNewPost: (state, action) => {
      // For real-time socket updates
      state.posts.unshift(action.payload);
    },
    updatePostLikes: (state, action) => {
      // For real-time socket updates
      const post = state.posts.find((p) => p._id === action.payload.postId);
      if (post) {
        post.likes = action.payload.likes;
      }
    },
    addNewComment: (state, action) => {
      // For real-time socket updates
      const post = state.posts.find((p) => p._id === action.payload.postId);
      if (post) {
        post.comments.push(action.payload.comment);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Posts
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload.posts || action.payload;
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Post By ID
      .addCase(fetchPostById.fulfilled, (state, action) => {
        state.currentPost = action.payload;
      })
      // Create Post
      .addCase(createPost.fulfilled, (state, action) => {
        state.posts.unshift(action.payload);
      })
      // Update Post
      .addCase(updatePost.fulfilled, (state, action) => {
        const index = state.posts.findIndex((p) => p._id === action.payload._id);
        if (index !== -1) {
          state.posts[index] = action.payload;
        }
      })
      // Delete Post
      .addCase(deletePost.fulfilled, (state, action) => {
        state.posts = state.posts.filter((p) => p._id !== action.payload);
      })
      // Like Post
      .addCase(likePost.fulfilled, (state, action) => {
        const index = state.posts.findIndex((p) => p._id === action.payload._id);
        if (index !== -1) {
          state.posts[index] = action.payload;
        }
      })
      // Add Comment
      .addCase(addComment.fulfilled, (state, action) => {
        const post = state.posts.find((p) => p._id === action.payload.postId);
        if (post) {
          post.comments.push(action.payload.comment);
        }
      })
      // Delete Comment
      .addCase(deleteComment.fulfilled, (state, action) => {
        const post = state.posts.find((p) => p._id === action.payload.postId);
        if (post) {
          post.comments = post.comments.filter((c) => c._id !== action.payload.commentId);
        }
      });
  },
});

export const { clearError, addNewPost, updatePostLikes, addNewComment } = feedSlice.actions;
export default feedSlice.reducer;
