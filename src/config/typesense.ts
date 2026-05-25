import { Client } from 'typesense';

export const typesenseClient = new Client({
  nodes: [{
    host:     import.meta.env.VITE_TYPESENSE_HOST     ?? 'localhost',
    port:     Number(import.meta.env.VITE_TYPESENSE_PORT     ?? 8108),
    protocol: (import.meta.env.VITE_TYPESENSE_PROTOCOL ?? 'http') as 'http' | 'https',
  }],
  apiKey:                   import.meta.env.VITE_TYPESENSE_API_KEY ?? 'kurukh-local-key',
  connectionTimeoutSeconds: 3,
});

export const WORDS_COLLECTION = 'kurukh_words';
