// Design tokens for the Kurukh Dictionary redesign.
// One source of truth for color / type / spacing across web + mobile.

const KD = {
  // Light surface — warm bone with a hint of cream, not cold white
  light: {
    bg: '#F5EFE3',
    surface: '#FBF7EE',
    surfaceAlt: '#EFE7D5',
    ink: '#1C1814',
    inkSoft: '#534B40',
    inkMute: '#8A8073',
    line: 'rgba(28,24,20,0.10)',
    lineSoft: 'rgba(28,24,20,0.06)',
  },
  // Dark surface — warm charcoal, not pure black
  dark: {
    bg: '#13110F',
    surface: '#1B1816',
    surfaceAlt: '#26221E',
    ink: '#F2EBDC',
    inkSoft: '#B8AE9A',
    inkMute: '#7A7060',
    line: 'rgba(242,235,220,0.10)',
    lineSoft: 'rgba(242,235,220,0.06)',
  },
  // Single considered accent — terracotta saffron; tribal warm, dictionary serious
  accent: '#C7522A',
  accentSoft: '#E89A6C',
  // A second muted accent for "verified" / community state
  sage: '#5A7A5F',
  sageSoft: '#8FA690',
  // Phonetic / mono
  mono: '"JetBrains Mono", ui-monospace, monospace',
  serif: '"Newsreader", "Source Serif Pro", Georgia, serif',
  sans: '"DM Sans", -apple-system, system-ui, sans-serif',
};

// Inject web fonts once (Newsreader for headings/word display + DM Sans for UI +
// JetBrains Mono for phonetic transcriptions)
if (typeof document !== 'undefined' && !document.getElementById('kd-fonts')) {
  const link = document.createElement('link');
  link.id = 'kd-fonts';
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;0,6..72,700;1,6..72,400&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=JetBrains+Mono:wght@400;500&display=swap';
  document.head.appendChild(link);
}

// Small SVG icon helpers (stroke icons — feather-style — no emoji)
const Icon = {
  search: (p = {}) => (
    <svg width={p.size || 18} height={p.size || 18} viewBox="0 0 24 24" fill="none"
      stroke={p.color || 'currentColor'} strokeWidth={p.weight || 1.75}
      strokeLinecap="round" strokeLinejoin="round" {...p.style && { style: p.style }}>
      <circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>
    </svg>
  ),
  speaker: (p = {}) => (
    <svg width={p.size || 18} height={p.size || 18} viewBox="0 0 24 24" fill="none"
      stroke={p.color || 'currentColor'} strokeWidth={p.weight || 1.75}
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 5 6 9H3v6h3l5 4z"/><path d="M16 8c2 1.5 2 6.5 0 8"/><path d="M19 5c3 3 3 11 0 14"/>
    </svg>
  ),
  bookmark: (p = {}) => (
    <svg width={p.size || 18} height={p.size || 18} viewBox="0 0 24 24" fill={p.fill || 'none'}
      stroke={p.color || 'currentColor'} strokeWidth={p.weight || 1.75}
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 4h12v17l-6-4-6 4z"/>
    </svg>
  ),
  heart: (p = {}) => (
    <svg width={p.size || 18} height={p.size || 18} viewBox="0 0 24 24" fill={p.fill || 'none'}
      stroke={p.color || 'currentColor'} strokeWidth={p.weight || 1.75}
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>
    </svg>
  ),
  share: (p = {}) => (
    <svg width={p.size || 18} height={p.size || 18} viewBox="0 0 24 24" fill="none"
      stroke={p.color || 'currentColor'} strokeWidth={p.weight || 1.75}
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v13"/><path d="m7 8 5-5 5 5"/><path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/>
    </svg>
  ),
  arrow: (p = {}) => (
    <svg width={p.size || 18} height={p.size || 18} viewBox="0 0 24 24" fill="none"
      stroke={p.color || 'currentColor'} strokeWidth={p.weight || 1.75}
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>
    </svg>
  ),
  back: (p = {}) => (
    <svg width={p.size || 18} height={p.size || 18} viewBox="0 0 24 24" fill="none"
      stroke={p.color || 'currentColor'} strokeWidth={p.weight || 1.75}
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5"/><path d="m11 18-6-6 6-6"/>
    </svg>
  ),
  sun: (p = {}) => (
    <svg width={p.size || 18} height={p.size || 18} viewBox="0 0 24 24" fill="none"
      stroke={p.color || 'currentColor'} strokeWidth={p.weight || 1.75}
      strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
    </svg>
  ),
  moon: (p = {}) => (
    <svg width={p.size || 18} height={p.size || 18} viewBox="0 0 24 24" fill="none"
      stroke={p.color || 'currentColor'} strokeWidth={p.weight || 1.75}
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>
    </svg>
  ),
  plus: (p = {}) => (
    <svg width={p.size || 18} height={p.size || 18} viewBox="0 0 24 24" fill="none"
      stroke={p.color || 'currentColor'} strokeWidth={p.weight || 1.75}
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M5 12h14"/>
    </svg>
  ),
  home: (p = {}) => (
    <svg width={p.size || 22} height={p.size || 22} viewBox="0 0 24 24" fill={p.fill || 'none'}
      stroke={p.color || 'currentColor'} strokeWidth={p.weight || 1.75}
      strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10"/>
    </svg>
  ),
  book: (p = {}) => (
    <svg width={p.size || 22} height={p.size || 22} viewBox="0 0 24 24" fill="none"
      stroke={p.color || 'currentColor'} strokeWidth={p.weight || 1.75}
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h7a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H4z"/>
      <path d="M20 4h-3a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h4z"/>
    </svg>
  ),
  community: (p = {}) => (
    <svg width={p.size || 22} height={p.size || 22} viewBox="0 0 24 24" fill="none"
      stroke={p.color || 'currentColor'} strokeWidth={p.weight || 1.75}
      strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="9" r="3.2"/><path d="M3 20a6 6 0 0 1 12 0"/>
      <circle cx="17" cy="7" r="2.6"/><path d="M15 14a5 5 0 0 1 7 4.5"/>
    </svg>
  ),
  user: (p = {}) => (
    <svg width={p.size || 22} height={p.size || 22} viewBox="0 0 24 24" fill="none"
      stroke={p.color || 'currentColor'} strokeWidth={p.weight || 1.75}
      strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/>
    </svg>
  ),
  more: (p = {}) => (
    <svg width={p.size || 18} height={p.size || 18} viewBox="0 0 24 24" fill="currentColor">
      <circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>
    </svg>
  ),
  menu: (p = {}) => (
    <svg width={p.size || 22} height={p.size || 22} viewBox="0 0 24 24" fill="none"
      stroke={p.color || 'currentColor'} strokeWidth={p.weight || 1.75}
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7h16M4 12h16M4 17h10"/>
    </svg>
  ),
  filter: (p = {}) => (
    <svg width={p.size || 18} height={p.size || 18} viewBox="0 0 24 24" fill="none"
      stroke={p.color || 'currentColor'} strokeWidth={p.weight || 1.75}
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 5h16l-6 8v6l-4 2v-8z"/>
    </svg>
  ),
  check: (p = {}) => (
    <svg width={p.size || 16} height={p.size || 16} viewBox="0 0 24 24" fill="none"
      stroke={p.color || 'currentColor'} strokeWidth={p.weight || 2}
      strokeLinecap="round" strokeLinejoin="round">
      <path d="m5 12 5 5 9-11"/>
    </svg>
  ),
};

// Sample Kurukh dictionary entries — using real-sounding Kurukh vocabulary
// (Oraon language, Eastern India). Mix of single words and longer entries
// so screens show realistic density.
const SAMPLE_WORDS = [
  {
    word: 'chando', ipa: 'tʃʌn.do̞', pos: 'noun', gloss: 'moon',
    examples: [
      { ku: 'Chando neem ulā tarken.', en: 'The moon shone over the village.' }
    ],
    etymology: 'Proto-Dravidian *cantu — shared with Munda forms.',
    related: ['biri (sun)', 'ulā (night)', 'tarken (to shine)'],
    likes: 248,
  },
  {
    word: 'khekhel', ipa: 'kʰeː.kʰel', pos: 'noun', gloss: 'forest, sal grove',
    examples: [
      { ku: 'Khekhel-ge sānā nu menjkhā.', en: 'We walked together into the forest.' }
    ],
    etymology: 'Native Kurukh; cognate with khēkh (wood, timber).',
    related: ['sānā (path)', 'mankhaa (tree)', 'kūl (water)'],
    likes: 132,
  },
  {
    word: 'ammā', ipa: 'ʌm.maː', pos: 'noun', gloss: 'mother',
    examples: [{ ku: 'Ammā baṛī chitti hai.', en: 'Mother is kindness itself.' }],
    etymology: 'Reduplicated *am — universal kinship term.',
    related: ['bābā (father)', 'bāji (elder sister)'],
    likes: 412,
  },
  {
    word: 'bāji', ipa: 'baː.dʒi', pos: 'noun', gloss: 'elder sister',
    examples: [{ ku: 'Bāji ē ekkā chando lai.', en: 'My sister, like the moon.' }],
    likes: 88,
  },
  {
    word: 'ekka', ipa: 'ek.kʌ', pos: 'numeral', gloss: 'one',
    examples: [{ ku: 'Ekka beṛā, irbai nāyā.', en: 'One ox, two cows.' }],
    likes: 54,
  },
  {
    word: 'irbai', ipa: 'iɾ.bʌi', pos: 'numeral', gloss: 'two',
    likes: 41,
  },
  {
    word: 'munnd', ipa: 'mun.d̪', pos: 'numeral', gloss: 'three',
    likes: 36,
  },
  {
    word: 'mankhaa', ipa: 'mʌn.kʰaː', pos: 'noun', gloss: 'tree; the standing thing',
    likes: 67,
  },
  {
    word: 'bai', ipa: 'bʌi', pos: 'noun', gloss: 'younger brother; close friend',
    likes: 198,
  },
];

Object.assign(window, { KD, Icon, SAMPLE_WORDS });
