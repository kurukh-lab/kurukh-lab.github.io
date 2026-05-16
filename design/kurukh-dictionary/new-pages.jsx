// Additional pages identified from the kurukh-lab repo:
//   • /contribute      — submit a new word (multi-language meanings)
//   • /kurukh-editor   — document editor with Kurukh + Hindi font toggles + templates
//   • /review          — community review queue (vote on pending words)
//   • /profile         — user profile + contribution history
//
// All re-use the WebNav, KMark, and tokens already defined in web-screens.jsx.

const { KD, Icon, KMark } = window;

// ─────────────────────────────────────────────────────────────
// /contribute  — Submit a word
// ─────────────────────────────────────────────────────────────

function WebContribute({ dark = false }) {
  const t = dark ? KD.dark : KD.light;
  const { WebNav, WebFooter } = window; // reuse
  // Note: WebFooter is not exported from web-screens.jsx — re-implement a tiny one locally.

  return (
    <div style={{ background: t.bg, color: t.ink, fontFamily: KD.sans, minHeight: '100%' }}>
      {WebNav ? <WebNav t={t} active="Contribute"/> : null}

      {/* Page header */}
      <div style={{
        maxWidth: 1200, margin: '0 auto', padding: '56px 56px 32px',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <div style={{
              fontFamily: KD.mono, fontSize: 11.5, color: KD.accent,
              letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 14,
            }}>Step 1 of 1 · Contribute</div>
            <h1 style={{
              fontFamily: KD.serif, fontWeight: 500, fontSize: 64, lineHeight: 1.05,
              letterSpacing: '-0.025em', margin: 0, color: t.ink,
            }}>Add a word to<br/>the <em style={{ color: KD.accent }}>archive</em>.</h1>
            <p style={{
              fontFamily: KD.serif, fontSize: 19, color: t.inkSoft, lineHeight: 1.5,
              marginTop: 16, marginBottom: 0, maxWidth: 560,
            }}>Every entry passes through five community reviewers before
              an editor reads it. Take your time — clarity is worth more than speed.</p>
          </div>

          {/* Stepper / status chips */}
          <div style={{
            display: 'flex', gap: 12, alignItems: 'center',
            fontFamily: KD.sans, fontSize: 13, color: t.inkSoft,
          }}>
            <ProgressDot active label="Draft"/>
            <ProgressLine/>
            <ProgressDot label="Community"/>
            <ProgressLine/>
            <ProgressDot label="Editor"/>
            <ProgressLine/>
            <ProgressDot label="Published"/>
          </div>
        </div>
      </div>

      {/* Two-column body */}
      <div style={{
        maxWidth: 1200, margin: '0 auto', padding: '8px 56px 96px',
        display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 48,
      }}>
        {/* ── Left: the form ── */}
        <div style={{
          background: t.surface, border: `1px solid ${t.line}`, borderRadius: 20,
          padding: 36,
        }}>
          <SubHead t={t} eyebrow="Headword" title="The word itself"/>
          <Field t={t} label="Kurukh word" required>
            <input value="khekhel" readOnly style={inputCss(t, KD.serif, 26)}/>
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 18 }}>
            <Field t={t} label="Pronunciation (IPA)" hint="Optional but encouraged">
              <input value="/kʰeː.kʰel/" readOnly style={inputCss(t, KD.mono, 15)}/>
            </Field>
            <Field t={t} label="Part of speech">
              <SelectBox t={t} value="noun"/>
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 18 }}>
            <Field t={t} label="Dialect">
              <SelectBox t={t} value="Lohardaga"/>
            </Field>
            <Field t={t} label="Audio recording">
              <AudioField t={t}/>
            </Field>
          </div>

          {/* Meanings */}
          <div style={{ marginTop: 36 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <SubHead t={t} eyebrow="Meanings" title="Definitions in every language you can offer"
                noBottom/>
              <button style={addBtnCss(t)}>
                <Icon.plus size={13} weight={2.2}/> Add another language
              </button>
            </div>

            <MeaningCard t={t} n={1} lang="English" langCode="en"
              def="forest; specifically a stand of sal (Shorea robusta) trees"
              ex="Khekhel-ge sānā nu menjkhā."
              tr="We walked together into the forest."/>
            <MeaningCard t={t} n={2} lang="Hindi · हिन्दी" langCode="hi"
              def="जंगल; विशेषकर साल वृक्षों का घना समूह"
              ex="Khekhel-ge sānā nu menjkhā."
              tr="हम मिलकर जंगल की ओर चल पड़े।"
              hindiFont/>
            <MeaningCard t={t} n={3} lang="Bengali · বাংলা" langCode="bn" empty/>
          </div>
        </div>

        {/* ── Right: live preview + sidebars ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Info pill */}
          <div style={{
            background: 'rgba(90,122,95,0.10)', borderRadius: 14,
            padding: '14px 18px', display: 'flex', alignItems: 'flex-start', gap: 14,
            border: `1px solid ${KD.sage}33`,
          }}>
            <div style={{
              width: 24, height: 24, borderRadius: '50%', background: KD.sage, color: '#FFF',
              fontFamily: KD.serif, fontWeight: 600, fontSize: 13,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1,
            }}>i</div>
            <div>
              <div style={{ fontFamily: KD.sans, fontSize: 14, fontWeight: 600, color: t.ink }}>
                Review process
              </div>
              <div style={{ fontFamily: KD.sans, fontSize: 13, color: t.inkSoft, lineHeight: 1.6, marginTop: 4 }}>
                Five community speakers vote → an editor reads → published. Usually 3–5 days.
              </div>
            </div>
          </div>

          {/* Live preview */}
          <div style={{
            background: t.surface, border: `1px solid ${t.line}`, borderRadius: 20,
            padding: 28, position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: 16, right: 20,
              fontFamily: KD.mono, fontSize: 10.5, color: t.inkMute,
              letterSpacing: '0.2em', textTransform: 'uppercase',
            }}>Live preview</div>

            <div style={{
              fontFamily: KD.serif, fontWeight: 500, fontSize: 64, color: t.ink,
              letterSpacing: '-0.03em', lineHeight: 1, marginTop: 18,
            }}>khekhel</div>
            <div style={{
              marginTop: 12, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
            }}>
              <span style={{ fontFamily: KD.mono, fontSize: 13, color: t.inkSoft }}>/kʰeː.kʰel/</span>
              <span style={{
                padding: '3px 10px', borderRadius: 999, fontSize: 11,
                fontFamily: KD.sans, fontWeight: 500, letterSpacing: '0.04em',
                background: 'rgba(199,82,42,0.10)', color: KD.accent,
              }}>noun</span>
              <span style={{
                fontFamily: KD.sans, fontSize: 12, color: t.inkMute,
                display: 'flex', alignItems: 'center', gap: 5,
              }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: KD.accent }}/>
                draft · not yet published
              </span>
            </div>

            <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <PreviewMeaning t={t} n={1}
                def="forest; specifically a stand of sal trees"
                ex="Khekhel-ge sānā nu menjkhā."
                tr="We walked together into the forest."/>
              <PreviewMeaning t={t} n={2} hi
                def="जंगल; विशेषकर साल वृक्षों का घना समूह"
                tr="हम मिलकर जंगल की ओर चल पड़े।"/>
            </div>
          </div>

          {/* Submission rules */}
          <div style={{
            background: t.surface, border: `1px solid ${t.line}`, borderRadius: 16,
            padding: 24,
          }}>
            <div style={{
              fontFamily: KD.mono, fontSize: 10.5, color: KD.accent,
              letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 14,
            }}>Before you submit</div>
            {[
              ['Use the form your community uses', 'Loan-words and dialect forms are welcome — tag the region.'],
              ['Cite a source for unusual claims', 'Especially for etymology and rare meanings.'],
              ['No duplicate languages', 'One definition per language; merge variants in the same entry.'],
            ].map(([h, p]) => (
              <div key={h} style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                <div style={{
                  width: 18, height: 18, borderRadius: 5, background: KD.accent,
                  color: '#FBF7EE', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, marginTop: 2,
                }}><Icon.check size={11} weight={2.5}/></div>
                <div>
                  <div style={{ fontFamily: KD.sans, fontSize: 13.5, fontWeight: 500, color: t.ink }}>{h}</div>
                  <div style={{ fontFamily: KD.sans, fontSize: 12.5, color: t.inkSoft, marginTop: 2, lineHeight: 1.5 }}>{p}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Sticky CTA row */}
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button style={{
              flex: 1, border: 'none', background: t.ink, color: t.bg, padding: '14px 18px',
              borderRadius: 12, fontFamily: KD.sans, fontWeight: 600, fontSize: 15, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>Submit for community review <Icon.arrow size={15} color={t.bg}/></button>
            <button style={{
              border: `1px solid ${t.line}`, background: 'transparent', color: t.ink,
              padding: '14px 18px', borderRadius: 12,
              fontFamily: KD.sans, fontWeight: 500, fontSize: 14, cursor: 'pointer',
            }}>Save draft</button>
          </div>
        </div>
      </div>

      <SimpleFooter t={t}/>
    </div>
  );
}

// ─── Helpers for Contribute ────────────────────────────────────────

function SubHead({ t, eyebrow, title, noBottom = false }) {
  return (
    <div style={{ marginBottom: noBottom ? 0 : 20 }}>
      <div style={{
        fontFamily: KD.mono, fontSize: 10.5, color: KD.accent,
        letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 6,
      }}>{eyebrow}</div>
      <h3 style={{
        fontFamily: KD.serif, fontWeight: 500, fontSize: 22, color: t.ink,
        margin: 0, letterSpacing: '-0.01em',
      }}>{title}</h3>
    </div>
  );
}

function Field({ t, label, required, hint, children }) {
  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6,
      }}>
        <label style={{
          fontFamily: KD.sans, fontSize: 12.5, fontWeight: 500, color: t.inkSoft,
          letterSpacing: '0.02em',
        }}>{label}{required && <span style={{ color: KD.accent, marginLeft: 4 }}>*</span>}</label>
        {hint && (
          <span style={{
            fontFamily: KD.sans, fontSize: 11.5, color: t.inkMute,
          }}>{hint}</span>
        )}
      </div>
      {children}
    </div>
  );
}

const inputCss = (t, font, size) => ({
  width: '100%', boxSizing: 'border-box',
  border: `1px solid ${t.line}`, borderRadius: 10,
  background: t.bg, color: t.ink,
  padding: '12px 14px', fontFamily: font, fontSize: size, outline: 'none',
});

function SelectBox({ t, value }) {
  return (
    <div style={{
      ...inputCss(t, KD.sans, 15),
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer',
    }}>
      <span>{value}</span>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={t.inkSoft}
        strokeWidth="2" strokeLinecap="round"><path d="m6 9 6 6 6-6"/></svg>
    </div>
  );
}

function AudioField({ t }) {
  return (
    <div style={{
      ...inputCss(t, KD.sans, 14),
      padding: '8px 8px 8px 14px',
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: '50%', background: KD.accent, color: '#FBF7EE',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#FBF7EE' }}/>
      </div>
      <div style={{ flex: 1, display: 'flex', gap: 2, alignItems: 'center', height: 20 }}>
        {Array.from({ length: 22 }).map((_, i) => (
          <div key={i} style={{
            width: 2, height: 4 + Math.abs(Math.sin(i * 1.1)) * 14,
            background: KD.accent, opacity: i < 12 ? 1 : 0.3, borderRadius: 1,
          }}/>
        ))}
      </div>
      <span style={{ fontFamily: KD.mono, fontSize: 11, color: t.inkMute }}>0:02</span>
      <button style={{
        border: `1px solid ${t.line}`, background: t.bg, color: t.ink,
        padding: '6px 12px', borderRadius: 8, fontFamily: KD.sans, fontSize: 12,
        fontWeight: 500, cursor: 'pointer',
      }}>Re-record</button>
    </div>
  );
}

function addBtnCss(t) {
  return {
    border: `1px solid ${KD.accent}`, background: 'transparent', color: KD.accent,
    padding: '7px 12px', borderRadius: 999, cursor: 'pointer',
    fontFamily: KD.sans, fontWeight: 500, fontSize: 12.5,
    display: 'flex', alignItems: 'center', gap: 6,
  };
}

function MeaningCard({ t, n, lang, langCode, def, ex, tr, hindiFont, empty }) {
  const hiSerif = '"Noto Serif Devanagari", Newsreader, serif';
  return (
    <div style={{
      background: t.bg, border: `1px solid ${t.line}`, borderRadius: 14,
      padding: 20, marginTop: 14,
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 26, height: 26, borderRadius: 7,
            background: 'rgba(199,82,42,0.10)', color: KD.accent,
            fontFamily: KD.serif, fontWeight: 600, fontSize: 13,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>{n}</div>
          <div>
            <div style={{ fontFamily: KD.sans, fontSize: 13, fontWeight: 500, color: t.ink }}>
              {lang}
            </div>
            <div style={{ fontFamily: KD.mono, fontSize: 11, color: t.inkMute, marginTop: 1 }}>
              {langCode}
            </div>
          </div>
        </div>
        <button style={{
          border: 'none', background: 'transparent', cursor: 'pointer',
          color: t.inkMute, padding: 4,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>

      {empty ? (
        <div style={{
          padding: '20px 0', fontFamily: KD.sans, fontSize: 13, color: t.inkMute,
          fontStyle: 'italic',
        }}>Empty — click to add a Bengali definition.</div>
      ) : (
        <>
          <div style={{
            padding: '10px 14px', background: t.surface, borderRadius: 10,
            border: `1px solid ${t.line}`,
            fontFamily: hindiFont ? hiSerif : KD.serif, fontSize: 16, color: t.ink, lineHeight: 1.5,
          }}>{def}</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
            <div style={{
              padding: '10px 14px', background: t.surface, borderRadius: 10,
              border: `1px solid ${t.line}`,
              fontFamily: KD.serif, fontSize: 14, color: t.inkSoft, fontStyle: 'italic',
            }}>{ex}</div>
            <div style={{
              padding: '10px 14px', background: t.surface, borderRadius: 10,
              border: `1px solid ${t.line}`,
              fontFamily: hindiFont ? hiSerif : KD.sans, fontSize: 13, color: t.inkSoft,
            }}>{tr}</div>
          </div>
        </>
      )}
    </div>
  );
}

function PreviewMeaning({ t, n, def, ex, tr, hi }) {
  const hiSerif = '"Noto Serif Devanagari", Newsreader, serif';
  return (
    <div style={{
      borderLeft: `3px solid ${KD.accent}`, paddingLeft: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{
          fontFamily: KD.serif, fontWeight: 500, fontSize: 18, color: KD.accent,
        }}>{n}.</span>
        <span style={{
          fontFamily: hi ? hiSerif : KD.serif, fontSize: 17, color: t.ink, lineHeight: 1.5,
        }}>{def}</span>
      </div>
      {ex && (
        <p style={{
          fontFamily: KD.serif, fontStyle: 'italic', fontSize: 14,
          color: t.inkSoft, margin: '6px 0 0', paddingLeft: 22, lineHeight: 1.55,
        }}>"{ex}" <span style={{ color: t.inkMute, fontStyle: 'normal', marginLeft: 6, fontFamily: KD.sans, fontSize: 12 }}>— {tr}</span></p>
      )}
      {!ex && tr && (
        <p style={{
          fontFamily: hi ? hiSerif : KD.sans, fontSize: 13,
          color: t.inkSoft, margin: '6px 0 0', paddingLeft: 22, lineHeight: 1.55,
        }}>— {tr}</p>
      )}
    </div>
  );
}

function ProgressDot({ active, label }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div style={{
        width: 14, height: 14, borderRadius: '50%',
        background: active ? KD.accent : 'transparent',
        border: active ? 'none' : '1.5px solid rgba(28,24,20,0.25)',
      }}/>
      <span style={{
        fontFamily: KD.sans, fontSize: 11, color: active ? KD.accent : 'rgba(28,24,20,0.45)',
        fontWeight: active ? 600 : 500, letterSpacing: '0.04em',
      }}>{label}</span>
    </div>
  );
}
function ProgressLine() {
  return <div style={{ width: 32, height: 1.5, background: 'rgba(28,24,20,0.15)', marginBottom: 18 }}/>;
}

function SimpleFooter({ t }) {
  return (
    <div style={{
      borderTop: `1px solid ${t.line}`, padding: '28px 56px', background: t.surface,
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between',
        fontFamily: KD.sans, fontSize: 12, color: t.inkMute,
      }}>
        <span>© 2026 Kurukh Dictionary Collective · CC BY-SA 4.0</span>
        <span>Made with care in Ranchi, Jharkhand</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// /kurukh-editor — Document editor
// ─────────────────────────────────────────────────────────────

function WebEditor({ dark = false }) {
  const t = dark ? KD.dark : KD.light;
  const { WebNav } = window;
  return (
    <div style={{ background: t.bg, color: t.ink, fontFamily: KD.sans, minHeight: '100%' }}>
      {WebNav ? <WebNav t={t} active="Kurukh Editor"/> : null}

      {/* Editor chrome — kept slim, no Microsoft Word vibe */}
      <div style={{
        maxWidth: 1280, margin: '0 auto', padding: '32px 56px 0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            fontFamily: KD.mono, fontSize: 11, color: KD.accent,
            letterSpacing: '0.2em', textTransform: 'uppercase',
          }}>Editor · auto-saved 2 min ago</div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button style={ghostBtn(t)}>
            <Icon.share size={14}/> Share
          </button>
          <button style={ghostBtn(t)}>
            <Icon.bookmark size={14}/> Save as HTML
          </button>
          <button style={{
            border: 'none', background: t.ink, color: t.bg, padding: '10px 16px',
            borderRadius: 10, fontFamily: KD.sans, fontWeight: 500, fontSize: 13.5,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
          }}>Export PDF <Icon.arrow size={13} color={t.bg}/></button>
        </div>
      </div>

      {/* Three-column workspace: templates | paper | inspector */}
      <div style={{
        maxWidth: 1280, margin: '24px auto 0', padding: '0 56px 80px',
        display: 'grid', gridTemplateColumns: '240px 1fr 260px', gap: 32,
        alignItems: 'flex-start',
      }}>
        {/* ── Templates rail ── */}
        <div>
          <div style={{
            fontFamily: KD.mono, fontSize: 10.5, color: t.inkMute,
            letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 14,
          }}>Templates</div>
          {[
            { title: 'Dictionary entry', sub: 'Structured word + meanings + example', active: true },
            { title: 'Folk story', sub: 'Bilingual storytelling format' },
            { title: 'Letter', sub: 'Formal correspondence' },
            { title: 'Blank document', sub: 'Start fresh' },
          ].map(tpl => (
            <div key={tpl.title} style={{
              padding: 14, borderRadius: 12, marginBottom: 6, cursor: 'pointer',
              background: tpl.active ? t.surface : 'transparent',
              border: `1px solid ${tpl.active ? t.line : 'transparent'}`,
            }}>
              <div style={{
                fontFamily: KD.serif, fontSize: 16, fontWeight: 500, color: t.ink,
              }}>{tpl.title}</div>
              <div style={{
                fontFamily: KD.sans, fontSize: 12, color: t.inkMute, marginTop: 2, lineHeight: 1.4,
              }}>{tpl.sub}</div>
            </div>
          ))}

          <div style={{
            marginTop: 32, padding: 18, borderRadius: 12,
            background: 'rgba(90,122,95,0.10)',
            border: `1px solid ${KD.sage}33`,
          }}>
            <div style={{
              fontFamily: KD.mono, fontSize: 10, color: KD.sage,
              letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 8,
            }}>Keyboard</div>
            {[
              ['⌘K', 'Kurukh script'],
              ['⌘H', 'हिन्दी'],
              ['⌘B', 'Bold'],
              ['⌘I', 'Italic'],
            ].map(([k, l]) => (
              <div key={k} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                fontFamily: KD.sans, fontSize: 12, color: t.ink, padding: '5px 0',
              }}>
                <span>{l}</span>
                <kbd style={{
                  fontFamily: KD.mono, fontSize: 11,
                  padding: '2px 7px', border: `1px solid ${t.line}`, borderRadius: 5,
                  background: t.surface,
                }}>{k}</kbd>
              </div>
            ))}
          </div>
        </div>

        {/* ── Document paper ── */}
        <div>
          {/* Toolbar */}
          <div style={{
            background: t.surface, border: `1px solid ${t.line}`, borderRadius: 14,
            padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 4,
            marginBottom: 14, flexWrap: 'wrap',
          }}>
            <ToolGroup t={t}>
              <FontPickerChip t={t} label="Newsreader" sub="default"/>
              <SizeChip t={t} label="18 pt"/>
            </ToolGroup>
            <Sep t={t}/>
            <ToolGroup t={t}>
              <IconBtn t={t}><b>B</b></IconBtn>
              <IconBtn t={t}><i>I</i></IconBtn>
              <IconBtn t={t}><u>U</u></IconBtn>
              <IconBtn t={t}><s>S</s></IconBtn>
            </ToolGroup>
            <Sep t={t}/>
            <ToolGroup t={t}>
              <ScriptChip t={t} label="Kurukh" active accent={KD.accent}/>
              <ScriptChip t={t} label="हिन्दी" hindiFont/>
              <ScriptChip t={t} label="English"/>
            </ToolGroup>
            <Sep t={t}/>
            <ToolGroup t={t}>
              <IconBtn t={t}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 6h16M4 12h16M4 18h10"/></svg>
              </IconBtn>
              <IconBtn t={t}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="6" cy="6" r="1.4"/><circle cx="6" cy="12" r="1.4"/><circle cx="6" cy="18" r="1.4"/><path d="M11 6h9M11 12h9M11 18h9"/></svg>
              </IconBtn>
              <IconBtn t={t}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M9 18 15 12 9 6"/></svg>
              </IconBtn>
            </ToolGroup>
            <div style={{ flex: 1 }}/>
            <div style={{
              fontFamily: KD.mono, fontSize: 11, color: t.inkMute, padding: '0 8px',
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <span>248 words</span>
              <span style={{ width: 1, height: 14, background: t.line }}/>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: KD.sage }}/>
                synced
              </span>
            </div>
          </div>

          {/* Paper */}
          <div style={{
            background: t.surface, border: `1px solid ${t.line}`, borderRadius: 14,
            padding: '56px 72px', minHeight: 880,
            boxShadow: `0 1px 0 ${t.lineSoft}, 0 24px 60px -30px rgba(28,24,20,0.18)`,
          }}>
            {/* Document title */}
            <input
              defaultValue="A field-note on the word khekhel"
              style={{
                border: 'none', outline: 'none', background: 'transparent',
                fontFamily: KD.serif, fontSize: 42, fontWeight: 500, color: t.ink,
                letterSpacing: '-0.025em', width: '100%', padding: 0,
              }}/>
            <div style={{
              marginTop: 8, fontFamily: KD.mono, fontSize: 11.5, color: t.inkMute,
              letterSpacing: '0.06em',
            }}>by Rohini Tirkey · 15 May 2026</div>

            <hr style={{ border: 'none', borderTop: `1px solid ${t.line}`, margin: '28px 0' }}/>

            {/* Body — mixed scripts */}
            <p style={{
              fontFamily: KD.serif, fontSize: 18, lineHeight: 1.7, color: t.ink, margin: '0 0 18px',
            }}>
              Walking the path from Lohardaga to Bishunpur, my <span style={{
                background: 'rgba(199,82,42,0.10)', padding: '0 4px', borderRadius: 3,
                color: KD.accent, fontFamily: KD.serif,
              }}>khekhel</span> meant something different at every kilometre.
              A <em>sal</em> grove at one bend; a stand of mahua at another;
              by dusk, simply the place where the dirt road ran out.
            </p>

            <p style={{
              fontFamily: KD.serif, fontSize: 18, lineHeight: 1.7, color: t.ink, margin: '0 0 18px',
            }}>
              In Hindi the closest word would be <span style={{
                fontFamily: '"Noto Serif Devanagari", Newsreader, serif',
                background: 'rgba(90,122,95,0.10)', padding: '0 4px', borderRadius: 3,
                color: KD.sage,
              }}>जंगल</span>, but जंगल carries the menace of the unknown,
              while khekhel just means: <em>that side of the village fence.</em>
            </p>

            <h2 style={{
              fontFamily: KD.serif, fontSize: 26, fontWeight: 500, color: t.ink,
              letterSpacing: '-0.015em', margin: '32px 0 12px',
            }}>What the elders said</h2>

            <p style={{
              fontFamily: KD.serif, fontSize: 18, lineHeight: 1.7, color: t.ink, margin: '0 0 18px',
            }}>
              <em>"Khekhel-ge sānā nu menjkhā"</em> — "we walked into the forest together"
              is a phrase used to mean any shared crossing into the wild, not only literal.
              Pastor Lakra said his father used it when he announced he was leaving for Calcutta.
            </p>

            <blockquote style={{
              borderLeft: `3px solid ${KD.accent}`, paddingLeft: 20, margin: '24px 0',
              fontFamily: KD.serif, fontSize: 20, fontStyle: 'italic',
              color: t.ink, lineHeight: 1.5,
            }}>
              "Every word, when you stand close enough to it, opens out into a place."
              <div style={{
                fontFamily: KD.sans, fontSize: 13, fontStyle: 'normal', color: t.inkMute, marginTop: 8,
              }}>— Binod Lakra, 78, Gumla</div>
            </blockquote>

            <p style={{
              fontFamily: KD.serif, fontSize: 18, lineHeight: 1.7, color: t.ink, margin: '0 0 18px',
            }}>
              The cursor blinks here<span style={{
                display: 'inline-block', width: 2, height: 22, background: KD.accent,
                marginLeft: 1, verticalAlign: 'text-bottom', animation: 'kdblink 1.1s steps(2) infinite',
              }}/>
            </p>

            <style>{`@keyframes kdblink{50%{opacity:0}}`}</style>
          </div>
        </div>

        {/* ── Inspector rail ── */}
        <div>
          <div style={{
            fontFamily: KD.mono, fontSize: 10.5, color: t.inkMute,
            letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 14,
          }}>Document</div>

          <div style={{
            background: t.surface, border: `1px solid ${t.line}`, borderRadius: 14,
            padding: 18, marginBottom: 14,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontFamily: KD.sans, fontSize: 12, color: t.inkSoft }}>Words</span>
              <span style={{ fontFamily: KD.serif, fontSize: 16, fontWeight: 500, color: t.ink }}>248</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontFamily: KD.sans, fontSize: 12, color: t.inkSoft }}>Characters</span>
              <span style={{ fontFamily: KD.serif, fontSize: 16, fontWeight: 500, color: t.ink }}>1,412</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: KD.sans, fontSize: 12, color: t.inkSoft }}>Reading time</span>
              <span style={{ fontFamily: KD.serif, fontSize: 16, fontWeight: 500, color: t.ink }}>~1 min</span>
            </div>
          </div>

          {/* Script breakdown */}
          <div style={{
            background: t.surface, border: `1px solid ${t.line}`, borderRadius: 14,
            padding: 18, marginBottom: 14,
          }}>
            <div style={{
              fontFamily: KD.mono, fontSize: 10, color: KD.accent,
              letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 12,
            }}>Scripts in use</div>
            <div style={{
              height: 8, borderRadius: 4, overflow: 'hidden', display: 'flex',
              background: t.surfaceAlt,
            }}>
              <div style={{ width: '62%', background: KD.accent }}/>
              <div style={{ width: '12%', background: KD.sage }}/>
              <div style={{ width: '26%', background: t.inkMute }}/>
            </div>
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                ['Kurukh', KD.accent, '62%'],
                ['हिन्दी', KD.sage, '12%'],
                ['English', t.inkMute, '26%'],
              ].map(([l, c, p]) => (
                <div key={l} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  fontFamily: KD.sans, fontSize: 12, color: t.ink,
                }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: c }}/>
                  <span style={{ flex: 1 }}>{l}</span>
                  <span style={{ fontFamily: KD.mono, color: t.inkMute }}>{p}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Collaborators */}
          <div style={{
            background: t.surface, border: `1px solid ${t.line}`, borderRadius: 14,
            padding: 18,
          }}>
            <div style={{
              fontFamily: KD.mono, fontSize: 10, color: KD.accent,
              letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 12,
            }}>Collaborators</div>
            {[
              ['RT', 'Rohini Tirkey', 'editing now', KD.sage],
              ['BL', 'Binod Lakra', '2h ago', KD.accentSoft],
              ['EX', 'Elina Xalxo', 'invited', t.inkMute],
            ].map(([init, name, when, c]) => (
              <div key={name} style={{
                display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10,
              }}>
                <div style={{
                  width: 26, height: 26, borderRadius: '50%', background: c, color: '#FFF',
                  fontFamily: KD.serif, fontWeight: 600, fontSize: 11,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{init}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: KD.sans, fontSize: 13, color: t.ink, fontWeight: 500 }}>{name}</div>
                  <div style={{ fontFamily: KD.sans, fontSize: 11, color: t.inkMute }}>{when}</div>
                </div>
              </div>
            ))}
            <button style={{
              marginTop: 4, width: '100%', border: `1px dashed ${t.line}`,
              background: 'transparent', color: t.ink,
              padding: '8px 12px', borderRadius: 10, cursor: 'pointer',
              fontFamily: KD.sans, fontWeight: 500, fontSize: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}><Icon.plus size={12} weight={2.2}/> Invite</button>
          </div>
        </div>
      </div>

      <SimpleFooter t={t}/>
    </div>
  );
}

// Editor toolbar helpers
function ToolGroup({ t, children }) {
  return <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>{children}</div>;
}
function Sep({ t }) { return <div style={{ width: 1, height: 22, background: t.line, margin: '0 6px' }}/>; }
function IconBtn({ t, children }) {
  return (
    <button style={{
      width: 30, height: 30, border: 'none', background: 'transparent', color: t.ink,
      cursor: 'pointer', borderRadius: 7, fontFamily: KD.serif, fontSize: 15,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>{children}</button>
  );
}
function FontPickerChip({ t, label, sub }) {
  return (
    <div style={{
      padding: '6px 12px', borderRadius: 8, cursor: 'pointer',
      display: 'flex', alignItems: 'center', gap: 8,
    }}>
      <div>
        <div style={{ fontFamily: KD.serif, fontSize: 13, fontWeight: 500, color: t.ink, lineHeight: 1 }}>{label}</div>
        {sub && <div style={{ fontFamily: KD.sans, fontSize: 10, color: t.inkMute, marginTop: 2 }}>{sub}</div>}
      </div>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={t.inkSoft} strokeWidth="2.2" strokeLinecap="round"><path d="m6 9 6 6 6-6"/></svg>
    </div>
  );
}
function SizeChip({ t, label }) {
  return (
    <div style={{
      padding: '6px 10px', borderRadius: 8, cursor: 'pointer',
      fontFamily: KD.mono, fontSize: 12, color: t.ink,
      display: 'flex', alignItems: 'center', gap: 6,
    }}>{label}
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={t.inkSoft} strokeWidth="2.2" strokeLinecap="round"><path d="m6 9 6 6 6-6"/></svg>
    </div>
  );
}
function ScriptChip({ t, label, active, hindiFont, accent }) {
  const hiSerif = '"Noto Serif Devanagari", Newsreader, serif';
  return (
    <button style={{
      padding: '6px 12px', borderRadius: 999,
      background: active ? KD.accent : 'transparent',
      color: active ? '#FBF7EE' : t.ink,
      border: active ? 'none' : `1px solid ${t.line}`,
      fontFamily: hindiFont ? hiSerif : KD.sans, fontSize: 12, fontWeight: 500,
      cursor: 'pointer',
    }}>{label}</button>
  );
}
function ghostBtn(t) {
  return {
    border: `1px solid ${t.line}`, background: 'transparent', color: t.ink,
    padding: '10px 14px', borderRadius: 10, cursor: 'pointer',
    fontFamily: KD.sans, fontWeight: 500, fontSize: 13.5,
    display: 'flex', alignItems: 'center', gap: 8,
  };
}

// ─────────────────────────────────────────────────────────────
// /review — Community review queue
// ─────────────────────────────────────────────────────────────

function WebReview({ dark = false }) {
  const t = dark ? KD.dark : KD.light;
  const { WebNav } = window;
  return (
    <div style={{ background: t.bg, color: t.ink, fontFamily: KD.sans, minHeight: '100%' }}>
      {WebNav ? <WebNav t={t} active="Community"/> : null}

      {/* Hero */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '56px 56px 0' }}>
        <div style={{
          fontFamily: KD.mono, fontSize: 11.5, color: KD.accent,
          letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 14,
        }}>Queue · 12 entries waiting</div>
        <h1 style={{
          fontFamily: KD.serif, fontWeight: 500, fontSize: 64, lineHeight: 1.05,
          letterSpacing: '-0.025em', margin: 0, color: t.ink,
        }}>Help us <em style={{ color: KD.accent }}>tend</em> the lexicon.</h1>
        <p style={{
          fontFamily: KD.serif, fontSize: 19, color: t.inkSoft, lineHeight: 1.5,
          marginTop: 16, marginBottom: 0, maxWidth: 620,
        }}>Five speakers vote on each entry. Read carefully. A "yes" means
          you have heard this word used this way — not just that it sounds right.</p>

        {/* Tab nav */}
        <div style={{
          marginTop: 36, borderBottom: `1px solid ${t.line}`,
          display: 'flex', gap: 28, alignItems: 'flex-end',
        }}>
          {[
            { l: 'New words', count: 12, active: true },
            { l: 'Edits & corrections', count: 7 },
            { l: 'Audio recordings', count: 24 },
            { l: 'My votes', count: 88 },
          ].map(tab => (
            <div key={tab.l} style={{
              padding: '14px 0', position: 'relative',
              display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
            }}>
              <span style={{
                fontFamily: KD.sans, fontSize: 14, fontWeight: 500,
                color: tab.active ? t.ink : t.inkSoft,
              }}>{tab.l}</span>
              <span style={{
                padding: '2px 8px', borderRadius: 999, fontSize: 11,
                background: tab.active ? KD.accent : t.surfaceAlt,
                color: tab.active ? '#FBF7EE' : t.inkSoft,
                fontFamily: KD.mono, fontWeight: 500,
              }}>{tab.count}</span>
              {tab.active && (
                <div style={{
                  position: 'absolute', bottom: -1, left: 0, right: 0,
                  height: 2.5, background: KD.accent, borderRadius: 2,
                }}/>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Queue */}
      <div style={{
        maxWidth: 1200, margin: '0 auto', padding: '32px 56px 96px',
        display: 'grid', gridTemplateColumns: '1fr 320px', gap: 40,
      }}>
        <div>
          {[
            {
              word: 'kūmal', ipa: 'kuː.mʌl', pos: 'noun',
              gloss: 'open scrub-land; thin forest where sky shows through',
              ex: 'Kūmal-rē beṛā chaṛīa.', tr: 'The oxen are grazing in the scrub.',
              by: 'Suresh Kerketta', when: 'submitted 14 May',
              votes: 3, against: 0, votedBy: ['RT', 'BL', 'EX'],
            },
            {
              word: 'tarken', ipa: 'tʌɾ.ken', pos: 'verb',
              gloss: 'to shine; especially of light moving across water or leaves',
              ex: 'Biri kūl-rē tarken.', tr: 'The sun shines on the water.',
              by: 'Anjali Bhagat', when: 'submitted 13 May',
              votes: 4, against: 1, votedBy: ['RT', 'BL', 'EX', 'SK'],
            },
            {
              word: 'sānā', ipa: 'saː.naː', pos: 'noun',
              gloss: 'path; specifically a foot-trail that is walked, not built',
              ex: 'Sānā-ge khekhel ge jā.', tr: 'The trail leads into the forest.',
              by: 'Pradeep Toppo', when: 'submitted 12 May',
              votes: 2, against: 0, votedBy: ['RT', 'EX'],
            },
          ].map(w => <ReviewCard key={w.word} t={t} w={w}/>)}
        </div>

        {/* Right rail */}
        <div>
          {/* Your stats */}
          <div style={{
            background: t.surface, border: `1px solid ${t.line}`, borderRadius: 16,
            padding: 22, marginBottom: 16,
          }}>
            <div style={{
              fontFamily: KD.mono, fontSize: 10.5, color: KD.accent,
              letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 14,
            }}>Your reviewing</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 8 }}>
              <span style={{
                fontFamily: KD.serif, fontSize: 44, fontWeight: 500,
                color: t.ink, lineHeight: 1, letterSpacing: '-0.02em',
              }}>88</span>
              <span style={{ fontFamily: KD.sans, fontSize: 13, color: t.inkSoft }}>
                votes cast this season
              </span>
            </div>
            <div style={{
              fontFamily: KD.sans, fontSize: 13, color: t.inkSoft, lineHeight: 1.55,
              borderTop: `1px solid ${t.line}`, paddingTop: 12, marginTop: 12,
            }}>You are among the <span style={{ color: t.ink, fontWeight: 600 }}>top 12</span>
              {' '}reviewers. Eligible to vouch for new contributors after 100.</div>
          </div>

          {/* Guidance */}
          <div style={{
            background: t.surface, border: `1px solid ${t.line}`, borderRadius: 16,
            padding: 22,
          }}>
            <div style={{
              fontFamily: KD.mono, fontSize: 10.5, color: KD.accent,
              letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 14,
            }}>How to vote</div>
            {[
              ['Approve', 'You have heard this word, in this meaning, in real use.', KD.sage],
              ['Reject', 'You have not heard this, OR the meaning is wrong.', KD.accent],
              ['Defer', 'You are not sure — pass the entry to other reviewers.', t.inkMute],
            ].map(([h, p, c]) => (
              <div key={h} style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%', background: c, marginTop: 8, flexShrink: 0,
                }}/>
                <div>
                  <div style={{ fontFamily: KD.sans, fontSize: 13.5, fontWeight: 600, color: t.ink }}>{h}</div>
                  <div style={{ fontFamily: KD.sans, fontSize: 12.5, color: t.inkSoft, lineHeight: 1.5, marginTop: 2 }}>{p}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <SimpleFooter t={t}/>
    </div>
  );
}

function ReviewCard({ t, w }) {
  const approvals = w.votes;
  const needed = 5;
  return (
    <div style={{
      background: t.surface, border: `1px solid ${t.line}`, borderRadius: 18,
      padding: 28, marginBottom: 14,
    }}>
      {/* Header row */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24,
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, flexWrap: 'wrap' }}>
            <span style={{
              fontFamily: KD.serif, fontWeight: 500, fontSize: 44,
              color: t.ink, letterSpacing: '-0.025em', lineHeight: 1,
            }}>{w.word}</span>
            <span style={{ fontFamily: KD.mono, fontSize: 14, color: t.inkSoft }}>
              /{w.ipa}/
            </span>
            <span style={{
              padding: '3px 10px', borderRadius: 999, fontSize: 11,
              fontFamily: KD.sans, fontWeight: 500, letterSpacing: '0.04em',
              background: 'rgba(199,82,42,0.10)', color: KD.accent,
            }}>{w.pos}</span>
            <button style={{
              width: 32, height: 32, borderRadius: '50%',
              border: `1px solid ${t.line}`, background: t.bg, color: t.ink,
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}><Icon.speaker size={14}/></button>
          </div>
          <p style={{
            fontFamily: KD.serif, fontSize: 19, color: t.ink, lineHeight: 1.5,
            marginTop: 14, marginBottom: 0,
          }}>{w.gloss}</p>
          <div style={{
            marginTop: 14, padding: '12px 16px', background: t.bg,
            border: `1px solid ${t.line}`, borderRadius: 10, borderLeft: `3px solid ${KD.accent}`,
          }}>
            <p style={{
              fontFamily: KD.serif, fontSize: 16, fontStyle: 'italic',
              color: t.ink, margin: 0, lineHeight: 1.4,
            }}>"{w.ex}"</p>
            <p style={{
              fontFamily: KD.sans, fontSize: 13, color: t.inkSoft,
              margin: '4px 0 0',
            }}>{w.tr}</p>
          </div>

          <div style={{
            marginTop: 14, display: 'flex', alignItems: 'center', gap: 10,
            fontFamily: KD.sans, fontSize: 12.5, color: t.inkMute,
          }}>
            <div style={{
              width: 22, height: 22, borderRadius: '50%', background: KD.accentSoft, color: '#FFF',
              fontFamily: KD.serif, fontWeight: 600, fontSize: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{w.by.split(' ').map(p => p[0]).join('').slice(0, 2)}</div>
            <span style={{ color: t.inkSoft, fontWeight: 500 }}>{w.by}</span>
            <span>·</span>
            <span>{w.when}</span>
          </div>
        </div>

        {/* Right: vote tracker + actions */}
        <div style={{
          width: 220, display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 12,
          flexShrink: 0,
        }}>
          <div style={{
            background: t.bg, border: `1px solid ${t.line}`, borderRadius: 12,
            padding: 14,
          }}>
            <div style={{
              fontFamily: KD.mono, fontSize: 10, color: t.inkMute,
              letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 8,
            }}>Approvals</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{
                fontFamily: KD.serif, fontSize: 32, fontWeight: 500, color: KD.sage,
                lineHeight: 1, letterSpacing: '-0.02em',
              }}>{approvals}</span>
              <span style={{ fontFamily: KD.serif, fontSize: 18, color: t.inkMute }}>/ {needed}</span>
            </div>
            <div style={{
              marginTop: 10, height: 4, background: t.surfaceAlt, borderRadius: 2, overflow: 'hidden',
            }}>
              <div style={{
                width: (approvals / needed * 100) + '%', height: '100%', background: KD.sage,
              }}/>
            </div>
            <div style={{
              marginTop: 12, display: 'flex', alignItems: 'center', gap: 4,
            }}>
              {w.votedBy.map((init, i) => (
                <div key={i} style={{
                  width: 22, height: 22, borderRadius: '50%',
                  background: i % 2 ? KD.sageSoft : KD.accentSoft, color: '#FFF',
                  fontFamily: KD.serif, fontWeight: 600, fontSize: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: `2px solid ${t.surface}`, marginLeft: i ? -6 : 0,
                }}>{init}</div>
              ))}
              {Array.from({ length: needed - approvals }).map((_, i) => (
                <div key={'e' + i} style={{
                  width: 22, height: 22, borderRadius: '50%',
                  background: 'transparent', border: `1.5px dashed ${t.line}`,
                  marginLeft: -6,
                }}/>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            <button style={{
              flex: 1, border: 'none', background: KD.sage, color: '#FBF7EE',
              padding: '11px 12px', borderRadius: 10, cursor: 'pointer',
              fontFamily: KD.sans, fontWeight: 600, fontSize: 13,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}><Icon.check size={13} weight={2.5}/> Approve</button>
            <button style={{
              flex: 1, border: `1px solid ${t.line}`, background: 'transparent', color: t.ink,
              padding: '11px 12px', borderRadius: 10, cursor: 'pointer',
              fontFamily: KD.sans, fontWeight: 500, fontSize: 13,
            }}>Defer</button>
          </div>
          <button style={{
            border: `1px solid ${t.line}`, background: 'transparent', color: t.inkSoft,
            padding: '9px 12px', borderRadius: 10, cursor: 'pointer',
            fontFamily: KD.sans, fontWeight: 500, fontSize: 12.5,
          }}>Suggest a correction</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// /profile — User profile + contributions
// ─────────────────────────────────────────────────────────────

function WebProfile({ dark = false }) {
  const t = dark ? KD.dark : KD.light;
  const { WebNav } = window;
  return (
    <div style={{ background: t.bg, color: t.ink, fontFamily: KD.sans, minHeight: '100%' }}>
      {WebNav ? <WebNav t={t} active="Saved"/> : null}

      {/* Profile header */}
      <div style={{
        maxWidth: 1200, margin: '0 auto', padding: '56px 56px 36px',
        display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 32, alignItems: 'center',
      }}>
        <div style={{
          width: 112, height: 112, borderRadius: '50%',
          background: `linear-gradient(135deg, ${KD.accentSoft}, ${KD.accent})`,
          color: '#FBF7EE', fontFamily: KD.serif, fontWeight: 600, fontSize: 48,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          letterSpacing: '-0.02em',
        }}>RT</div>

        <div>
          <div style={{
            fontFamily: KD.mono, fontSize: 11.5, color: KD.accent,
            letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 6,
          }}>Speaker · Lohardaga dialect</div>
          <h1 style={{
            fontFamily: KD.serif, fontWeight: 500, fontSize: 56, lineHeight: 1.05,
            margin: 0, color: t.ink, letterSpacing: '-0.025em',
          }}>Rohini Tirkey</h1>
          <p style={{
            fontFamily: KD.sans, fontSize: 14, color: t.inkSoft, marginTop: 8, marginBottom: 0,
          }}>rohini@kurukh.dict · member since April 2024 · 14 months on the project</p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button style={ghostBtn(t)}>Edit profile</button>
          <button style={{
            border: 'none', background: t.ink, color: t.bg, padding: '10px 16px',
            borderRadius: 10, fontFamily: KD.sans, fontWeight: 500, fontSize: 13.5,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <Icon.plus size={13} weight={2.2}/> Add a word
          </button>
        </div>
      </div>

      {/* Stat grid */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 56px' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12,
        }}>
          {[
            ['142', 'words contributed', null],
            ['98', 'approved', 'text-success'],
            ['12', 'awaiting review', null],
            ['88', 'reviews cast', null],
          ].map(([n, l]) => (
            <div key={l} style={{
              background: t.surface, border: `1px solid ${t.line}`, borderRadius: 14,
              padding: 22,
            }}>
              <div style={{
                fontFamily: KD.serif, fontSize: 38, fontWeight: 500,
                color: t.ink, letterSpacing: '-0.02em', lineHeight: 1,
              }}>{n}</div>
              <div style={{
                fontFamily: KD.sans, fontSize: 12.5, color: t.inkSoft, marginTop: 6,
                textTransform: 'uppercase', letterSpacing: '0.08em',
              }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Two columns: bio/dialects + contributions */}
      <div style={{
        maxWidth: 1200, margin: '32px auto 0', padding: '0 56px 96px',
        display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 40,
      }}>
        {/* Left rail */}
        <div>
          <SubHead t={t} eyebrow="About" title="Speaker profile"/>
          <p style={{
            fontFamily: KD.serif, fontSize: 17, color: t.ink, lineHeight: 1.65,
            marginTop: -8, marginBottom: 24,
          }}>Born in Lohardaga; teaches Kurukh at the Saint Anne's primary school.
            Records audio in her grandmother's voice every Sunday.</p>

          <div style={{
            background: t.surface, border: `1px solid ${t.line}`, borderRadius: 14,
            padding: 20, marginBottom: 16,
          }}>
            <div style={{
              fontFamily: KD.mono, fontSize: 10.5, color: KD.accent,
              letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 14,
            }}>Dialects I speak</div>
            {[
              ['Lohardaga (native)', 'Primary fluency, raised in this dialect.', KD.accent],
              ['Gumla', 'Conversational; my grandmother\'s family.', KD.sageSoft],
              ['Sundargarh', 'Reading only.', t.inkMute],
            ].map(([h, p, c]) => (
              <div key={h} style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                <div style={{
                  width: 6, height: 6, borderRadius: '50%', background: c, marginTop: 8, flexShrink: 0,
                }}/>
                <div>
                  <div style={{ fontFamily: KD.sans, fontSize: 13.5, fontWeight: 600, color: t.ink }}>{h}</div>
                  <div style={{ fontFamily: KD.sans, fontSize: 12.5, color: t.inkSoft, marginTop: 2, lineHeight: 1.5 }}>{p}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{
            background: t.surface, border: `1px solid ${t.line}`, borderRadius: 14,
            padding: 20,
          }}>
            <div style={{
              fontFamily: KD.mono, fontSize: 10.5, color: KD.accent,
              letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 14,
            }}>Badges</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {[
                ['100 words', KD.accent],
                ['Audio archivist', KD.sage],
                ['First-year', t.inkMute],
                ['Folktale collector', '#7C5BA8'],
              ].map(([l, c]) => (
                <span key={l} style={{
                  padding: '5px 12px', borderRadius: 999,
                  border: `1px solid ${c}66`, color: c,
                  fontFamily: KD.sans, fontSize: 12, fontWeight: 500,
                }}>{l}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Right: contributions list */}
        <div>
          <div style={{
            display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 18,
          }}>
            <SubHead t={t} eyebrow="Your contributions" title="Words you've planted" noBottom/>
            <select style={{
              ...inputCss(t, KD.sans, 13),
              width: 'auto', padding: '8px 12px',
            }}>
              <option>All status</option><option>Approved</option><option>In review</option>
            </select>
          </div>

          {[
            { word: 'chando', gloss: 'moon', date: '14 Apr', status: 'approved', likes: 248 },
            { word: 'khekhel', gloss: 'forest, sal grove', date: '17 Apr', status: 'approved', likes: 132 },
            { word: 'sānā', gloss: 'a foot-trail walked into being', date: '02 May', status: 'community', votes: '4/5' },
            { word: 'tarken', gloss: 'to shine (across water, leaves)', date: '08 May', status: 'community', votes: '3/5' },
            { word: 'aṛkhi', gloss: 'rice-beer; the fermented kind', date: '10 May', status: 'editor' },
            { word: 'kūmal', gloss: 'open scrub-land', date: '11 May', status: 'draft' },
          ].map(c => <ContribRow key={c.word} t={t} c={c}/>)}
        </div>
      </div>

      <SimpleFooter t={t}/>
    </div>
  );
}

function ContribRow({ t, c }) {
  const statusMap = {
    approved: { label: 'Approved', color: KD.sage, dot: KD.sage },
    community: { label: `Community · ${c.votes}`, color: KD.accent, dot: KD.accent },
    editor:    { label: 'Editor review', color: '#7C5BA8', dot: '#7C5BA8' },
    draft:     { label: 'Draft', color: t.inkMute, dot: t.inkMute },
  };
  const s = statusMap[c.status];
  return (
    <div style={{
      background: t.surface, border: `1px solid ${t.line}`, borderRadius: 14,
      padding: '18px 22px', marginBottom: 8,
      display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 20, alignItems: 'center',
    }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, flexWrap: 'wrap' }}>
          <span style={{
            fontFamily: KD.serif, fontWeight: 500, fontSize: 24,
            color: t.ink, letterSpacing: '-0.01em',
          }}>{c.word}</span>
          <span style={{
            fontFamily: KD.serif, fontSize: 16, color: t.inkSoft, fontStyle: 'italic',
          }}>{c.gloss}</span>
        </div>
        <div style={{
          marginTop: 4, fontFamily: KD.sans, fontSize: 12, color: t.inkMute,
        }}>added {c.date}</div>
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '6px 12px', borderRadius: 999,
        background: `${s.color}15`,
        fontFamily: KD.sans, fontSize: 12, fontWeight: 500, color: s.color,
      }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot }}/>
        {s.label}
      </div>

      {c.likes ? (
        <div style={{
          fontFamily: KD.mono, fontSize: 13, color: t.inkMute,
          display: 'flex', alignItems: 'center', gap: 5,
        }}>
          <Icon.heart size={13} color={KD.accent} fill={KD.accent}/>{c.likes}
        </div>
      ) : (
        <Icon.arrow size={14} color={t.inkMute}/>
      )}
    </div>
  );
}

Object.assign(window, { WebContribute, WebEditor, WebReview, WebProfile });
