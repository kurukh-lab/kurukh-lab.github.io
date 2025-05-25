import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <h1 className="text-6xl font-bold text-amber-700 mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-6">Page Not Found</h2>
      <p className="text-gray-600 mb-8 text-center max-w-md">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className="btn btn-primary">
        Back to Home
      </Link>
    </div>
  );
};

export default NotFound;
