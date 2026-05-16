import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

export interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();

  if (location.pathname === '/kurukh-editor') {
    return (
      <div className="flex flex-col min-h-screen w-full">{children}</div>
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
