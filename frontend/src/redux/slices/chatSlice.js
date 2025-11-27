// frontend/src/redux/slices/chatSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks
export const fetchChatRooms = createAsyncThunk(
  'chat/fetchChatRooms',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/chat/rooms');
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch chat rooms');
    }
  }
);

export const fetchRoomMessages = createAsyncThunk(
  'chat/fetchRoomMessages',
  async ({ roomId, page = 1, limit = 50 }, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/chat/rooms/${roomId}/messages`, {
        params: { page, limit },
      });
      return { roomId, messages: data.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch messages');
    }
  }
);

export const createDirectRoom = createAsyncThunk(
  'chat/createDirectRoom',
  async (participantId, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/chat/rooms/direct', { participantId });
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create chat room');
    }
  }
);

export const deleteMessage = createAsyncThunk(
  'chat/deleteMessage',
  async (messageId, { rejectWithValue }) => {
    try {
      await api.delete(`/chat/messages/${messageId}`);
      return messageId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete message');
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    rooms: [],
    currentRoom: null,
    messages: {},
    typingUsers: {},
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentRoom: (state, action) => {
      state.currentRoom = action.payload;
    },
    addMessage: (state, action) => {
      // For real-time socket updates
      const { roomId, message } = action.payload;
      if (!state.messages[roomId]) {
        state.messages[roomId] = [];
      }
      state.messages[roomId].push(message);
      
      // Update room's last message
      const room = state.rooms.find((r) => r._id === roomId);
      if (room) {
        room.lastMessage = message;
        room.updatedAt = message.createdAt;
      }
    },
    setTyping: (state, action) => {
      const { roomId, userId, isTyping } = action.payload;
      if (!state.typingUsers[roomId]) {
        state.typingUsers[roomId] = [];
      }
      if (isTyping) {
        if (!state.typingUsers[roomId].includes(userId)) {
          state.typingUsers[roomId].push(userId);
        }
      } else {
        state.typingUsers[roomId] = state.typingUsers[roomId].filter((id) => id !== userId);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Chat Rooms
      .addCase(fetchChatRooms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChatRooms.fulfilled, (state, action) => {
        state.loading = false;
        state.rooms = action.payload;
      })
      .addCase(fetchChatRooms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Room Messages
      .addCase(fetchRoomMessages.fulfilled, (state, action) => {
        const { roomId, messages } = action.payload;
        state.messages[roomId] = messages;
      })
      // Create Direct Room
      .addCase(createDirectRoom.fulfilled, (state, action) => {
        state.rooms.unshift(action.payload);
        state.currentRoom = action.payload;
      })
      // Delete Message
      .addCase(deleteMessage.fulfilled, (state, action) => {
        Object.keys(state.messages).forEach((roomId) => {
          state.messages[roomId] = state.messages[roomId].filter(
            (m) => m._id !== action.payload
          );
        });
      });
  },
});

export const { clearError, setCurrentRoom, addMessage, setTyping } = chatSlice.actions;
export default chatSlice.reducer;
