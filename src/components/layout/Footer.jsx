import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import KMark from '../kd/KMark';

const Footer = () => {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  const columns = [
    { heading: t('footer.explore'), items: t('footer.exploreItems', { returnObjects: true }) },
    { heading: t('footer.contribute'), items: t('footer.contributeItems', { returnObjects: true }) },
    { heading: t('footer.about'), items: t('footer.aboutItems', { returnObjects: true }) },
  ];

  return (
    <footer
      className="mt-auto"
      style={{ background: 'var(--kd-surface)', borderTop: '1px solid var(--kd-line)' }}
    >
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 pt-14 pb-12">
        <div className="grid gap-10 md:grid-cols-[2fr_1fr_1fr_1fr] md:gap-12">
          <div>
            <div className="flex items-center gap-2.5">
              <KMark size={32} />
              <span
                className="kd-font-serif font-semibold text-[20px]"
                style={{ color: 'var(--kd-ink)' }}
              >
                {t('brand.name')}<span style={{ color: 'var(--kd-accent)' }}>.</span>
              </span>
            </div>
            <p
              className="kd-font-serif mt-4 max-w-[360px]"
              style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--kd-ink-soft)' }}
            >
              {t('footer.tagline')}
            </p>
          </div>

          {columns.map(col => (
            <div key={col.heading}>
              <div className="kd-eyebrow mb-4">{col.heading}</div>
              <ul className="flex flex-col gap-2.5">
                {(Array.isArray(col.items) ? col.items : []).map(item => (
                  <li
                    key={item}
                    className="kd-font-sans text-[14px] cursor-pointer transition-colors hover:opacity-80"
                    style={{ color: 'var(--kd-ink-soft)' }}
                  >
                    {item === 'Privacy' || item === 'गोपनीयता' ? (
                      <Link to="/privacy-policy">{item}</Link>
                    ) : (
                      <span>{item}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="mt-12 pt-6 flex flex-col sm:flex-row justify-between gap-2"
          style={{ borderTop: '1px solid var(--kd-line)' }}
        >
          <span className="kd-font-sans text-[12px]" style={{ color: 'var(--kd-ink-mute)' }}>
            {t('footer.copyright', { year })}
          </span>
          <span className="kd-font-sans text-[12px]" style={{ color: 'var(--kd-ink-mute)' }}>
            {t('footer.made')}
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
