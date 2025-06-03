import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const location = useLocation();

  if (location.pathname === '/kurukh-editor') {
    return (
      <div className="flex flex-col min-h-screen min-w-full h-full w-full">
          {children}
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-6 flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
