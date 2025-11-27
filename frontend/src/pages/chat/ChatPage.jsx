import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Send,
  Search,
  MoreVertical,
  Users,
  Phone,
  Video,
  Paperclip,
  Smile,
} from 'lucide-react';
import {
  fetchChatRooms,
  fetchRoomMessages,
  setCurrentRoom,
  addMessage,
  setTyping,
} from '../../redux/slices/chatSlice';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Card, Button, Avatar, Input, EmptyState, Loader } from '../../components/ui';
import socketService from '../../services/socket';

const ChatPage = () => {
  const { roomId } = useParams();
  const dispatch = useDispatch();
  const { rooms, currentRoom, messages, typingUsers, loading } = useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.auth);
  const [searchTerm, setSearchTerm] = useState('');
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    dispatch(fetchChatRooms());
  }, [dispatch]);

  useEffect(() => {
    if (roomId) {
      const room = rooms.find((r) => r._id === roomId);
      if (room) {
        dispatch(setCurrentRoom(room));
        dispatch(fetchRoomMessages({ roomId, page: 1, limit: 50 }));
        socketService.joinRoom(roomId);
      }
    }

    return () => {
      if (roomId) {
        socketService.leaveRoom(roomId);
      }
    };
  }, [roomId, rooms, dispatch]);

  // Real-time message listeners
  useEffect(() => {
    const handleNewMessage = (message) => {
      dispatch(addMessage({ roomId: message.room, message }));
      scrollToBottom();
    };

    const handleTyping = ({ roomId, userId, userName }) => {
      if (userId !== user._id) {
        dispatch(setTyping({ roomId, userId, isTyping: true }));
      }
    };

    const handleStopTyping = ({ roomId, userId }) => {
      dispatch(setTyping({ roomId, userId, isTyping: false }));
    };

    socketService.onNewMessage(handleNewMessage);
    socketService.onTyping(handleTyping);
    socketService.onStopTyping(handleStopTyping);

    return () => {
      socketService.off('newMessage', handleNewMessage);
      socketService.off('userTyping', handleTyping);
      socketService.off('userStopTyping', handleStopTyping);
    };
  }, [dispatch, user._id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages[currentRoom?._id]]);

  const handleSendMessage = () => {
    if (!messageText.trim() || !currentRoom) return;

    const messageData = {
      text: messageText,
      room: currentRoom._id,
    };

    socketService.sendMessage(currentRoom._id, messageData);
    setMessageText('');
    socketService.stopTyping(currentRoom._id);
  };

  const handleTyping = () => {
    if (!currentRoom) return;

    socketService.typing(currentRoom._id);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socketService.stopTyping(currentRoom._id);
    }, 1000);
  };

  const filteredRooms = rooms.filter((room) =>
    room.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentMessages = messages[currentRoom?._id] || [];
  const currentTypingUsers = typingUsers[currentRoom?._id] || [];

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-4rem)] flex">
        {/* Rooms List Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Search */}
          <div className="p-4 border-b border-gray-200">
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="h-5 w-5 text-gray-400" />}
            />
          </div>

          {/* Rooms List */}
          <div className="flex-1 overflow-y-auto">
            {loading && <Loader text="Loading chats..." />}
            
            {!loading && filteredRooms.length === 0 && (
              <div className="p-4 text-center text-gray-500">
                <p>No conversations yet</p>
              </div>
            )}

            {!loading && filteredRooms.map((room) => (
              <RoomItem
                key={room._id}
                room={room}
                isActive={currentRoom?._id === room._id}
                onClick={() => {
                  dispatch(setCurrentRoom(room));
                  dispatch(fetchRoomMessages({ roomId: room._id, page: 1, limit: 50 }));
                  socketService.joinRoom(room._id);
                }}
              />
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-gray-50">
          {currentRoom ? (
            <>
              {/* Chat Header */}
              <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar 
                    name={currentRoom.name || 'Chat'} 
                    size="md" 
                  />
                  <div>
                    <h2 className="font-semibold text-gray-900">{currentRoom.name}</h2>
                    <p className="text-sm text-gray-500">
                      {currentRoom.participants?.length || 0} participants
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                    <Phone className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                    <Video className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {currentMessages.map((message, index) => {
                  const isOwn = message.sender?._id === user._id;
                  const showAvatar = !isOwn && (
                    index === 0 || 
                    currentMessages[index - 1]?.sender?._id !== message.sender?._id
                  );

                  return (
                    <MessageBubble
                      key={message._id || index}
                      message={message}
                      isOwn={isOwn}
                      showAvatar={showAvatar}
                    />
                  );
                })}
                
                {/* Typing Indicator */}
                {currentTypingUsers.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                    </div>
                    <span>Someone is typing...</span>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="bg-white border-t border-gray-200 px-6 py-4">
                <div className="flex items-end gap-3">
                  <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                    <Paperclip className="h-5 w-5" />
                  </button>
                  
                  <div className="flex-1">
                    <textarea
                      value={messageText}
                      onChange={(e) => {
                        setMessageText(e.target.value);
                        handleTyping();
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Type a message..."
                      rows={1}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    />
                  </div>

                  <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                    <Smile className="h-5 w-5" />
                  </button>

                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageText.trim()}
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <EmptyState
              icon={Users}
              title="No conversation selected"
              description="Select a conversation from the sidebar to start chatting"
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

const RoomItem = ({ room, isActive, onClick }) => {
  const formatTime = (date) => {
    if (!date) return '';
    const messageDate = new Date(date);
    const today = new Date();
    
    if (messageDate.toDateString() === today.toDateString()) {
      return messageDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    return messageDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div
      onClick={onClick}
      className={`p-4 border-b border-gray-100 cursor-pointer transition ${
        isActive ? 'bg-indigo-50' : 'hover:bg-gray-50'
      }`}
    >
      <div className="flex items-start gap-3">
        <Avatar name={room.name || 'Chat'} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <h3 className="font-semibold text-gray-900 truncate">
              {room.name || 'Unnamed Chat'}
            </h3>
            <span className="text-xs text-gray-500">
              {formatTime(room.lastMessage?.createdAt || room.updatedAt)}
            </span>
          </div>
          <p className="text-sm text-gray-600 truncate">
            {room.lastMessage?.text || 'No messages yet'}
          </p>
        </div>
      </div>
    </div>
  );
};

const MessageBubble = ({ message, isOwn, showAvatar }) => {
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
      {showAvatar && !isOwn && (
        <Avatar 
          src={message.sender?.avatar} 
          name={message.sender?.name} 
          size="sm" 
        />
      )}
      {!showAvatar && !isOwn && <div className="w-8" />}
      
      <div className={`flex flex-col ${isOwn ? 'items-end' : ''}`}>
        {showAvatar && !isOwn && (
          <span className="text-xs text-gray-500 mb-1 px-3">
            {message.sender?.name}
          </span>
        )}
        <div
          className={`max-w-md px-4 py-2 rounded-2xl ${
            isOwn
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-gray-900 border border-gray-200'
          }`}
        >
          <p className="whitespace-pre-wrap break-words">{message.text}</p>
        </div>
        <span className="text-xs text-gray-500 mt-1 px-3">
          {formatTime(message.createdAt)}
        </span>
      </div>
    </div>
  );
};

export default ChatPage;
