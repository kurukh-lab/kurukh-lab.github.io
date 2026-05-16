import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './i18n';
import App from './App';
import { ThemeProvider } from './contexts/ThemeContext';

const rootEl = document.getElementById('root');
if (!rootEl) {
  throw new Error('Failed to find #root element');
}

createRoot(rootEl).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
);
