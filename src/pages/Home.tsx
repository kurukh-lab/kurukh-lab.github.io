import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import SearchBar from '../components/common/SearchBar';
import SectionLabel from '../components/kd/SectionLabel';
import WordOfDayCard from '../components/kd/WordOfDayCard';
import AlphabetRibbon from '../components/kd/AlphabetRibbon';
import WordRow from '../components/kd/WordRow';
import { useSearchUI } from '../contexts/SearchContext';
import { getHomePageData } from '../services/dictionaryService';
import type { Word } from '../types';

type WordWithLikes = Word & { likes_count?: number; likes?: number };

const Home = () => {
  const { t, i18n } = useTranslation();
  const [recentWords, setRecentWords] = useState<WordWithLikes[]>([]);
  const [wordOfTheDay, setWordOfTheDay] = useState<Word | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { openSearch } = useSearchUI();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const homePageData = await getHomePageData();
        setRecentWords((homePageData.recentWords as WordWithLikes[]) || []);
        setWordOfTheDay(homePageData.wordOfTheDay || null);
      } catch (err) {
        console.error('Error fetching home page data:', err);
        setError(t('errors.loadDictionary') as string);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [t]);

  const dateLabel = new Date().toLocaleDateString(
    i18n.language === 'hi' ? 'hi-IN' : 'en-US',
    { day: 'numeric', month: 'short' },
  );

  const totalEntries = recentWords.length;
  const lovedWords = [...recentWords]
    .sort((a, b) => (b.likes_count ?? b.likes ?? 0) - (a.likes_count ?? a.likes ?? 0))
    .slice(0, 4);

  return (
    <div style={{ background: 'var(--kd-bg)', color: 'var(--kd-ink)' }}>
      <section className="max-w-[1200px] mx-auto px-6 md:px-14 pt-16 md:pt-20 pb-10">
        <div className="kd-eyebrow mb-4">{t('home.eyebrow')}</div>
        <h1
          className="kd-font-serif"
          style={{
            fontWeight: 500,
            fontSize: 'clamp(48px, 8vw, 96px)',
            lineHeight: 1.02,
            letterSpacing: '-0.025em',
            margin: 0,
            color: 'var(--kd-ink)',
          }}
        >
          {t('home.titleLine1')}
          <br />
          <em style={{ fontStyle: 'italic', color: 'var(--kd-accent)', fontWeight: 400 }}>
            {t('home.titleEmph')}
          </em>{' '}
          {t('home.titleLine2')}
        </h1>

        <p
          className="kd-font-serif"
          style={{
            fontSize: 'clamp(17px, 1.6vw, 22px)',
            lineHeight: 1.5,
            color: 'var(--kd-ink-soft)',
            maxWidth: 620,
            marginTop: 28,
            marginBottom: 40,
            fontWeight: 400,
          }}
        >
          {t('home.subtitle')}
        </p>

        <div style={{ maxWidth: 720 }}>
          <SearchBar asTrigger onActivate={openSearch} large />
        </div>

        <div
          className="mt-12 pt-8 grid gap-x-10 gap-y-6"
          style={{
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, max-content))',
            borderTop: '1px solid var(--kd-line)',
          }}
        >
          {[
            [String(totalEntries || '—'), t('home.stats.words')],
            ['—', t('home.stats.audio')],
            ['—', t('home.stats.contributors')],
            ['—', t('home.stats.regions')],
          ].map(([n, l]) => (
            <div key={String(l)}>
              <div
                className="kd-font-serif"
                style={{ fontSize: 32, fontWeight: 500, color: 'var(--kd-ink)', letterSpacing: '-0.02em' }}
              >
                {n}
              </div>
              <div
                className="kd-font-sans uppercase mt-1"
                style={{ fontSize: 12, color: 'var(--kd-ink-mute)', letterSpacing: '0.1em' }}
              >
                {l}
              </div>
            </div>
          ))}
        </div>
      </section>

      {error && !loading && (
        <div className="max-w-[1200px] mx-auto px-6 md:px-14 pb-6">
          <div
            role="alert"
            className="kd-font-sans px-4 py-3 rounded-xl"
            style={{
              background: 'var(--kd-accent-tint)',
              color: 'var(--kd-accent)',
              border: '1px solid var(--kd-accent)',
            }}
          >
            {error}
          </div>
        </div>
      )}

      {!loading && wordOfTheDay && (
        <section className="max-w-[1200px] mx-auto px-6 md:px-14 py-6">
          <SectionLabel
            eyebrow={`${t('home.wordOfDay.eyebrow')} · ${dateLabel}`}
            title={t('home.wordOfDay.title')}
          />
          <WordOfDayCard word={wordOfTheDay} />
        </section>
      )}

      <section className="max-w-[1200px] mx-auto px-6 md:px-14 py-6">
        <SectionLabel
          eyebrow={t('home.alphabet.eyebrow')}
          title={t('home.alphabet.title')}
          right={
            <span className="kd-font-sans" style={{ fontSize: 13, color: 'var(--kd-ink-soft)' }}>
              {t('home.alphabet.entries', { count: totalEntries })}
            </span>
          }
        />
        <AlphabetRibbon />
      </section>

      <section className="max-w-[1200px] mx-auto px-6 md:px-14 pt-6 pb-24 grid gap-14 md:grid-cols-2">
        <div>
          <SectionLabel eyebrow={t('home.recent.eyebrow')} title={t('home.recent.title')} />
          {loading ? (
            <p className="kd-ink-mute kd-font-sans">…</p>
          ) : recentWords.length > 0 ? (
            <div className="flex flex-col">
              {recentWords.slice(0, 4).map((w, i) => (
                <WordRow key={w.id || i} word={w} isFirst={i === 0} />
              ))}
            </div>
          ) : (
            <p className="kd-font-sans" style={{ color: 'var(--kd-ink-mute)' }}>
              {t('home.noWords')}
            </p>
          )}
        </div>
        <div>
          <SectionLabel eyebrow={t('home.loved.eyebrow')} title={t('home.loved.title')} />
          {loading ? (
            <p className="kd-ink-mute kd-font-sans">…</p>
          ) : lovedWords.length > 0 ? (
            <div className="flex flex-col">
              {lovedWords.map((w, i) => (
                <WordRow key={w.id || i} word={w} isFirst={i === 0} />
              ))}
            </div>
          ) : (
            <p className="kd-font-sans" style={{ color: 'var(--kd-ink-mute)' }}>
              {t('home.noWords')}
            </p>
          )}
        </div>
      </section>

    </div>
  );
};

export default Home;
