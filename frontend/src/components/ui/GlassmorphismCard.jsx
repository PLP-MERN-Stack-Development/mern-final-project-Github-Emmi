// frontend/src/components/ui/GlassmorphismCard.jsx
import React from 'react';

const GlassmorphismCard = ({ children, className = '', hover = false, ...props }) => {
  const baseStyles = "bg-white/10 dark:bg-white/5 backdrop-blur-lg rounded-2xl border border-white/20 shadow-glass";
  const hoverStyles = hover ? "hover:bg-white/20 dark:hover:bg-white/10 hover:shadow-glow transition-all duration-300" : "";

  return (
    <div className={`${baseStyles} ${hoverStyles} ${className}`} {...props}>
      {children}
    </div>
  );
};

export default GlassmorphismCard;
