import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import KurukhDictionaryLogo from '../logo/KurukhDictionaryLogo';

const Header = () => {
  const { currentUser, isAdmin, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const closeUserMenu = () => {
    setIsUserMenuOpen(false);
  };

  const handleLogoutAndCloseMenu = () => {
    logout();
    closeUserMenu();
  };

  return (
    <nav className="navbar bg-base-100 top-0 z-50">
      <div className="navbar-start">
      </div>
      <div className="navbar-center hidden lg:flex">
      </div>
      <div className="navbar-end">
        <div>
          <ul className="menu menu-horizontal px-1">
          <li><NavLink to="/" className={({ isActive }) => isActive ? "active" : ""}>Home</NavLink></li>
          <li><NavLink to="/contribute" className={({ isActive }) => isActive ? "active" : ""}>Contribute</NavLink></li>
          {currentUser && isAdmin && (
            <li><NavLink to="/admin" className={({ isActive }) => isActive ? "active" : ""}>Admin</NavLink></li>
          )}
        </ul>
        </div>
        {currentUser ? (
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle avatar" onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}>
              <div className="w-10 rounded-full">
                {/* Placeholder for user avatar - replace with actual image if available */}
                <img src={currentUser.photoURL || `https://ui-avatars.com/api/?name=${currentUser.displayName || currentUser.email}&background=random`} alt="User avatar" />
              </div>
            </label>
            {isUserMenuOpen && (
              <ul tabIndex={0} className="mt-3 p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
                <li>
                  <Link to="/profile" className="justify-between" onClick={closeUserMenu}>
                    Profile
                    <span className="badge">New</span>
                  </Link>
                </li>
                <li><button onClick={handleLogoutAndCloseMenu}>Logout</button></li>
              </ul>
            )}
          </div>
        ) : (
          <Link to="/login">
            <button className="btn btn-primary">Login</button>
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Header;
