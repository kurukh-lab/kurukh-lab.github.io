import {
  useState,
  type ChangeEvent,
  type FormEvent,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { addWord } from '../services/dictionaryService';
import Stepper from '../components/kd/Stepper';
import SubHead from '../components/kd/SubHead';
import { IconPlus, IconClose, IconArrow } from '../components/kd/icons';
import type { Meaning } from '../types';

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  hi: 'Hindi · हिन्दी',
  bn: 'Bengali · বাংলা',
  te: 'Telugu',
  ta: 'Tamil',
  ml: 'Malayalam',
  kn: 'Kannada',
  gu: 'Gujarati',
  or: 'Odia',
  pa: 'Punjabi',
  as: 'Assamese',
  ur: 'Urdu',
};

const LANGUAGE_OPTIONS = Object.keys(LANGUAGE_NAMES);

interface MeaningDraft {
  language: string;
  definition: string;
  example_sentence_kurukh: string;
  example_sentence_translation: string;
}

interface ContribFormState {
  kurukh_word: string;
  pronunciation: string;
  dialect: string;
  part_of_speech: string;
  meanings: MeaningDraft[];
}

const emptyMeaning = (language: string): MeaningDraft => ({
  language,
  definition: '',
  example_sentence_kurukh: '',
  example_sentence_translation: '',
});

const Contribute = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [formData, setFormData] = useState<ContribFormState>({
    kurukh_word: '',
    pronunciation: '',
    dialect: '',
    part_of_speech: '',
    meanings: [emptyMeaning('en')],
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMeaningChange = (
    index: number,
    field: keyof MeaningDraft,
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      meanings: prev.meanings.map((m, i) => (i === index ? { ...m, [field]: value } : m)),
    }));
  };

  const addMeaning = () => {
    const used = new Set(formData.meanings.map((m) => m.language));
    const next = LANGUAGE_OPTIONS.find((c) => !used.has(c)) || 'en';
    setFormData((prev) => ({ ...prev, meanings: [...prev.meanings, emptyMeaning(next)] }));
  };

  const removeMeaning = (index: number) => {
    if (formData.meanings.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      meanings: prev.meanings.filter((_, i) => i !== index),
    }));
  };

  const isLanguageUsed = (code: string, currentIndex: number) =>
    formData.meanings.some((m, i) => m.language === code && i !== currentIndex);

  const wordCount = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.kurukh_word.trim()) return setError(t('contribute.errors.wordRequired') as string);
    if (!formData.meanings.some((m) => m.definition.trim()))
      return setError(t('contribute.errors.definitionRequired') as string);
    const langs = formData.meanings.map((m) => m.language);
    if (new Set(langs).size !== langs.length)
      return setError(t('contribute.errors.duplicateLanguage') as string);

    setSubmitting(true);
    setError(null);

    try {
      if (!currentUser?.uid) {
        setError(t('contribute.errors.notLoggedIn') as string);
        setSubmitting(false);
        return;
      }

      const meanings: Meaning[] = formData.meanings
        .filter((m) => m.definition.trim())
        .map((m) => ({
          language: m.language,
          definition: m.definition.trim(),
          example_sentence_kurukh: m.example_sentence_kurukh.trim(),
          example_sentence_translation: m.example_sentence_translation.trim(),
        }));

      const result = await addWord(
        {
          kurukh_word: formData.kurukh_word.trim(),
          meanings,
          part_of_speech: formData.part_of_speech.trim() || undefined,
          pronunciation_guide: formData.pronunciation.trim() || undefined,
        },
        currentUser.uid,
      );

      if (result.success) {
        setSuccess(true);
        setFormData({
          kurukh_word: '',
          pronunciation: '',
          dialect: '',
          part_of_speech: '',
          meanings: [emptyMeaning('en')],
        });
        setTimeout(() => setSuccess(false), 5000);
      } else {
        throw new Error(result.error || (t('contribute.errors.generic') as string));
      }
    } catch (err) {
      const e2 = err as { code?: string; message?: string };
      if (e2.code === 'permission-denied') setError(t('contribute.errors.permissionDenied') as string);
      else setError(e2.message || (t('contribute.errors.generic') as string));
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      kurukh_word: '',
      pronunciation: '',
      dialect: '',
      part_of_speech: '',
      meanings: [emptyMeaning('en')],
    });
    setError(null);
  };

  if (!currentUser) {
    return (
      <div className="max-w-[700px] mx-auto py-20 px-6 md:px-12">
        <div
          className="p-10 rounded-2xl text-center"
          style={{ background: 'var(--kd-surface)', border: '1px solid var(--kd-line)' }}
        >
          <h1
            className="kd-font-serif"
            style={{
              fontSize: 36,
              fontWeight: 500,
              margin: 0,
              color: 'var(--kd-ink)',
              letterSpacing: '-0.02em',
            }}
          >
            {t('nav.contribute')}
          </h1>
          <p
            className="kd-font-serif mt-4"
            style={{ fontSize: 17, color: 'var(--kd-ink-soft)', lineHeight: 1.5 }}
          >
            {t('contribute.loginRequired')}
          </p>
          <div className="flex justify-center gap-3 mt-8">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="kd-font-sans px-5 py-2.5 rounded-[10px] font-semibold text-[14px]"
              style={{ background: 'var(--kd-accent)', color: '#FBF7EE' }}
            >
              {t('contribute.logIn')}
            </button>
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="kd-font-sans px-5 py-2.5 rounded-[10px] font-semibold text-[14px]"
              style={{
                background: 'transparent',
                color: 'var(--kd-ink)',
                border: '1px solid var(--kd-line)',
              }}
            >
              {t('contribute.register')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const previewMeanings = formData.meanings.filter((m) => m.definition.trim());
  const hasPreviewContent = formData.kurukh_word.trim() && previewMeanings.length > 0;

  return (
    <div style={{ background: 'var(--kd-bg)', color: 'var(--kd-ink)' }}>
      <div className="max-w-[1200px] mx-auto px-6 md:px-14 pt-14 pb-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
          <div>
            <div className="kd-eyebrow mb-4">{t('contribute.stepEyebrow')}</div>
            <h1
              className="kd-font-serif"
              style={{
                fontWeight: 500,
                fontSize: 'clamp(40px, 6vw, 64px)',
                lineHeight: 1.05,
                letterSpacing: '-0.025em',
                margin: 0,
                color: 'var(--kd-ink)',
              }}
            >
              {t('contribute.titleLine1')} {t('contribute.titleLine2')}
              <br />
              <em style={{ fontStyle: 'italic', color: 'var(--kd-accent)', fontWeight: 400 }}>
                {t('contribute.titleEmph')}
              </em>
              .
            </h1>
            <p
              className="kd-font-serif mt-4 max-w-[560px]"
              style={{
                fontSize: 'clamp(16px, 1.4vw, 19px)',
                color: 'var(--kd-ink-soft)',
                lineHeight: 1.5,
                margin: 0,
                marginTop: 16,
              }}
            >
              {t('contribute.subtitle')}
            </p>
          </div>
          <div className="hidden md:block">
            <Stepper
              steps={[
                t('contribute.steps.draft') as string,
                t('contribute.steps.community') as string,
                t('contribute.steps.editor') as string,
                t('contribute.steps.published') as string,
              ]}
              activeIndex={0}
            />
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 md:px-14 pb-24 grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <form
          onSubmit={handleSubmit}
          className="p-7 md:p-9 rounded-[20px]"
          style={{ background: 'var(--kd-surface)', border: '1px solid var(--kd-line)' }}
        >
          <SubHead eyebrow={t('contribute.headwordEyebrow')} title={t('contribute.headwordTitle')} />

          <FieldLabel label={t('contribute.fields.kurukhWord') as string} required />
          <input
            type="text"
            name="kurukh_word"
            value={formData.kurukh_word}
            onChange={handleChange}
            placeholder="khekhel"
            className="w-full kd-font-serif outline-none"
            style={inputStyle({ fontSize: 26 })}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <FieldLabel
                label={t('contribute.fields.ipa') as string}
                hint={t('contribute.fields.ipaHint') as string}
              />
              <input
                type="text"
                name="pronunciation"
                value={formData.pronunciation}
                onChange={handleChange}
                placeholder="/kʰeː.kʰel/"
                className="w-full kd-font-mono outline-none"
                style={inputStyle({ fontSize: 15 })}
              />
            </div>
            <div>
              <FieldLabel label={t('contribute.fields.pos') as string} />
              <select
                name="part_of_speech"
                value={formData.part_of_speech}
                onChange={handleChange}
                className="w-full kd-font-sans outline-none appearance-none"
                style={{
                  ...inputStyle({ fontSize: 15 }),
                  paddingRight: 36,
                  backgroundPosition: 'right 12px center',
                  backgroundRepeat: 'no-repeat',
                  backgroundImage: chevronBg(),
                }}
              >
                <option value="">{t('contribute.fields.posSelect')}</option>
                <option value="noun">noun</option>
                <option value="verb">verb</option>
                <option value="adjective">adjective</option>
                <option value="adverb">adverb</option>
                <option value="pronoun">pronoun</option>
                <option value="preposition">preposition</option>
                <option value="conjunction">conjunction</option>
                <option value="interjection">interjection</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <FieldLabel label={t('contribute.fields.dialect') as string} />
            <input
              type="text"
              name="dialect"
              value={formData.dialect}
              onChange={handleChange}
              placeholder="Lohardaga"
              className="w-full kd-font-sans outline-none"
              style={inputStyle({ fontSize: 15 })}
            />
          </div>

          <div className="mt-9">
            <div className="flex flex-wrap justify-between items-end gap-3">
              <SubHead eyebrow={t('contribute.meaningsEyebrow')} title={t('contribute.meaningsTitle')} noBottom />
              <button
                type="button"
                onClick={addMeaning}
                className="kd-font-sans inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12.5px] font-medium"
                style={{
                  border: '1px solid var(--kd-accent)',
                  color: 'var(--kd-accent)',
                  background: 'transparent',
                }}
              >
                <IconPlus size={13} weight={2.2} />
                {t('contribute.addLanguage')}
              </button>
            </div>

            {formData.meanings.map((meaning, index) => (
              <MeaningCard
                key={index}
                t={t}
                n={index + 1}
                meaning={meaning}
                isLanguageUsed={isLanguageUsed}
                showRemove={formData.meanings.length > 1}
                onChange={(field, value) => handleMeaningChange(index, field, value)}
                onRemove={() => removeMeaning(index)}
                wordCount={wordCount}
              />
            ))}
          </div>

          {success && (
            <div
              role="status"
              className="mt-6 kd-font-sans px-4 py-3 rounded-xl"
              style={{
                background: 'color-mix(in srgb, var(--kd-sage) 15%, transparent)',
                color: 'var(--kd-sage)',
                border: '1px solid color-mix(in srgb, var(--kd-sage) 40%, transparent)',
              }}
            >
              {t('contribute.successMessage')}
            </div>
          )}
          {error && (
            <div
              role="alert"
              className="mt-6 kd-font-sans px-4 py-3 rounded-xl"
              style={{
                background: 'var(--kd-accent-tint)',
                color: 'var(--kd-accent)',
                border: '1px solid color-mix(in srgb, var(--kd-accent) 40%, transparent)',
              }}
            >
              {error}
            </div>
          )}

          <div className="flex flex-wrap gap-2.5 mt-7">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 inline-flex items-center justify-center gap-2 kd-font-sans font-semibold text-[15px] py-3.5 rounded-xl disabled:opacity-60"
              style={{ background: 'var(--kd-ink)', color: 'var(--kd-bg)' }}
            >
              {submitting ? t('contribute.submitting') : t('contribute.submit')}
              {!submitting && <IconArrow size={15} color="currentColor" />}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="kd-font-sans font-medium text-[14px] px-5 py-3.5 rounded-xl"
              style={{
                background: 'transparent',
                color: 'var(--kd-ink)',
                border: '1px solid var(--kd-line)',
              }}
            >
              {t('contribute.cancel')}
            </button>
          </div>
        </form>

        <div className="flex flex-col gap-5">
          <div
            className="p-4 rounded-2xl flex gap-3.5"
            style={{
              background: 'color-mix(in srgb, var(--kd-sage) 10%, transparent)',
              border: '1px solid color-mix(in srgb, var(--kd-sage) 25%, transparent)',
            }}
          >
            <div
              className="kd-font-serif"
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: 'var(--kd-sage)',
                color: '#FFF',
                fontWeight: 600,
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: 1,
              }}
            >
              i
            </div>
            <div>
              <div className="kd-font-sans" style={{ fontSize: 14, fontWeight: 600, color: 'var(--kd-ink)' }}>
                {t('contribute.infoPillTitle')}
              </div>
              <div
                className="kd-font-sans mt-1"
                style={{ fontSize: 13, color: 'var(--kd-ink-soft)', lineHeight: 1.6 }}
              >
                {t('contribute.infoPillBody')}
              </div>
            </div>
          </div>

          <div
            className="p-7 rounded-[20px] relative overflow-hidden"
            style={{ background: 'var(--kd-surface)', border: '1px solid var(--kd-line)' }}
          >
            <div
              className="kd-font-mono"
              style={{
                position: 'absolute',
                top: 16,
                right: 20,
                fontSize: 10.5,
                color: 'var(--kd-ink-mute)',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
              }}
            >
              {t('contribute.preview')}
            </div>

            {hasPreviewContent ? (
              <>
                <div
                  className="kd-font-serif mt-4"
                  style={{
                    fontWeight: 500,
                    fontSize: 'clamp(44px, 6vw, 64px)',
                    color: 'var(--kd-ink)',
                    letterSpacing: '-0.03em',
                    lineHeight: 1,
                  }}
                >
                  {formData.kurukh_word}
                </div>
                <div className="mt-3 flex items-center gap-3 flex-wrap">
                  {formData.pronunciation && (
                    <span className="kd-font-mono" style={{ fontSize: 13, color: 'var(--kd-ink-soft)' }}>
                      /{formData.pronunciation.replace(/^\/|\/$/g, '')}/
                    </span>
                  )}
                  {formData.part_of_speech && (
                    <span
                      className="kd-font-sans"
                      style={{
                        padding: '3px 10px',
                        borderRadius: 999,
                        fontSize: 11,
                        fontWeight: 500,
                        letterSpacing: '0.04em',
                        background: 'var(--kd-accent-tint)',
                        color: 'var(--kd-accent)',
                      }}
                    >
                      {formData.part_of_speech}
                    </span>
                  )}
                  <span
                    className="kd-font-sans inline-flex items-center gap-1.5"
                    style={{ fontSize: 12, color: 'var(--kd-ink-mute)' }}
                  >
                    <span
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: '50%',
                        background: 'var(--kd-accent)',
                        display: 'inline-block',
                      }}
                    />
                    {t('contribute.draftStatus')}
                  </span>
                </div>

                <div className="mt-5 flex flex-col gap-3.5">
                  {previewMeanings.map((m, i) => (
                    <PreviewMeaning
                      key={i}
                      n={i + 1}
                      definition={m.definition}
                      example={m.example_sentence_kurukh}
                      translation={m.example_sentence_translation}
                      hindi={m.language === 'hi'}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div
                className="kd-font-sans italic py-6"
                style={{ fontSize: 13, color: 'var(--kd-ink-mute)' }}
              >
                {t('contribute.previewEmpty')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const inputStyle = (overrides: CSSProperties = {}): CSSProperties => ({
  width: '100%',
  boxSizing: 'border-box',
  border: '1px solid var(--kd-line)',
  borderRadius: 10,
  background: 'var(--kd-bg)',
  color: 'var(--kd-ink)',
  padding: '12px 14px',
  outline: 'none',
  ...overrides,
});

const chevronBg = (): string =>
  `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%238A8073' stroke-width='2' stroke-linecap='round'><path d='m6 9 6 6 6-6'/></svg>")`;

interface FieldLabelProps {
  label: string;
  required?: boolean;
  hint?: string;
}

const FieldLabel = ({ label, required, hint }: FieldLabelProps) => (
  <div className="flex items-baseline justify-between mb-1.5">
    <label
      className="kd-font-sans"
      style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--kd-ink-soft)', letterSpacing: '0.02em' }}
    >
      {label}
      {required && <span style={{ color: 'var(--kd-accent)', marginLeft: 4 }}>*</span>}
    </label>
    {hint && (
      <span className="kd-font-sans" style={{ fontSize: 11.5, color: 'var(--kd-ink-mute)' }}>
        {hint}
      </span>
    )}
  </div>
);

interface MeaningCardProps {
  t: (key: string, opts?: Record<string, unknown>) => string;
  n: number;
  meaning: MeaningDraft;
  isLanguageUsed: (code: string, idx: number) => boolean;
  onChange: (field: keyof MeaningDraft, value: string) => void;
  onRemove: () => void;
  showRemove: boolean;
  wordCount: (text: string) => number;
}

const MeaningCard = ({
  t,
  n,
  meaning,
  isLanguageUsed,
  onChange,
  onRemove,
  showRemove,
  wordCount,
}: MeaningCardProps) => {
  const langLabel = LANGUAGE_NAMES[meaning.language] || meaning.language;
  return (
    <div
      className="p-5 rounded-2xl mt-3.5"
      style={{ background: 'var(--kd-bg)', border: '1px solid var(--kd-line)' }}
    >
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2.5">
          <span
            className="kd-font-serif inline-flex items-center justify-center"
            style={{
              width: 26,
              height: 26,
              borderRadius: 7,
              background: 'var(--kd-accent-tint)',
              color: 'var(--kd-accent)',
              fontWeight: 600,
              fontSize: 13,
            }}
          >
            {n}
          </span>
          <div>
            <div className="kd-font-sans" style={{ fontSize: 13, fontWeight: 500, color: 'var(--kd-ink)' }}>
              {langLabel}
            </div>
            <div
              className="kd-font-mono"
              style={{ fontSize: 11, color: 'var(--kd-ink-mute)', marginTop: 1 }}
            >
              {meaning.language}
            </div>
          </div>
        </div>
        {showRemove && (
          <button
            type="button"
            onClick={onRemove}
            aria-label={t('contribute.removeMeaning') as string}
            className="inline-flex items-center justify-center p-1.5 rounded-md"
            style={{ color: 'var(--kd-ink-mute)' }}
          >
            <IconClose size={14} />
          </button>
        )}
      </div>

      <select
        value={meaning.language}
        onChange={(e) => onChange('language', e.target.value)}
        aria-label="language"
        className="w-full kd-font-sans outline-none appearance-none mb-3"
        style={{
          ...inputStyle({ fontSize: 13.5 }),
          paddingRight: 36,
          backgroundPosition: 'right 12px center',
          backgroundRepeat: 'no-repeat',
          backgroundImage: chevronBg(),
        }}
      >
        {LANGUAGE_OPTIONS.map((code) => (
          <option key={code} value={code} disabled={isLanguageUsed(code, n - 1)}>
            {LANGUAGE_NAMES[code]}
            {isLanguageUsed(code, n - 1) ? ' (used)' : ''}
          </option>
        ))}
      </select>
      <FieldLabel
        label={t('contribute.definition') as string}
        required
        hint={t('contribute.wordsCount', { count: wordCount(meaning.definition) }) as string}
      />
      <textarea
        value={meaning.definition}
        onChange={(e) => onChange('definition', e.target.value)}
        rows={2}
        placeholder={t('contribute.definitionPlaceholder', { lang: langLabel }) as string}
        className="w-full kd-font-serif outline-none"
        style={inputStyle({ fontSize: 16, lineHeight: 1.5, background: 'var(--kd-surface)' })}
        required={n === 1}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mt-2.5">
        <textarea
          value={meaning.example_sentence_kurukh}
          onChange={(e) => onChange('example_sentence_kurukh', e.target.value)}
          rows={2}
          placeholder={t('contribute.exampleKurukhPlaceholder') as string}
          className="kd-font-serif italic outline-none"
          style={inputStyle({ fontSize: 14, background: 'var(--kd-surface)', color: 'var(--kd-ink-soft)' })}
        />
        <textarea
          value={meaning.example_sentence_translation}
          onChange={(e) => onChange('example_sentence_translation', e.target.value)}
          rows={2}
          placeholder={t('contribute.exampleTranslationPlaceholder', { lang: langLabel }) as string}
          className="kd-font-sans outline-none"
          style={inputStyle({ fontSize: 13, background: 'var(--kd-surface)', color: 'var(--kd-ink-soft)' })}
        />
      </div>
    </div>
  );
};

interface PreviewMeaningProps {
  n: number;
  definition: string;
  example: string;
  translation: string;
  hindi: boolean;
}

const PreviewMeaning = ({ n, definition, example, translation, hindi }: PreviewMeaningProps): ReactNode => (
  <div style={{ borderLeft: '3px solid var(--kd-accent)', paddingLeft: 16 }}>
    <div className="flex items-baseline gap-2 flex-wrap">
      <span className="kd-font-serif" style={{ fontWeight: 500, fontSize: 18, color: 'var(--kd-accent)' }}>
        {n}.
      </span>
      <span
        className={hindi ? '' : 'kd-font-serif'}
        style={{
          fontFamily: hindi ? 'var(--kd-font-deva, var(--kd-font-serif))' : undefined,
          fontSize: 17,
          color: 'var(--kd-ink)',
          lineHeight: 1.5,
        }}
      >
        {definition}
      </span>
    </div>
    {example && (
      <p
        className="kd-font-serif italic"
        style={{ fontSize: 14, color: 'var(--kd-ink-soft)', margin: '6px 0 0', paddingLeft: 22, lineHeight: 1.55 }}
      >
        “{example}”{' '}
        {translation && (
          <span
            className="kd-font-sans not-italic ml-1.5"
            style={{ color: 'var(--kd-ink-mute)', fontSize: 12 }}
          >
            — {translation}
          </span>
        )}
      </p>
    )}
    {!example && translation && (
      <p
        className={hindi ? '' : 'kd-font-sans'}
        style={{
          fontFamily: hindi ? 'var(--kd-font-deva, var(--kd-font-sans))' : undefined,
          fontSize: 13,
          color: 'var(--kd-ink-soft)',
          margin: '6px 0 0',
          paddingLeft: 22,
          lineHeight: 1.55,
        }}
      >
        — {translation}
      </p>
    )}
  </div>
);

export default Contribute;
