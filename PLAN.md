# Maintainability Plan

This is a concrete, prioritised roadmap for making the Kurukh Dictionary easier to maintain, extend, and onboard new contributors to. Each item lists **what**, **why it matters**, **how to do it**, and a rough **effort** ("S" = under a day, "M" = a few days, "L" = a week+).

For an overview of the system as it stands today, see [ARCHITECTURE.md](ARCHITECTURE.md). For setup, see [README.md](README.md).

Items are grouped roughly by leverage — quick wins first, structural changes later. Nothing here is a feature request; the goal is to make the existing app cheaper to keep running.

---

## Legend

| Priority | Meaning |
|----------|---------|
| 🔴 P0 | Correctness or security — schedule first. |
| 🟠 P1 | High-leverage cleanup that unlocks other work. |
| 🟡 P2 | Improves day-to-day developer experience. |
| 🟢 P3 | Nice to have once everything above ships. |

---

## 1. Remove duplicate and dead files 🟠 P1 — Effort: **S**

**What**

There are several pairs of files where only one is actually loaded; the other is dead code that misleads readers and grep results.

| Keep | Delete |
|------|--------|
| `babel.config.cjs` | `babel.config.js` (ESM `type: module` in `package.json` ignores `.js` Babel config) |
| `jest.config.cjs` | `jest.config.js` |
| `src/state/wordReviewMachine.js` | `src/state/wordReviewMachine.new.js` |
| `src/components/WordReviewStateMachine.jsx` (or `.v5.jsx`, decide which is current) | the other |
| `src/utils/highlightUtils.js` **or** `.jsx` (pick one based on JSX usage) | the other |
| `scripts/addTestWord.js` | `scripts/addTestWord.cjs` (or vice versa, depending on whether scripts run as ESM or CJS) |
| `scripts/finalVerification.js` | `scripts/finalVerification.cjs` |
| `README.md` | `README.md.addition` (now folded into the new README) |
| `storage.old.rules` | delete — there is no active `storage.rules` referenced anywhere |
| `firestore-debug.log` | delete and add to `.gitignore` |

**Why**

Each duplicate is a future bug magnet: someone edits the inactive copy and is then confused when nothing changes. The `.new.` and `.v5.` suffixes especially suggest abandoned migrations.

**How**

1. `git mv` or delete the listed files.
2. Run `npm test && npm run build` to confirm nothing references the deleted versions.
3. Add `dist/`, `coverage/`, `firestore-debug.log`, `*-debug.log`, and `.firebase/` to `.gitignore` if missing.

---

## 2. Tidy the `scripts/` directory 🟠 P1 — Effort: **S**

**What**

Today `scripts/` contains 47+ files mixing four very different things: DB seeding, one-off debugging, emulator smoke tests, and "manual test runners". Split them:

```
scripts/
├── seed/                 # initializeDatabase.js, addApprovedWords.js, …
├── manual-tests/         # testCommunityReview*.js, testCommentThreads*.js, …
└── debug/                # debugSearch.js, checkReports.js, finalVerification.js, …
```

Add a `scripts/README.md` listing each script, its purpose, whether it expects emulators or production, and the command to run it. Delete the scripts that no longer apply (e.g. `verifyWordReportsFix.js`, `testTimingFix.js` — referring to historic fixes).

**Why**

Right now nobody can tell which scripts are still useful. Reorganising costs an afternoon and saves "what does this do?" cycles forever.

---

## 3. Replace client-side full-table search 🔴 P0 (eventually) — Effort: **M-L**

**What**

`searchWords()` ([src/services/dictionaryService.js:143](src/services/dictionaryService.js#L143)) downloads every approved word on every search. This works at a few hundred entries; it does not work at ten thousand.

**Why**

This is the single biggest scalability cliff in the system. The page-load cost grows linearly with the dictionary, and Firestore reads are billed per document.

**How — three options, ordered by cost vs. quality**

1. **Cheap (S):** Build an in-memory index in the scheduled `updateHomePageData` job. Store a `{ kurukh_word_lower, id, meanings_preview }` array on `static_data/search-index`. Client fetches once, searches locally. Fine up to ~50k entries; one read instead of N.
2. **Better (M):** Add **Typesense** or **Algolia** (Algolia has a free dev tier). Index `words` on write via a Cloud Function trigger. Replace `searchWords` with a SDK call. Get fuzzy + typo-tolerant search for free.
3. **Best for a Firebase-native shop (M):** Use **Firestore Bundles** to ship a pre-built read-only word index, or **Firestore vector search** if semantic matching matters later.

Either way, *also* fix the missing-paging case: `getWordsForCommunityReview` and `getCorrectionsForReview` use `limit` but no cursor, so admins can't see past the first page.

---

## 4. Fix the `AuthContext` sign-out recursion 🔴 P0 — Effort: **S**

**What**

[`AuthContext.jsx:155-160`](src/contexts/AuthContext.jsx#L155-L160) calls `logout()` from inside the `onAuthStateChanged` else-branch. `logout()` triggers `signOut(auth)`, which re-fires `onAuthStateChanged`, which re-enters the else-branch. It's saved only by `setCurrentUser(null)` being a no-op the second time.

**Why**

It's a latent bug — any future change to `logout()` that adds side-effects (analytics ping, navigation, etc.) will fire twice. It also masks errors during sign-out because they happen during an event handler.

**How**

Drop the `logout()` call from the listener. The user is already signed out at that point; just clear local state:

```jsx
} else {
  setCurrentUser(null);
  setLoading(false);
}
```

Also: the `useEffect` returns the `unsubscribe` function from *inside* the async callback, which means the effect's cleanup is `undefined`. Move the listener out of the inner async function so `unsubscribe` is the actual return value. While you're there, drop the `navigate('/login')` in the `register` `finally` block — it fires even when registration fails.

---

## 5. Tighten Firestore security rules 🔴 P0 — Effort: **S-M**

**What**

A few rules are looser than they should be:

1. **`isLikeUpdate`** lets *any* caller (including unauthenticated) increment `likesCount` arbitrarily. Limit to:
   - `request.resource.data.likesCount == resource.data.likesCount + 1` (or `-1`)
   - `request.resource.data.likedBy.size() == resource.data.likedBy.size() ± 1`
   - the changing entry corresponds to `request.auth.uid` (when present) or — accept the trade-off and rate-limit via a Cloud Function.
2. **`comments/{commentId}` update** is open to any registered user. It should restrict edits to the author (`resource.data.userId == request.auth.uid`) and gate vote-field updates separately.
3. **`static_data/`** allows writes when `request.auth.token.firebase.sign_in_provider == 'firebase'` — that's any signed-in user. The scheduled function uses admin SDK and bypasses rules anyway; this clause should be `if false` so no client can ever overwrite the home-page payload.
4. **`reports/`**: `allow write: if request.auth != null;` lets any user *update* anyone's report. Split into `create` (any auth user, restricted to setting `user_id` to themselves) and `update` (admin only).

**Why**

The dictionary is small and well-meaning right now, but rule mistakes never get exploited until they get exploited.

**How**

Write rule tests using the [Firebase Rules Unit Testing](https://firebase.google.com/docs/rules/unit-tests) SDK (`@firebase/rules-unit-testing`). Add a `npm run test:rules` script. The library runs against the emulator, so it slots into existing tooling cleanly.

---

## 6. Adopt TypeScript (incrementally) 🟠 P1 — Effort: **L** — ✅ **DONE**

**What**

Convert the codebase to TypeScript starting from the inside out.

**Status — complete as of 2026-05-16**

Every file under `src/` is now `.ts` or `.tsx`. `tsconfig.json` runs with `strict: true` and `allowJs: false`. `npx tsc --noEmit`, `npm test` (13/13 passing across 9 suites), and `npm run build` are all green.

Order it actually shipped in:

1. ✅ Added `typescript` + `@types/react` + `@types/react-dom`. Initial `tsconfig.json` was permissive (`allowJs: true`, strict on).
2. ✅ Shared domain types live in [src/types/domain.ts](src/types/domain.ts) and [src/types/index.ts](src/types/index.ts).
3. ✅ Services converted: [dictionaryService.ts](src/services/dictionaryService.ts), [wordReviewService.ts](src/services/wordReviewService.ts), [commentService.ts](src/services/commentService.ts).
4. ✅ Hooks converted: [useSearch.ts](src/hooks/useSearch.ts), [useWordReview.ts](src/hooks/useWordReview.ts), [useKeyboardShortcut.ts](src/hooks/useKeyboardShortcut.ts).
5. ✅ Components migrated in waves: design-system leaves → auth/layout → dictionary feature → loose review → editor (Tiptap).
6. ✅ All 17 pages migrated (`Home`, `Admin`, `Contribute`, `KurukhEditor`, `WordDetails`, `CommunityReview`, `UserProfile`, etc.).
7. ✅ Entry points: [main.tsx](src/main.tsx), [App.tsx](src/App.tsx), [i18n/index.ts](src/i18n/index.ts).
8. ✅ Test suite migrated to `.tsx`/`.ts`. `test-kurukh-editor.js` deleted.
9. ✅ Flipped `allowJs` to `false` in [tsconfig.json](tsconfig.json) — no JS files remain in the program.

**Follow-up worth doing later (not blocking)**

- Audit any remaining `any`/`unknown` escape hatches in services that handle raw Firestore docs.
- Consider turning on `noUnusedLocals`/`noUnusedParameters` once the codebase stabilises.

---

## 7. Add CI 🟠 P1 — Effort: **S**

**What**

A single GitHub Actions workflow that runs on every PR:

```yaml
# .github/workflows/ci.yml
on: [push, pull_request]
jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npm run build
```

Add a second job that runs Firestore rule tests against the emulator (see §5). Add branch protection on `main` requiring CI green.

**Why**

Right now there is nothing that fails a PR. The first contributor who breaks the build does so silently.

---

## 8. Break up oversized components 🟡 P2 — Effort: **M**

**What**

Some single-file components have grown past the point where they're easy to reason about:

| File | LOC | What to extract |
|------|-----|-----------------|
| [src/pages/Admin.jsx](src/pages/Admin.jsx) | 30 KB | Stats panel, word list, reports list, debug widgets — each becomes a `components/admin/*.jsx`. |
| [src/pages/Contribute.jsx](src/pages/Contribute.jsx) | 27 KB | The form should split into a `ContributionForm` + per-meaning subcomponent + a hook that owns submit state. |
| [src/pages/KurukhEditor.jsx](src/pages/KurukhEditor.jsx) + [TiptapEditorDemo.jsx](src/pages/TiptapEditorDemo.jsx) | 25 + 22 KB | Editor toolbar / preview / export panel are separate concerns. |
| [src/services/dictionaryService.js](src/services/dictionaryService.js) | 1005 LOC | Split into `wordsService`, `votesService`, `correctionsService`, `homePageService`, `reportsService` mirroring the function boundaries already present. |
| [src/services/commentService.js](src/services/commentService.js) | 508 LOC | Same idea — separate threading from voting. |

**Why**

Big components mean every PR touches the same file. Smaller modules give clearer git blame and easier code review.

**How**

Move one block per PR. Each refactor should be **mechanical** (cut a JSX subtree → paste into new file → import) so reviews are quick.

---

## 9. Standardise file extensions and naming 🟡 P2 — Effort: **S**

**What**

- Files that return JSX → `.jsx` (most pages and components are already correct).
- Files that don't (services, hooks, utils) → `.js`.
- `src/utils/highlightUtils.jsx` exists alongside `highlightUtils.js` — pick whichever the codebase actually imports and delete the other (see §1).
- Either commit to `snake_case` or `camelCase` for Firestore fields — both are present (e.g. `likes_count` vs `likesCount`, `community_votes_for` vs `votes_for`). Standardising avoids fallback chains like `b.likes_count ?? b.likes ?? 0` ([src/pages/Home.jsx:45](src/pages/Home.jsx#L45)).

**Why**

Consistency is free once it's done and infuriating until it is.

---

## 10. Bring `firebase-admin` versions in line 🟡 P2 — Effort: **S**

**What**

Root `package.json` pins `firebase-admin: ^13.4.0`; `functions/package.json` pins `^11.8.0`. Functions also pins `firebase-functions: ^6.3.2` and uses v2 SDK calls (`onRequest` from `firebase-functions/v2/https`), so the runtime works — but the version drift makes copy-pasting code between contexts dangerous.

**How**

Upgrade the functions package to `firebase-admin ^13` and `firebase-functions ^6` together (the v2 API is stable across both). Run the emulator suite + smoke tests after upgrading.

---

## 11. Replace ad-hoc dev routes with a single dev panel 🟡 P2 — Effort: **S**

**What**

Today `App.jsx` mounts five dev-only routes (`/firebase-test`, `/admin-debug`, `/like-test`, `/highlight-test`, `/word-review-demo`) each gated on `import.meta.env.DEV`. Each ships as its own lazy chunk only in dev, but they clutter `pages/`.

Move them under `src/pages/dev/` and expose a single `/dev` index that lists them. Optionally hide all dev pages behind `?dev=1` rather than only `DEV` — useful when reproducing prod issues on a deployed preview channel.

---

## 12. Reduce hardcoded URLs 🟡 P2 — Effort: **S**

**What**

[src/services/dictionaryService.js](src/services/dictionaryService.js) hardcodes:

```js
import.meta.env.DEV
  ? 'http://localhost:5011/kurukh-dictionary/us-central1/getDictionaryStats'
  : 'https://us-central1-kurukh-dictionary.cloudfunctions.net/getDictionaryStats';
```

This bakes the project ID and region in the source. Move to environment variables (`VITE_FUNCTIONS_REGION`, `VITE_FUNCTIONS_HOST`) or — better — use `httpsCallable(functions, 'getDictionaryStats')` consistently so the Firebase SDK handles emulator vs. prod automatically (it already does for callable functions in the codebase).

---

## 13. Establish a logging convention 🟡 P2 — Effort: **S**

**What**

The codebase has hundreds of `console.log` calls, many with emoji prefixes (`🔥`, `🎯`, `✅`). Most are debugging leftovers.

**How**

- Add a tiny logger wrapper (`src/utils/log.js`) that no-ops in production: `export const log = import.meta.env.DEV ? console.log : () => {};`.
- Replace `console.log` calls with `log()`; keep `console.error` for genuine errors.
- Set up an ESLint rule (`no-console: ['error', { allow: ['warn', 'error'] }]`) to enforce going forward.

---

## 14. Add a real E2E suite 🟢 P3 — Effort: **M**

**What**

The `e2e/` directory is empty. Add **Playwright** with a small set of journey tests:

1. Anonymous user searches → opens a word → likes it.
2. User registers → logs in → contributes a word → it appears in `/review`.
3. Admin promotes through the full pipeline.

Run them in CI against the emulator suite (`firebase emulators:exec --project kurukh-dictionary "npx playwright test"`).

**Why**

The current Jest tests cover services but not real user flows. The XState + Firestore split is exactly the kind of code that breaks silently when one side changes.

---

## 15. Documentation hygiene 🟢 P3 — Effort: **S**

**What**

The `docs/` folder has 17 files with overlapping topics — multiple "summary", "implementation report", and "manual tests" files for the same features. Consolidate:

- Merge the four `COMMUNITY_REVIEW_*` files into one canonical doc.
- Merge `XSTATE_IMPLEMENTATION.md`, `XSTATE_V5_MIGRATION.md`, and `WORD_REVIEW_XSTATE.md` into a single state-machine doc.
- Archive (or delete) the historical reports (`LIKE_FEATURE_COMPLETE.md`, `SEARCH_FIX_SUMMARY.md`, `PULL_REQUEST.md`) — they belong in git history, not the repo.
- Keep `DEPLOYMENT.md`, the canonical XState doc, and the canonical community-review doc; delete the rest or move them to `docs/history/`.

The new top-level README + ARCHITECTURE + PLAN takes the rest of the load.

---

## 16. Error and loading-state primitives 🟢 P3 — Effort: **S**

**What**

Every page currently re-implements its own `loading`/`error` state and falls back to either a spinner or a translated alert string. Extract two primitives:

- `<AsyncBoundary loading={…} error={…}>{children}</AsyncBoundary>` — handles the three states uniformly.
- A `useFirestoreDoc(path)` / `useFirestoreQuery(query)` hook pair backed by `onSnapshot`.

Page components shrink, and the network/empty-state UX gets consistent at the same time.

---

## 17. Bundle and performance budget 🟢 P3 — Effort: **S**

**What**

The frontend ships TipTap, jsPDF, html2canvas, XState, i18next, all of Firebase, and react-icons. Add `rollup-plugin-visualizer` or `vite-bundle-analyzer` and set a CI budget (`build` fails if `dist/assets/*.js` total exceeds, say, 400 KB gzip).

The first obvious win: `jspdf` and `html2canvas` are only used by the editor's export feature — they should be dynamic-imported inside that handler, not part of the initial bundle.

---

## Suggested execution order

A rough quarter-sized roadmap:

**Week 1 — Cleanup**
- §1 Delete duplicates and dead files
- §2 Reorganise `scripts/`
- §4 Fix AuthContext recursion
- §10 Align `firebase-admin` versions
- §13 Logger wrapper + ESLint `no-console`

**Week 2 — Safety net**
- §7 Add GitHub Actions CI
- §5 Tighten Firestore rules + write rule tests
- §14 (start) Playwright skeleton with the happy-path test

**Weeks 3–4 — Structural**
- §3 Replace client-side search (option 1 or 2)
- §8 Split the three biggest components
- §11 Move dev routes under `/dev`
- §12 Drop hardcoded function URLs

**Months 2–3 — Investment**
- ✅ §6 Incremental TypeScript migration — complete (see §6 above)
- §9 Naming/extension standardisation (done alongside TS conversion)
- §15 Documentation consolidation
- §16 Loading/error primitives
- §17 Bundle budget + code-splitting

Past that, the codebase should be in a shape where adding features (audio pronunciations, PWA, new locales, etc. — see [docs/PLAN.md](docs/PLAN.md) for the product roadmap) is mostly *adding* code rather than rewriting it.
