import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { KurukhDictionaryLogo } from '../logo/KurukhDictionaryLogo';

export const Navbar = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  
  // Add shadow when scrolled
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className={`navbar bg-base-100 z-50 transition-all duration-300 ${scrolled ? 'shadow-md' : ''}`}>
      <div className="container mx-auto px-4">
        <div className="navbar-start">
          <div className="dropdown">
            <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
              </svg>
            </div>
            <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
              <li><Link to="/" className={location.pathname === '/' ? 'font-bold text-primary' : ''}>Home</Link></li>
              <li><Link to="/contribute" className={location.pathname === '/contribute' ? 'font-bold text-primary' : ''}>Contribute</Link></li>
              <li><Link to="/about" className={location.pathname === '/about' ? 'font-bold text-primary' : ''}>About</Link></li>
            </ul>
          </div>
          <Link to="/" className="flex items-center hover:opacity-90 transition-opacity">
            <div className="w-10 h-10 mr-2">
              <KurukhDictionaryLogo />
            </div>
            <span className="text-xl averia-serif-libre-bold">Kurukh Dictionary</span>
          </Link>
        </div>
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-1">
            <li>
              <Link 
                to="/" 
                className={`mx-1 hover:text-primary transition-colors ${location.pathname === '/' ? 'font-bold text-primary' : ''}`}
              >
                Home
              </Link>
            </li>
            <li>
              <Link 
                to="/contribute"
                className={`mx-1 hover:text-primary transition-colors ${location.pathname === '/contribute' ? 'font-bold text-primary' : ''}`}
              >
                Contribute
              </Link>
            </li>
            <li>
              <Link 
                to="/about"
                className={`mx-1 hover:text-primary transition-colors ${location.pathname === '/about' ? 'font-bold text-primary' : ''}`}
              >
                About
              </Link>
            </li>
          </ul>
        </div>
        <div className="navbar-end">
          {isAuthenticated ? (
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar border-2 border-primary/20 hover:border-primary transition-colors">
                <div className="w-10 rounded-full bg-primary text-primary-content flex items-center justify-center">
                  <span className="text-xl">{user?.username?.charAt(0).toUpperCase()}</span>
                </div>
              </div>
              <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
                <li className="menu-title px-4 py-2 text-sm font-semibold">
                  {user?.username}
                </li>
                <li><Link to="/profile" className="hover:text-primary transition-colors">Profile</Link></li>
                <li><Link to="/my-contributions" className="hover:text-primary transition-colors">My Contributions</Link></li>
                <div className="divider my-1"></div>
                <li>
                  <button 
                    onClick={logout} 
                    className="text-error hover:bg-error/10 hover:text-error transition-colors"
                  >
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          ) : (
            <div className="flex gap-2">
              <Link to="/login" className="btn btn-ghost hover:text-primary transition-colors">Login</Link>
              <Link to="/register" className="btn btn-primary">Register</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
