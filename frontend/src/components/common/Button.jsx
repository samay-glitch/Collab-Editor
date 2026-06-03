import React from 'react';
import Spinner from './Spinner';

export default function Button({
  children,
  variant = 'primary',
  isLoading = false,
  disabled = false,
  className = '',
  ...props
}) {
  const baseStyle = 'relative flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-900 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500',
    secondary: 'bg-dark-700 hover:bg-dark-600 text-dark-100 border border-dark-600 focus:ring-dark-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
    ghost: 'hover:bg-dark-800 text-dark-400 hover:text-dark-100',
  };

  const sizes = 'py-2.5 px-5 text-sm';

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyle} ${variants[variant]} ${sizes} ${className}`}
      {...props}
    >
      {isLoading && (
        <span className="mr-2">
          <Spinner size="sm" />
        </span>
      )}
      {children}
    </button>
  );
}
