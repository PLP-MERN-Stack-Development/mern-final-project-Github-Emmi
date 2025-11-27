// frontend/src/components/landing/TestimonialCard.jsx
import React from 'react';
import { Star } from 'lucide-react';

const TestimonialCard = ({ name, role, quote, content, avatar, rating = 5, location }) => {
  const testimonialText = content || quote; // Support both 'content' and 'quote' props
  
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 border border-gray-200 dark:border-slate-700 h-full flex flex-col">
      {/* Stars */}
      <div className="flex mb-6">
        {[...Array(rating)].map((_, i) => (
          <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
        ))}
      </div>
      
      {/* Quote */}
      <p className="text-gray-700 dark:text-gray-300 italic mb-6 leading-relaxed text-lg flex-grow">
        "{testimonialText}"
      </p>
      
      {/* Profile */}
      <div className="flex items-center space-x-4">
        {/* Avatar */}
        {avatar ? (
          <img 
            src={avatar} 
            alt={name} 
            className="h-16 w-16 rounded-full object-cover border-2 border-indigo-500"
          />
        ) : (
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
            {name.split(' ').map(n => n[0]).join('')}
          </div>
        )}
        
        {/* Name & Role */}
        <div>
          <h4 className="font-bold text-gray-900 dark:text-white text-lg">{name}</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">{role}</p>
          {location && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">📍 {location}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;
