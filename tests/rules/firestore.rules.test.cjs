/**
 * Firestore security rules — emulator-backed assertions.
 *
 * Run via:  npm run test:rules
 *
 * The npm script wraps this in `firebase emulators:exec --only firestore` so a
 * clean Firestore emulator is started for the duration of the run.
 */

const fs = require('fs');
const path = require('path');
const {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
} = require('@firebase/rules-unit-testing');
const {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  addDoc,
  serverTimestamp,
} = require('firebase/firestore');

const PROJECT_ID = 'kurukh-dictionary-rules-test';
const FIRESTORE_HOST = '127.0.0.1';
const FIRESTORE_PORT = Number(process.env.FIRESTORE_EMULATOR_PORT || 8080);

let testEnv;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules: fs.readFileSync(
        path.resolve(__dirname, '../../firestore.rules'),
        'utf8',
      ),
      host: FIRESTORE_HOST,
      port: FIRESTORE_PORT,
    },
  });
});

afterAll(async () => {
  if (testEnv) await testEnv.cleanup();
});

afterEach(async () => {
  if (testEnv) await testEnv.clearFirestore();
});

// ─── Seeding helpers ────────────────────────────────────────────────────

async function seedUser(uid, roles) {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, 'users', uid), {
      uid,
      username: `user-${uid}`,
      email: `${uid}@example.com`,
      roles,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });
}

async function seedDoc(collPath, id, data) {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, collPath, id), data);
  });
}

function asUser(uid) {
  return testEnv.authenticatedContext(uid).firestore();
}

function asAnon() {
  return testEnv.unauthenticatedContext().firestore();
}

// Realistic shape of a freshly-submitted word.
function newWordPayload(contributorUid, overrides = {}) {
  return {
    kurukh_word: 'aalas',
    meanings: [{ language: 'en', definition: 'laziness' }],
    contributor_id: contributorUid,
    status: 'community_review',
    community_votes_for: 0,
    community_votes_against: 0,
    reviewed_by: [],
    likedBy: [],
    likesCount: 0,
    commentsCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

// ─── /words ─────────────────────────────────────────────────────────────

describe('words: create', () => {
  test('anonymous cannot create a word (closes isEmulator backdoor)', async () => {
    await assertFails(
      addDoc(collection(asAnon(), 'words'), newWordPayload('anon')),
    );
  });

  test('registered user can create a community-review word as themselves', async () => {
    await seedUser('alice', ['user']);
    await assertSucceeds(
      addDoc(collection(asUser('alice'), 'words'), newWordPayload('alice')),
    );
  });

  test('registered user cannot create a word that is already approved', async () => {
    await seedUser('alice', ['user']);
    await assertFails(
      addDoc(
        collection(asUser('alice'), 'words'),
        newWordPayload('alice', { status: 'approved' }),
      ),
    );
  });

  test('registered user cannot create a word attributed to someone else', async () => {
    await seedUser('alice', ['user']);
    await seedUser('bob', ['user']);
    await assertFails(
      addDoc(
        collection(asUser('alice'), 'words'),
        newWordPayload('bob'),
      ),
    );
  });

  test('registered user cannot pre-seed votes on a new word', async () => {
    await seedUser('alice', ['user']);
    await assertFails(
      addDoc(
        collection(asUser('alice'), 'words'),
        newWordPayload('alice', { community_votes_for: 5 }),
      ),
    );
  });
});

describe('words: read', () => {
  test('anonymous can read an approved word', async () => {
    await seedDoc('words', 'w1', newWordPayload('alice', { status: 'approved' }));
    await assertSucceeds(getDoc(doc(asAnon(), 'words', 'w1')));
  });

  test('anonymous cannot read a community-review word', async () => {
    await seedDoc('words', 'w1', newWordPayload('alice'));
    await assertFails(getDoc(doc(asAnon(), 'words', 'w1')));
  });

  test('registered user can read a community-review word', async () => {
    await seedUser('alice', ['user']);
    await seedDoc('words', 'w1', newWordPayload('bob'));
    await assertSucceeds(getDoc(doc(asUser('alice'), 'words', 'w1')));
  });
});

describe('words: like updates', () => {
  test('anonymous can add their own like to an approved word', async () => {
    await seedDoc('words', 'w1', newWordPayload('alice', { status: 'approved' }));
    await assertSucceeds(
      updateDoc(doc(asAnon(), 'words', 'w1'), {
        likedBy: ['anon-id-1'],
        likesCount: 1,
        updatedAt: new Date(),
      }),
    );
  });

  test('like update cannot also change kurukh_word or status', async () => {
    await seedDoc('words', 'w1', newWordPayload('alice', { status: 'approved' }));
    await assertFails(
      updateDoc(doc(asAnon(), 'words', 'w1'), {
        likedBy: ['anon-id-1'],
        likesCount: 1,
        kurukh_word: 'pwnd',
        updatedAt: new Date(),
      }),
    );
  });

  test('like update with mismatched likesCount/likedBy is rejected', async () => {
    await seedDoc('words', 'w1', newWordPayload('alice', { status: 'approved' }));
    await assertFails(
      updateDoc(doc(asAnon(), 'words', 'w1'), {
        likedBy: ['anon-id-1'],
        likesCount: 999,
        updatedAt: new Date(),
      }),
    );
  });

  test('like update growing the array by more than 1 is rejected', async () => {
    await seedDoc('words', 'w1', newWordPayload('alice', { status: 'approved' }));
    await assertFails(
      updateDoc(doc(asAnon(), 'words', 'w1'), {
        likedBy: ['a', 'b', 'c'],
        likesCount: 3,
        updatedAt: new Date(),
      }),
    );
  });
});

describe('words: community votes', () => {
  test('non-contributor registered user can record an approve vote', async () => {
    await seedUser('alice', ['user']);
    await seedUser('bob', ['user']);
    await seedDoc('words', 'w1', newWordPayload('alice'));
    await assertSucceeds(
      updateDoc(doc(asUser('bob'), 'words', 'w1'), {
        community_votes_for: 1,
        community_votes_against: 0,
        reviewed_by: [
          { user_id: 'bob', vote: 'approve', comment: '', timestamp: new Date() },
        ],
        status: 'community_review',
        updatedAt: new Date(),
      }),
    );
  });

  test('contributor cannot vote on their own word', async () => {
    await seedUser('alice', ['user']);
    await seedDoc('words', 'w1', newWordPayload('alice'));
    await assertFails(
      updateDoc(doc(asUser('alice'), 'words', 'w1'), {
        community_votes_for: 1,
        community_votes_against: 0,
        reviewed_by: [
          { user_id: 'alice', vote: 'approve', comment: '', timestamp: new Date() },
        ],
        status: 'community_review',
        updatedAt: new Date(),
      }),
    );
  });

  test('vote claiming to come from a different uid is rejected', async () => {
    await seedUser('alice', ['user']);
    await seedUser('bob', ['user']);
    await seedDoc('words', 'w1', newWordPayload('alice'));
    await assertFails(
      updateDoc(doc(asUser('bob'), 'words', 'w1'), {
        community_votes_for: 1,
        community_votes_against: 0,
        reviewed_by: [
          { user_id: 'mallory', vote: 'approve', comment: '', timestamp: new Date() },
        ],
        status: 'community_review',
        updatedAt: new Date(),
      }),
    );
  });

  test('non-admin cannot flip status to approved via a vote', async () => {
    await seedUser('alice', ['user']);
    await seedUser('bob', ['user']);
    await seedDoc('words', 'w1', newWordPayload('alice'));
    await assertFails(
      updateDoc(doc(asUser('bob'), 'words', 'w1'), {
        community_votes_for: 1,
        community_votes_against: 0,
        reviewed_by: [
          { user_id: 'bob', vote: 'approve', comment: '', timestamp: new Date() },
        ],
        status: 'approved',
        updatedAt: new Date(),
      }),
    );
  });

  test('non-admin cannot directly edit kurukh_word on an existing word', async () => {
    await seedUser('alice', ['user']);
    await seedDoc('words', 'w1', newWordPayload('bob'));
    await assertFails(
      updateDoc(doc(asUser('alice'), 'words', 'w1'), {
        kurukh_word: 'tampered',
        updatedAt: new Date(),
      }),
    );
  });
});

describe('words: admin', () => {
  test('admin can approve a word', async () => {
    await seedUser('admin1', ['admin']);
    await seedDoc('words', 'w1', newWordPayload('alice'));
    await assertSucceeds(
      updateDoc(doc(asUser('admin1'), 'words', 'w1'), {
        status: 'approved',
        updatedAt: new Date(),
      }),
    );
  });

  test('admin can delete a word', async () => {
    await seedUser('admin1', ['admin']);
    await seedDoc('words', 'w1', newWordPayload('alice'));
    await assertSucceeds(deleteDoc(doc(asUser('admin1'), 'words', 'w1')));
  });

  test('registered non-admin cannot delete a word', async () => {
    await seedUser('alice', ['user']);
    await seedDoc('words', 'w1', newWordPayload('bob'));
    await assertFails(deleteDoc(doc(asUser('alice'), 'words', 'w1')));
  });
});

// ─── /users ─────────────────────────────────────────────────────────────

describe('users', () => {
  test('user cannot self-promote to admin', async () => {
    await seedUser('alice', ['user']);
    await assertFails(
      updateDoc(doc(asUser('alice'), 'users', 'alice'), {
        roles: ['admin'],
        updatedAt: new Date(),
      }),
    );
  });

  test('user can update their own non-role fields', async () => {
    await seedUser('alice', ['user']);
    await assertSucceeds(
      updateDoc(doc(asUser('alice'), 'users', 'alice'), {
        username: 'alice-new',
        updatedAt: new Date(),
      }),
    );
  });

  test('user cannot read another user document', async () => {
    await seedUser('alice', ['user']);
    await seedUser('bob', ['user']);
    await assertFails(getDoc(doc(asUser('alice'), 'users', 'bob')));
  });

  test('admin can read any user document', async () => {
    await seedUser('admin1', ['admin']);
    await seedUser('bob', ['user']);
    await assertSucceeds(getDoc(doc(asUser('admin1'), 'users', 'bob')));
  });

  test('admin can change another user roles', async () => {
    await seedUser('admin1', ['admin']);
    await seedUser('bob', ['user']);
    await assertSucceeds(
      updateDoc(doc(asUser('admin1'), 'users', 'bob'), {
        roles: ['user', 'admin'],
        updatedAt: new Date(),
      }),
    );
  });
});

// ─── /reports ───────────────────────────────────────────────────────────

describe('reports', () => {
  test('user can create a report for themselves', async () => {
    await seedUser('alice', ['user']);
    await assertSucceeds(
      addDoc(collection(asUser('alice'), 'reports'), {
        word_id: 'w1',
        user_id: 'alice',
        reason: 'incorrect',
        details: '',
        status: 'open',
        createdAt: new Date(),
      }),
    );
  });

  test('user cannot impersonate another user when creating a report', async () => {
    await seedUser('alice', ['user']);
    await seedUser('bob', ['user']);
    await assertFails(
      addDoc(collection(asUser('alice'), 'reports'), {
        word_id: 'w1',
        user_id: 'bob',
        reason: 'incorrect',
        details: '',
        status: 'open',
        createdAt: new Date(),
      }),
    );
  });

  test('user cannot read someone else\'s report', async () => {
    await seedUser('alice', ['user']);
    await seedUser('bob', ['user']);
    await seedDoc('reports', 'r1', {
      word_id: 'w1',
      user_id: 'bob',
      reason: 'x',
      status: 'open',
    });
    await assertFails(getDoc(doc(asUser('alice'), 'reports', 'r1')));
  });

  test('admin can read any report', async () => {
    await seedUser('admin1', ['admin']);
    await seedDoc('reports', 'r1', {
      word_id: 'w1',
      user_id: 'bob',
      reason: 'x',
      status: 'open',
    });
    await assertSucceeds(getDoc(doc(asUser('admin1'), 'reports', 'r1')));
  });

  test('non-admin cannot resolve a report', async () => {
    await seedUser('alice', ['user']);
    await seedDoc('reports', 'r1', {
      word_id: 'w1',
      user_id: 'alice',
      reason: 'x',
      status: 'open',
    });
    await assertFails(
      updateDoc(doc(asUser('alice'), 'reports', 'r1'), { status: 'resolved' }),
    );
  });
});

// ─── /corrections ───────────────────────────────────────────────────────

describe('corrections', () => {
  function newCorrection(uid, overrides = {}) {
    return {
      word_id: 'w1',
      user_id: uid,
      correction_type: 'definition',
      current_value: 'old',
      proposed_change: 'new',
      explanation: '',
      status: 'shallow_review',
      review_level: 'community',
      votes_for: 0,
      votes_against: 0,
      reviewed_by: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  test('user can submit a correction as themselves', async () => {
    await seedUser('alice', ['user']);
    await assertSucceeds(
      addDoc(collection(asUser('alice'), 'corrections'), newCorrection('alice')),
    );
  });

  test('user cannot submit a correction pre-marked as approved', async () => {
    await seedUser('alice', ['user']);
    await assertFails(
      addDoc(
        collection(asUser('alice'), 'corrections'),
        newCorrection('alice', { status: 'approved', votes_for: 5 }),
      ),
    );
  });

  test('non-author user can vote on a correction', async () => {
    await seedUser('alice', ['user']);
    await seedUser('bob', ['user']);
    await seedDoc('corrections', 'c1', newCorrection('alice'));
    await assertSucceeds(
      updateDoc(doc(asUser('bob'), 'corrections', 'c1'), {
        votes_for: 1,
        votes_against: 0,
        reviewed_by: [
          { user_id: 'bob', vote: 'approve', comment: '', timestamp: new Date() },
        ],
        status: 'shallow_review',
        updatedAt: new Date(),
      }),
    );
  });

  test('author cannot vote on their own correction', async () => {
    await seedUser('alice', ['user']);
    await seedDoc('corrections', 'c1', newCorrection('alice'));
    await assertFails(
      updateDoc(doc(asUser('alice'), 'corrections', 'c1'), {
        votes_for: 1,
        votes_against: 0,
        reviewed_by: [
          { user_id: 'alice', vote: 'approve', comment: '', timestamp: new Date() },
        ],
        status: 'shallow_review',
        updatedAt: new Date(),
      }),
    );
  });

  test('non-admin cannot mark a correction as applied', async () => {
    await seedUser('bob', ['user']);
    await seedDoc('corrections', 'c1', newCorrection('alice'));
    await assertFails(
      updateDoc(doc(asUser('bob'), 'corrections', 'c1'), {
        status: 'applied',
        updatedAt: new Date(),
      }),
    );
  });

  test('admin can mark a correction as applied', async () => {
    await seedUser('admin1', ['admin']);
    await seedDoc('corrections', 'c1', newCorrection('alice'));
    await assertSucceeds(
      updateDoc(doc(asUser('admin1'), 'corrections', 'c1'), {
        status: 'applied',
        updatedAt: new Date(),
      }),
    );
  });
});

// ─── /comments ──────────────────────────────────────────────────────────

describe('comments', () => {
  function newComment(uid, overrides = {}) {
    return {
      wordId: 'w1',
      userId: uid,
      content: 'hello',
      parentCommentId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      upvotes: 0,
      downvotes: 0,
      upvotedBy: [],
      downvotedBy: [],
      replyCount: 0,
      isDeleted: false,
      ...overrides,
    };
  }

  test('user can create a comment as themselves', async () => {
    await seedUser('alice', ['user']);
    await assertSucceeds(
      addDoc(collection(asUser('alice'), 'comments'), newComment('alice')),
    );
  });

  test('user cannot create a comment as someone else', async () => {
    await seedUser('alice', ['user']);
    await assertFails(
      addDoc(collection(asUser('alice'), 'comments'), newComment('bob')),
    );
  });

  test('user can edit their own comment content only', async () => {
    await seedUser('alice', ['user']);
    await seedDoc('comments', 'c1', newComment('alice'));
    await assertSucceeds(
      updateDoc(doc(asUser('alice'), 'comments', 'c1'), {
        content: 'edited',
        updatedAt: new Date(),
        isEdited: true,
      }),
    );
  });

  test('user cannot edit someone else\'s comment', async () => {
    await seedUser('alice', ['user']);
    await seedDoc('comments', 'c1', newComment('bob'));
    await assertFails(
      updateDoc(doc(asUser('alice'), 'comments', 'c1'), {
        content: 'tampered',
        updatedAt: new Date(),
      }),
    );
  });

  test('user can upvote a comment by adding their own uid', async () => {
    await seedUser('alice', ['user']);
    await seedDoc('comments', 'c1', newComment('bob'));
    await assertSucceeds(
      updateDoc(doc(asUser('alice'), 'comments', 'c1'), {
        upvotes: 1,
        downvotes: 0,
        upvotedBy: ['alice'],
        downvotedBy: [],
        updatedAt: new Date(),
      }),
    );
  });

  test('user cannot stuff another uid into upvotedBy', async () => {
    await seedUser('alice', ['user']);
    await seedDoc('comments', 'c1', newComment('bob'));
    await assertFails(
      updateDoc(doc(asUser('alice'), 'comments', 'c1'), {
        upvotes: 1,
        downvotes: 0,
        upvotedBy: ['mallory'],
        downvotedBy: [],
        updatedAt: new Date(),
      }),
    );
  });

  test('admin can override another user\'s comment content', async () => {
    await seedUser('admin1', ['admin']);
    await seedDoc('comments', 'c1', newComment('bob'));
    await assertSucceeds(
      updateDoc(doc(asUser('admin1'), 'comments', 'c1'), {
        content: '[moderated]',
        updatedAt: new Date(),
      }),
    );
  });

  test('user can soft-delete their own comment', async () => {
    await seedUser('alice', ['user']);
    await seedDoc('comments', 'c1', newComment('alice'));
    await assertSucceeds(
      updateDoc(doc(asUser('alice'), 'comments', 'c1'), {
        isDeleted: true,
        content: '[deleted]',
        deletedAt: new Date(),
        updatedAt: new Date(),
      }),
    );
  });
});

// ─── /static_data ───────────────────────────────────────────────────────

describe('static_data', () => {
  test('anonymous can read static_data', async () => {
    await seedDoc('static_data', 'home-page', { recentWords: [] });
    await assertSucceeds(getDoc(doc(asAnon(), 'static_data', 'home-page')));
  });

  test('non-admin cannot write to static_data', async () => {
    await seedUser('alice', ['user']);
    await assertFails(
      setDoc(doc(asUser('alice'), 'static_data', 'home-page'), { recentWords: [] }),
    );
  });

  test('admin can write to static_data', async () => {
    await seedUser('admin1', ['admin']);
    await assertSucceeds(
      setDoc(doc(asUser('admin1'), 'static_data', 'home-page'), { recentWords: [] }),
    );
  });
});
