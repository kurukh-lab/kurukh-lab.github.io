import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import KurukhDictionaryLogo from '../logo/KurukhDictionaryLogo';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const { currentUser, userRoles, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center">
          <KurukhDictionaryLogo size="sm" />
        </Link>

        <nav className="flex items-center gap-4">
          <Link to="/" className="hover:text-amber-600">Home</Link>
          <Link to="/contribute" className="hover:text-amber-600">Contribute</Link>
          {userRoles?.includes('admin') && (
            <Link to="/admin" className="hover:text-amber-600 text-amber-700 font-medium">Admin</Link>
          )}
          
          {currentUser ? (
            <div className="flex items-center gap-3">
              <div className="dropdown dropdown-end">
                <div tabIndex={0} role="button" className="text-sm font-medium text-gray-600 hover:text-amber-600 cursor-pointer flex items-center gap-1">
                  {currentUser.username || currentUser.email}
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M7.247 11.14L2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
                  </svg>
                </div>
                <ul tabIndex={0} className="dropdown-content z-10 menu p-2 shadow bg-base-100 rounded-box w-52">
                  <li>
                    <Link to="/profile">My Profile</Link>
                  </li>
                  <li>
                    <button 
                      onClick={async () => {
                        await logout();
                        navigate('/');
                      }}
                    >
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <Link to="/login" className="btn btn-sm btn-outline btn-primary">Login</Link>
              <Link to="/register" className="btn btn-sm btn-primary">Register</Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
