import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { IconSun, IconMoon } from './icons';

const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();
  const { t } = useTranslation();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={t('theme.toggle')}
      title={t('theme.toggle')}
      className="relative inline-flex items-center w-14 h-[30px] rounded-full p-[3px] cursor-pointer transition-colors"
      style={{ background: 'var(--kd-surface-alt)' }}
    >
      <span
        className="absolute top-[3px] flex items-center justify-center w-6 h-6 rounded-full transition-all duration-200"
        style={{
          background: 'var(--kd-surface)',
          color: 'var(--kd-ink)',
          left: isDark ? '28px' : '3px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
        }}
      >
        {isDark ? <IconMoon size={13} weight={2} /> : <IconSun size={13} weight={2} />}
      </span>
    </button>
  );
};

export default ThemeToggle;
