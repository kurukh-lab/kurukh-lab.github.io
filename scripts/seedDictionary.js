/**
 * Bulk-seeds /words collection from docs/book/kurukh_dictionary.json.
 *
 * Usage:
 *   node scripts/seedDictionary.js                     # emulator, wet run
 *   node scripts/seedDictionary.js --dry-run           # emulator, count only
 *   node scripts/seedDictionary.js --production        # production, wet run
 *   node scripts/seedDictionary.js --production --dry-run
 *
 * Production auth: gcloud auth application-default login
 *   OR set GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccountKey.json
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const args = process.argv.slice(2);
const IS_PRODUCTION = args.includes('--production');
const IS_DRY_RUN = args.includes('--dry-run');
const BATCH_SIZE = 400;
const COLLECTION = 'words';
const PROJECT_ID = 'kurukh-dictionary';
const JSON_PATH = resolve(__dirname, '../docs/book/kurukh_dictionary.json');

// Set emulator env vars BEFORE importing firebase-admin
if (!IS_PRODUCTION) {
  process.env.FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST ?? '127.0.0.1:8081';
  process.env.GCLOUD_PROJECT = PROJECT_ID;
  console.log('Mode: EMULATOR');
  console.log(`  Firestore: ${process.env.FIRESTORE_EMULATOR_HOST}`);
} else {
  console.log('Mode: PRODUCTION');
  console.warn('  WARNING: Writing to real Firestore project —', PROJECT_ID);
}

if (IS_DRY_RUN) {
  console.log('Dry-run: no writes will be performed.\n');
}

import admin from 'firebase-admin';

admin.initializeApp({ projectId: PROJECT_ID });
const db = admin.firestore();
const serverTimestamp = () => admin.firestore.FieldValue.serverTimestamp();

function slugify(text) {
  return (text ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function buildDocId(entry) {
  const base = slugify(entry.kurukh_word_ascii ?? entry.kurukh_word ?? '');
  const idx = entry.homograph_index;
  return idx != null && idx > 0 ? `${base}_${idx}` : base;
}

function buildFirestoreDoc(entry) {
  // Clean meanings: strip empty example sentence strings
  let meanings = (entry.meanings ?? []).map((m) => {
    const cleaned = { language: m.language, definition: m.definition };
    if (m.example_sentence_kurukh) cleaned.example_sentence_kurukh = m.example_sentence_kurukh;
    if (m.example_sentence_translation) cleaned.example_sentence_translation = m.example_sentence_translation;
    if (m.audio_url) cleaned.audio_url = m.audio_url;
    if (m.dialect) cleaned.dialect = m.dialect;
    if (m.region) cleaned.region = m.region;
    return cleaned;
  });

  // Synthesise meanings from flat fields when the array is absent/empty
  if (meanings.length === 0) {
    if (entry.english_definition) meanings.push({ language: 'en', definition: entry.english_definition });
    if (entry.hindi_definition) meanings.push({ language: 'hi', definition: entry.hindi_definition });
  }

  // linguistics sub-object (only written when at least one field is non-null)
  const linguistics = {};
  if (entry.grammatical_tag != null) linguistics.grammatical_tag = entry.grammatical_tag;
  if (entry.verb_class != null) linguistics.verb_class = entry.verb_class;
  if (entry.transitivity != null) linguistics.transitivity = entry.transitivity;
  if (entry.gender != null) linguistics.gender = entry.gender;
  if (entry.loanword_from != null) linguistics.loanword_from = entry.loanword_from;

  // book_source sub-object
  const book_source = {};
  if (entry.source?.book) book_source.book = entry.source.book;
  if (entry.source?.page_image) book_source.page_image = entry.source.page_image;
  if (entry.source?.page_label) book_source.page_label = entry.source.page_label;
  if (entry.hindi_source) book_source.hindi_source = entry.hindi_source;

  const doc = {
    kurukh_word: entry.kurukh_word,
    kurukh_word_ascii: entry.kurukh_word_ascii ?? slugify(entry.kurukh_word ?? ''),
    meanings,
    status: 'approved',
    contributor_id: entry.contributor_id ?? 'hahn-1903',
    community_votes_for: 0,
    community_votes_against: 0,
    likedBy: [],
    likesCount: 0,
    commentsCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  if (entry.homograph_index != null && entry.homograph_index > 0) doc.homograph_index = entry.homograph_index;
  if (entry.part_of_speech) doc.part_of_speech = entry.part_of_speech;
  if (Object.keys(linguistics).length > 0) doc.linguistics = linguistics;
  if (entry.notes) doc.notes = entry.notes;
  if (entry.example_phrase) doc.example_phrase = entry.example_phrase;
  if (entry.variant_of) doc.variant_of = entry.variant_of;
  if (entry.variants?.length > 0) doc.variants = entry.variants;
  if (Object.keys(book_source).length > 0) doc.book_source = book_source;

  return doc;
}

async function fetchExistingDocIds() {
  console.log('Fetching existing document IDs from /words...');
  const snap = await db.collection(COLLECTION).select().get();
  const ids = new Set(snap.docs.map((d) => d.id));
  console.log(`  Found ${ids.size} existing documents.`);
  return ids;
}

async function seedInBatches(entries, existingIds) {
  const toWrite = entries.filter((e) => {
    const docId = buildDocId(e);
    if (!docId) return false;
    return !existingIds.has(docId);
  });

  const skipped = entries.length - toWrite.length;
  console.log(`\nEntries to write: ${toWrite.length} (skipping ${skipped} existing)`);

  if (IS_DRY_RUN) {
    console.log('Dry-run complete. No writes performed.');
    return;
  }

  const totalBatches = Math.ceil(toWrite.length / BATCH_SIZE);
  let totalWritten = 0;

  for (let i = 0; i < toWrite.length; i += BATCH_SIZE) {
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const slice = toWrite.slice(i, i + BATCH_SIZE);
    const batch = db.batch();

    for (const entry of slice) {
      const docId = buildDocId(entry);
      if (!docId) {
        console.warn('  Skipping entry with no usable word key:', entry.kurukh_word);
        continue;
      }
      const docRef = db.collection(COLLECTION).doc(docId);
      batch.set(docRef, buildFirestoreDoc(entry));
    }

    await batch.commit();
    totalWritten += slice.length;
    console.log(`  Batch ${batchNum}/${totalBatches} committed — ${slice.length} docs (total: ${totalWritten})`);
  }

  console.log(`\nSeed complete. ${totalWritten} documents written to /${COLLECTION}.`);
}

async function main() {
  console.log('=== Kurukh Dictionary Seeder ===');
  console.log(`JSON source: ${JSON_PATH}\n`);

  const raw = JSON.parse(readFileSync(JSON_PATH, 'utf8'));
  const entries = raw.entries;
  console.log(`Source entries: ${entries.length}`);

  const existingIds = await fetchExistingDocIds();
  await seedInBatches(entries, existingIds);

  process.exit(0);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
