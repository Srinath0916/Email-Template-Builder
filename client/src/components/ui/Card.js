import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ children, className = '', hover = true, glass = false, ...props }) => {
  const baseStyles = 'rounded-2xl transition-all duration-300';
  const glassStyles = glass 
    ? 'glass shadow-glass' 
    : 'bg-white shadow-lg';
  const hoverStyles = hover ? 'hover-lift cursor-pointer' : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`${baseStyles} ${glassStyles} ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;
