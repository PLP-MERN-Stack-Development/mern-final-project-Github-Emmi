// frontend/src/components/ui/EmptyState.jsx
import React from 'react';

const EmptyState = ({ 
  icon: Icon,
  title, 
  description, 
  action,
  className = '' 
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}>
      {Icon && (
        <div className="mb-4 p-4 bg-gray-100 rounded-full">
          <Icon className="h-12 w-12 text-gray-400" />
        </div>
      )}
      {title && (
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      )}
      {description && (
        <p className="text-gray-600 text-center max-w-md mb-6">{description}</p>
      )}
      {action && action}
    </div>
  );
};

export default EmptyState;
