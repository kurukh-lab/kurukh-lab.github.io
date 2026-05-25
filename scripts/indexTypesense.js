/**
 * Exports /words collection from Firestore into Typesense for fast search.
 *
 * Usage:
 *   node scripts/indexTypesense.js                 # emulator Firestore → localhost Typesense
 *   node scripts/indexTypesense.js --dry-run       # count only, no Typesense writes
 *   node scripts/indexTypesense.js --recreate      # drop + recreate the collection first
 *   node scripts/indexTypesense.js --production    # production Firestore + TYPESENSE_* env vars
 *
 * Env vars (all optional — defaults work for local docker-compose):
 *   TYPESENSE_HOST     default: localhost
 *   TYPESENSE_PORT     default: 8108
 *   TYPESENSE_PROTOCOL default: http
 *   TYPESENSE_API_KEY  default: kurukh-local-key
 *
 * Production Firestore auth: gcloud auth application-default login
 *   OR set GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccountKey.json
 */

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const args = process.argv.slice(2);
const IS_PRODUCTION = args.includes('--production');
const IS_DRY_RUN    = args.includes('--dry-run');
const RECREATE      = args.includes('--recreate');

const BATCH_SIZE      = 500;
const COLLECTION_NAME = 'kurukh_words';
const PROJECT_ID      = 'kurukh-dictionary';

// ─── Firestore setup ────────────────────────────────────────────────────────

if (!IS_PRODUCTION) {
  process.env.FIRESTORE_EMULATOR_HOST =
    process.env.FIRESTORE_EMULATOR_HOST ?? '127.0.0.1:8081';
  process.env.GCLOUD_PROJECT = PROJECT_ID;
  console.log('Firestore: EMULATOR', process.env.FIRESTORE_EMULATOR_HOST);
} else {
  console.log('Firestore: PRODUCTION —', PROJECT_ID);
}

if (IS_DRY_RUN) console.log('Dry-run: Typesense writes skipped.\n');

import admin from 'firebase-admin';
admin.initializeApp({ projectId: PROJECT_ID });
const db = admin.firestore();

// ─── Typesense setup ────────────────────────────────────────────────────────

const { Client } = await import('typesense');

const tsClient = new Client({
  nodes: [{
    host:     process.env.TYPESENSE_HOST     ?? 'localhost',
    port:     Number(process.env.TYPESENSE_PORT ?? 8108),
    protocol: process.env.TYPESENSE_PROTOCOL ?? 'http',
  }],
  apiKey:                   process.env.TYPESENSE_API_KEY ?? 'kurukh-local-key',
  connectionTimeoutSeconds: 10,
});

const COLLECTION_SCHEMA = {
  name: COLLECTION_NAME,
  fields: [
    { name: 'id',                  type: 'string'  },
    { name: 'kurukh_word',         type: 'string'  },
    { name: 'kurukh_word_ascii',   type: 'string'  },
    { name: 'status',              type: 'string',  facet: true              },
    { name: 'part_of_speech',      type: 'string',  facet: true, optional: true },
    { name: 'english_definition',  type: 'string',  optional: true           },
    { name: 'hindi_definition',    type: 'string',  optional: true           },
    { name: 'likes_count',         type: 'int32',   optional: true           },
  ],
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function extractDefinition(meanings, language) {
  if (!Array.isArray(meanings)) return undefined;
  const m = meanings.find((x) => x?.language === language);
  return m?.definition?.trim() || undefined;
}

function toTypesenseDoc(id, data) {
  const doc = {
    id,
    kurukh_word:       data.kurukh_word       ?? '',
    kurukh_word_ascii: data.kurukh_word_ascii  ?? '',
    status:            data.status             ?? 'pending_review',
    likes_count:       data.likesCount         ?? 0,
  };

  const pos = data.part_of_speech;
  if (pos) doc.part_of_speech = pos;

  const enDef = extractDefinition(data.meanings, 'en')
    ?? data.english_definition?.trim()
    ?? undefined;
  if (enDef) doc.english_definition = enDef;

  const hiDef = extractDefinition(data.meanings, 'hi')
    ?? data.hindi_definition?.trim()
    ?? undefined;
  if (hiDef) doc.hindi_definition = hiDef;

  return doc;
}

// ─── Ensure collection ──────────────────────────────────────────────────────

async function ensureCollection() {
  if (RECREATE) {
    try {
      await tsClient.collections(COLLECTION_NAME).delete();
      console.log('Collection dropped for recreation.');
    } catch {
      // didn't exist — fine
    }
  }

  try {
    await tsClient.collections(COLLECTION_NAME).retrieve();
    console.log(`Collection "${COLLECTION_NAME}" already exists — will upsert.`);
  } catch (err) {
    if (err?.httpStatus === 404) {
      await tsClient.collections().create(COLLECTION_SCHEMA);
      console.log(`Collection "${COLLECTION_NAME}" created.`);
    } else {
      throw err;
    }
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function run() {
  console.log('\nFetching words from Firestore…');
  const snapshot = await db.collection('words').get();
  const total = snapshot.size;
  console.log(`  ${total} documents found.`);

  if (IS_DRY_RUN) {
    console.log('\nDry-run complete. No Typesense writes performed.');
    return;
  }

  await ensureCollection();

  const docs = snapshot.docs.map((d) => toTypesenseDoc(d.id, d.data()));

  let indexed = 0;
  let errors  = 0;

  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = docs.slice(i, i + BATCH_SIZE);
    const results = await tsClient
      .collections(COLLECTION_NAME)
      .documents()
      .import(batch, { action: 'upsert' });

    for (const r of results) {
      if (!r.success) {
        errors++;
        console.error('  Failed doc:', r);
      } else {
        indexed++;
      }
    }

    const pct = Math.round(((i + batch.length) / docs.length) * 100);
    console.log(`  Batch ${Math.ceil((i + 1) / BATCH_SIZE)}: ${i + batch.length}/${total} (${pct}%)`);
  }

  console.log(`\nDone. ${indexed} indexed, ${errors} errors.`);
}

run().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
