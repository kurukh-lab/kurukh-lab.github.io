import React from 'react';

const Footer = () => {
  const year = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-100 py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-gray-700">
              © {year} Kurukh Dictionary. All rights reserved.
            </p>
          </div>
          
          <div className="flex gap-6">
            <a href="#" className="text-gray-600 hover:text-amber-600">About</a>
            <a href="#" className="text-gray-600 hover:text-amber-600">Contact</a>
            <a href="#" className="text-gray-600 hover:text-amber-600">Privacy Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
