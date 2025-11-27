// frontend/src/components/landing/FeatureCard.jsx
import React from 'react';

const FeatureCard = ({ icon: Icon, title, description, gradient = 'from-indigo-500 to-purple-600' }) => {
  return (
    <div className="group bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-2xl p-8 hover:border-indigo-500 dark:hover:border-indigo-400 hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-300 hover:-translate-y-2">
      {/* Gradient Icon Container */}
      <div className={`inline-flex p-4 rounded-xl mb-6 bg-gradient-to-br ${gradient} group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
        <Icon className="h-8 w-8 text-white" />
      </div>
      
      {/* Title */}
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
        {title}
      </h3>
      
      {/* Description */}
      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
        {description}
      </p>
    </div>
  );
};

export default FeatureCard;
