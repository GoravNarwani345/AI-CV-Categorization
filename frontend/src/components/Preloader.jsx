import React from 'react';
import { FaSpinner } from 'react-icons/fa';

const Preloader = ({ message = "Loading...", fullScreen = true, size = "large" }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const containerClasses = fullScreen
    ? "fixed inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-50"
    : "flex items-center justify-center p-8";

  return (
    <div className={containerClasses}>
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <FaSpinner className={`${sizeClasses[size]} text-blue-600 animate-spin`} />
        </div>
        {message && (
          <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default Preloader;
