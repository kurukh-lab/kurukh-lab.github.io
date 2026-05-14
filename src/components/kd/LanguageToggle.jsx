import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageToggle = () => {
  const { i18n, t } = useTranslation();
  const current = i18n.language?.startsWith('hi') ? 'hi' : 'en';
  const next = current === 'en' ? 'hi' : 'en';

  return (
    <button
      type="button"
      onClick={() => i18n.changeLanguage(next)}
      aria-label={t('language.toggle')}
      title={t('language.toggle')}
      className="inline-flex items-center gap-1.5 px-3 h-[30px] rounded-full text-[12px] font-medium transition-colors kd-font-mono"
      style={{
        background: 'var(--kd-surface-alt)',
        color: 'var(--kd-ink)',
        letterSpacing: '0.08em',
      }}
    >
      <span style={{ color: current === 'en' ? 'var(--kd-accent)' : 'var(--kd-ink-mute)' }}>EN</span>
      <span style={{ color: 'var(--kd-ink-mute)' }}>/</span>
      <span style={{ color: current === 'hi' ? 'var(--kd-accent)' : 'var(--kd-ink-mute)' }}>हि</span>
    </button>
  );
};

export default LanguageToggle;
