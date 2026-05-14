// Hindi (Devanagari) version of the dictionary screens.
// Same design system, palette, and accent as Kurukh — but with
// Devanagari typography (Noto Serif Devanagari + Noto Sans Devanagari)
// and Hindi sample content.

const { KD, Icon, KMark } = window;

// Inject Devanagari fonts (additive — Latin fonts loaded by tokens.jsx still work)
if (typeof document !== 'undefined' && !document.getElementById('hi-fonts')) {
  const link = document.createElement('link');
  link.id = 'hi-fonts';
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Noto+Serif+Devanagari:wght@400;500;600;700&family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap';
  document.head.appendChild(link);
}

// Devanagari font stacks — stack Latin fonts after so any mixed text falls back gracefully
const HI = {
  serif: '"Noto Serif Devanagari", "Newsreader", Georgia, serif',
  sans: '"Noto Sans Devanagari", "DM Sans", system-ui, sans-serif',
  mono: KD.mono,
};

// Sample Hindi vocabulary, mirroring the Kurukh entries in tone
const HI_WORDS = [
  {
    word: 'चाँद', latin: 'chā̃d', ipa: 't͡ʃãːd̪', pos: 'संज्ञा', posEn: 'noun',
    gloss: 'moon', glossHi: 'आकाश का रात्रिचर',
    examples: [
      { hi: 'चाँद आज पूर्ण है, गाँव चाँदनी से नहाया हुआ।',
        en: 'The moon is full tonight; the village is bathed in its light.' }
    ],
    note: 'काव्य परंपरा में सौंदर्य और विरह दोनों का प्रतीक।',
    likes: 412,
  },
  {
    word: 'जंगल', latin: 'jaṅgal', ipa: 'd͡ʒəŋ.ɡəl', pos: 'संज्ञा', posEn: 'noun',
    gloss: 'forest, wilderness', glossHi: 'घना वन; वह स्थान जो बस्ती से बाहर है',
    examples: [
      { hi: 'जंगल में मोर नाचा, किसने देखा?',
        en: 'A peacock danced in the forest — who saw it?' }
    ],
    note: 'फ़ारसी से उधार लिया गया; अंग्रेज़ी "jungle" का स्रोत।',
    likes: 188,
  },
  {
    word: 'माँ', latin: 'mā̃', ipa: 'mãː', pos: 'संज्ञा', posEn: 'noun',
    gloss: 'mother', glossHi: 'जननी; पहली शिक्षिका',
    examples: [{ hi: 'माँ की ममता समुद्र से गहरी होती है।',
      en: "A mother's love is deeper than the sea." }],
    likes: 624,
  },
  {
    word: 'पिता', latin: 'pitā', ipa: 'pɪ.t̪aː', pos: 'संज्ञा', posEn: 'noun',
    gloss: 'father',
    likes: 248,
  },
  {
    word: 'एक', latin: 'ek', ipa: 'eːk', pos: 'अंक', posEn: 'numeral',
    gloss: 'one', likes: 96,
  },
  {
    word: 'दो', latin: 'do', ipa: 'd̪oː', pos: 'अंक', posEn: 'numeral',
    gloss: 'two', likes: 84,
  },
  {
    word: 'पेड़', latin: 'peṛ', ipa: 'peːɽ', pos: 'संज्ञा', posEn: 'noun',
    gloss: 'tree', likes: 132,
  },
  {
    word: 'नदी', latin: 'nadī', ipa: 'nəd̪.iː', pos: 'संज्ञा', posEn: 'noun',
    gloss: 'river', likes: 176,
  },
];

// Devanagari alphabet sample (vowels + a few consonants for the ribbon)
const HI_ALPHABET = ['अ','आ','इ','ई','उ','ऊ','ए','ऐ','ओ','औ','क','ख','ग','घ','च','छ','ज','झ','ट','ठ','ड','ढ','त','थ','द','ध','न','प','फ','ब','भ','म','य','र','ल','व','श','ष','स','ह'];

// "क" mark — Devanagari counterpart to the Kurukh "K" tile
function HiKMark({ size = 38, color = KD.accent }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: 9, background: color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative',
    }}>
      <span style={{
        fontFamily: HI.serif, fontWeight: 600, fontSize: size * 0.62,
        color: '#FBF7EE', lineHeight: 1, marginTop: -2,
      }}>क</span>
      <div style={{
        position: 'absolute', top: size * 0.18, right: size * 0.18,
        width: size * 0.12, height: size * 0.12, borderRadius: '50%', background: '#FBF7EE',
      }}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Web — shared chrome
// ─────────────────────────────────────────────────────────────

function HiWebNav({ t, active = 'मुख्य' }) {
  const items = ['मुख्य', 'खोज', 'योगदान', 'समुदाय', 'सहेजे'];
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '22px 56px', borderBottom: `1px solid ${t.lineSoft}`,
      background: t.bg, position: 'sticky', top: 0, zIndex: 5,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <HiKMark color={KD.accent}/>
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
          <span style={{
            fontFamily: HI.serif, fontWeight: 600, fontSize: 22,
            color: t.ink, letterSpacing: '-0.005em',
          }}>कोश<span style={{ color: KD.accent }}>.</span></span>
          <span style={{
            fontFamily: HI.sans, fontSize: 11, color: t.inkMute,
            letterSpacing: '0.06em', marginTop: 3,
          }}>एक जीवंत शब्दकोश</span>
        </div>
      </div>

      <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {items.map(label => (
          <a key={label} style={{
            fontFamily: HI.sans, fontSize: 15, fontWeight: 500,
            padding: '8px 14px', borderRadius: 999, cursor: 'pointer',
            color: active === label ? t.ink : t.inkSoft,
            background: active === label ? t.surfaceAlt : 'transparent',
          }}>{label}</a>
        ))}
      </nav>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 56, height: 30, borderRadius: 999, background: t.surfaceAlt,
          position: 'relative', display: 'flex', alignItems: 'center', padding: 3,
          boxSizing: 'border-box',
        }}>
          <div style={{
            position: 'absolute', left: t === KD.dark ? 28 : 3, top: 3,
            width: 24, height: 24, borderRadius: '50%',
            background: t.surface, display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: t.ink,
            boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
          }}>{t === KD.dark ? <Icon.moon size={13}/> : <Icon.sun size={13}/>}</div>
        </div>
        <button style={{
          fontFamily: HI.sans, fontSize: 14, fontWeight: 600,
          padding: '9px 16px', borderRadius: 999, border: 'none', cursor: 'pointer',
          background: KD.accent, color: '#FBF7EE',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <Icon.plus size={14} weight={2.2}/> शब्द जोड़ें
        </button>
        <div style={{
          width: 36, height: 36, borderRadius: '50%', background: KD.sageSoft,
          color: '#FFF', fontFamily: HI.serif, fontWeight: 600, fontSize: 14,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>आ</div>
      </div>
    </div>
  );
}

function HiSearchBar({ t, large = false }) {
  return (
    <div style={{ width: '100%' }}>
      <div style={{
        background: t.surface, border: `1px solid ${t.line}`, borderRadius: 14,
        padding: large ? '20px 24px' : '14px 20px',
        display: 'flex', alignItems: 'center', gap: 16,
        boxShadow: `0 1px 0 ${t.lineSoft}, 0 12px 40px -20px rgba(28,24,20,0.18)`,
      }}>
        <Icon.search size={large ? 22 : 18} color={t.inkSoft} weight={1.6}/>
        <input placeholder="हिन्दी, अंग्रेज़ी या रोमन में कोई शब्द खोजें…"
          style={{
            flex: 1, border: 'none', outline: 'none', background: 'transparent',
            fontFamily: HI.sans, fontSize: large ? 18 : 15, color: t.ink,
          }} />
        <kbd style={{
          fontFamily: KD.mono, fontSize: 11, color: t.inkMute,
          padding: '4px 8px', border: `1px solid ${t.line}`, borderRadius: 6,
          background: t.surfaceAlt,
        }}>⌘ K</kbd>
      </div>
      {large && (
        <div style={{
          display: 'flex', gap: 12, marginTop: 16, paddingLeft: 4,
          fontFamily: HI.sans, fontSize: 14, color: t.inkMute, flexWrap: 'wrap',
        }}>
          <span>प्रयास करें:</span>
          {['चाँद', 'जंगल', 'माँ', 'अंक'].map(q => (
            <span key={q} style={{
              padding: '4px 14px', borderRadius: 999,
              border: `1px solid ${t.line}`, background: t.surface,
              color: t.inkSoft, cursor: 'pointer',
              fontFamily: HI.serif, fontSize: 15,
            }}>{q}</span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Web Home (Hindi) ─────────────────────────────────────────────────

function HiWebHome({ dark = false }) {
  const t = dark ? KD.dark : KD.light;
  const wod = HI_WORDS[0];
  return (
    <div style={{ background: t.bg, color: t.ink, fontFamily: HI.sans, minHeight: '100%' }}>
      <HiWebNav t={t} active="मुख्य"/>

      {/* Hero */}
      <div style={{ padding: '88px 56px 56px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{
          fontFamily: KD.mono, fontSize: 11.5, color: KD.accent,
          letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 18,
        }}>हिन्दी · Hindī · /ɦɪn̪.d̪iː/</div>
        <h1 style={{
          fontFamily: HI.serif, fontWeight: 500, fontSize: 92, lineHeight: 1.1,
          letterSpacing: '-0.01em', margin: 0, color: t.ink,
        }}>
          एक शब्दकोश,<br/>
          <em style={{ fontStyle: 'normal', color: KD.accent }}>बोलने वालों</em> का।
        </h1>
        <p style={{
          fontFamily: HI.serif, fontSize: 22, lineHeight: 1.6, color: t.inkSoft,
          maxWidth: 660, marginTop: 28, marginBottom: 48, fontWeight: 400,
        }}>
          हिन्दी का खुला सामुदायिक शब्दकोश — पढ़िए, सुनिए, जोड़िए।
          हर बोली का स्वागत है: खड़ी बोली, अवधी, ब्रज, भोजपुरी।
        </p>

        <div style={{ maxWidth: 720 }}><HiSearchBar t={t} large/></div>

        <div style={{
          marginTop: 48, display: 'flex', gap: 44, fontFamily: HI.sans,
          paddingTop: 32, borderTop: `1px solid ${t.line}`,
        }}>
          {[
            ['१२,६४८', 'शब्द'],
            ['४,१०२', 'ऑडियो सहित'],
            ['५८७', 'योगदानकर्ता'],
            ['१८', 'बोलियाँ'],
          ].map(([n, l]) => (
            <div key={l}>
              <div style={{
                fontFamily: HI.serif, fontSize: 32, fontWeight: 500,
                color: t.ink, letterSpacing: '-0.01em',
              }}>{n}</div>
              <div style={{
                fontSize: 12, color: t.inkMute, marginTop: 4,
                fontFamily: HI.sans, letterSpacing: '0.04em',
              }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Word of the day */}
      <div style={{ padding: '24px 56px 56px', maxWidth: 1200, margin: '0 auto' }}>
        <HiSectionLabel t={t} eyebrow="आज · १५ मई" title="आज का शब्द"/>
        <HiWordOfDayCard t={t} word={wod}/>
      </div>

      {/* Alphabet */}
      <div style={{ padding: '24px 56px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <HiSectionLabel t={t} eyebrow="अ — ह" title="वर्णमाला से खोजें"
          right={<span style={{ fontFamily: HI.sans, fontSize: 13, color: t.inkSoft }}>१२,६४८ प्रविष्टियाँ</span>}/>
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 8, padding: 24,
          background: t.surface, border: `1px solid ${t.line}`, borderRadius: 16,
        }}>
          {HI_ALPHABET.map((l, i) => (
            <div key={l} style={{
              minWidth: 48, height: 48, borderRadius: 10, cursor: 'pointer',
              background: i === 10 ? KD.accent : t.surfaceAlt,
              color: i === 10 ? '#FBF7EE' : t.ink,
              fontFamily: HI.serif, fontWeight: 500, fontSize: 22,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flex: '1 0 48px',
            }}>{l}</div>
          ))}
        </div>
      </div>

      {/* Two columns */}
      <div style={{
        padding: '24px 56px 96px', maxWidth: 1200, margin: '0 auto',
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56,
      }}>
        <div>
          <HiSectionLabel t={t} eyebrow="नए शब्द" title="अभी जोड़े गए"/>
          <HiWordList t={t} words={HI_WORDS.slice(3, 7)}/>
        </div>
        <div>
          <HiSectionLabel t={t} eyebrow="सबसे चहेते" title="समुदाय के पसंदीदा"/>
          <HiWordList t={t} words={[HI_WORDS[2], HI_WORDS[0], HI_WORDS[7], HI_WORDS[1]]}/>
        </div>
      </div>

      <HiWebFooter t={t}/>
    </div>
  );
}

function HiSectionLabel({ t, eyebrow, title, right }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div style={{
            fontFamily: KD.mono, fontSize: 11, color: KD.accent,
            letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 8,
          }}>{eyebrow}</div>
          <h2 style={{
            fontFamily: HI.serif, fontWeight: 500, fontSize: 36, color: t.ink,
            margin: 0, letterSpacing: '-0.005em',
          }}>{title}</h2>
        </div>
        {right}
      </div>
    </div>
  );
}

function HiWordOfDayCard({ t, word }) {
  return (
    <div style={{
      background: t.surface, border: `1px solid ${t.line}`, borderRadius: 20,
      padding: 48, display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 56,
      boxShadow: `0 1px 0 ${t.lineSoft}`,
    }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 18, flexWrap: 'wrap' }}>
          <h3 style={{
            fontFamily: HI.serif, fontWeight: 500, fontSize: 92, margin: 0,
            color: t.ink, letterSpacing: '-0.005em', lineHeight: 1,
          }}>{word.word}</h3>
          <button style={{
            border: 'none', background: t.surfaceAlt, color: t.ink,
            width: 44, height: 44, borderRadius: '50%', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}><Icon.speaker size={20} weight={1.6}/></button>
        </div>
        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: HI.serif, fontSize: 17, color: t.inkSoft }}>
            {word.latin}
          </span>
          <span style={{ fontFamily: KD.mono, fontSize: 13, color: t.inkMute }}>
            /{word.ipa}/
          </span>
          <span style={{
            padding: '3px 10px', borderRadius: 999, fontSize: 12,
            fontFamily: HI.sans, fontWeight: 500,
            background: 'rgba(199,82,42,0.10)', color: KD.accent, letterSpacing: '0.02em',
          }}>{word.pos}</span>
        </div>

        <p style={{
          fontFamily: HI.serif, fontSize: 26, color: t.ink,
          fontWeight: 400, marginTop: 28, marginBottom: 0, lineHeight: 1.45,
        }}>{word.glossHi} <span style={{ color: t.inkMute, fontSize: 18 }}>· {word.gloss}</span></p>
        <p style={{
          fontFamily: HI.sans, fontSize: 15, color: t.inkSoft, lineHeight: 1.7,
          marginTop: 16, maxWidth: 460,
        }}>{word.note}</p>

        <div style={{ display: 'flex', gap: 8, marginTop: 28 }}>
          <button style={{
            border: 'none', background: t.ink, color: t.bg, padding: '11px 18px',
            borderRadius: 10, fontFamily: HI.sans, fontWeight: 500, fontSize: 14,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
          }}>पूरा देखें <Icon.arrow size={14} color={t.bg}/></button>
          <button style={{
            border: `1px solid ${t.line}`, background: 'transparent', color: t.ink,
            padding: '11px 14px', borderRadius: 10, fontFamily: HI.sans,
            fontWeight: 500, fontSize: 14, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 8,
          }}><Icon.bookmark size={14}/> सहेजें</button>
        </div>
      </div>

      <div style={{
        borderLeft: `2px solid ${KD.accent}`, paddingLeft: 28,
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
      }}>
        <div style={{
          fontFamily: KD.mono, fontSize: 11, color: KD.accent,
          letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 18,
        }}>उदाहरण</div>
        <p style={{
          fontFamily: HI.serif, fontSize: 32, lineHeight: 1.45, color: t.ink,
          margin: 0, fontWeight: 400, letterSpacing: '-0.005em',
        }}>"{word.examples[0].hi}"</p>
        <p style={{
          fontFamily: KD.sans, fontSize: 15, color: t.inkSoft, fontStyle: 'italic',
          marginTop: 16, marginBottom: 0, lineHeight: 1.55,
        }}>{word.examples[0].en}</p>
        <div style={{
          marginTop: 32, display: 'flex', alignItems: 'center', gap: 12,
          fontFamily: HI.sans, fontSize: 13, color: t.inkMute,
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%', background: KD.accentSoft,
            color: '#FFF', fontFamily: HI.serif, fontWeight: 600, fontSize: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>आ</div>
          रिकॉर्ड किया · <span style={{ color: t.inkSoft, fontWeight: 500 }}>आनंदी मिश्रा</span>
          · खड़ी बोली
        </div>
      </div>
    </div>
  );
}

function HiWordList({ t, words }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {words.map((w, i) => (
        <div key={w.word + i} style={{
          display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 16,
          alignItems: 'baseline', padding: '18px 0',
          borderTop: i === 0 ? 'none' : `1px solid ${t.line}`, cursor: 'pointer',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
              <span style={{
                fontFamily: HI.serif, fontWeight: 500, fontSize: 28,
                color: t.ink, letterSpacing: '-0.005em', lineHeight: 1.1,
              }}>{w.word}</span>
              <span style={{ fontFamily: HI.serif, fontSize: 14, color: t.inkMute, fontStyle: 'italic' }}>
                {w.latin}
              </span>
            </div>
            <div style={{
              fontFamily: HI.serif, fontSize: 16, color: t.inkSoft, marginTop: 4,
            }}>{w.gloss}</div>
          </div>
          <div style={{
            fontFamily: HI.sans, fontSize: 11.5, color: t.inkMute,
            padding: '3px 8px', borderRadius: 999, border: `1px solid ${t.line}`,
          }}>{w.pos}</div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontFamily: KD.mono, fontSize: 12, color: t.inkMute,
          }}>
            <Icon.heart size={13} color={KD.accent} fill={KD.accent}/> {w.likes}
          </div>
        </div>
      ))}
    </div>
  );
}

function HiWebFooter({ t }) {
  return (
    <div style={{ borderTop: `1px solid ${t.line}`, padding: '56px 56px 48px', background: t.surface }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto', display: 'grid',
        gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48,
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <HiKMark size={32}/>
            <span style={{
              fontFamily: HI.serif, fontWeight: 600, fontSize: 20, color: t.ink,
            }}>कोश<span style={{ color: KD.accent }}>.</span></span>
          </div>
          <p style={{
            fontFamily: HI.serif, fontSize: 15, color: t.inkSoft,
            lineHeight: 1.7, maxWidth: 380, marginTop: 16,
          }}>एक खुला, सामुदायिक हिन्दी शब्दकोश — विज्ञापन मुक्त,
            सबके लिए मुफ़्त, और हम सबसे लंबा जीने के लिए बनाया गया।</p>
        </div>
        {[
          ['खोजिए', ['वर्णमाला अ–ह', 'विषय', 'मुहावरे', 'ध्वनि संग्रह']],
          ['योगदान', ['शब्द जोड़ें', 'आवाज़ रिकॉर्ड', 'समीक्षा सूची', 'संपादक मार्गदर्शिका']],
          ['परिचय', ['परियोजना', 'टीम', 'गोपनीयता', 'संपर्क']],
        ].map(([h, items]) => (
          <div key={h}>
            <div style={{
              fontFamily: KD.mono, fontSize: 10.5, color: t.inkMute,
              letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 16,
            }}>{h}</div>
            {items.map(x => (
              <div key={x} style={{
                fontFamily: HI.sans, fontSize: 14, color: t.inkSoft,
                marginBottom: 10, cursor: 'pointer',
              }}>{x}</div>
            ))}
          </div>
        ))}
      </div>
      <div style={{
        maxWidth: 1200, margin: '48px auto 0', paddingTop: 24,
        borderTop: `1px solid ${t.line}`, display: 'flex',
        justifyContent: 'space-between', fontFamily: HI.sans,
        fontSize: 12, color: t.inkMute,
      }}>
        <span>© २०२६ कोश सामुदायिक संग्रह · CC BY-SA 4.0</span>
        <span>दिल्ली · वाराणसी · पटना से, स्नेह के साथ</span>
      </div>
    </div>
  );
}

// ─── Web Word Detail (Hindi) ──────────────────────────────────────────

function HiWebWordDetail({ dark = false }) {
  const t = dark ? KD.dark : KD.light;
  const w = HI_WORDS[1]; // जंगल
  return (
    <div style={{ background: t.bg, color: t.ink, fontFamily: HI.sans, minHeight: '100%' }}>
      <HiWebNav t={t} active="खोज"/>

      <div style={{
        maxWidth: 1100, margin: '0 auto', padding: '32px 56px 0',
        fontFamily: KD.mono, fontSize: 12, color: t.inkMute, letterSpacing: '0.06em',
      }}>खोज / ज / <span style={{ color: t.ink }}>जंगल</span></div>

      {/* Big entry */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 56px 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'end', gap: 24 }}>
          <div>
            <h1 style={{
              fontFamily: HI.serif, fontWeight: 500, fontSize: 148, margin: 0,
              color: t.ink, letterSpacing: '-0.01em', lineHeight: 1.05,
            }}>{w.word}</h1>
            <div style={{
              marginTop: 18, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
            }}>
              <span style={{ fontFamily: HI.serif, fontSize: 19, color: t.inkSoft, fontStyle: 'italic' }}>
                {w.latin}
              </span>
              <span style={{ fontFamily: KD.mono, fontSize: 15, color: t.inkSoft }}>
                /{w.ipa}/
              </span>
              <span style={{
                padding: '4px 12px', borderRadius: 999, fontSize: 12,
                fontFamily: HI.sans, fontWeight: 500,
                background: 'rgba(199,82,42,0.10)', color: KD.accent,
              }}>{w.pos} · {w.posEn}</span>
              <span style={{
                fontFamily: HI.sans, fontSize: 13, color: t.inkMute,
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: KD.sage }}/>
                सत्यापित · ६ योगदानकर्ता
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{
              border: 'none', background: t.ink, color: t.bg, padding: '11px 16px',
              borderRadius: 10, fontFamily: HI.sans, fontWeight: 500, fontSize: 14,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
            }}><Icon.speaker size={16}/> सुनिए</button>
            <button style={{
              border: `1px solid ${t.line}`, background: 'transparent', color: t.ink,
              padding: '11px 14px', borderRadius: 10, fontFamily: HI.sans,
              fontWeight: 500, fontSize: 14, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8,
            }}><Icon.bookmark size={14}/> सहेजें</button>
            <button style={{
              border: `1px solid ${t.line}`, background: 'transparent', color: t.ink,
              padding: '11px 14px', borderRadius: 10, fontFamily: HI.sans,
              fontWeight: 500, fontSize: 14, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8,
            }}><Icon.share size={14}/> साझा</button>
          </div>
        </div>
      </div>

      {/* Audio strip */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 56px 48px' }}>
        <div style={{
          background: t.surface, border: `1px solid ${t.line}`, borderRadius: 16,
          padding: '18px 24px', display: 'flex', alignItems: 'center', gap: 18,
        }}>
          <button style={{
            width: 48, height: 48, borderRadius: '50%', border: 'none',
            background: KD.accent, color: '#FBF7EE', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4l14 8-14 8z"/></svg>
          </button>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 3, height: 36 }}>
            {Array.from({ length: 70 }).map((_, i) => {
              const h = 6 + Math.abs(Math.sin(i * 1.7) + Math.sin(i * 0.9)) * 14;
              return <div key={i} style={{
                width: 3, height: h, borderRadius: 2,
                background: i < 26 ? KD.accent : t.lineSoft,
              }}/>;
            })}
          </div>
          <div style={{ fontFamily: KD.mono, fontSize: 12, color: t.inkMute }}>0:02 / 0:03</div>
          <div style={{ width: 1, height: 28, background: t.line }}/>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontFamily: HI.sans, fontSize: 12, color: t.inkMute }}>बोली</span>
            <span style={{
              fontFamily: HI.sans, fontSize: 13, fontWeight: 500, color: t.ink, marginTop: 2,
            }}>खड़ी बोली ▾</span>
          </div>
        </div>
      </div>

      <div style={{
        maxWidth: 1100, margin: '0 auto', padding: '0 56px 96px',
        display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 64,
      }}>
        <div>
          <HiSectionLabel t={t} eyebrow="अर्थ" title="परिभाषाएँ"/>
          <HiDefinition t={t} n={1}
            gloss="घना वन; वह स्थान जहाँ पेड़ इतने सघन हों कि आकाश ढक जाए"
            hi="जंगल में मोर नाचा, किसने देखा?"
            en="A peacock danced in the forest — who saw it?"
            note="कबीर के दोहे में लोकप्रिय; आज भी हिन्दी मुहावरे का अंग।"/>
          <HiDefinition t={t} n={2}
            gloss="वह क्षेत्र जो आबादी से बाहर हो, निर्जन भूमि"
            hi="रात में जंगल अकेले पार करना समझदारी नहीं।"
            en="Crossing the wilderness alone at night is unwise."/>
          <HiDefinition t={t} n={3}
            gloss="(लाक्षणिक) उलझन, समस्याओं का पुलिंदा"
            hi="यह काम तो जंगल बन गया है।"
            en="This task has become an absolute thicket."/>

          <HiSectionLabel t={t} eyebrow="संबंधित" title="आसपास के शब्द"/>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 56 }}>
            {[
              ['पेड़', 'tree'], ['नदी', 'river'], ['पहाड़', 'mountain'],
              ['वन', 'forest'], ['खेत', 'field'], ['गाँव', 'village'], ['राह', 'path'],
            ].map(([h, e]) => (
              <span key={h} style={{
                fontFamily: HI.serif, fontSize: 19, padding: '8px 16px',
                border: `1px solid ${t.line}`, borderRadius: 999,
                background: t.surface, color: t.ink, cursor: 'pointer',
              }}>{h}
                <span style={{ color: t.inkMute, marginLeft: 8, fontStyle: 'italic', fontSize: 14, fontFamily: KD.sans }}>
                  {e}
                </span>
              </span>
            ))}
          </div>
        </div>

        <div>
          <HiSidebarCard t={t} title="व्युत्पत्ति">
            <p style={{ fontFamily: HI.serif, fontSize: 16, lineHeight: 1.7, color: t.ink, margin: 0 }}>
              फ़ारसी <em>जङ्गल</em> (jangal) से, जो स्वयं संस्कृत <em>जङ्गलः</em> ("शुष्क,
              बंजर") से लिया गया। मध्यकाल में हिन्दी में आया; अंग्रेज़ी "jungle" इसी का अपभ्रंश है।
            </p>
          </HiSidebarCard>

          <HiSidebarCard t={t} title="कहाँ बोला जाता है" mt={20}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10,
              fontFamily: HI.sans, fontSize: 14, color: t.ink }}>
              {[
                ['खड़ी बोली · दिल्ली', 94], ['अवधी · लखनऊ', 81],
                ['ब्रज · मथुरा', 76], ['भोजपुरी · वाराणसी', 68], ['कुमाऊँनी', 52],
              ].map(([place, pct]) => (
                <div key={place}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span>{place}</span>
                    <span style={{ fontFamily: KD.mono, fontSize: 12, color: t.inkMute }}>{pct}%</span>
                  </div>
                  <div style={{ height: 4, background: t.surfaceAlt, borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ width: pct + '%', height: '100%', background: KD.accent }}/>
                  </div>
                </div>
              ))}
            </div>
          </HiSidebarCard>

          <HiSidebarCard t={t} title="योगदानकर्ता" mt={20}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14,
              fontFamily: HI.sans, fontSize: 13, color: t.ink }}>
              {[
                ['आ', 'आनंदी मिश्रा', 'प्रविष्टि जोड़ी · १४ अप्रैल'],
                ['र', 'राजेश पांडे', 'ऑडियो जोड़ा · १८ अप्रैल'],
                ['मे', 'मेहर ख़ान', 'अर्थ ३ जोड़ा · २ मई'],
                ['सु', 'सुधा यादव', 'सत्यापित · ११ मई'],
              ].map(([init, name, action], i) => (
                <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: i % 2 ? KD.sageSoft : KD.accentSoft, color: '#FFF',
                    fontFamily: HI.serif, fontWeight: 600, fontSize: 13,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{init}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500 }}>{name}</div>
                    <div style={{ fontSize: 12, color: t.inkMute }}>{action}</div>
                  </div>
                </div>
              ))}
            </div>
          </HiSidebarCard>
        </div>
      </div>

      <HiWebFooter t={t}/>
    </div>
  );
}

function HiDefinition({ t, n, gloss, hi, en, note }) {
  return (
    <div style={{ marginBottom: 36, paddingBottom: 36, borderBottom: `1px solid ${t.line}` }}>
      <div style={{ display: 'flex', gap: 18 }}>
        <div style={{
          fontFamily: HI.serif, fontWeight: 500, fontSize: 28, color: KD.accent,
          lineHeight: 1, marginTop: 4,
        }}>{n}.</div>
        <div style={{ flex: 1 }}>
          <p style={{
            fontFamily: HI.serif, fontSize: 22, color: t.ink, lineHeight: 1.55,
            margin: 0, fontWeight: 400,
          }}>{gloss}</p>
          <div style={{
            marginTop: 18, padding: '14px 20px', background: t.surface,
            border: `1px solid ${t.line}`, borderRadius: 12, borderLeft: `3px solid ${KD.accent}`,
          }}>
            <p style={{
              fontFamily: HI.serif, fontSize: 20, color: t.ink, margin: 0, lineHeight: 1.55,
            }}>"{hi}"</p>
            <p style={{
              fontFamily: KD.sans, fontStyle: 'italic',
              fontSize: 14, color: t.inkSoft, marginTop: 6, marginBottom: 0,
            }}>{en}</p>
          </div>
          {note && (
            <p style={{
              fontFamily: HI.sans, fontSize: 13, color: t.inkMute, lineHeight: 1.7,
              marginTop: 14, marginBottom: 0,
            }}>— {note}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function HiSidebarCard({ t, title, children, mt = 0 }) {
  return (
    <div style={{
      background: t.surface, border: `1px solid ${t.line}`, borderRadius: 16,
      padding: 24, marginTop: mt,
    }}>
      <div style={{
        fontFamily: KD.mono, fontSize: 10.5, color: KD.accent,
        letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 16,
      }}>{title}</div>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Mobile shared
// ─────────────────────────────────────────────────────────────

function HiMobileSearchPill({ t }) {
  return (
    <div style={{
      background: t.surface, border: `1px solid ${t.line}`, borderRadius: 16,
      padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
      boxShadow: `0 1px 0 ${t.lineSoft}`,
    }}>
      <Icon.search size={18} color={t.inkSoft} weight={1.7}/>
      <span style={{ fontFamily: HI.sans, fontSize: 15, color: t.inkMute, flex: 1 }}>
        कोई शब्द खोजें…
      </span>
      <div style={{
        width: 28, height: 28, borderRadius: 8, background: KD.accent,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FBF7EE"
          strokeWidth="2.2" strokeLinecap="round">
          <path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>
        </svg>
      </div>
    </div>
  );
}

function HiBottomNav({ t, active, platform = 'ios' }) {
  const items = [
    { key: 'home', label: 'मुख्य', icon: Icon.home },
    { key: 'browse', label: 'खोज', icon: Icon.book },
    { key: 'add', label: 'जोड़ें', icon: Icon.plus, primary: true },
    { key: 'community', label: 'समुदाय', icon: Icon.community },
    { key: 'me', label: 'मैं', icon: Icon.user },
  ];
  return (
    <div style={{
      position: 'absolute', bottom: platform === 'ios' ? 34 : 0,
      left: 0, right: 0, padding: platform === 'ios' ? '8px 16px 0' : '0',
      pointerEvents: 'none',
    }}>
      <div style={{
        background: platform === 'ios'
          ? (t === KD.dark ? 'rgba(27,24,22,0.85)' : 'rgba(251,247,238,0.88)')
          : t.surface,
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${t.line}`,
        borderRadius: platform === 'ios' ? 24 : 0,
        padding: platform === 'ios' ? '10px 8px' : '8px 0 12px',
        display: 'flex', justifyContent: 'space-around', alignItems: 'center',
        pointerEvents: 'auto',
      }}>
        {items.map(it => {
          const isActive = active === it.key;
          if (it.primary) {
            return (
              <div key={it.key} style={{
                width: 48, height: 48, borderRadius: '50%', background: KD.accent,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 6px 16px rgba(199,82,42,0.40)',
                marginTop: platform === 'ios' ? -16 : -20,
              }}><Icon.plus size={22} color="#FBF7EE" weight={2.4}/></div>
            );
          }
          return (
            <div key={it.key} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              padding: '4px 8px',
            }}>
              <it.icon size={22} color={isActive ? KD.accent : t.inkSoft} weight={isActive ? 2 : 1.7}/>
              <span style={{
                fontFamily: HI.sans, fontSize: 11, fontWeight: 500,
                color: isActive ? KD.accent : t.inkSoft,
              }}>{it.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── iOS Home (Hindi) ─────────────────────────────────────────────────

function HiIOSHome({ dark = false }) {
  const t = dark ? KD.dark : KD.light;
  const wod = HI_WORDS[0];
  return (
    <div style={{ background: t.bg, color: t.ink, fontFamily: HI.sans,
      width: '100%', minHeight: '100%' }}>
      {/* Header */}
      <div style={{ padding: '8px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <HiKMark size={32}/>
            <span style={{
              fontFamily: HI.serif, fontWeight: 600, fontSize: 20, color: t.ink,
            }}>कोश<span style={{ color: KD.accent }}>.</span></span>
          </div>
          <div style={{
            width: 36, height: 36, borderRadius: '50%', background: KD.sageSoft,
            color: '#FFF', fontFamily: HI.serif, fontWeight: 600, fontSize: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>आ</div>
        </div>

        {/* Greeting */}
        <div style={{ marginTop: 28 }}>
          <div style={{
            fontFamily: KD.mono, fontSize: 10.5, color: KD.accent,
            letterSpacing: '0.2em', textTransform: 'uppercase',
          }}>१५ मई · गुरुवार</div>
          <h1 style={{
            fontFamily: HI.serif, fontWeight: 500, fontSize: 34, margin: '8px 0 0',
            color: t.ink, letterSpacing: '-0.005em', lineHeight: 1.2,
          }}>नमस्ते,<br/>
            <em style={{ color: KD.accent, fontStyle: 'normal' }}>आनंदी</em>।
          </h1>
          <p style={{
            fontFamily: HI.serif, fontSize: 16, color: t.inkSoft,
            margin: '8px 0 0', lineHeight: 1.6,
          }}>आज १२ शब्द आपकी समीक्षा की प्रतीक्षा में हैं।</p>
        </div>

        {/* Search */}
        <div style={{ marginTop: 24 }}><HiMobileSearchPill t={t}/></div>
      </div>

      {/* Word of the day */}
      <div style={{ padding: '28px 20px 0' }}>
        <HiMobileSectionHead t={t} eyebrow="आज का शब्द" right="सुनें"/>
        <div style={{
          background: KD.accent, borderRadius: 24, padding: 24,
          color: '#FBF7EE', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', right: -20, bottom: -90,
            fontFamily: HI.serif, fontSize: 280, fontWeight: 400,
            color: 'rgba(255,255,255,0.10)', lineHeight: 1,
          }}>च</div>
          <div style={{
            fontFamily: KD.mono, fontSize: 10.5, letterSpacing: '0.2em',
            textTransform: 'uppercase', opacity: 0.75,
          }}>{wod.pos}</div>
          <div style={{
            fontFamily: HI.serif, fontSize: 64, fontWeight: 500,
            letterSpacing: '-0.005em', lineHeight: 1.05, marginTop: 10,
          }}>{wod.word}</div>
          <div style={{
            fontFamily: HI.serif, fontStyle: 'italic', fontSize: 15,
            marginTop: 6, opacity: 0.85,
          }}>{wod.latin} · /{wod.ipa}/</div>
          <div style={{
            fontFamily: HI.serif, fontSize: 22, marginTop: 16,
            lineHeight: 1.4, position: 'relative', zIndex: 1,
          }}>{wod.glossHi}</div>

          <div style={{
            marginTop: 22, padding: '12px 16px',
            background: 'rgba(255,255,255,0.14)', borderRadius: 14,
            display: 'flex', alignItems: 'center', gap: 12,
            position: 'relative', zIndex: 1,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: '#FBF7EE', color: KD.accent,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4l14 8-14 8z"/></svg>
            </div>
            <div style={{ flex: 1, display: 'flex', gap: 2, height: 22, alignItems: 'center' }}>
              {Array.from({ length: 22 }).map((_, i) => (
                <div key={i} style={{
                  width: 2, height: 4 + Math.abs(Math.sin(i * 0.9)) * 16,
                  background: '#FBF7EE', opacity: i < 9 ? 1 : 0.4, borderRadius: 1,
                }}/>
              ))}
            </div>
            <span style={{ fontFamily: KD.mono, fontSize: 11, opacity: 0.8 }}>0:03</span>
          </div>
        </div>
      </div>

      {/* Themes */}
      <div style={{ padding: '32px 0 0 20px' }}>
        <div style={{ paddingRight: 20 }}>
          <HiMobileSectionHead t={t} eyebrow="विषय से खोजें" right="सब देखें"/>
        </div>
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4 }}>
          {[
            { label: 'प्रकृति', n: 612, color: '#5A7A5F', em: 'प' },
            { label: 'परिवार', n: 288, color: KD.accent, em: 'प' },
            { label: 'अंक', n: 48, color: '#7C5BA8', em: 'अ' },
            { label: 'त्यौहार', n: 156, color: '#B8843A', em: 'त' },
            { label: 'भोजन', n: 244, color: '#5E7493', em: 'भ' },
          ].map(th => (
            <div key={th.label} style={{
              minWidth: 132, padding: 18, borderRadius: 18,
              background: t.surface, border: `1px solid ${t.line}`,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, background: th.color,
                color: '#FBF7EE', fontFamily: HI.serif, fontWeight: 600, fontSize: 20,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{th.em}</div>
              <div style={{
                fontFamily: HI.serif, fontWeight: 500, fontSize: 20, color: t.ink,
                marginTop: 18, letterSpacing: '-0.005em',
              }}>{th.label}</div>
              <div style={{
                fontFamily: KD.mono, fontSize: 11, color: t.inkMute, marginTop: 4,
              }}>{th.n} शब्द</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recently added */}
      <div style={{ padding: '32px 20px 120px' }}>
        <HiMobileSectionHead t={t} eyebrow="अभी जोड़े गए"/>
        <div style={{
          background: t.surface, border: `1px solid ${t.line}`, borderRadius: 18,
          overflow: 'hidden',
        }}>
          {HI_WORDS.slice(3, 7).map((w, i) => (
            <div key={w.word} style={{
              padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14,
              borderTop: i === 0 ? 'none' : `1px solid ${t.line}`,
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{
                    fontFamily: HI.serif, fontWeight: 500, fontSize: 24,
                    color: t.ink, lineHeight: 1.1,
                  }}>{w.word}</span>
                  <span style={{ fontFamily: HI.serif, fontSize: 12, color: t.inkMute, fontStyle: 'italic' }}>
                    {w.latin}
                  </span>
                </div>
                <div style={{
                  fontFamily: HI.serif, fontSize: 15, color: t.inkSoft, marginTop: 4,
                }}>{w.gloss}</div>
              </div>
              <div style={{
                fontFamily: KD.mono, fontSize: 11, color: t.inkMute,
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                <Icon.heart size={12} color={KD.accent} fill={KD.accent}/> {w.likes}
              </div>
            </div>
          ))}
        </div>
      </div>

      <HiBottomNav t={t} active="home" platform="ios"/>
    </div>
  );
}

function HiMobileSectionHead({ t, eyebrow, right }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      marginBottom: 14,
    }}>
      <div style={{
        fontFamily: KD.mono, fontSize: 10.5, color: t.inkSoft,
        letterSpacing: '0.2em', textTransform: 'uppercase',
      }}>{eyebrow}</div>
      {right && (
        <span style={{
          fontFamily: HI.sans, fontSize: 12, color: KD.accent, fontWeight: 500,
        }}>{right}</span>
      )}
    </div>
  );
}

// ─── iOS Word Detail (Hindi) ──────────────────────────────────────────

function HiIOSWordDetail({ dark = false }) {
  const t = dark ? KD.dark : KD.light;
  const w = HI_WORDS[1]; // जंगल
  return (
    <div style={{ background: t.bg, color: t.ink, fontFamily: HI.sans,
      width: '100%', minHeight: '100%' }}>
      {/* Header */}
      <div style={{
        padding: '4px 20px 0', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%', background: t.surface,
          border: `1px solid ${t.line}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}><Icon.back size={17} color={t.ink} weight={2}/></div>
        <div style={{
          fontFamily: KD.mono, fontSize: 10.5, color: t.inkMute,
          letterSpacing: '0.16em',
        }}>ज</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%', background: t.surface,
            border: `1px solid ${t.line}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}><Icon.bookmark size={16} color={t.ink}/></div>
          <div style={{
            width: 36, height: 36, borderRadius: '50%', background: t.surface,
            border: `1px solid ${t.line}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}><Icon.share size={16} color={t.ink}/></div>
        </div>
      </div>

      {/* Big word */}
      <div style={{ padding: '40px 20px 0' }}>
        <div style={{
          fontFamily: HI.serif, fontWeight: 500, fontSize: 86,
          color: t.ink, letterSpacing: '-0.005em', lineHeight: 1.05,
        }}>{w.word}</div>
        <div style={{
          marginTop: 14, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
        }}>
          <span style={{ fontFamily: HI.serif, fontSize: 15, color: t.inkSoft, fontStyle: 'italic' }}>
            {w.latin}
          </span>
          <span style={{ fontFamily: KD.mono, fontSize: 13, color: t.inkMute }}>/{w.ipa}/</span>
          <span style={{
            padding: '3px 10px', borderRadius: 999, fontSize: 11,
            fontFamily: HI.sans, fontWeight: 500,
            background: 'rgba(199,82,42,0.10)', color: KD.accent,
          }}>{w.pos}</span>
          <span style={{
            fontFamily: HI.sans, fontSize: 12, color: t.inkMute,
            display: 'flex', alignItems: 'center', gap: 5,
          }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: KD.sage }}/>
            सत्यापित
          </span>
        </div>
        <p style={{
          fontFamily: HI.serif, fontSize: 21, color: t.ink, lineHeight: 1.55,
          marginTop: 20, marginBottom: 0, fontWeight: 400,
        }}>घना वन; वह स्थान जहाँ <span style={{ color: KD.accent }}>पेड़</span> इतने सघन हों।</p>
      </div>

      {/* Audio */}
      <div style={{ padding: '24px 20px 0' }}>
        <div style={{
          background: t.surface, border: `1px solid ${t.line}`, borderRadius: 18,
          padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <button style={{
            width: 44, height: 44, borderRadius: '50%', border: 'none',
            background: KD.accent, color: '#FBF7EE',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4l14 8-14 8z"/></svg>
          </button>
          <div style={{ flex: 1, display: 'flex', gap: 2, height: 28, alignItems: 'center' }}>
            {Array.from({ length: 32 }).map((_, i) => (
              <div key={i} style={{
                width: 2.5, height: 4 + Math.abs(Math.sin(i * 1.2)) * 22,
                background: i < 12 ? KD.accent : t.line, borderRadius: 1,
              }}/>
            ))}
          </div>
          <span style={{ fontFamily: KD.mono, fontSize: 11, color: t.inkMute }}>0:03</span>
        </div>
        <div style={{
          marginTop: 10, fontFamily: HI.sans, fontSize: 12, color: t.inkMute,
        }}>खड़ी बोली · रिकॉर्ड किया आनंदी मिश्रा</div>
      </div>

      {/* Definitions */}
      <div style={{ padding: '28px 20px 0' }}>
        <HiMobileSectionHead t={t} eyebrow="अर्थ"/>
        {[
          { gloss: 'घना वन; पेड़ों का गुच्छा', hi: 'जंगल में मोर नाचा, किसने देखा?', en: 'A peacock danced in the forest.' },
          { gloss: 'निर्जन भूमि, आबादी से बाहर', hi: 'रात में जंगल अकेले पार करना समझदारी नहीं।', en: "Don't cross the wild alone at night." },
          { gloss: '(लाक्षणिक) उलझन, समस्याओं का पुलिंदा', hi: 'यह काम तो जंगल बन गया है।', en: 'This task has become a thicket.' },
        ].map((d, i) => (
          <div key={i} style={{
            background: t.surface, border: `1px solid ${t.line}`, borderRadius: 16,
            padding: 18, marginBottom: 10, borderLeft: `3px solid ${KD.accent}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <span style={{
                fontFamily: HI.serif, fontWeight: 500, fontSize: 18,
                color: KD.accent, lineHeight: 1,
              }}>{i + 1}.</span>
              <span style={{
                fontFamily: HI.serif, fontSize: 18, color: t.ink, lineHeight: 1.55,
              }}>{d.gloss}</span>
            </div>
            <p style={{
              fontFamily: HI.serif, fontSize: 16, color: t.inkSoft,
              marginTop: 10, marginBottom: 0, lineHeight: 1.6,
            }}>"{d.hi}"</p>
            <p style={{
              fontFamily: KD.sans, fontSize: 12.5, color: t.inkMute, fontStyle: 'italic',
              marginTop: 4, marginBottom: 0,
            }}>{d.en}</p>
          </div>
        ))}
      </div>

      {/* Related */}
      <div style={{ padding: '20px 20px 0' }}>
        <HiMobileSectionHead t={t} eyebrow="संबंधित शब्द"/>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {['पेड़', 'नदी', 'पहाड़', 'वन', 'खेत', 'गाँव'].map(r => (
            <span key={r} style={{
              fontFamily: HI.serif, fontSize: 17, padding: '7px 14px',
              border: `1px solid ${t.line}`, borderRadius: 999,
              background: t.surface, color: t.ink,
            }}>{r}</span>
          ))}
        </div>
      </div>

      {/* Contributor */}
      <div style={{ padding: '24px 20px 140px' }}>
        <div style={{
          background: t.surfaceAlt, borderRadius: 16, padding: '14px 16px',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%', background: KD.sageSoft,
            color: '#FFF', fontFamily: HI.serif, fontWeight: 600, fontSize: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>आ</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: HI.sans, fontSize: 13, fontWeight: 500, color: t.ink }}>
              आनंदी मिश्रा व ५ अन्य
            </div>
            <div style={{ fontFamily: HI.sans, fontSize: 12, color: t.inkMute }}>
              अंतिम अद्यतन: ११ मई २०२६
            </div>
          </div>
          <Icon.arrow size={14} color={t.inkSoft}/>
        </div>
      </div>

      <HiBottomNav t={t} active="browse" platform="ios"/>
    </div>
  );
}

// ─── Android Home (Hindi) ─────────────────────────────────────────────

function HiAndroidHome({ dark = false }) {
  const t = dark ? KD.dark : KD.light;
  const wod = HI_WORDS[2]; // माँ
  return (
    <div style={{ background: t.bg, color: t.ink, fontFamily: HI.sans,
      width: '100%', minHeight: '100%' }}>
      {/* Top app bar */}
      <div style={{
        padding: '12px 20px 0', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Icon.menu size={24} color={t.ink} weight={1.8}/>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <HiKMark size={28}/>
          <span style={{
            fontFamily: HI.serif, fontWeight: 600, fontSize: 18, color: t.ink,
          }}>कोश<span style={{ color: KD.accent }}>.</span></span>
        </div>
        <div style={{
          width: 36, height: 36, borderRadius: '50%', background: KD.sageSoft,
          color: '#FFF', fontFamily: HI.serif, fontWeight: 600, fontSize: 14,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>आ</div>
      </div>

      {/* Greeting */}
      <div style={{ padding: '20px 20px 0' }}>
        <h1 style={{
          fontFamily: HI.serif, fontWeight: 500, fontSize: 32,
          color: t.ink, letterSpacing: '-0.005em', lineHeight: 1.25, margin: 0,
        }}>आज आप कौन सा<br/>
          <em style={{ color: KD.accent, fontStyle: 'normal' }}>शब्द</em> सीखेंगे?
        </h1>
        <div style={{ marginTop: 20 }}><HiMobileSearchPill t={t}/></div>
      </div>

      {/* Card grid */}
      <div style={{
        padding: '24px 20px 0', display: 'grid',
        gridTemplateColumns: '1fr 1fr', gap: 10,
      }}>
        <div style={{
          background: KD.accent, color: '#FBF7EE', borderRadius: 28,
          padding: 18, gridRow: 'span 2', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            fontFamily: KD.mono, fontSize: 10, letterSpacing: '0.2em',
            textTransform: 'uppercase', opacity: 0.75,
          }}>शब्द · १५ मई</div>
          <div style={{
            fontFamily: HI.serif, fontSize: 56, fontWeight: 500,
            letterSpacing: '-0.005em', lineHeight: 1.05, marginTop: 14,
          }}>{wod.word}</div>
          <div style={{
            fontFamily: HI.serif, fontStyle: 'italic', fontSize: 13,
            marginTop: 6, opacity: 0.8,
          }}>{wod.latin} · /{wod.ipa}/</div>
          <div style={{
            fontFamily: HI.serif, fontSize: 18, marginTop: 14, lineHeight: 1.45,
          }}>{wod.glossHi}</div>
          <div style={{
            position: 'absolute', bottom: 14, right: 14,
            width: 40, height: 40, borderRadius: '50%', background: '#FBF7EE',
            color: KD.accent, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4l14 8-14 8z"/></svg>
          </div>
        </div>

        <div style={{
          background: KD.sage, color: '#FBF7EE', borderRadius: 24,
          padding: 16, minHeight: 96,
        }}>
          <Icon.community size={22} color="#FBF7EE" weight={1.8}/>
          <div style={{ fontFamily: HI.serif, fontSize: 17, fontWeight: 500, marginTop: 12, lineHeight: 1.35 }}>
            १२ शब्दों की<br/>समीक्षा बाक़ी
          </div>
        </div>

        <div style={{
          background: t.surfaceAlt, color: t.ink, borderRadius: 24,
          padding: 16, minHeight: 96,
        }}>
          <Icon.book size={22} color={t.ink} weight={1.8}/>
          <div style={{ fontFamily: HI.serif, fontSize: 17, fontWeight: 500, marginTop: 12, lineHeight: 1.35 }}>
            वर्णमाला<br/>अ से ह तक
          </div>
        </div>
      </div>

      {/* Themes */}
      <div style={{ padding: '28px 0 0 20px' }}>
        <div style={{ paddingRight: 20 }}>
          <HiMobileSectionHead t={t} eyebrow="विषय के साथ"/>
        </div>
        <div style={{
          display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4, paddingRight: 20,
        }}>
          {[
            { l: 'प्रकृति', n: 612, c: '#5A7A5F' },
            { l: 'परिवार', n: 288, c: KD.accent },
            { l: 'अंक', n: 48, c: '#7C5BA8' },
            { l: 'भोजन', n: 244, c: '#B8843A' },
          ].map(th => (
            <div key={th.l} style={{
              minWidth: 116, padding: '14px 14px 16px', borderRadius: 20,
              background: t.surface, border: `1px solid ${t.line}`,
            }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: th.c }}/>
              <div style={{
                fontFamily: HI.serif, fontWeight: 500, fontSize: 17,
                color: t.ink, marginTop: 14,
              }}>{th.l}</div>
              <div style={{
                fontFamily: KD.mono, fontSize: 10.5, color: t.inkMute, marginTop: 4,
              }}>{th.n} शब्द</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recently added */}
      <div style={{ padding: '28px 20px 130px' }}>
        <HiMobileSectionHead t={t} eyebrow="अभी जोड़े गए"/>
        {HI_WORDS.slice(3, 7).map((w, i) => (
          <div key={w.word} style={{
            display: 'flex', alignItems: 'center', gap: 14, padding: '14px 14px',
            background: t.surface, borderRadius: 16, marginBottom: 6,
            border: `1px solid ${t.lineSoft}`,
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: i % 2 ? KD.sageSoft : KD.accentSoft, color: '#FFF',
              fontFamily: HI.serif, fontWeight: 600, fontSize: 20,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{w.word[0]}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{
                  fontFamily: HI.serif, fontWeight: 500, fontSize: 21,
                  color: t.ink, lineHeight: 1.15,
                }}>{w.word}</span>
                <span style={{ fontFamily: HI.serif, fontSize: 12, color: t.inkMute, fontStyle: 'italic' }}>
                  {w.latin}
                </span>
              </div>
              <div style={{
                fontFamily: HI.serif, fontSize: 14, color: t.inkSoft, marginTop: 2,
              }}>{w.gloss}</div>
            </div>
            <Icon.arrow size={16} color={t.inkMute}/>
          </div>
        ))}
      </div>

      <HiBottomNav t={t} active="home" platform="android"/>
    </div>
  );
}

// ─── Android Word Detail (Hindi) ──────────────────────────────────────

function HiAndroidWordDetail({ dark = false }) {
  const t = dark ? KD.dark : KD.light;
  const w = HI_WORDS[0]; // चाँद
  return (
    <div style={{ background: t.bg, color: t.ink, fontFamily: HI.sans,
      width: '100%', minHeight: '100%' }}>
      <div style={{
        padding: '12px 20px 0', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Icon.back size={22} color={t.ink} weight={1.8}/>
        <div style={{ display: 'flex', gap: 18 }}>
          <Icon.bookmark size={20} color={t.ink}/>
          <Icon.share size={20} color={t.ink}/>
          <Icon.more size={20} color={t.ink}/>
        </div>
      </div>

      <div style={{
        margin: '16px 16px 0', borderRadius: 28, background: KD.accent,
        color: '#FBF7EE', padding: '28px 22px 30px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', right: -30, bottom: -110,
          fontFamily: HI.serif, fontSize: 320, fontWeight: 400,
          color: 'rgba(255,255,255,0.10)', lineHeight: 1,
        }}>च</div>

        <div style={{
          fontFamily: KD.mono, fontSize: 10.5, letterSpacing: '0.2em',
          textTransform: 'uppercase', opacity: 0.75,
        }}>{w.pos} · प्रविष्टि #412</div>
        <div style={{
          fontFamily: HI.serif, fontWeight: 500, fontSize: 76,
          letterSpacing: '-0.005em', lineHeight: 1.02, marginTop: 10,
        }}>{w.word}</div>
        <div style={{
          fontFamily: HI.serif, fontStyle: 'italic', fontSize: 16,
          marginTop: 8, opacity: 0.85,
        }}>{w.latin} · /{w.ipa}/</div>

        <div style={{
          marginTop: 20, padding: '12px 14px',
          background: 'rgba(255,255,255,0.16)',
          borderRadius: 14, display: 'flex', alignItems: 'center', gap: 12,
          position: 'relative', zIndex: 1,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: '#FBF7EE', color: KD.accent,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4l14 8-14 8z"/></svg>
          </div>
          <div style={{ flex: 1, display: 'flex', gap: 2, height: 22, alignItems: 'center' }}>
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} style={{
                width: 2, height: 4 + Math.abs(Math.sin(i * 1.1)) * 16,
                background: '#FBF7EE', opacity: i < 10 ? 1 : 0.4, borderRadius: 1,
              }}/>
            ))}
          </div>
          <span style={{ fontFamily: KD.mono, fontSize: 11, opacity: 0.8 }}>0:03</span>
        </div>
      </div>

      <div style={{ padding: '24px 20px 0' }}>
        <div style={{
          fontFamily: KD.mono, fontSize: 10.5, color: t.inkSoft,
          letterSpacing: '0.2em', textTransform: 'uppercase',
        }}>अर्थ</div>
        <p style={{
          fontFamily: HI.serif, fontSize: 22, color: t.ink, lineHeight: 1.5,
          marginTop: 8, marginBottom: 0,
        }}>आकाश का रात्रिचर — कविता और लोकगीतों का चिर साथी।</p>
      </div>

      <div style={{ padding: '20px 20px 0' }}>
        <div style={{
          background: t.surface, borderRadius: 18, padding: '18px 18px',
          borderLeft: `3px solid ${KD.accent}`, border: `1px solid ${t.line}`,
        }}>
          <div style={{
            fontFamily: KD.mono, fontSize: 10, color: KD.accent,
            letterSpacing: '0.2em', textTransform: 'uppercase',
          }}>उदाहरण</div>
          <p style={{
            fontFamily: HI.serif, fontSize: 19, color: t.ink, margin: '10px 0 0', lineHeight: 1.55,
          }}>"चाँद आज पूर्ण है, गाँव चाँदनी से नहाया हुआ।"</p>
          <p style={{
            fontFamily: KD.sans, fontStyle: 'italic',
            fontSize: 13, color: t.inkSoft, marginTop: 6, marginBottom: 0,
          }}>The moon is full tonight; the village is bathed in its light.</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ padding: '24px 20px 0' }}>
        <div style={{ display: 'flex', gap: 18, borderBottom: `1px solid ${t.line}` }}>
          {['अर्थ', 'व्युत्पत्ति', 'कहाँ बोला', 'संबंधित'].map((tab, i) => (
            <div key={tab} style={{
              padding: '10px 0', position: 'relative',
              fontFamily: HI.sans, fontSize: 13, fontWeight: 500,
              color: i === 1 ? KD.accent : t.inkSoft,
            }}>
              {tab}
              {i === 1 && (
                <div style={{
                  position: 'absolute', bottom: -1, left: 0, right: 0,
                  height: 2.5, background: KD.accent, borderRadius: 2,
                }}/>
              )}
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '18px 20px 0' }}>
        <p style={{
          fontFamily: HI.serif, fontSize: 16, color: t.ink, lineHeight: 1.75,
          margin: 0,
        }}>संस्कृत <em>चन्द्र</em> से, "जो चमकता है।" प्राकृत में <em>चंदो</em> होता हुआ
          आधुनिक हिन्दी में <em>चाँद</em>। उर्दू में भी इसी रूप में प्रचलित।</p>
      </div>

      <div style={{ padding: '24px 20px 130px' }}>
        <div style={{
          background: t.surfaceAlt, borderRadius: 16, padding: '14px 16px',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{ display: 'flex' }}>
            {[KD.accentSoft, KD.sageSoft, '#7C5BA8'].map((c, i) => (
              <div key={i} style={{
                width: 28, height: 28, borderRadius: '50%', background: c,
                border: `2px solid ${t.bg}`, marginLeft: i ? -8 : 0,
              }}/>
            ))}
          </div>
          <div style={{ flex: 1, fontFamily: HI.sans, fontSize: 13, color: t.ink }}>
            <b>४१२ लोगों</b> ने पसंद किया
          </div>
          <Icon.heart size={18} color={KD.accent}/>
        </div>
      </div>

      <HiBottomNav t={t} active="browse" platform="android"/>
    </div>
  );
}

Object.assign(window, {
  HiWebHome, HiWebWordDetail, HiIOSHome, HiIOSWordDetail,
  HiAndroidHome, HiAndroidWordDetail,
});
