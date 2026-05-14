import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import KMark from '../components/kd/KMark';
import { IconArrow } from '../components/kd/icons';

const Login = () => {
  const { t } = useTranslation();
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      const { success, error: err } = await login(formData.email, formData.password);
      if (success) navigate('/');
      else throw new Error(err || t('login.errors.generic'));
    } catch (err) {
      console.error('Login error:', err);
      setError(t('login.errors.generic'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setError('');
      setLoading(true);
      const { success, error: err } = await loginWithGoogle();
      if (success) navigate('/');
      else throw new Error(err || t('login.errors.google'));
    } catch (err) {
      console.error('Google login error:', err);
      setError(t('login.errors.google'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] grid lg:grid-cols-2">
      {/* ── Left editorial panel ── */}
      <aside
        className="hidden lg:flex flex-col justify-between p-14"
        style={{
          background: 'var(--kd-surface)',
          borderRight: '1px solid var(--kd-line)',
        }}
      >
        <Link to="/" className="inline-flex items-center gap-2.5 w-fit">
          <KMark size={36} />
          <div className="flex flex-col leading-none">
            <span
              className="kd-font-serif"
              style={{ fontWeight: 600, fontSize: 22, color: 'var(--kd-ink)', letterSpacing: '-0.01em' }}
            >
              {t('brand.name')}<span style={{ color: 'var(--kd-accent)' }}>.</span>
            </span>
            <span
              className="kd-font-sans mt-1"
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

        <div>
          <div className="kd-eyebrow mb-5">{t('login.eyebrow')}</div>
          <h1
            className="kd-font-serif"
            style={{
              fontWeight: 500,
              fontSize: 'clamp(40px, 4.4vw, 64px)',
              lineHeight: 1.05,
              letterSpacing: '-0.025em',
              margin: 0,
              color: 'var(--kd-ink)',
            }}
          >
            {t('login.titleLine1')}{' '}
            <em style={{ fontStyle: 'italic', color: 'var(--kd-accent)', fontWeight: 400 }}>
              {t('login.titleEmph')}
            </em>
            {t('login.titleLine2')}
          </h1>

          <blockquote
            className="mt-10 pl-6"
            style={{ borderLeft: '2px solid var(--kd-accent)' }}
          >
            <p
              className="kd-font-serif italic m-0"
              style={{
                fontSize: 'clamp(18px, 1.8vw, 22px)',
                lineHeight: 1.45,
                color: 'var(--kd-ink-soft)',
                fontWeight: 400,
              }}
            >
              {t('login.panelQuote')}
            </p>
            <footer
              className="kd-font-sans mt-3"
              style={{ fontSize: 13, color: 'var(--kd-ink-mute)' }}
            >
              {t('login.panelAttribution')}
            </footer>
          </blockquote>
        </div>

        <div
          className="kd-font-sans"
          style={{ fontSize: 12, color: 'var(--kd-ink-mute)' }}
        >
          {t('footer.copyright', { year: new Date().getFullYear() })}
        </div>
      </aside>

      {/* ── Right form panel ── */}
      <section className="flex items-center justify-center px-6 py-14 md:px-10">
        <div className="w-full max-w-[420px]">
          {/* Visible only on mobile — desktop has the wordmark in the left panel */}
          <Link to="/" className="lg:hidden inline-flex items-center gap-2.5 mb-10">
            <KMark size={32} />
            <span
              className="kd-font-serif"
              style={{ fontWeight: 600, fontSize: 20, color: 'var(--kd-ink)' }}
            >
              {t('brand.name')}<span style={{ color: 'var(--kd-accent)' }}>.</span>
            </span>
          </Link>

          <div className="kd-eyebrow mb-3">{t('login.formTitle')}</div>
          <h2
            className="kd-font-serif"
            style={{
              fontWeight: 500,
              fontSize: 'clamp(28px, 3vw, 38px)',
              letterSpacing: '-0.02em',
              margin: 0,
              color: 'var(--kd-ink)',
              lineHeight: 1.1,
            }}
          >
            {t('login.formSubtitle')}
          </h2>

          {error && (
            <div
              role="alert"
              className="mt-6 kd-font-sans px-4 py-3 rounded-xl"
              style={{
                background: 'var(--kd-accent-tint)',
                color: 'var(--kd-accent)',
                border: '1px solid color-mix(in srgb, var(--kd-accent) 40%, transparent)',
                fontSize: 14,
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
            <Field
              label={t('login.email')}
              name="email"
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={t('login.emailPlaceholder')}
              required
            />
            <Field
              label={t('login.password')}
              name="password"
              type="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              placeholder={t('login.passwordPlaceholder')}
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="mt-2 inline-flex items-center justify-center gap-2 kd-font-sans font-semibold text-[15px] py-3.5 rounded-xl disabled:opacity-60 transition-opacity hover:opacity-95"
              style={{ background: 'var(--kd-ink)', color: 'var(--kd-bg)' }}
            >
              {loading ? t('login.submitting') : t('login.submit')}
              {!loading && <IconArrow size={15} color="currentColor" />}
            </button>
          </form>

          <div
            className="flex items-center gap-3 my-6 kd-font-mono uppercase"
            style={{ fontSize: 11, color: 'var(--kd-ink-mute)', letterSpacing: '0.2em' }}
          >
            <span style={{ flex: 1, height: 1, background: 'var(--kd-line)' }} />
            {t('login.or')}
            <span style={{ flex: 1, height: 1, background: 'var(--kd-line)' }} />
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-3 kd-font-sans font-medium text-[14px] py-3 rounded-xl disabled:opacity-60 transition-colors"
            style={{
              background: 'transparent',
              color: 'var(--kd-ink)',
              border: '1px solid var(--kd-line)',
            }}
          >
            <GoogleIcon />
            {t('login.google')}
          </button>

          <p
            className="mt-8 text-center kd-font-sans"
            style={{ fontSize: 14, color: 'var(--kd-ink-soft)' }}
          >
            {t('login.noAccount')}{' '}
            <Link
              to="/register"
              className="kd-font-sans"
              style={{ color: 'var(--kd-accent)', fontWeight: 500, textDecoration: 'underline' }}
            >
              {t('login.registerLink')}
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
};

const Field = ({ label, name, type, value, onChange, placeholder, autoComplete, required }) => (
  <label className="flex flex-col gap-1.5">
    <span
      className="kd-font-sans"
      style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--kd-ink-soft)', letterSpacing: '0.02em' }}
    >
      {label}
    </span>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      autoComplete={autoComplete}
      required={required}
      className="kd-font-sans outline-none transition-colors"
      style={{
        width: '100%',
        boxSizing: 'border-box',
        background: 'var(--kd-surface)',
        color: 'var(--kd-ink)',
        border: '1px solid var(--kd-line)',
        borderRadius: 10,
        padding: '12px 14px',
        fontSize: 15,
      }}
    />
  </label>
);

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

export default Login;
