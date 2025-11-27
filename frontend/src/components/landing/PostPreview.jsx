// frontend/src/components/landing/PostPreview.jsx
import React from 'react';
import { MessageCircle, Heart } from 'lucide-react';

const PostPreview = ({ name, timestamp, content, likes, comments, avatar }) => {
  return (
    <div className="flex space-x-4 p-6 hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors duration-200 cursor-pointer">
      {/* Avatar */}
      <div className="flex-shrink-0">
        {avatar ? (
          <img 
            src={avatar} 
            alt={name} 
            className="h-12 w-12 rounded-full object-cover"
          />
        ) : (
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
            {name.split(' ').map(n => n[0]).join('')}
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center space-x-2 mb-2">
          <span className="font-semibold text-gray-900 dark:text-white">{name}</span>
          <span className="text-gray-500 dark:text-gray-400">·</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">{timestamp}</span>
        </div>
        
        {/* Post Content */}
        <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
          {content}
        </p>
        
        {/* Engagement */}
        <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
          <button className="flex items-center space-x-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group">
            <MessageCircle className="h-5 w-5 group-hover:scale-110 transition-transform" />
            <span className="font-medium">{comments}</span>
          </button>
          <button className="flex items-center space-x-2 hover:text-red-600 dark:hover:text-red-400 transition-colors group">
            <Heart className="h-5 w-5 group-hover:scale-110 transition-transform" />
            <span className="font-medium">{likes}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostPreview;
