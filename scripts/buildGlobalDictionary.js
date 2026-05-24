#!/usr/bin/env node
// Combines all per-page JSON files in docs/book/ilovepdf_pages-to-jpg/ into
// docs/book/kurukh_dictionary.json. Idempotent — safe to re-run after each batch.
//
// Usage: node scripts/buildGlobalDictionary.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BOOK_DIR = path.join(__dirname, '..', 'docs', 'book');
const PAGES_DIR = path.join(BOOK_DIR, 'ilovepdf_pages-to-jpg');
const OUT_FILE = path.join(BOOK_DIR, 'kurukh_dictionary.json');

const pageFiles = fs.readdirSync(PAGES_DIR)
  .filter(f => f.endsWith('.json'))
  .sort();

const entries = [];
let extractedPages = 0;
let frontMatterPages = 0;
let pendingPages = 0;

for (const filename of pageFiles) {
  const raw = JSON.parse(fs.readFileSync(path.join(PAGES_DIR, filename), 'utf8'));
  if (raw.status === 'extracted') {
    extractedPages += 1;
    for (const entry of raw.entries) entries.push(entry);
  } else if (raw.status === 'front_matter') {
    frontMatterPages += 1;
  } else {
    pendingPages += 1;
  }
}

const out = {
  source: {
    book: 'Kurukh (Oraon)-English Dictionary, Part I',
    author: 'Revd. Ferd. Hahn',
    publisher: 'Bengal Secretariat Press, Calcutta',
    year: 1903,
    scan_directory: 'docs/book/ilovepdf_pages-to-jpg/',
  },
  extraction: {
    tool: 'Claude (vision OCR + transliteration)',
    hindi_source: 'model-translated',
    entry_status: 'pending_review',
    contributor_id: 'hahn-1903',
  },
  generated_at: new Date().toISOString(),
  pages_extracted: extractedPages,
  pages_front_matter: frontMatterPages,
  pages_pending: pendingPages,
  total_entries: entries.length,
  entries,
};

fs.writeFileSync(OUT_FILE, JSON.stringify(out, null, 2) + '\n');
console.log(`wrote ${OUT_FILE}`);
console.log(`  pages: ${extractedPages} extracted, ${frontMatterPages} front_matter, ${pendingPages} pending`);
console.log(`  entries: ${entries.length}`);
