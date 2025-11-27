// frontend/src/components/landing/CourseCard.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Play, Star, Clock } from 'lucide-react';

const CourseCard = ({ 
  id,
  title, 
  instructor, 
  duration, 
  price, 
  rating, 
  students, 
  image,
  gradient = 'from-indigo-500 to-purple-600'
}) => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const handleEnrollClick = (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      // Redirect to login page with return URL
      navigate('/login', { state: { from: `/courses/${id}` } });
    } else {
      // Navigate to course detail page
      navigate(`/courses/${id}`);
    }
  };

  return (
    <div className="group bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-300 hover:-translate-y-2">
      {/* Thumbnail with Play Button Overlay */}
      <div className={`relative h-48 bg-gradient-to-br ${gradient} overflow-hidden`}>
        {image ? (
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover opacity-75 group-hover:opacity-90 transition-opacity duration-300" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-white text-6xl font-bold opacity-30">{title.charAt(0)}</div>
          </div>
        )}
        
        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-all duration-300">
          <div className="bg-white rounded-full p-4 opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300 shadow-2xl">
            <Play className="h-8 w-8 text-indigo-600" fill="currentColor" />
          </div>
        </div>

        {/* Duration Badge */}
        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm flex items-center space-x-1">
          <Clock className="h-4 w-4" />
          <span>{duration}</span>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6">
        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
          {title}
        </h3>
        
        {/* Instructor */}
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          by {instructor}
        </p>
        
        {/* Meta Info */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-sm font-semibold text-gray-900 dark:text-white">{rating}</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">({students})</span>
          </div>
        </div>

        {/* Price & CTA */}
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {price}
          </span>
          <button
            onClick={handleEnrollClick}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-300 text-sm"
          >
            Enroll Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
