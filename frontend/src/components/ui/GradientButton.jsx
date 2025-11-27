// frontend/src/components/ui/GradientButton.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const GradientButton = ({ 
  children, 
  to, 
  onClick, 
  variant = 'primary', 
  size = 'md',
  icon: Icon,
  iconPosition = 'right',
  className = '',
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-semibold transition-all duration-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variants = {
    primary: "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-500/50 hover:scale-105 focus:ring-indigo-500",
    secondary: "bg-gradient-to-r from-pink-600 to-purple-600 text-white hover:shadow-lg hover:shadow-pink-500/50 hover:scale-105 focus:ring-pink-500",
    ghost: "border-2 border-white text-white hover:bg-white/10 backdrop-blur-sm focus:ring-white",
    outline: "border-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 focus:ring-indigo-500",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  const buttonClasses = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

  const content = (
    <>
      {Icon && iconPosition === 'left' && <Icon className="mr-2 h-5 w-5" />}
      {children}
      {Icon && iconPosition === 'right' && <Icon className="ml-2 h-5 w-5" />}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={buttonClasses} {...props}>
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={buttonClasses} {...props}>
      {content}
    </button>
  );
};

export default GradientButton;
