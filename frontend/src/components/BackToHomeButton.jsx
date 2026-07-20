// src/components/BackToHomeButton.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/solid'; // Using solid icon for prominence

const BackToHomeButton = () => {
  const location = useLocation();

  // Don't render the button if we are already on the home page
  if (location.pathname === '/') {
    return null;
  }

  return (
    <Link
      to="/"
      aria-label="Back to Home"
      className="fixed top-4 left-4 z-50 inline-flex items-center justify-center px-3 py-1.5 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 ease-in-out group"
      // Added group for potential hover effects on icon/text
    >
      <ArrowLeftIcon className="h-5 w-5 transition-transform duration-200 ease-in-out group-hover:-translate-x-1" />
      {/* Optional: Add text on larger screens */}
      <span className="ml-1.5 text-sm font-medium hidden sm:inline">Home</span>
    </Link>
  );
};

export default BackToHomeButton;