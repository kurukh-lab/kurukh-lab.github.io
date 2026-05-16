import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import CommunityReviewList from '../components/dictionary/CommunityReview';
import WordCommunityReview from '../components/dictionary/WordCommunityReview';

type Tab = 'words' | 'edits';

const TABS: Array<{ id: Tab }> = [{ id: 'words' }, { id: 'edits' }];

interface Guidance {
  title: string;
  body: string;
}

const CommunityReviewPage = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('words');

  const tabLabels: Record<Tab, string> = {
    words: t('review.tabs.words') as string,
    edits: t('review.tabs.edits') as string,
  };

  const guidanceRaw = t('review.guidance', { returnObjects: true });
  const guidance: Guidance[] = Array.isArray(guidanceRaw) ? (guidanceRaw as Guidance[]) : [];

  return (
    <div style={{ background: 'var(--kd-bg)', color: 'var(--kd-ink)' }}>
      <section className="max-w-[1200px] mx-auto px-6 md:px-14 pt-14">
        <div className="kd-eyebrow mb-4">{t('review.queueEyebrow', { count: '—' })}</div>
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
          {t('review.titleLine1')}{' '}
          <em style={{ fontStyle: 'italic', color: 'var(--kd-accent)', fontWeight: 400 }}>
            {t('review.titleEmph')}
          </em>{' '}
          {t('review.titleLine2')}
        </h1>
        <p
          className="kd-font-serif mt-4 max-w-[620px]"
          style={{ fontSize: 'clamp(16px, 1.4vw, 19px)', color: 'var(--kd-ink-soft)', lineHeight: 1.5 }}
        >
          {t('review.subtitle')}
        </p>

        <div
          className="mt-9 flex gap-7 items-end overflow-x-auto"
          style={{ borderBottom: '1px solid var(--kd-line)' }}
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className="relative inline-flex items-center gap-2 py-3.5 whitespace-nowrap kd-font-sans"
                style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
              >
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: isActive ? 'var(--kd-ink)' : 'var(--kd-ink-soft)',
                  }}
                >
                  {tabLabels[tab.id]}
                </span>
                {isActive && (
                  <span
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      bottom: -1,
                      height: 2.5,
                      background: 'var(--kd-accent)',
                      borderRadius: 2,
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </section>

      <section className="max-w-[1200px] mx-auto px-6 md:px-14 py-8 pb-24 grid gap-10 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0">
          {activeTab === 'words' ? <WordCommunityReview /> : <CommunityReviewList />}
        </div>

        <aside className="flex flex-col gap-4">
          <div
            className="p-6 rounded-2xl"
            style={{ background: 'var(--kd-surface)', border: '1px solid var(--kd-line)' }}
          >
            <div className="kd-eyebrow mb-3.5">{t('review.guidanceEyebrow')}</div>
            {guidance.map((g, i) => {
              const dotColor =
                ['var(--kd-sage)', 'var(--kd-accent)', 'var(--kd-ink-mute)'][i] ||
                'var(--kd-ink-mute)';
              return (
                <div key={g.title} className="flex gap-3 mb-3.5">
                  <span
                    aria-hidden="true"
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: dotColor,
                      marginTop: 8,
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <div
                      className="kd-font-sans"
                      style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--kd-ink)' }}
                    >
                      {g.title}
                    </div>
                    <div
                      className="kd-font-sans mt-0.5"
                      style={{ fontSize: 12.5, color: 'var(--kd-ink-soft)', lineHeight: 1.5 }}
                    >
                      {g.body}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>
      </section>
    </div>
  );
};

export default CommunityReviewPage;
