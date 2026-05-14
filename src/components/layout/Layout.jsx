import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const location = useLocation();

  if (location.pathname === '/kurukh-editor') {
    return (
      <div className="flex flex-col min-h-screen w-full">
        {children}
      </div>
    );
  }

  return (
    <div
      className="flex flex-col min-h-screen kd-font-sans"
      style={{ background: 'var(--kd-bg)', color: 'var(--kd-ink)' }}
    >
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
