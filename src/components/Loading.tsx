import React from 'react';

const Loading = () => {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-lg text-gray-600">Loading...</p>
      </div>
    </div>
  );
};

export default Loading; 