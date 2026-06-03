import React, { forwardRef } from 'react';

const Input = forwardRef(({ label, error, id, className = '', ...props }, ref) => {
  return (
    <div className="w-full flex flex-col space-y-1.5">
      {label && (
        <label htmlFor={id} className="text-xs font-semibold uppercase tracking-wider text-dark-400">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={`w-full bg-dark-800 border ${error ? 'border-red-500 focus:ring-red-500' : 'border-dark-600 focus:ring-primary-500'} rounded-lg px-4 py-2.5 text-dark-100 placeholder-dark-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 text-sm ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
