import React, { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import KMark from '../kd/KMark';
import ThemeToggle from '../kd/ThemeToggle';
import LanguageToggle from '../kd/LanguageToggle';
import { IconPlus, IconMenu, IconClose } from '../kd/icons';

const Header = () => {
  const { currentUser, isAdmin, logout } = useAuth();
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { to: '/', label: t('nav.home') },
    { to: '/kurukh-editor', label: t('nav.editor') },
    { to: '/contribute', label: t('nav.contribute') },
    ...(currentUser ? [{ to: '/review', label: t('nav.community') }] : []),
    ...(currentUser && isAdmin ? [{ to: '/admin', label: t('nav.admin') }] : []),
  ];

  const linkClass = ({ isActive }) =>
    `kd-font-sans text-[14px] font-medium px-3.5 py-2 rounded-full transition-colors whitespace-nowrap ${
      isActive ? 'kd-ink' : 'kd-ink-soft hover:kd-ink'
    }`;
  const linkStyle = ({ isActive }) => ({
    color: isActive ? 'var(--kd-ink)' : 'var(--kd-ink-soft)',
    background: isActive ? 'var(--kd-surface-alt)' : 'transparent',
  });

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur"
      style={{
        background: 'color-mix(in srgb, var(--kd-bg) 88%, transparent)',
        borderBottom: '1px solid var(--kd-line-soft)',
      }}
    >
      <div className="max-w-[1280px] mx-auto flex items-center justify-between gap-4 px-6 md:px-12 py-4">
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <KMark size={38} />
          <div className="flex flex-col leading-none">
            <span
              className="kd-font-serif font-semibold text-[22px]"
              style={{ color: 'var(--kd-ink)', letterSpacing: '-0.01em' }}
            >
              {t('brand.name')}<span style={{ color: 'var(--kd-accent)' }}>.</span>
            </span>
            <span
              className="kd-font-sans mt-[3px]"
              style={{
                fontSize: 10.5,
                color: 'var(--kd-ink-mute)',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
              }}
            >
              {t('brand.tagline')}
            </span>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'} className={linkClass} style={linkStyle}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
          </div>

          <Link
            to="/contribute"
            className="hidden md:inline-flex items-center gap-1.5 rounded-full px-4 py-2 kd-font-sans text-[13px] font-semibold transition-opacity hover:opacity-90"
            style={{ background: 'var(--kd-accent)', color: '#FBF7EE' }}
          >
            <IconPlus size={14} weight={2.2} />
            {t('nav.addWord')}
          </Link>

          {currentUser ? (
            <div className="dropdown dropdown-end">
              <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                <div className="w-9 rounded-full">
                  <img
                    src={
                      currentUser.photoURL ||
                      `https://ui-avatars.com/api/?name=${currentUser.displayName || currentUser.email}&background=8FA690&color=fff`
                    }
                    alt={currentUser.displayName || currentUser.email}
                  />
                </div>
              </label>
              <ul
                tabIndex={0}
                className="mt-3 p-2 menu menu-sm dropdown-content rounded-box w-52 z-[60]"
                style={{
                  background: 'var(--kd-surface)',
                  border: '1px solid var(--kd-line)',
                  boxShadow: 'var(--kd-shadow-card)',
                }}
              >
                <li><Link to="/profile">{t('nav.profile')}</Link></li>
                <li><button onClick={logout}>{t('nav.logout')}</button></li>
              </ul>
            </div>
          ) : (
            <Link
              to="/login"
              tabIndex={pathname === '/login' ? -1 : 0}
              className="hidden md:inline-flex items-center rounded-full px-4 py-2 kd-font-sans text-[13px] font-semibold transition-colors"
              style={{
                background: 'transparent',
                color: 'var(--kd-ink)',
                border: '1px solid var(--kd-line)',
              }}
            >
              {t('nav.login')}
            </Link>
          )}

          <button
            type="button"
            className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-full"
            style={{ color: 'var(--kd-ink)', background: 'var(--kd-surface-alt)' }}
            aria-label="menu"
            onClick={() => setMobileOpen(o => !o)}
          >
            {mobileOpen ? <IconClose size={20} /> : <IconMenu size={22} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div
          className="lg:hidden border-t"
          style={{ borderColor: 'var(--kd-line-soft)', background: 'var(--kd-bg)' }}
        >
          <div className="max-w-[1280px] mx-auto px-6 py-4 flex flex-col gap-1">
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className="kd-font-sans text-[15px] font-medium px-3 py-2 rounded-lg"
                style={({ isActive }) => ({
                  color: isActive ? 'var(--kd-ink)' : 'var(--kd-ink-soft)',
                  background: isActive ? 'var(--kd-surface-alt)' : 'transparent',
                })}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
            <div className="flex items-center gap-2 mt-3 px-1">
              <LanguageToggle />
              <ThemeToggle />
              {!currentUser && (
                <Link
                  to="/login"
                  className="ml-auto rounded-full px-4 py-2 kd-font-sans text-[13px] font-semibold"
                  style={{ background: 'var(--kd-accent)', color: '#FBF7EE' }}
                  onClick={() => setMobileOpen(false)}
                >
                  {t('nav.login')}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
