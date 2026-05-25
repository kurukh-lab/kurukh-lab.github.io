import { typesenseClient, WORDS_COLLECTION } from '../config/typesense';
import type { SearchOptions, Word } from '../types';

interface TypesenseWordDoc {
  id: string;
  kurukh_word: string;
  kurukh_word_ascii: string;
  status: string;
  part_of_speech?: string;
  english_definition?: string;
  hindi_definition?: string;
  likes_count?: number;
}

export const searchWordsTypesense = async (
  term: string,
  options: SearchOptions = {},
): Promise<Word[]> => {
  // Which fields to search — narrow by language when the filter is set
  const queryBy =
    options.language === 'en'
      ? 'kurukh_word,kurukh_word_ascii,english_definition'
      : options.language === 'hi'
        ? 'kurukh_word,kurukh_word_ascii,hindi_definition'
        : 'kurukh_word,kurukh_word_ascii,english_definition,hindi_definition';

  const filterParts: string[] = ['status:!=[rejected,community_rejected]'];
  if (options.partOfSpeech) {
    filterParts.push(`part_of_speech:=${options.partOfSpeech}`);
  }

  const results = await typesenseClient
    .collections<TypesenseWordDoc>(WORDS_COLLECTION)
    .documents()
    .search({
      q:          term,
      query_by:   queryBy,
      filter_by:  filterParts.join(' && '),
      per_page:   100,
      sort_by:    '_text_match:desc',
      prefix:     true,
    });

  return (results.hits ?? []).map((hit) => {
    const d = hit.document;
    const meanings: Word['meanings'] = [];
    if (d.english_definition) meanings.push({ language: 'en', definition: d.english_definition });
    if (d.hindi_definition)   meanings.push({ language: 'hi', definition: d.hindi_definition });

    return {
      id:                    d.id,
      kurukh_word:           d.kurukh_word,
      kurukh_word_ascii:     d.kurukh_word_ascii,
      status:                d.status as Word['status'],
      part_of_speech:        d.part_of_speech,
      meanings,
      likesCount:            d.likes_count ?? 0,
      likedBy:                 [],
      community_votes_for:     0,
      community_votes_against: 0,
      reviewed_by:             [],
      commentsCount:           0,
      contributor_id:          '',
      createdAt:               null as unknown as Word['createdAt'],
      updatedAt:               null as unknown as Word['updatedAt'],
    };
  });
};
