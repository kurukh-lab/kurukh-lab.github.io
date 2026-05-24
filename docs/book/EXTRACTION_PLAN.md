# Kurukh Dictionary — Image-to-JSON Extraction Plan

## Source
- **Book**: *Kurukh (Oraon)-English Dictionary, Part I* — Revd. Ferd. Hahn, Bengal Secretariat Press, Calcutta, 1903.
- **Location**: [docs/book/ilovepdf_pages-to-jpg/](ilovepdf_pages-to-jpg/) — 188 JPG page scans (`...page-0001.jpg` … `...page-0188.jpg`).
- **Layout per dictionary page** (observed on pages 5–188):
  - Page number + running header (e.g. `Anūhō malā — Arjha'anā`).
  - One-line entries shaped like: `Kurukh-headword[, grammatical-tag] [+ optional second form], English gloss[; second gloss][; example in Kurukh, English translation].`
  - Grammatical tags include `adj.`, `adv.`, `conj.`, `interj.`, `H.` (= Hindi loan), `kan, yan` / `kan, an` / `ckan, c'an` (verb-class markers), `dem. pron.`, `prep.` …
  - Example sentences are italicised in the scan and follow the gloss.
- **Front matter (pages 1–4)**: title page, preface, abbreviations key, alphabet/pronunciation notes — **no dictionary entries**.
- **Back matter**: page 188 ends at `Urū` (U-section); the book is a single A→U sweep, no appendix observed.

## Target Schema (matches `scripts/addApprovedWords.js` so the global JSON can seed directly)
Each entry:
```jsonc
{
  "kurukh_word": "mankhnā",              // headword exactly as printed (diacritics preserved)
  "english_definition": "to see, to look",
  "hindi_definition": "",                // see "Open question — Hindi" below
  "part_of_speech": "verb",              // mapped from page tag — see mapping table
  "meanings": [
    {
      "language": "en",
      "definition": "to see, to look at something",
      "example_sentence_kurukh": "…",    // empty string if none on page
      "example_sentence_translation": "…"
    }
    // a "hi" entry is only added if hindi_definition is filled
  ],
  "status": "approved",
  "contributor_id": "hahn-1903",          // attribute to the source, distinct from "admin"
  "source": {
    "book": "Hahn 1903 Kurukh-Oraon English Dictionary",
    "page_image": "2015.280761.Kurukh-Orao_text_page-0010.jpg",
    "page_label": 6                       // printed page number on the scan
  }
}
```
Notes on field handling:
- **Diacritics** (`ā ī ū ē ō ṅ kh kh̄`) are preserved exactly as printed in `kurukh_word`. The seed script can choose to normalise later; we don't lose info here.
- **`H.` tag** in the source = "Hindi loanword in Kurukh", NOT a Hindi translation. It will be captured as `"loanword_from": "hi"` on the entry rather than confused with `hindi_definition`.
- **Sub-headwords** on the same line (e.g. `Argā, argī, adv. not yet`) become **separate entries** sharing the same gloss — one entry per Kurukh form.
- **Example sentences** stay nested in `meanings[]`. They are NOT promoted to standalone entries.
- **Cross-reference entries** (e.g. "see Y") are kept with the cross-ref text in `english_definition`.

## Part-of-speech mapping (book tag → schema value)
| Book tag | `part_of_speech` |
| --- | --- |
| (no tag, just gloss) | `noun` (default) |
| `adj.` | `adjective` |
| `adv.` | `adverb` |
| `conj.` | `conjunction` |
| `interj.` | `interjection` |
| `prep.` | `preposition` |
| `dem. pron.`, `pron.` | `pronoun` |
| `kan, yan` / `kan, an` / `ckan, c'an` / verb forms | `verb` |
| `H. adj.`, `H. adv.` etc. | use the inner tag; record `loanword_from = "hi"` |

## File layout
```
docs/book/
├── EXTRACTION_PLAN.md          ← this file
├── EXTRACTION_PROGRESS.md      ← resumable checkpoint, updated after each page
├── kurukh_dictionary.json      ← global combined JSON (entries: [...])
└── ilovepdf_pages-to-jpg/
    ├── 2015.280761.Kurukh-Orao_text_page-0001.json   ← per-page JSON
    ├── 2015.280761.Kurukh-Orao_text_page-0002.json
    └── …
```

- **Per-page JSON** (`...page-NNNN.json`): `{ page_image, page_label, status: "front_matter" | "extracted" | "skipped", entries: [...] }`. Even front-matter pages get a stub file so the run is idempotent.
- **Global JSON** (`kurukh_dictionary.json`): `{ source: {...}, generated_at, total_entries, entries: [...] }`. Rebuilt by concatenating all per-page `entries[]` in page order.
- **Progress tracker** (`EXTRACTION_PROGRESS.md`): one row per page — `| 0010 | extracted | 28 entries | 2026-05-23 |`. The next session reads this and resumes at the first non-`extracted` row.

## Process (per page)
1. Read the JPG via the Read tool (multimodal vision).
2. Transcribe each dictionary line — preserve diacritics, split sub-headwords, normalise whitespace.
3. Emit per-page JSON to the sibling `.json` file.
4. Append a row to `EXTRACTION_PROGRESS.md`.
5. After every **10 pages**, rebuild `kurukh_dictionary.json` from the per-page files (cheap, idempotent — protects against a mid-run crash).
6. At the very end, do a final rebuild + integrity check (entry count, no duplicate `(kurukh_word, page_label)` pairs).

## Resumability
- Each per-page JSON is self-contained — re-running on an already-extracted page is a no-op (skip if file exists and status === "extracted").
- `EXTRACTION_PROGRESS.md` is the source of truth for "where to resume". Global JSON is **derived**, never the resumption pointer.
- A session can be interrupted at any point; the next session reads the progress file, picks the next unprocessed page, and continues.

## Estimated scope
- ~184 content pages × ~30 entries/page ≈ **5,000–6,000 entries** in the final global JSON.
- One image read per page → ~184 vision reads. Throughput is roughly one page per turn; expect this to span multiple sessions.

## Model strategy (locked 2026-05-24, after page 13)

- **Default model: Sonnet 4.6** for routine pages 14 onward. The schema is settled, the per-page pattern is mechanical, and Sonnet's vision is good enough to read the 1903 scan; entries go to `pending_review` anyway, so a later human pass catches edge cases. Cost is roughly 4–5× lower than Opus for negligible quality drop.
- **Escalate to Opus 4.7** when the page has: (a) the first page of a new letter section (typography shifts), (b) heavy compound blocks like `Amm`/`Asnā` with many sub-entries, (c) 3+ homographs of the same headword on one page, or (d) footnote markers / italics that look ambiguous.
- **Spot-check cadence**: every 20–30 pages, re-extract one random already-done Sonnet page on Opus and diff the JSON. If headwords or homograph splits drift, escalate the surrounding batch.
- **Avoid Haiku** for ground-truth extraction — the 1903 diacritics (`ā ḫ ṛ ṅ`) are at the edge of its vision reliability. Acceptable only as a cheap triage draft that a stronger model then reviews.

## Decisions (locked 2026-05-23)

1. **Hindi translations** → **auto-translate English → Hindi** during extraction. Each entry will carry both `english_definition` and `hindi_definition`, plus matching `en` and `hi` items in `meanings[]`. Example sentences are translated alongside; if a Kurukh example exists, both `en` and `hi` meanings reference the same `example_sentence_kurukh` with translations in their respective languages. Entries also carry `hindi_source: "model-translated"` so a future human-review pass can re-rank them.
2. **Entry status** → `"pending_review"`. Seed lands in moderation queue; admins approve before going public.
3. **Checkpoint** → **pause after the first 5 content pages (pages 5–9)** for user QA before continuing.
4. **Front matter** → skip with stub JSON (`status: "front_matter"`, `entries: []`). No preface transcription.
5. **Diacritics** → keep Hahn's printed form in `kurukh_word`; also emit `kurukh_word_ascii` (NFD-folded, diacritics stripped) for search.
