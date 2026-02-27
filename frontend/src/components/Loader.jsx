import React from 'react';
import { FaSpinner } from 'react-icons/fa';

const Loader = ({ message = "Loading..." }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="text-center">
        <FaSpinner className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
        <p className="text-gray-600 text-sm font-medium">{message}</p>
      </div>
    </div>
  );
};

export default Loader;
