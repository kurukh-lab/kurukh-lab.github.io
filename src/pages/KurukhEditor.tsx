import {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useReducer,
  type ReactNode,
} from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { Editor } from '@tiptap/react';
import TiptapKurukhEditor, {
  type TiptapContentPayload,
} from '../components/editor/TiptapKurukhEditor';
import { useAuth } from '../contexts/AuthContext';
import KMark from '../components/kd/KMark';
import ThemeToggle from '../components/kd/ThemeToggle';
import LanguageToggle from '../components/kd/LanguageToggle';
import { IconArrow, IconBookmark, IconBack, IconPlus } from '../components/kd/icons';

const TEMPLATE_KEYS = ['dictionary', 'story', 'letter', 'blank'] as const;
type TemplateKey = (typeof TEMPLATE_KEYS)[number];

const KurukhEditor = () => {
  const { t, i18n } = useTranslation();
  const { currentUser } = useAuth();
  const [editor, setEditor] = useState<Editor | null>(null);
  const [editorContent, setEditorContent] = useState('');
  const [documentTitle, setDocumentTitle] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [activeTemplate, setActiveTemplate] = useState<TemplateKey | null>(null);

  const handleContentChange = useCallback(({ html }: TiptapContentPayload) => {
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
    const u = currentUser as typeof currentUser & { displayName?: string | null; username?: string };
    const author = u?.displayName || u?.username || currentUser?.email?.split('@')[0];
    const dateLocale = i18n.language === 'hi' ? 'hi-IN' : 'en-GB';
    const date = new Date().toLocaleDateString(dateLocale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
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
      titleElement.textContent = documentTitle || (t('editor.titlePlaceholder') as string);
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
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${
      documentTitle || 'Document'
    }</title></head><body><h1>${documentTitle || ''}</h1>${editorContent}</body></html>`;
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

  const loadTemplate = (templateKey: TemplateKey) => {
    setActiveTemplate(templateKey);
    let template = '';
    switch (templateKey) {
      case 'dictionary':
        template = `<h2>Word</h2><p><span style="font-family: KellyTolong, monospace;">[Kurukh word]</span></p>`;
        setDocumentTitle('Kurukh dictionary entry');
        break;
      case 'story':
        template = `<h2>Once</h2><p>Once upon a time…</p>`;
        setDocumentTitle('A folk story');
        break;
      case 'letter':
        template = `<p style="text-align:right">[Date]</p><p>Dear [Name],</p><p>[Body]</p>`;
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
    if (editorContent && !window.confirm('Discard current document?')) return;
    setEditorContent('');
    setDocumentTitle('');
    setSavedAt(null);
    setActiveTemplate(null);
    if (editor) editor.commands.clearContent();
  };

  const savedLabel = savedAt
    ? t('editor.saveStatus', {
        time: savedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      })
    : t('editor.unsaved');

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'var(--kd-bg)', color: 'var(--kd-ink)' }}
    >
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
              style={{
                background: 'transparent',
                color: 'var(--kd-ink)',
                border: '1px solid var(--kd-line)',
              }}
            >
              <IconPlus size={12} weight={2.2} />
              {t('editor.newDocument')}
            </button>
            <button
              type="button"
              onClick={saveAsHTML}
              disabled={!editorContent}
              className="hidden md:inline-flex items-center gap-1.5 kd-font-sans px-3 py-2 rounded-[10px] text-[13px] disabled:opacity-50"
              style={{
                background: 'transparent',
                color: 'var(--kd-ink)',
                border: '1px solid var(--kd-line)',
              }}
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

      <div className="flex-grow max-w-[1280px] mx-auto w-full px-6 md:px-14 py-8 grid gap-7 lg:grid-cols-[220px_minmax(0,1fr)_260px]">
        <aside className="hidden lg:flex flex-col">
          <div className="kd-eyebrow mb-3.5">{t('editor.templatesEyebrow')}</div>
          {TEMPLATE_KEYS.map((key) => {
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
                <div
                  className="kd-font-serif"
                  style={{ fontSize: 16, fontWeight: 500, color: 'var(--kd-ink)' }}
                >
                  {t(`editor.templates.${key}.title`)}
                </div>
                <div
                  className="kd-font-sans mt-0.5"
                  style={{ fontSize: 12, color: 'var(--kd-ink-mute)', lineHeight: 1.4 }}
                >
                  {t(`editor.templates.${key}.sub`)}
                </div>
              </button>
            );
          })}
        </aside>

        <div className="min-w-0 flex flex-col gap-3.5">
          <SlimToolbar editor={editor} wordsCount={wordsCount} synced={!!savedAt} />

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
              placeholder={t('editor.titlePlaceholder') as string}
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
              placeholder={t('editor.titlePlaceholder') as string}
              onContentChange={handleContentChange}
              onEditorReady={setEditor}
              showToolbar={false}
            />
          </div>
        </div>

        <aside className="hidden lg:flex flex-col gap-3.5">
          <div className="kd-eyebrow">{t('editor.documentEyebrow')}</div>
          <div
            className="p-5 rounded-2xl"
            style={{ background: 'var(--kd-surface)', border: '1px solid var(--kd-line)' }}
          >
            {[
              [t('editor.words'), wordsCount] as const,
              [t('editor.characters'), charsCount.toLocaleString()] as const,
              [t('editor.readingTime'), t('editor.minute', { count: readingMinutes })] as const,
            ].map(([label, value]) => (
              <div key={String(label)} className="flex justify-between items-baseline mb-2.5 last:mb-0">
                <span className="kd-font-sans" style={{ fontSize: 12, color: 'var(--kd-ink-soft)' }}>
                  {label}
                </span>
                <span
                  className="kd-font-serif"
                  style={{ fontSize: 16, fontWeight: 500, color: 'var(--kd-ink)' }}
                >
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
          </div>
        </aside>
      </div>
    </div>
  );
};

interface SlimToolbarProps {
  editor: Editor | null;
  wordsCount: number;
  synced: boolean;
}

const SlimToolbar = ({ editor, wordsCount, synced }: SlimToolbarProps) => {
  const { t } = useTranslation();
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);

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

  const isActive = (name: string, attrs?: Record<string, unknown>) =>
    editor?.isActive(name, attrs) ?? false;
  const focusChain = () => editor?.chain().focus();
  const isEnglishActive = editor && !isActive('kurukhFont') && !isActive('hindiFont');

  return (
    <div
      className="flex flex-wrap items-center gap-1 px-3 py-2 rounded-2xl"
      style={{ background: 'var(--kd-surface)', border: '1px solid var(--kd-line)' }}
    >
      <IconBtn
        active={isActive('bold')}
        onClick={() => focusChain()?.toggleBold().run()}
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

      <Sep />

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
        active={!!isEnglishActive}
        onClick={() => focusChain()?.unsetKurukhFont().unsetHindiFont().run()}
      />

      <span className="flex-1" />

      <div
        className="kd-font-mono flex items-center gap-3 px-2"
        style={{ fontSize: 11, color: 'var(--kd-ink-mute)' }}
      >
        <span>
          {wordsCount} {(t('editor.words') as string).toLowerCase()}
        </span>
        <span style={{ width: 1, height: 14, background: 'var(--kd-line)' }} />
        <span className="inline-flex items-center gap-1.5">
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: synced ? 'var(--kd-sage)' : 'var(--kd-ink-mute)',
            }}
          />
          {synced ? t('editor.synced') : t('editor.neverSaved')}
        </span>
      </div>
    </div>
  );
};

const Sep = () => (
  <span
    aria-hidden="true"
    style={{ width: 1, height: 22, background: 'var(--kd-line)', margin: '0 6px' }}
  />
);

interface IconBtnProps {
  active?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
  children: ReactNode;
}

const IconBtn = ({ active, onClick, disabled, title, children }: IconBtnProps) => (
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

interface ScriptChipProps {
  label: string;
  active: boolean;
  hindi?: boolean;
  onClick?: () => void;
}

const ScriptChip = ({ label, active, hindi, onClick }: ScriptChipProps) => (
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

export default KurukhEditor;
