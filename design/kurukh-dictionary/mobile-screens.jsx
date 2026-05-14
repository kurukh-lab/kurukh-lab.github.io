// Mobile screens — iOS + Android
// All sized for the device frames (iPhone 402×874, Android 412×892).

const { KD, Icon, SAMPLE_WORDS, KMark } = window;

// ─────────────────────────────────────────────────────────────
// Shared mobile bits
// ─────────────────────────────────────────────────────────────

function MobileBg({ t, children, padTop = 0 }) {
  return (
    <div style={{
      background: t.bg, color: t.ink, fontFamily: KD.sans,
      width: '100%', minHeight: '100%', paddingTop: padTop,
    }}>{children}</div>
  );
}

function MobileSearchPill({ t, label = 'Search the lexicon…' }) {
  return (
    <div style={{
      background: t.surface, border: `1px solid ${t.line}`, borderRadius: 16,
      padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
      boxShadow: `0 1px 0 ${t.lineSoft}`,
    }}>
      <Icon.search size={18} color={t.inkSoft} weight={1.7}/>
      <span style={{ fontFamily: KD.sans, fontSize: 15, color: t.inkMute, flex: 1 }}>{label}</span>
      <div style={{
        width: 28, height: 28, borderRadius: 8, background: KD.accent,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FBF7EE" strokeWidth="2.2" strokeLinecap="round">
          <path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>
        </svg>
      </div>
    </div>
  );
}

function MobileBottomNav({ t, active, items, platform = 'ios' }) {
  const labels = items || [
    { key: 'home', label: 'Home', icon: Icon.home },
    { key: 'browse', label: 'Browse', icon: Icon.book },
    { key: 'add', label: 'Add', icon: Icon.plus, primary: true },
    { key: 'community', label: 'Community', icon: Icon.community },
    { key: 'me', label: 'Me', icon: Icon.user },
  ];
  return (
    <div style={{
      position: 'absolute', bottom: platform === 'ios' ? 34 : 0,
      left: 0, right: 0, padding: platform === 'ios' ? '8px 16px 0' : '0',
      pointerEvents: 'none',
    }}>
      <div style={{
        background: platform === 'ios' ? 'rgba(251,247,238,0.88)' : t.surface,
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${t.line}`,
        borderRadius: platform === 'ios' ? 24 : 0,
        padding: platform === 'ios' ? '10px 8px' : '8px 0 12px',
        display: 'flex', justifyContent: 'space-around', alignItems: 'center',
        pointerEvents: 'auto',
        background: platform === 'ios'
          ? (t === KD.dark ? 'rgba(27,24,22,0.85)' : 'rgba(251,247,238,0.88)')
          : t.surface,
      }}>
        {labels.map(it => {
          const isActive = active === it.key;
          if (it.primary) {
            return (
              <div key={it.key} style={{
                width: 48, height: 48, borderRadius: '50%', background: KD.accent,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 6px 16px rgba(199,82,42,0.40)',
                marginTop: platform === 'ios' ? -16 : -20,
              }}>
                <Icon.plus size={22} color="#FBF7EE" weight={2.4}/>
              </div>
            );
          }
          return (
            <div key={it.key} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              padding: '4px 8px',
            }}>
              <it.icon size={22} color={isActive ? KD.accent : t.inkSoft} weight={isActive ? 2 : 1.7}/>
              <span style={{
                fontFamily: KD.sans, fontSize: 10, fontWeight: 500,
                color: isActive ? KD.accent : t.inkSoft, letterSpacing: '0.02em',
              }}>{it.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// iOS — Home
// ─────────────────────────────────────────────────────────────

function IOSHome({ dark = false }) {
  const t = dark ? KD.dark : KD.light;
  const wod = SAMPLE_WORDS[0];

  return (
    <MobileBg t={t}>
      {/* Header */}
      <div style={{ padding: '8px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <KMark size={32}/>
            <span style={{
              fontFamily: KD.serif, fontWeight: 600, fontSize: 20, color: t.ink,
            }}>Kurukh<span style={{ color: KD.accent }}>.</span></span>
          </div>
          <div style={{
            width: 36, height: 36, borderRadius: '50%', background: KD.sageSoft,
            color: '#FFF', fontFamily: KD.serif, fontWeight: 600, fontSize: 13,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>RT</div>
        </div>

        {/* Greeting */}
        <div style={{ marginTop: 28 }}>
          <div style={{
            fontFamily: KD.mono, fontSize: 10.5, color: KD.accent,
            letterSpacing: '0.2em', textTransform: 'uppercase',
          }}>15 May · Thursday</div>
          <h1 style={{
            fontFamily: KD.serif, fontWeight: 500, fontSize: 36, margin: '8px 0 0',
            color: t.ink, letterSpacing: '-0.02em', lineHeight: 1.1,
          }}>Nam-namastē,<br/>
            <em style={{ color: KD.accent, fontWeight: 400 }}>Rohini</em>.
          </h1>
          <p style={{
            fontFamily: KD.serif, fontSize: 16, color: t.inkSoft,
            margin: '8px 0 0', lineHeight: 1.5,
          }}>Twelve words wait for your review today.</p>
        </div>

        {/* Search */}
        <div style={{ marginTop: 24 }}>
          <MobileSearchPill t={t}/>
        </div>
      </div>

      {/* Word of the day — postcard */}
      <div style={{ padding: '28px 20px 0' }}>
        <SectionHead t={t} eyebrow="Word of the day" right="Listen"/>
        <div style={{
          background: KD.accent, borderRadius: 24, padding: 24,
          color: '#FBF7EE', position: 'relative', overflow: 'hidden',
        }}>
          {/* Decorative serif K watermark */}
          <div style={{
            position: 'absolute', right: -20, bottom: -50,
            fontFamily: KD.serif, fontSize: 260, fontWeight: 400,
            color: 'rgba(255,255,255,0.10)', lineHeight: 1, letterSpacing: '-0.05em',
          }}>K</div>
          <div style={{
            fontFamily: KD.mono, fontSize: 10.5, letterSpacing: '0.2em',
            textTransform: 'uppercase', opacity: 0.75,
          }}>{wod.pos}</div>
          <div style={{
            fontFamily: KD.serif, fontSize: 60, fontWeight: 500,
            letterSpacing: '-0.03em', lineHeight: 1, marginTop: 10,
          }}>{wod.word}</div>
          <div style={{
            fontFamily: KD.mono, fontSize: 13, marginTop: 8, opacity: 0.85,
          }}>/{wod.ipa}/</div>
          <div style={{
            fontFamily: KD.serif, fontSize: 22, fontStyle: 'italic',
            marginTop: 16, lineHeight: 1.3, position: 'relative', zIndex: 1,
          }}>{wod.gloss}</div>

          <div style={{
            marginTop: 22, padding: '12px 16px',
            background: 'rgba(255,255,255,0.14)',
            backdropFilter: 'blur(6px)', borderRadius: 14,
            display: 'flex', alignItems: 'center', gap: 12, position: 'relative', zIndex: 1,
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
                  background: '#FBF7EE', opacity: i < 8 ? 1 : 0.4, borderRadius: 1,
                }}/>
              ))}
            </div>
            <span style={{ fontFamily: KD.mono, fontSize: 11, opacity: 0.8 }}>0:04</span>
          </div>
        </div>
      </div>

      {/* Themes */}
      <div style={{ padding: '32px 0 0 20px' }}>
        <div style={{ paddingRight: 20 }}>
          <SectionHead t={t} eyebrow="Explore by theme" right="See all"/>
        </div>
        <div style={{
          display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4,
        }}>
          {[
            { label: 'Nature', n: 412, color: '#5A7A5F', em: 'khekhel' },
            { label: 'Family', n: 188, color: KD.accent, em: 'ammā' },
            { label: 'Numbers', n: 24, color: '#7C5BA8', em: 'ekka' },
            { label: 'Festivals', n: 96, color: '#B8843A', em: 'karam' },
            { label: 'Cooking', n: 144, color: '#5E7493', em: 'aṛkhi' },
          ].map(th => (
            <div key={th.label} style={{
              minWidth: 132, padding: 18, borderRadius: 18,
              background: t.surface, border: `1px solid ${t.line}`,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, background: th.color,
                color: '#FBF7EE', fontFamily: KD.serif, fontWeight: 600, fontSize: 18,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                letterSpacing: '-0.02em',
              }}>{th.em[0]}</div>
              <div style={{
                fontFamily: KD.serif, fontWeight: 500, fontSize: 20, color: t.ink,
                marginTop: 18, letterSpacing: '-0.01em',
              }}>{th.label}</div>
              <div style={{
                fontFamily: KD.mono, fontSize: 11, color: t.inkMute, marginTop: 4,
              }}>{th.n} words</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recently added */}
      <div style={{ padding: '32px 20px 120px' }}>
        <SectionHead t={t} eyebrow="Recently added"/>
        <div style={{
          background: t.surface, border: `1px solid ${t.line}`, borderRadius: 18,
          overflow: 'hidden',
        }}>
          {SAMPLE_WORDS.slice(2, 6).map((w, i) => (
            <div key={w.word} style={{
              padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14,
              borderTop: i === 0 ? 'none' : `1px solid ${t.line}`,
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{
                    fontFamily: KD.serif, fontWeight: 500, fontSize: 22,
                    color: t.ink, letterSpacing: '-0.01em',
                  }}>{w.word}</span>
                  <span style={{ fontFamily: KD.mono, fontSize: 11, color: t.inkMute }}>
                    /{w.ipa}/
                  </span>
                </div>
                <div style={{
                  fontFamily: KD.serif, fontSize: 15, color: t.inkSoft,
                  fontStyle: 'italic', marginTop: 2,
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

      <MobileBottomNav t={t} active="home" platform="ios"/>
    </MobileBg>
  );
}

function SectionHead({ t, eyebrow, right }) {
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
          fontFamily: KD.sans, fontSize: 12, color: KD.accent, fontWeight: 500,
        }}>{right}</span>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// iOS — Word detail
// ─────────────────────────────────────────────────────────────

function IOSWordDetail({ dark = false }) {
  const t = dark ? KD.dark : KD.light;
  const w = SAMPLE_WORDS[1];
  return (
    <MobileBg t={t}>
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
        }}>K / Kh</div>
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
          fontFamily: KD.serif, fontWeight: 500, fontSize: 84,
          color: t.ink, letterSpacing: '-0.04em', lineHeight: 0.95,
        }}>{w.word}</div>
        <div style={{
          marginTop: 14, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
        }}>
          <span style={{ fontFamily: KD.mono, fontSize: 14, color: t.inkSoft }}>
            /{w.ipa}/
          </span>
          <span style={{
            padding: '3px 10px', borderRadius: 999, fontSize: 11,
            fontFamily: KD.sans, fontWeight: 500, letterSpacing: '0.04em',
            background: 'rgba(199,82,42,0.10)', color: KD.accent,
          }}>{w.pos}</span>
          <span style={{
            fontFamily: KD.sans, fontSize: 12, color: t.inkMute,
            display: 'flex', alignItems: 'center', gap: 5,
          }}>
            <span style={{
              width: 5, height: 5, borderRadius: '50%', background: KD.sage,
            }}/>verified
          </span>
        </div>
        <p style={{
          fontFamily: KD.serif, fontSize: 22, color: t.ink, lineHeight: 1.4,
          fontStyle: 'italic', marginTop: 20, marginBottom: 0, fontWeight: 400,
        }}>forest; specifically a stand of <span style={{ color: KD.accent }}>sal</span> trees.</p>
      </div>

      {/* Audio player */}
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
          <span style={{ fontFamily: KD.mono, fontSize: 11, color: t.inkMute }}>0:04</span>
        </div>
        <div style={{
          marginTop: 10, fontFamily: KD.sans, fontSize: 12, color: t.inkMute,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          Lohardaga dialect · recorded by Rohini Tirkey
        </div>
      </div>

      {/* Definitions */}
      <div style={{ padding: '28px 20px 0' }}>
        <SectionHead t={t} eyebrow="Meanings"/>
        {[
          { gloss: 'forest; a stand of sal trees', ku: 'Khekhel-ge sānā nu menjkhā.', en: 'We walked into the forest.' },
          { gloss: 'wilderness, the place beyond the village', ku: 'Aṛkē khekhel-rē kī bāj nāhin.', en: "Don't sleep alone in the wild." },
          { gloss: '(fig.) a tangle, a thicket of trouble', ku: 'Iyā kām khekhel ban gayā.', en: 'This task has turned into a thicket.' },
        ].map((d, i) => (
          <div key={i} style={{
            background: t.surface, border: `1px solid ${t.line}`, borderRadius: 16,
            padding: 18, marginBottom: 10, borderLeft: `3px solid ${KD.accent}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <span style={{
                fontFamily: KD.serif, fontWeight: 500, fontSize: 16,
                color: KD.accent, lineHeight: 1,
              }}>{i + 1}.</span>
              <span style={{
                fontFamily: KD.serif, fontSize: 18, color: t.ink, lineHeight: 1.4,
              }}>{d.gloss}</span>
            </div>
            <p style={{
              fontFamily: KD.serif, fontSize: 16, fontStyle: 'italic',
              color: t.inkSoft, marginTop: 10, marginBottom: 0, lineHeight: 1.4,
            }}>"{d.ku}"</p>
            <p style={{
              fontFamily: KD.sans, fontSize: 12.5, color: t.inkMute,
              marginTop: 4, marginBottom: 0,
            }}>{d.en}</p>
          </div>
        ))}
      </div>

      {/* Related */}
      <div style={{ padding: '20px 20px 0' }}>
        <SectionHead t={t} eyebrow="Related words"/>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {['sānā', 'mankhaa', 'kūl', 'kūmal', 'bāj', 'biri'].map(r => (
            <span key={r} style={{
              fontFamily: KD.serif, fontSize: 15, padding: '7px 14px',
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
            color: '#FFF', fontFamily: KD.serif, fontWeight: 600, fontSize: 13,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>RT</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: KD.sans, fontSize: 13, fontWeight: 500, color: t.ink }}>
              Rohini Tirkey & 3 others
            </div>
            <div style={{ fontFamily: KD.sans, fontSize: 12, color: t.inkMute }}>
              Last updated 11 May 2026
            </div>
          </div>
          <Icon.arrow size={14} color={t.inkSoft}/>
        </div>
      </div>

      <MobileBottomNav t={t} active="browse" platform="ios"/>
    </MobileBg>
  );
}

// ─────────────────────────────────────────────────────────────
// iOS — Contribute (record audio for a word)
// ─────────────────────────────────────────────────────────────

function IOSContribute({ dark = false }) {
  const t = dark ? KD.dark : KD.light;
  return (
    <MobileBg t={t}>
      {/* Header */}
      <div style={{
        padding: '4px 20px 0', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <span style={{
          fontFamily: KD.sans, fontSize: 15, color: KD.accent, fontWeight: 500,
        }}>Cancel</span>
        <span style={{ fontFamily: KD.serif, fontWeight: 600, fontSize: 17, color: t.ink }}>
          New entry
        </span>
        <span style={{
          fontFamily: KD.sans, fontSize: 15, color: t.inkMute, fontWeight: 500,
        }}>Submit</span>
      </div>

      {/* Step indicator */}
      <div style={{ padding: '24px 20px 0' }}>
        <div style={{
          fontFamily: KD.mono, fontSize: 10.5, color: KD.accent,
          letterSpacing: '0.2em', textTransform: 'uppercase',
        }}>Step 3 of 4 · Audio</div>
        <h2 style={{
          fontFamily: KD.serif, fontSize: 30, fontWeight: 500, margin: '8px 0 0',
          color: t.ink, letterSpacing: '-0.02em', lineHeight: 1.15,
        }}>Lend your voice to <em style={{ color: KD.accent }}>chando</em>.</h2>
        <p style={{
          fontFamily: KD.serif, fontSize: 15, color: t.inkSoft,
          marginTop: 8, lineHeight: 1.5,
        }}>Speakers of every dialect are welcome. Two seconds is plenty.</p>

        {/* Progress */}
        <div style={{ marginTop: 18, display: 'flex', gap: 6 }}>
          {[1,2,3,4].map(i => (
            <div key={i} style={{
              flex: 1, height: 4, borderRadius: 2,
              background: i <= 3 ? KD.accent : t.line,
            }}/>
          ))}
        </div>
      </div>

      {/* Big recording surface */}
      <div style={{ padding: '36px 20px 0' }}>
        <div style={{
          background: t.surface, border: `1px solid ${t.line}`, borderRadius: 24,
          padding: '32px 20px 28px', textAlign: 'center',
        }}>
          <div style={{
            fontFamily: KD.serif, fontWeight: 500, fontSize: 56,
            color: t.ink, letterSpacing: '-0.03em', lineHeight: 1,
          }}>chando</div>
          <div style={{
            fontFamily: KD.mono, fontSize: 13, color: t.inkSoft, marginTop: 8,
          }}>/tʃʌn.do̞/ · moon</div>

          {/* Big record ring */}
          <div style={{
            margin: '40px auto 0', width: 132, height: 132,
            position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              background: 'rgba(199,82,42,0.10)',
              animation: 'pulse 2s ease-out infinite',
            }}/>
            <div style={{
              width: 100, height: 100, borderRadius: '50%', background: KD.accent,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(199,82,42,0.4)',
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8, background: '#FBF7EE',
              }}/>
            </div>
          </div>

          <div style={{
            marginTop: 22, fontFamily: KD.mono, fontSize: 24, color: t.ink,
            letterSpacing: '0.05em',
          }}>00:01.4</div>
          <div style={{
            marginTop: 6, fontFamily: KD.sans, fontSize: 13, color: t.inkMute,
          }}>Recording · tap to stop</div>

          {/* Live waveform */}
          <div style={{
            marginTop: 22, height: 40,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3,
          }}>
            {Array.from({ length: 36 }).map((_, i) => (
              <div key={i} style={{
                width: 3, height: 4 + Math.abs(Math.sin(i * 1.4 + 1)) * 30,
                background: KD.accent, opacity: i < 16 ? 1 : 0.25, borderRadius: 1.5,
              }}/>
            ))}
          </div>
        </div>
      </div>

      {/* Dialect picker */}
      <div style={{ padding: '24px 20px 0' }}>
        <div style={{
          fontFamily: KD.sans, fontSize: 13, color: t.inkSoft, marginBottom: 10,
        }}>Tag your dialect</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {[
            ['Lohardaga', true], ['Gumla', false], ['Sundargarh', false],
            ['Jashpur', false], ['Tarai', false], ['Other…', false],
          ].map(([l, on]) => (
            <span key={l} style={{
              fontFamily: KD.sans, fontSize: 13, padding: '8px 14px',
              borderRadius: 999, fontWeight: 500,
              background: on ? KD.accent : t.surface,
              color: on ? '#FBF7EE' : t.ink,
              border: on ? 'none' : `1px solid ${t.line}`,
            }}>{l}</span>
          ))}
        </div>
      </div>

      <style>{`@keyframes pulse {
        0%{transform:scale(.9);opacity:1}
        100%{transform:scale(1.35);opacity:0}
      }`}</style>
    </MobileBg>
  );
}

// ─────────────────────────────────────────────────────────────
// Android — Home (Material 3 expressive)
// ─────────────────────────────────────────────────────────────

function AndroidHome({ dark = false }) {
  const t = dark ? KD.dark : KD.light;
  const wod = SAMPLE_WORDS[2]; // ammā — mother
  return (
    <MobileBg t={t}>
      {/* Top app bar */}
      <div style={{
        padding: '12px 20px 0', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Icon.menu size={24} color={t.ink} weight={1.8}/>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <KMark size={28}/>
          <span style={{
            fontFamily: KD.serif, fontWeight: 600, fontSize: 18, color: t.ink,
          }}>Kurukh<span style={{ color: KD.accent }}>.</span></span>
        </div>
        <div style={{
          width: 36, height: 36, borderRadius: '50%', background: KD.sageSoft,
          color: '#FFF', fontFamily: KD.serif, fontWeight: 600, fontSize: 13,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>RT</div>
      </div>

      {/* Greeting */}
      <div style={{ padding: '20px 20px 0' }}>
        <h1 style={{
          fontFamily: KD.serif, fontWeight: 500, fontSize: 34,
          color: t.ink, letterSpacing: '-0.02em', lineHeight: 1.1, margin: 0,
        }}>What word will you<br/>
          <em style={{ color: KD.accent, fontWeight: 400 }}>meet</em> today?
        </h1>
        <div style={{ marginTop: 20 }}><MobileSearchPill t={t}/></div>
      </div>

      {/* M3 expressive cards row */}
      <div style={{ padding: '24px 20px 0', display: 'grid',
        gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div style={{
          background: KD.accent, color: '#FBF7EE', borderRadius: 28,
          padding: 18, gridRow: 'span 2', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            fontFamily: KD.mono, fontSize: 10, letterSpacing: '0.2em',
            textTransform: 'uppercase', opacity: 0.75,
          }}>Word · 15 May</div>
          <div style={{
            fontFamily: KD.serif, fontSize: 52, fontWeight: 500,
            letterSpacing: '-0.03em', lineHeight: 1, marginTop: 14,
          }}>ammā</div>
          <div style={{
            fontFamily: KD.mono, fontSize: 11.5, marginTop: 6, opacity: 0.8,
          }}>/ʌm.maː/</div>
          <div style={{
            fontFamily: KD.serif, fontStyle: 'italic', fontSize: 18,
            marginTop: 14, lineHeight: 1.3,
          }}>mother — the first word every child learns</div>
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
          <div style={{ fontFamily: KD.serif, fontSize: 18, fontWeight: 500, marginTop: 12 }}>
            Review 12<br/>queued words
          </div>
        </div>

        <div style={{
          background: t.surfaceAlt, color: t.ink, borderRadius: 24,
          padding: 16, minHeight: 96,
        }}>
          <Icon.book size={22} color={t.ink} weight={1.8}/>
          <div style={{ fontFamily: KD.serif, fontSize: 18, fontWeight: 500, marginTop: 12 }}>
            Browse<br/>A–Z lexicon
          </div>
        </div>
      </div>

      {/* Themes scroller */}
      <div style={{ padding: '28px 0 0 20px' }}>
        <div style={{ paddingRight: 20 }}>
          <SectionHead t={t} eyebrow="Wander by theme"/>
        </div>
        <div style={{
          display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4, paddingRight: 20,
        }}>
          {[
            { l: 'Nature', n: 412, c: '#5A7A5F' },
            { l: 'Family', n: 188, c: KD.accent },
            { l: 'Numbers', n: 24, c: '#7C5BA8' },
            { l: 'Cooking', n: 144, c: '#B8843A' },
          ].map(th => (
            <div key={th.l} style={{
              minWidth: 116, padding: '14px 14px 16px', borderRadius: 20,
              background: t.surface, border: `1px solid ${t.line}`,
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', background: th.c,
              }}/>
              <div style={{
                fontFamily: KD.serif, fontWeight: 500, fontSize: 17,
                color: t.ink, marginTop: 14,
              }}>{th.l}</div>
              <div style={{
                fontFamily: KD.mono, fontSize: 10.5, color: t.inkMute, marginTop: 4,
              }}>{th.n} words</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recently added — Material list */}
      <div style={{ padding: '28px 20px 130px' }}>
        <SectionHead t={t} eyebrow="Recently added"/>
        {SAMPLE_WORDS.slice(2, 6).map((w, i) => (
          <div key={w.word} style={{
            display: 'flex', alignItems: 'center', gap: 14, padding: '14px 14px',
            background: t.surface, borderRadius: 16, marginBottom: 6,
            border: `1px solid ${t.lineSoft}`,
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: i % 2 ? KD.sageSoft : KD.accentSoft, color: '#FFF',
              fontFamily: KD.serif, fontWeight: 600, fontSize: 18,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{w.word[0]}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{
                  fontFamily: KD.serif, fontWeight: 500, fontSize: 19,
                  color: t.ink, letterSpacing: '-0.01em',
                }}>{w.word}</span>
                <span style={{ fontFamily: KD.mono, fontSize: 11, color: t.inkMute }}>
                  /{w.ipa}/
                </span>
              </div>
              <div style={{
                fontFamily: KD.serif, fontSize: 14, color: t.inkSoft,
                fontStyle: 'italic', marginTop: 1,
              }}>{w.gloss}</div>
            </div>
            <Icon.arrow size={16} color={t.inkMute}/>
          </div>
        ))}
      </div>

      {/* Android FAB-as-bottom-nav hybrid */}
      <MobileBottomNav t={t} active="home" platform="android"/>
    </MobileBg>
  );
}

// ─────────────────────────────────────────────────────────────
// Android — Word detail
// ─────────────────────────────────────────────────────────────

function AndroidWordDetail({ dark = false }) {
  const t = dark ? KD.dark : KD.light;
  const w = SAMPLE_WORDS[0]; // chando
  return (
    <MobileBg t={t}>
      {/* Top bar */}
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

      {/* Hero with colored block */}
      <div style={{
        margin: '16px 16px 0', borderRadius: 28, background: KD.accent,
        color: '#FBF7EE', padding: '28px 22px 30px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', right: -40, bottom: -90,
          fontFamily: KD.serif, fontSize: 320, fontWeight: 400,
          color: 'rgba(255,255,255,0.10)', lineHeight: 1, letterSpacing: '-0.05em',
        }}>c</div>

        <div style={{
          fontFamily: KD.mono, fontSize: 10.5, letterSpacing: '0.2em',
          textTransform: 'uppercase', opacity: 0.75,
        }}>{w.pos} · entry #248</div>
        <div style={{
          fontFamily: KD.serif, fontWeight: 500, fontSize: 72,
          letterSpacing: '-0.04em', lineHeight: 1, marginTop: 10,
        }}>{w.word}</div>
        <div style={{
          fontFamily: KD.mono, fontSize: 14, marginTop: 8, opacity: 0.85,
        }}>/{w.ipa}/</div>

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
                background: '#FBF7EE', opacity: i < 9 ? 1 : 0.4, borderRadius: 1,
              }}/>
            ))}
          </div>
          <span style={{ fontFamily: KD.mono, fontSize: 11, opacity: 0.8 }}>0:04</span>
        </div>
      </div>

      {/* Meaning */}
      <div style={{ padding: '24px 20px 0' }}>
        <div style={{
          fontFamily: KD.mono, fontSize: 10.5, color: t.inkSoft,
          letterSpacing: '0.2em', textTransform: 'uppercase',
        }}>Meaning</div>
        <p style={{
          fontFamily: KD.serif, fontSize: 22, color: t.ink, lineHeight: 1.4,
          fontStyle: 'italic', marginTop: 8, marginBottom: 0,
        }}>moon — the night-traveller; used in lullabies and harvest songs.</p>
      </div>

      {/* Example */}
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{
          background: t.surface, borderRadius: 18, padding: '18px 18px',
          borderLeft: `3px solid ${KD.accent}`, border: `1px solid ${t.line}`,
        }}>
          <div style={{
            fontFamily: KD.mono, fontSize: 10, color: KD.accent,
            letterSpacing: '0.2em', textTransform: 'uppercase',
          }}>In a sentence</div>
          <p style={{
            fontFamily: KD.serif, fontSize: 19, fontStyle: 'italic',
            color: t.ink, margin: '10px 0 0', lineHeight: 1.4,
          }}>"Chando neem ulā tarken."</p>
          <p style={{
            fontFamily: KD.sans, fontSize: 13, color: t.inkSoft,
            marginTop: 6, marginBottom: 0,
          }}>The moon shone over the village.</p>
        </div>
      </div>

      {/* Tabs: Meaning, Etymology, Related */}
      <div style={{ padding: '24px 20px 0' }}>
        <div style={{
          display: 'flex', gap: 20, borderBottom: `1px solid ${t.line}`,
        }}>
          {['Meaning', 'Etymology', 'Where spoken', 'Related'].map((tab, i) => (
            <div key={tab} style={{
              padding: '10px 0', position: 'relative',
              fontFamily: KD.sans, fontSize: 13, fontWeight: 500,
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

      {/* Etymology content */}
      <div style={{ padding: '18px 20px 0' }}>
        <p style={{
          fontFamily: KD.serif, fontSize: 16, color: t.ink, lineHeight: 1.65,
          margin: 0,
        }}>From <em>Proto-Dravidian *cantu</em>, "moon." Shared with Munda
          forms (Mundari <em>candu</em>) suggesting deep regional contact.
          First documented in Kurukh by <span style={{ color: t.inkSoft }}>F. Hahn (1903).</span></p>
      </div>

      {/* Liked by */}
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
          <div style={{ flex: 1, fontFamily: KD.sans, fontSize: 13, color: t.ink }}>
            Loved by <b>248 speakers</b>
          </div>
          <Icon.heart size={18} color={KD.accent}/>
        </div>
      </div>

      <MobileBottomNav t={t} active="browse" platform="android"/>
    </MobileBg>
  );
}

Object.assign(window, { IOSHome, IOSWordDetail, IOSContribute, AndroidHome, AndroidWordDetail });
