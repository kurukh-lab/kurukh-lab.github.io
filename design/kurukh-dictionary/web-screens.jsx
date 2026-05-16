// Web screens — both light and dark themed via a theme param.
// Renders inside <BrowserWindow> on the design canvas.

const { KD, Icon, SAMPLE_WORDS } = window;

// ─── Shared web components ─────────────────────────────────────────────

function WebNav({ t, active = 'Home' }) {
  const items = ['Home', 'Browse', 'Contribute', 'Community', 'Saved'];
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '22px 56px', borderBottom: `1px solid ${t.lineSoft}`,
      background: t.bg, position: 'sticky', top: 0, zIndex: 5,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Wordmark — a stylized "K" mark + serif wordmark */}
        <KMark color={KD.accent} />
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
          <span style={{
            fontFamily: KD.serif, fontWeight: 600, fontSize: 22,
            color: t.ink, letterSpacing: '-0.01em',
          }}>Kurukh<span style={{ color: KD.accent }}>.</span></span>
          <span style={{
            fontFamily: KD.sans, fontSize: 10.5, color: t.inkMute,
            letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: 3,
          }}>A living dictionary</span>
        </div>
      </div>

      <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {items.map(label => (
          <a key={label} style={{
            fontFamily: KD.sans, fontSize: 14, fontWeight: 500,
            padding: '8px 14px', borderRadius: 999, cursor: 'pointer',
            color: active === label ? t.ink : t.inkSoft,
            background: active === label ? t.surfaceAlt : 'transparent',
          }}>{label}</a>
        ))}
      </nav>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <ThemeToggle dark={t === KD.dark} />
        <button style={{
          fontFamily: KD.sans, fontSize: 13, fontWeight: 600,
          padding: '9px 16px', borderRadius: 999, border: 'none', cursor: 'pointer',
          background: KD.accent, color: '#FBF7EE',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <Icon.plus size={14} weight={2.2} /> Add a word
        </button>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: KD.sageSoft, color: '#FFF', fontFamily: KD.serif,
          fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center',
          justifyContent: 'center',
        }}>RT</div>
      </div>
    </div>
  );
}

// "K" mark — a simple geometric monogram (a serif K with a small accent dot)
function KMark({ size = 38, color = KD.accent }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect x="0" y="0" width="40" height="40" rx="9" fill={color}/>
      <path d="M12 9 V31 M12 20 L24 9 M12 20 L26 31"
        stroke="#FBF7EE" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="32" cy="11" r="2.2" fill="#FBF7EE"/>
    </svg>
  );
}

function ThemeToggle({ dark }) {
  const t = dark ? KD.dark : KD.light;
  return (
    <div style={{
      width: 56, height: 30, borderRadius: 999,
      background: t.surfaceAlt, position: 'relative', cursor: 'pointer',
      display: 'flex', alignItems: 'center', padding: 3, boxSizing: 'border-box',
    }}>
      <div style={{
        position: 'absolute', left: dark ? 28 : 3, top: 3,
        width: 24, height: 24, borderRadius: '50%',
        background: t.surface, display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: t.ink, boxShadow: '0 1px 3px rgba(0,0,0,0.15)', transition: 'left .2s',
      }}>
        {dark ? <Icon.moon size={13} weight={2} /> : <Icon.sun size={13} weight={2} />}
      </div>
    </div>
  );
}

function SearchBar({ t, large = false }) {
  return (
    <div style={{ width: '100%' }}>
      <div style={{
        background: t.surface, border: `1px solid ${t.line}`, borderRadius: 14,
        padding: large ? '20px 24px' : '14px 20px',
        display: 'flex', alignItems: 'center', gap: 16,
        boxShadow: `0 1px 0 ${t.lineSoft}, 0 12px 40px -20px rgba(28,24,20,0.18)`,
      }}>
        <Icon.search size={large ? 22 : 18} color={t.inkSoft} weight={1.6}/>
        <input placeholder="Search a word in Kurukh, English or Hindi…"
          style={{
            flex: 1, border: 'none', outline: 'none', background: 'transparent',
            fontFamily: KD.sans, fontSize: large ? 19 : 15, color: t.ink,
          }} />
        <kbd style={{
          fontFamily: KD.mono, fontSize: 11, color: t.inkMute,
          padding: '4px 8px', border: `1px solid ${t.line}`, borderRadius: 6,
          background: t.surfaceAlt,
        }}>⌘ K</kbd>
      </div>
      {large && (
        <div style={{
          display: 'flex', gap: 16, marginTop: 16, paddingLeft: 4,
          fontFamily: KD.sans, fontSize: 13, color: t.inkMute,
        }}>
          <span>Try:</span>
          {['chando', 'forest', 'mother', 'numbers'].map(q => (
            <span key={q} style={{
              padding: '4px 12px', borderRadius: 999,
              border: `1px solid ${t.line}`, background: t.surface,
              color: t.inkSoft, cursor: 'pointer',
            }}>{q}</span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Home page ────────────────────────────────────────────────────────

function WebHome({ dark = false }) {
  const t = dark ? KD.dark : KD.light;
  return (
    <div style={{ background: t.bg, color: t.ink, fontFamily: KD.sans, minHeight: '100%' }}>
      <WebNav t={t} active="Home" />

      {/* Hero */}
      <div style={{ padding: '88px 56px 56px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{
          fontFamily: KD.mono, fontSize: 11.5, color: KD.accent,
          letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 18,
        }}>Kuṛuk · ku.ɖukʰ · the people's word</div>
        <h1 style={{
          fontFamily: KD.serif, fontWeight: 500, fontSize: 96, lineHeight: 1.02,
          letterSpacing: '-0.025em', margin: 0, color: t.ink,
        }}>
          A dictionary<br/>
          <em style={{ fontStyle: 'italic', color: KD.accent, fontWeight: 400 }}>tended</em> by its speakers.
        </h1>
        <p style={{
          fontFamily: KD.serif, fontSize: 22, lineHeight: 1.5, color: t.inkSoft,
          maxWidth: 620, marginTop: 28, marginBottom: 48, fontWeight: 400,
        }}>
          A community archive of <em>Kuṛuk</em> — the Oraon tongue spoken across
          Jharkhand, Chhattisgarh and the Tarai foothills. Read, listen, contribute.
        </p>

        <div style={{ maxWidth: 720 }}><SearchBar t={t} large /></div>

        {/* Live stats line */}
        <div style={{
          marginTop: 48, display: 'flex', gap: 44, fontFamily: KD.sans,
          paddingTop: 32, borderTop: `1px solid ${t.line}`,
        }}>
          {[
            ['9,427', 'words'],
            ['2,108', 'entries with audio'],
            ['318', 'contributors'],
            ['12', 'dialect regions'],
          ].map(([n, l]) => (
            <div key={l}>
              <div style={{ fontFamily: KD.serif, fontSize: 32, fontWeight: 500, color: t.ink, letterSpacing: '-0.02em' }}>{n}</div>
              <div style={{ fontSize: 12, color: t.inkMute, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Word of the day — full featured card */}
      <div style={{ padding: '24px 56px 56px', maxWidth: 1200, margin: '0 auto' }}>
        <SectionLabel t={t} eyebrow="Today · 15 May" title="Word of the day" />
        <WordOfDayCard t={t} word={SAMPLE_WORDS[0]} />
      </div>

      {/* Browse by alphabet */}
      <div style={{ padding: '24px 56px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <SectionLabel t={t} eyebrow="A — Z" title="Browse the lexicon"
          right={<span style={{ fontFamily: KD.sans, fontSize: 13, color: t.inkSoft }}>9,427 entries</span>} />
        <AlphabetRibbon t={t} />
      </div>

      {/* Two columns */}
      <div style={{ padding: '24px 56px 96px', maxWidth: 1200, margin: '0 auto',
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56 }}>
        <div>
          <SectionLabel t={t} eyebrow="Recently added" title="New to the archive" />
          <WordList t={t} words={SAMPLE_WORDS.slice(2, 6)} />
        </div>
        <div>
          <SectionLabel t={t} eyebrow="Most loved" title="The community's favorites" />
          <WordList t={t} words={[SAMPLE_WORDS[2], SAMPLE_WORDS[0], SAMPLE_WORDS[7], SAMPLE_WORDS[1]]} />
        </div>
      </div>

      <WebFooter t={t} />
    </div>
  );
}

function SectionLabel({ t, eyebrow, title, right }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div style={{
            fontFamily: KD.mono, fontSize: 11, color: KD.accent,
            letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 8,
          }}>{eyebrow}</div>
          <h2 style={{
            fontFamily: KD.serif, fontWeight: 500, fontSize: 36, color: t.ink,
            margin: 0, letterSpacing: '-0.02em',
          }}>{title}</h2>
        </div>
        {right}
      </div>
    </div>
  );
}

function WordOfDayCard({ t, word }) {
  return (
    <div style={{
      background: t.surface, border: `1px solid ${t.line}`, borderRadius: 20,
      padding: 48, display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 56,
      boxShadow: `0 1px 0 ${t.lineSoft}`,
    }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 18, flexWrap: 'wrap' }}>
          <h3 style={{
            fontFamily: KD.serif, fontWeight: 500, fontSize: 88, margin: 0,
            color: t.ink, letterSpacing: '-0.03em', lineHeight: 1,
          }}>{word.word}</h3>
          <button style={{
            border: 'none', background: t.surfaceAlt, color: t.ink,
            width: 44, height: 44, borderRadius: '50%', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}><Icon.speaker size={20} weight={1.6}/></button>
        </div>
        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontFamily: KD.mono, fontSize: 15, color: t.inkSoft }}>
            /{word.ipa}/
          </span>
          <span style={{
            padding: '3px 10px', borderRadius: 999, fontSize: 11,
            fontFamily: KD.sans, fontWeight: 500,
            background: 'rgba(199,82,42,0.10)', color: KD.accent, letterSpacing: '0.04em',
          }}>{word.pos}</span>
        </div>

        <p style={{
          fontFamily: KD.serif, fontSize: 26, color: t.ink, fontStyle: 'italic',
          fontWeight: 400, marginTop: 28, marginBottom: 0, lineHeight: 1.35,
        }}>{word.gloss}</p>
        <p style={{
          fontFamily: KD.sans, fontSize: 14, color: t.inkSoft, lineHeight: 1.6,
          marginTop: 16, maxWidth: 420,
        }}>The night-traveller. Used in lullabies and harvest songs across the Sadan belt;
          cognate forms occur in Munda and Dravidian families.</p>

        <div style={{ display: 'flex', gap: 8, marginTop: 28 }}>
          <button style={{
            border: 'none', background: t.ink, color: t.bg, padding: '11px 18px',
            borderRadius: 10, fontFamily: KD.sans, fontWeight: 500, fontSize: 14,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
          }}>Read full entry <Icon.arrow size={14} color={t.bg}/></button>
          <button style={{
            border: `1px solid ${t.line}`, background: 'transparent', color: t.ink,
            padding: '11px 14px', borderRadius: 10, fontFamily: KD.sans,
            fontWeight: 500, fontSize: 14, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 8,
          }}><Icon.bookmark size={14}/> Save</button>
        </div>
      </div>

      {/* Example sentence in serif quote style */}
      <div style={{
        borderLeft: `2px solid ${KD.accent}`, paddingLeft: 28,
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
      }}>
        <div style={{
          fontFamily: KD.mono, fontSize: 11, color: KD.accent,
          letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 18,
        }}>In a sentence</div>
        <p style={{
          fontFamily: KD.serif, fontSize: 32, lineHeight: 1.35, color: t.ink,
          fontStyle: 'italic', margin: 0, fontWeight: 400, letterSpacing: '-0.005em',
        }}>“{word.examples[0].ku}”</p>
        <p style={{
          fontFamily: KD.sans, fontSize: 15, color: t.inkSoft,
          marginTop: 16, marginBottom: 0, lineHeight: 1.5,
        }}>{word.examples[0].en}</p>
        <div style={{
          marginTop: 32, display: 'flex', alignItems: 'center', gap: 12,
          fontFamily: KD.sans, fontSize: 13, color: t.inkMute,
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%', background: KD.sageSoft, color: '#FFF',
            fontFamily: KD.serif, fontWeight: 600, fontSize: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>RT</div>
          Recorded by <span style={{ color: t.inkSoft, fontWeight: 500 }}>Rohini Tirkey</span>
          · Lohardaga dialect
        </div>
      </div>
    </div>
  );
}

function AlphabetRibbon({ t }) {
  const letters = ['A', 'Ā', 'B', 'C', 'D', 'E', 'Ē', 'G', 'H', 'I', 'Ī', 'J',
    'K', 'Kh', 'L', 'M', 'N', 'Ṅ', 'O', 'P', 'R', 'S', 'T', 'U', 'Ū', 'X'];
  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap', gap: 8,
      padding: 24, background: t.surface, border: `1px solid ${t.line}`,
      borderRadius: 16,
    }}>
      {letters.map((l, i) => (
        <div key={l} style={{
          minWidth: 48, height: 48, borderRadius: 10, cursor: 'pointer',
          background: i === 2 ? KD.accent : t.surfaceAlt,
          color: i === 2 ? '#FBF7EE' : t.ink,
          fontFamily: KD.serif, fontWeight: 500, fontSize: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flex: '1 0 48px',
        }}>{l}</div>
      ))}
    </div>
  );
}

function WordList({ t, words }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {words.map((w, i) => (
        <div key={w.word + i} style={{
          display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 16,
          alignItems: 'baseline', padding: '18px 0',
          borderTop: i === 0 ? 'none' : `1px solid ${t.line}`, cursor: 'pointer',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
              <span style={{
                fontFamily: KD.serif, fontWeight: 500, fontSize: 26,
                color: t.ink, letterSpacing: '-0.01em',
              }}>{w.word}</span>
              <span style={{ fontFamily: KD.mono, fontSize: 12, color: t.inkMute }}>
                /{w.ipa}/
              </span>
            </div>
            <div style={{
              fontFamily: KD.serif, fontSize: 16, color: t.inkSoft,
              fontStyle: 'italic', marginTop: 2,
            }}>{w.gloss}</div>
          </div>
          <div style={{
            fontFamily: KD.sans, fontSize: 11, color: t.inkMute,
            padding: '3px 8px', borderRadius: 999, border: `1px solid ${t.line}`,
            textTransform: 'lowercase',
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

function WebFooter({ t }) {
  return (
    <div style={{
      borderTop: `1px solid ${t.line}`, padding: '56px 56px 48px',
      background: t.surface,
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto', display: 'grid',
        gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48,
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <KMark size={32} />
            <span style={{
              fontFamily: KD.serif, fontWeight: 600, fontSize: 20, color: t.ink,
            }}>Kurukh<span style={{ color: KD.accent }}>.</span></span>
          </div>
          <p style={{
            fontFamily: KD.serif, fontSize: 15, color: t.inkSoft,
            lineHeight: 1.6, maxWidth: 360, marginTop: 16,
          }}>An open dictionary stewarded by the Kurukh-speaking community.
            Free, ad-free, and built to outlive any one of us.</p>
        </div>
        {[
          ['Explore', ['Browse A–Z', 'Themes', 'Phrasebook', 'Audio archive']],
          ['Contribute', ['Add a word', 'Record audio', 'Review queue', 'Editor guide']],
          ['About', ['Project', 'Team', 'Privacy', 'Contact']],
        ].map(([h, items]) => (
          <div key={h}>
            <div style={{
              fontFamily: KD.mono, fontSize: 10.5, color: t.inkMute,
              letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 16,
            }}>{h}</div>
            {items.map(x => (
              <div key={x} style={{
                fontFamily: KD.sans, fontSize: 14, color: t.inkSoft,
                marginBottom: 10, cursor: 'pointer',
              }}>{x}</div>
            ))}
          </div>
        ))}
      </div>
      <div style={{
        maxWidth: 1200, margin: '48px auto 0', paddingTop: 24,
        borderTop: `1px solid ${t.line}`, display: 'flex',
        justifyContent: 'space-between', fontFamily: KD.sans,
        fontSize: 12, color: t.inkMute,
      }}>
        <span>© 2026 Kurukh Dictionary Collective · CC BY-SA 4.0</span>
        <span>Made with care in Ranchi, Jharkhand</span>
      </div>
    </div>
  );
}

// ─── Word detail page ─────────────────────────────────────────────────

function WebWordDetail({ dark = false }) {
  const t = dark ? KD.dark : KD.light;
  const w = SAMPLE_WORDS[1]; // khekhel — forest
  return (
    <div style={{ background: t.bg, color: t.ink, fontFamily: KD.sans, minHeight: '100%' }}>
      <WebNav t={t} active="Browse" />

      {/* Breadcrumb */}
      <div style={{
        maxWidth: 1100, margin: '0 auto', padding: '32px 56px 0',
        fontFamily: KD.mono, fontSize: 12, color: t.inkMute, letterSpacing: '0.06em',
      }}>
        BROWSE / K / Kh / <span style={{ color: t.ink }}>khekhel</span>
      </div>

      {/* Big entry */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 56px 32px' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'end', gap: 24,
        }}>
          <div>
            <h1 style={{
              fontFamily: KD.serif, fontWeight: 500, fontSize: 140, margin: 0,
              color: t.ink, letterSpacing: '-0.04em', lineHeight: 0.95,
            }}>{w.word}</h1>
            <div style={{
              marginTop: 18, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
            }}>
              <span style={{ fontFamily: KD.mono, fontSize: 17, color: t.inkSoft }}>
                /{w.ipa}/
              </span>
              <span style={{
                padding: '4px 12px', borderRadius: 999, fontSize: 12,
                fontFamily: KD.sans, fontWeight: 500, letterSpacing: '0.04em',
                background: 'rgba(199,82,42,0.10)', color: KD.accent,
              }}>{w.pos}</span>
              <span style={{
                fontFamily: KD.sans, fontSize: 13, color: t.inkMute,
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span style={{
                  width: 6, height: 6, borderRadius: '50%', background: KD.sage,
                }}/> verified · 4 contributors
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <ActionBtn t={t} icon={<Icon.speaker size={16}/>} label="Listen" primary />
            <ActionBtn t={t} icon={<Icon.bookmark size={16}/>} label="Save" />
            <ActionBtn t={t} icon={<Icon.share size={16}/>} label="Share" />
          </div>
        </div>
      </div>

      {/* Audio waveform strip */}
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
          <Waveform color={KD.accent} bg={t.lineSoft} />
          <div style={{ fontFamily: KD.mono, fontSize: 12, color: t.inkMute }}>0:02 / 0:04</div>
          <div style={{ width: 1, height: 28, background: t.line }} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontFamily: KD.sans, fontSize: 12, color: t.inkMute }}>Dialect</span>
            <select style={{
              border: 'none', background: 'transparent', color: t.ink,
              fontFamily: KD.sans, fontSize: 13, fontWeight: 500, outline: 'none',
              padding: 0, marginTop: 2,
            }}>
              <option>Lohardaga</option><option>Sundargarh</option><option>Sadan plains</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main two-column entry */}
      <div style={{
        maxWidth: 1100, margin: '0 auto', padding: '0 56px 96px',
        display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 64,
      }}>
        <div>
          <SectionLabel t={t} eyebrow="Meanings" title="Definitions" />
          <Definition t={t} n={1}
            gloss="forest; specifically a stand of sal (Shorea robusta) trees"
            ku="Khekhel-ge sānā nu menjkhā."
            en="We walked together into the forest."
            note="Used for groves dense enough that sky is broken; an open scrub is rather kūmal." />
          <Definition t={t} n={2}
            gloss="by extension — wilderness, the place beyond the village fence"
            ku="Aṛkē khekhel-rē kī bāj nāhin."
            en="A man should not sleep alone in the wilderness."
            note="Common in proverbs about caution and self-reliance." />
          <Definition t={t} n={3}
            gloss="(figurative) a tangle, a thicket of trouble"
            ku="Iyā kām khekhel ban gayā."
            en="This task has turned into a thicket." />

          <SectionLabel t={t} eyebrow="Related" title="Words around this one" />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 56 }}>
            {['sānā · path', 'mankhaa · tree', 'kūl · water', 'kūmal · scrub',
              'bāj · sleep', 'biri · sun', 'tarken · to shine'].map(r => (
              <span key={r} style={{
                fontFamily: KD.serif, fontSize: 17, padding: '8px 16px',
                border: `1px solid ${t.line}`, borderRadius: 999,
                background: t.surface, color: t.ink, cursor: 'pointer',
              }}>{r.split(' · ')[0]}
                <span style={{ color: t.inkMute, marginLeft: 8, fontStyle: 'italic', fontSize: 14 }}>
                  {r.split(' · ')[1]}
                </span>
              </span>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div>
          <SidebarCard t={t} title="Etymology">
            <p style={{ fontFamily: KD.serif, fontSize: 16, lineHeight: 1.6, color: t.ink, margin: 0 }}>
              Native Kurukh root. Cognate with <em>khēkh</em> (timber, wood).
              Possibly related to Munda <em>khel</em> (clearing in forest).
              First attested in <span style={{ color: t.inkSoft }}>F. Hahn's 1903 Wörterbuch.</span>
            </p>
          </SidebarCard>

          <SidebarCard t={t} title="Where it's spoken" mt={20}>
            <div style={{
              display: 'flex', flexDirection: 'column', gap: 10,
              fontFamily: KD.sans, fontSize: 14, color: t.ink,
            }}>
              {[
                ['Lohardaga, JH', 92], ['Gumla, JH', 88], ['Sundargarh, OD', 76],
                ['Jashpur, CG', 71], ['Morang, NP (Tarai)', 54],
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
          </SidebarCard>

          <SidebarCard t={t} title="Contributors" mt={20}>
            <div style={{
              display: 'flex', flexDirection: 'column', gap: 14,
              fontFamily: KD.sans, fontSize: 13, color: t.ink,
            }}>
              {[
                ['RT', 'Rohini Tirkey', 'added entry · 14 Apr'],
                ['BL', 'Binod Lakra', 'added audio · 18 Apr'],
                ['EX', 'Elina Xalxo', 'added meaning 3 · 02 May'],
                ['SK', 'Suresh Kerketta', 'verified · 11 May'],
              ].map(([init, name, action], i) => (
                <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: i % 2 ? KD.sageSoft : KD.accentSoft, color: '#FFF',
                    fontFamily: KD.serif, fontWeight: 600, fontSize: 12,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{init}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500 }}>{name}</div>
                    <div style={{ fontSize: 12, color: t.inkMute }}>{action}</div>
                  </div>
                </div>
              ))}
            </div>
          </SidebarCard>
        </div>
      </div>

      <WebFooter t={t} />
    </div>
  );
}

function ActionBtn({ t, icon, label, primary }) {
  return (
    <button style={{
      border: primary ? 'none' : `1px solid ${t.line}`,
      background: primary ? t.ink : 'transparent',
      color: primary ? t.bg : t.ink,
      padding: '11px 16px', borderRadius: 10,
      fontFamily: KD.sans, fontWeight: 500, fontSize: 14, cursor: 'pointer',
      display: 'flex', alignItems: 'center', gap: 8,
    }}>{icon} {label}</button>
  );
}

function Waveform({ color, bg }) {
  // Mostly-static bars; 60 of them
  const bars = [];
  for (let i = 0; i < 80; i++) {
    const seed = Math.sin(i * 1.7) * 0.5 + Math.sin(i * 0.9) * 0.5;
    const h = 8 + Math.abs(seed) * 22 + (i % 7 === 0 ? 6 : 0);
    bars.push(h);
  }
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 3, height: 36 }}>
      {bars.map((h, i) => (
        <div key={i} style={{
          width: 3, height: h, borderRadius: 2,
          background: i < 30 ? color : bg,
        }}/>
      ))}
    </div>
  );
}

function Definition({ t, n, gloss, ku, en, note }) {
  return (
    <div style={{ marginBottom: 36, paddingBottom: 36, borderBottom: `1px solid ${t.line}` }}>
      <div style={{ display: 'flex', gap: 18 }}>
        <div style={{
          fontFamily: KD.serif, fontWeight: 500, fontSize: 28, color: KD.accent,
          letterSpacing: '-0.02em', lineHeight: 1, marginTop: 4,
        }}>{n}.</div>
        <div style={{ flex: 1 }}>
          <p style={{
            fontFamily: KD.serif, fontSize: 22, color: t.ink, lineHeight: 1.4,
            margin: 0, fontWeight: 400,
          }}>{gloss}</p>
          <div style={{
            marginTop: 18, padding: '14px 20px', background: t.surface,
            border: `1px solid ${t.line}`, borderRadius: 12, borderLeft: `3px solid ${KD.accent}`,
          }}>
            <p style={{
              fontFamily: KD.serif, fontSize: 19, fontStyle: 'italic',
              color: t.ink, margin: 0, lineHeight: 1.4,
            }}>{ku}</p>
            <p style={{
              fontFamily: KD.sans, fontSize: 14, color: t.inkSoft,
              marginTop: 6, marginBottom: 0,
            }}>{en}</p>
          </div>
          {note && (
            <p style={{
              fontFamily: KD.sans, fontSize: 13, color: t.inkMute, lineHeight: 1.55,
              marginTop: 14, marginBottom: 0, fontStyle: 'italic',
            }}>— {note}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function SidebarCard({ t, title, children, mt = 0 }) {
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

Object.assign(window, { WebHome, WebWordDetail, KMark, WebNav, WebFooter, SectionLabel });
