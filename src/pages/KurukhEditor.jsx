import React, { useState, useMemo, useCallback, useEffect, useReducer } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import TiptapKurukhEditor from '../components/editor/TiptapKurukhEditor';
import { useAuth } from '../contexts/AuthContext';
import KMark from '../components/kd/KMark';
import ThemeToggle from '../components/kd/ThemeToggle';
import LanguageToggle from '../components/kd/LanguageToggle';
import { IconArrow, IconBookmark, IconBack, IconPlus } from '../components/kd/icons';

const TEMPLATE_KEYS = ['dictionary', 'story', 'letter', 'blank'];

const KurukhEditor = () => {
  const { t, i18n } = useTranslation();
  const { currentUser } = useAuth();
  const [editor, setEditor] = useState(null);
  const [editorContent, setEditorContent] = useState('');
  const [documentTitle, setDocumentTitle] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const [activeTemplate, setActiveTemplate] = useState(null);

  const handleContentChange = useCallback(({ html }) => {
    setEditorContent(html);
    setSavedAt(new Date());
  }, []);

  const plainText = useMemo(
    () => (editorContent ? editorContent.replace(/<[^>]*>/g, '') : ''),
    [editorContent],
  );
  const wordsCount = plainText.split(/\s+/).filter(Boolean).length;
  const charsCount = plainText.length;
  const readingMinutes = Math.max(1, Math.round(wordsCount / 220));

  // Naive script-share heuristic for the inspector — counts spans tagged with KellyTolong vs Devanagari
  const scriptShare = useMemo(() => {
    if (!editorContent || wordsCount === 0) return { kurukh: 0, hindi: 0, english: 0 };
    const kurukh = (editorContent.match(/KellyTolong/gi) || []).length;
    const hindi = (editorContent.match(/Devanagari/gi) || []).length;
    const latin = Math.max(0, wordsCount - kurukh - hindi);
    const total = kurukh + hindi + latin || 1;
    return {
      kurukh: Math.round((kurukh / total) * 100),
      hindi: Math.round((hindi / total) * 100),
      english: Math.round((latin / total) * 100),
    };
  }, [editorContent, wordsCount]);

  const byline = useMemo(() => {
    const author = currentUser?.displayName || currentUser?.username || (currentUser?.email?.split('@')[0]);
    const dateLocale = i18n.language === 'hi' ? 'hi-IN' : 'en-GB';
    const date = new Date().toLocaleDateString(dateLocale, { day: 'numeric', month: 'short', year: 'numeric' });
    return author ? `by ${author} · ${date}` : date;
  }, [currentUser, i18n.language]);

  const exportToPDF = async () => {
    if (!editorContent) return;
    setIsExporting(true);
    try {
      const exportDiv = document.createElement('div');
      exportDiv.style.cssText = `
        width: 210mm; min-height: 297mm; padding: 20mm; margin: 0 auto;
        background: white; font-family: Newsreader, serif; line-height: 1.6; color: #1C1814;
      `;
      const titleElement = document.createElement('h1');
      titleElement.textContent = documentTitle || t('editor.titlePlaceholder');
      titleElement.style.cssText = 'font-size: 28px; font-weight: 500; margin-bottom: 20px;';
      exportDiv.appendChild(titleElement);

      const contentDiv = document.createElement('div');
      contentDiv.innerHTML = editorContent;
      exportDiv.appendChild(contentDiv);
      document.body.appendChild(exportDiv);

      const canvas = await html2canvas(exportDiv, { scale: 2, useCORS: true, allowTaint: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      document.body.removeChild(exportDiv);
      const fileName = `${(documentTitle || 'kurukh-document').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      pdf.save(fileName);
    } catch (e) {
      console.error('Error exporting PDF:', e);
    } finally {
      setIsExporting(false);
    }
  };

  const saveAsHTML = () => {
    if (!editorContent) return;
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${documentTitle || 'Document'}</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Newsreader:wght@400;500;600&family=Noto+Sans+Devanagari&display=swap">
<style>body{font-family:Newsreader,serif;max-width:760px;margin:40px auto;padding:0 24px;color:#1C1814}h1{font-weight:500;letter-spacing:-0.02em}.kurukh-text,[style*="KellyTolong"]{font-family:KellyTolong,monospace}.hindi-text,[style*="Devanagari"]{font-family:'Noto Sans Devanagari',sans-serif}</style>
</head><body><h1>${documentTitle || ''}</h1>${editorContent}</body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(documentTitle || 'kurukh-document').replace(/[^a-zA-Z0-9]/g, '_')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const loadTemplate = (templateKey) => {
    setActiveTemplate(templateKey);
    let template = '';
    switch (templateKey) {
      case 'dictionary':
        template = `<h2>Word</h2><p><span style="font-family: KellyTolong, monospace;">[Kurukh word]</span></p><h2>Meaning</h2><p>English: [definition]</p><p><span style="font-family: 'Noto Sans Devanagari', sans-serif;">हिन्दी: [अर्थ]</span></p><h2>Example</h2><blockquote><em>[example sentence]</em></blockquote>`;
        setDocumentTitle('Kurukh dictionary entry');
        break;
      case 'story':
        template = `<h2>Once</h2><p>Once upon a time in a village near <span style="font-family: KellyTolong, monospace;">[place]</span>…</p>`;
        setDocumentTitle('A folk story');
        break;
      case 'letter':
        template = `<p style="text-align:right">[Date]</p><p>Dear [Name],</p><p>[Body]</p><p>Sincerely,<br/>[Your name]</p>`;
        setDocumentTitle('Letter');
        break;
      default:
        template = '<p></p>';
        setDocumentTitle('');
    }
    setEditorContent(template);
    if (editor) editor.commands.setContent(template);
  };

  const newDocument = () => {
    if (editorContent && !confirm('Discard current document?')) return;
    setEditorContent('');
    setDocumentTitle('');
    setSavedAt(null);
    setActiveTemplate(null);
    if (editor) editor.commands.clearContent();
  };

  const savedLabel = savedAt
    ? t('editor.saveStatus', { time: savedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) })
    : t('editor.unsaved');

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'var(--kd-bg)', color: 'var(--kd-ink)' }}
    >
      {/* Top bar */}
      <header
        className="sticky top-0 z-40 backdrop-blur"
        style={{
          background: 'color-mix(in srgb, var(--kd-bg) 88%, transparent)',
          borderBottom: '1px solid var(--kd-line-soft)',
        }}
      >
        <div className="max-w-[1280px] mx-auto px-6 md:px-14 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 kd-font-sans text-[13px]"
              style={{ color: 'var(--kd-ink-soft)' }}
            >
              <IconBack size={14} color="currentColor" />
              <span className="hidden sm:inline">{t('editor.backToDictionary')}</span>
            </Link>
            <span className="hidden md:inline" style={{ color: 'var(--kd-ink-mute)' }}>/</span>
            <Link to="/" className="hidden md:inline-flex items-center gap-2">
              <KMark size={26} />
              <span
                className="kd-font-serif"
                style={{ fontWeight: 600, fontSize: 16, color: 'var(--kd-ink)' }}
              >
                {t('brand.name')}<span style={{ color: 'var(--kd-accent)' }}>.</span>
              </span>
            </Link>
          </div>

          <div className="kd-eyebrow text-center truncate hidden md:block">{savedLabel}</div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2">
              <LanguageToggle />
              <ThemeToggle />
            </div>
            <button
              type="button"
              onClick={newDocument}
              className="hidden md:inline-flex items-center gap-1.5 kd-font-sans px-3 py-2 rounded-[10px] text-[13px]"
              style={{ background: 'transparent', color: 'var(--kd-ink)', border: '1px solid var(--kd-line)' }}
            >
              <IconPlus size={12} weight={2.2} />
              {t('editor.newDocument')}
            </button>
            <button
              type="button"
              onClick={saveAsHTML}
              disabled={!editorContent}
              className="hidden md:inline-flex items-center gap-1.5 kd-font-sans px-3 py-2 rounded-[10px] text-[13px] disabled:opacity-50"
              style={{ background: 'transparent', color: 'var(--kd-ink)', border: '1px solid var(--kd-line)' }}
            >
              <IconBookmark size={13} />
              {t('editor.saveHtml')}
            </button>
            <button
              type="button"
              onClick={exportToPDF}
              disabled={!editorContent || isExporting}
              className="inline-flex items-center gap-1.5 kd-font-sans px-3.5 py-2 rounded-[10px] text-[13px] font-medium disabled:opacity-50"
              style={{ background: 'var(--kd-ink)', color: 'var(--kd-bg)' }}
            >
              {isExporting ? t('editor.exporting') : t('editor.exportPdf')}
              {!isExporting && <IconArrow size={13} color="currentColor" />}
            </button>
          </div>
        </div>
      </header>

      {/* Three-column workspace */}
      <div className="flex-grow max-w-[1280px] mx-auto w-full px-6 md:px-14 py-8 grid gap-7 lg:grid-cols-[220px_minmax(0,1fr)_260px]">
        {/* Templates rail */}
        <aside className="hidden lg:flex flex-col">
          <div className="kd-eyebrow mb-3.5">{t('editor.templatesEyebrow')}</div>
          {TEMPLATE_KEYS.map(key => {
            const active = activeTemplate === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => loadTemplate(key)}
                className="text-left mb-1.5 p-3.5 rounded-xl transition-colors"
                style={{
                  background: active ? 'var(--kd-surface)' : 'transparent',
                  border: `1px solid ${active ? 'var(--kd-line)' : 'transparent'}`,
                  cursor: 'pointer',
                }}
              >
                <div className="kd-font-serif" style={{ fontSize: 16, fontWeight: 500, color: 'var(--kd-ink)' }}>
                  {t(`editor.templates.${key}.title`)}
                </div>
                <div className="kd-font-sans mt-0.5" style={{ fontSize: 12, color: 'var(--kd-ink-mute)', lineHeight: 1.4 }}>
                  {t(`editor.templates.${key}.sub`)}
                </div>
              </button>
            );
          })}

          <div
            className="mt-7 p-4 rounded-xl"
            style={{
              background: 'color-mix(in srgb, var(--kd-sage) 10%, transparent)',
              border: '1px solid color-mix(in srgb, var(--kd-sage) 25%, transparent)',
            }}
          >
            <div
              className="kd-font-mono mb-2"
              style={{
                fontSize: 10,
                color: 'var(--kd-sage)',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
              }}
            >
              {t('editor.keyboardEyebrow')}
            </div>
            {[
              ['⌘K', t('editor.keyboard.kurukh')],
              ['⌘H', t('editor.keyboard.hindi')],
              ['⌘B', t('editor.keyboard.bold')],
              ['⌘I', t('editor.keyboard.italic')],
            ].map(([key, label]) => (
              <div
                key={key}
                className="flex items-center justify-between kd-font-sans py-1"
                style={{ fontSize: 12, color: 'var(--kd-ink)' }}
              >
                <span>{label}</span>
                <kbd
                  className="kd-font-mono"
                  style={{
                    fontSize: 11,
                    padding: '2px 7px',
                    border: '1px solid var(--kd-line)',
                    borderRadius: 5,
                    background: 'var(--kd-surface)',
                  }}
                >
                  {key}
                </kbd>
              </div>
            ))}
          </div>
        </aside>

        {/* Center column: slim toolbar + paper */}
        <div className="min-w-0 flex flex-col gap-3.5">
          <SlimToolbar editor={editor} wordsCount={wordsCount} synced={!!savedAt} />

          {/* Paper card — title, byline, hr, editor body */}
          <div
            className="rounded-2xl"
            style={{
              background: 'var(--kd-surface)',
              border: '1px solid var(--kd-line)',
              boxShadow: '0 1px 0 var(--kd-line-soft), 0 24px 60px -30px rgba(28, 24, 20, 0.18)',
              padding: 'clamp(28px, 5vw, 56px) clamp(28px, 5vw, 72px)',
              minHeight: 'calc(100vh - 280px)',
            }}
          >
            <input
              type="text"
              value={documentTitle}
              onChange={(e) => setDocumentTitle(e.target.value)}
              placeholder={t('editor.titlePlaceholder')}
              className="kd-font-serif outline-none bg-transparent w-full"
              style={{
                fontSize: 'clamp(28px, 4vw, 42px)',
                fontWeight: 500,
                color: 'var(--kd-ink)',
                letterSpacing: '-0.025em',
                padding: 0,
              }}
            />
            <div
              className="kd-font-mono mt-2"
              style={{ fontSize: 11.5, color: 'var(--kd-ink-mute)', letterSpacing: '0.06em' }}
            >
              {byline}
            </div>
            <hr style={{ border: 'none', borderTop: '1px solid var(--kd-line)', margin: '28px 0' }} />

            <TiptapKurukhEditor
              content={editorContent}
              placeholder={t('editor.titlePlaceholder')}
              onContentChange={handleContentChange}
              onEditorReady={setEditor}
              showToolbar={false}
            />
          </div>
        </div>

        {/* Inspector */}
        <aside className="hidden lg:flex flex-col gap-3.5">
          <div className="kd-eyebrow">{t('editor.documentEyebrow')}</div>
          <div
            className="p-5 rounded-2xl"
            style={{ background: 'var(--kd-surface)', border: '1px solid var(--kd-line)' }}
          >
            {[
              [t('editor.words'), wordsCount],
              [t('editor.characters'), charsCount.toLocaleString()],
              [t('editor.readingTime'), t('editor.minute', { count: readingMinutes })],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between items-baseline mb-2.5 last:mb-0">
                <span className="kd-font-sans" style={{ fontSize: 12, color: 'var(--kd-ink-soft)' }}>{label}</span>
                <span className="kd-font-serif" style={{ fontSize: 16, fontWeight: 500, color: 'var(--kd-ink)' }}>
                  {value}
                </span>
              </div>
            ))}
          </div>

          <div
            className="p-5 rounded-2xl"
            style={{ background: 'var(--kd-surface)', border: '1px solid var(--kd-line)' }}
          >
            <div className="kd-eyebrow mb-3">{t('editor.scriptsEyebrow')}</div>
            <div
              className="h-2 rounded overflow-hidden flex"
              style={{ background: 'var(--kd-surface-alt)' }}
            >
              <div style={{ width: `${scriptShare.kurukh}%`, background: 'var(--kd-accent)' }} />
              <div style={{ width: `${scriptShare.hindi}%`, background: 'var(--kd-sage)' }} />
              <div style={{ width: `${scriptShare.english}%`, background: 'var(--kd-ink-mute)' }} />
            </div>
            <div className="mt-3 flex flex-col gap-1.5">
              {[
                [t('editor.scripts.kurukh'), 'var(--kd-accent)', scriptShare.kurukh],
                [t('editor.scripts.hindi'), 'var(--kd-sage)', scriptShare.hindi],
                [t('editor.scripts.english'), 'var(--kd-ink-mute)', scriptShare.english],
              ].map(([label, color, pct]) => (
                <div key={label} className="flex items-center gap-2 kd-font-sans" style={{ fontSize: 12, color: 'var(--kd-ink)' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                  <span className="flex-1">{label}</span>
                  <span className="kd-font-mono" style={{ color: 'var(--kd-ink-mute)' }}>{pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

// ─── Slim KD toolbar that drives the Tiptap editor instance ───
const SlimToolbar = ({ editor, wordsCount, synced }) => {
  const { t } = useTranslation();
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  // Tiptap doesn't trigger React re-renders on selection or mark changes by default.
  // Subscribe to transaction + selection events so button active states stay in sync.
  useEffect(() => {
    if (!editor) return;
    const handler = () => forceUpdate();
    editor.on('selectionUpdate', handler);
    editor.on('transaction', handler);
    editor.on('focus', handler);
    editor.on('blur', handler);
    return () => {
      editor.off('selectionUpdate', handler);
      editor.off('transaction', handler);
      editor.off('focus', handler);
      editor.off('blur', handler);
    };
  }, [editor]);

  const isActive = (name, attrs) => editor?.isActive(name, attrs) ?? false;
  const can = (chainFn) => !!editor && chainFn(editor.can().chain().focus()).run();
  const focusChain = () => editor?.chain().focus();

  // Active state for the "English" chip — the absence of either script mark
  const isEnglishActive = editor && !isActive('kurukhFont') && !isActive('hindiFont');

  return (
    <div
      className="flex flex-wrap items-center gap-1 px-3 py-2 rounded-2xl"
      style={{ background: 'var(--kd-surface)', border: '1px solid var(--kd-line)' }}
    >
      {/* Font picker chip (display-only — Newsreader is fixed for now) */}
      <Chip>
        <span className="kd-font-serif" style={{ fontSize: 13, fontWeight: 500, color: 'var(--kd-ink)', lineHeight: 1 }}>
          Newsreader
        </span>
        <span className="kd-font-sans ml-1" style={{ fontSize: 10, color: 'var(--kd-ink-mute)' }}>
          default
        </span>
        <ChevDown />
      </Chip>

      <Chip>
        <span className="kd-font-mono" style={{ fontSize: 12, color: 'var(--kd-ink)' }}>18 pt</span>
        <ChevDown />
      </Chip>

      <Sep />

      <IconBtn
        active={isActive('bold')}
        onClick={() => focusChain()?.toggleBold().run()}
        disabled={!can(c => c.toggleBold())}
        title="Bold (Ctrl+B)"
      >
        <span style={{ fontFamily: 'var(--kd-font-serif)', fontWeight: 700 }}>B</span>
      </IconBtn>
      <IconBtn
        active={isActive('italic')}
        onClick={() => focusChain()?.toggleItalic().run()}
        title="Italic (Ctrl+I)"
      >
        <span style={{ fontFamily: 'var(--kd-font-serif)', fontStyle: 'italic' }}>I</span>
      </IconBtn>
      <IconBtn
        active={isActive('underline')}
        onClick={() => focusChain()?.toggleUnderline().run()}
        title="Underline (Ctrl+U)"
      >
        <span style={{ fontFamily: 'var(--kd-font-serif)', textDecoration: 'underline' }}>U</span>
      </IconBtn>
      <IconBtn
        active={isActive('strike')}
        onClick={() => focusChain()?.toggleStrike().run()}
        title="Strikethrough"
      >
        <span style={{ fontFamily: 'var(--kd-font-serif)', textDecoration: 'line-through' }}>S</span>
      </IconBtn>

      <Sep />

      {/* Script chips */}
      <ScriptChip
        label="Kurukh"
        active={isActive('kurukhFont')}
        onClick={() => focusChain()?.toggleKurukhFont().run()}
      />
      <ScriptChip
        label="हिन्दी"
        active={isActive('hindiFont')}
        hindi
        onClick={() => focusChain()?.toggleHindiFont().run()}
      />
      <ScriptChip
        label="English"
        active={isEnglishActive}
        onClick={() => focusChain()?.unsetKurukhFont().unsetHindiFont().run()}
      />

      <Sep />

      <IconBtn
        active={isActive({ textAlign: 'left' })}
        onClick={() => focusChain()?.setTextAlign('left').run()}
        title="Align left"
      >
        <AlignLeftIcon />
      </IconBtn>
      <IconBtn
        active={isActive({ textAlign: 'center' })}
        onClick={() => focusChain()?.setTextAlign('center').run()}
        title="Align center"
      >
        <AlignCenterIcon />
      </IconBtn>
      <IconBtn
        active={isActive({ textAlign: 'right' })}
        onClick={() => focusChain()?.setTextAlign('right').run()}
        title="Align right"
      >
        <AlignRightIcon />
      </IconBtn>

      <span className="flex-1" />

      <div
        className="kd-font-mono flex items-center gap-3 px-2"
        style={{ fontSize: 11, color: 'var(--kd-ink-mute)' }}
      >
        <span>{wordsCount} {t('editor.words').toLowerCase()}</span>
        <span style={{ width: 1, height: 14, background: 'var(--kd-line)' }} />
        <span className="inline-flex items-center gap-1.5">
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: synced ? 'var(--kd-sage)' : 'var(--kd-ink-mute)' }} />
          {synced ? t('editor.synced') : t('editor.neverSaved')}
        </span>
      </div>
    </div>
  );
};

// ─── tiny presentational helpers for the slim toolbar ───

const Chip = ({ children }) => (
  <button
    type="button"
    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
    style={{ background: 'transparent', color: 'var(--kd-ink)', border: 'none' }}
  >
    {children}
  </button>
);

const Sep = () => (
  <span
    aria-hidden="true"
    style={{ width: 1, height: 22, background: 'var(--kd-line)', margin: '0 6px' }}
  />
);

const IconBtn = ({ active, onClick, disabled, title, children }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    aria-pressed={active || undefined}
    className="inline-flex items-center justify-center transition-colors disabled:opacity-40"
    style={{
      width: 30,
      height: 30,
      borderRadius: 7,
      background: active ? 'var(--kd-surface-alt)' : 'transparent',
      color: active ? 'var(--kd-accent)' : 'var(--kd-ink)',
      border: 'none',
      fontSize: 15,
      cursor: 'pointer',
    }}
  >
    {children}
  </button>
);

const ScriptChip = ({ label, active, hindi, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active || undefined}
    className="inline-flex items-center transition-colors"
    style={{
      padding: '6px 12px',
      borderRadius: 999,
      background: active ? 'var(--kd-accent)' : 'transparent',
      color: active ? '#FBF7EE' : 'var(--kd-ink)',
      border: active ? 'none' : '1px solid var(--kd-line)',
      fontFamily: hindi
        ? 'var(--kd-font-deva, "Noto Sans Devanagari", system-ui, sans-serif)'
        : 'var(--kd-font-sans)',
      fontSize: 12,
      fontWeight: 500,
      cursor: 'pointer',
    }}
  >
    {label}
  </button>
);

const ChevDown = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--kd-ink-soft)" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const AlignLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
    <path d="M4 6h16M4 12h10M4 18h13" />
  </svg>
);
const AlignCenterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
    <path d="M4 6h16M7 12h10M5 18h14" />
  </svg>
);
const AlignRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
    <path d="M4 6h16M10 12h10M7 18h13" />
  </svg>
);

export default KurukhEditor;
