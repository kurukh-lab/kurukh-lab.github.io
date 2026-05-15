# Architecture

This document describes how the Kurukh Dictionary is put together: the runtime topology, the data model, how a request travels through the system, the conventions different parts follow, and the trade-offs baked into the current design. It is meant to be useful to someone joining the project who needs to make changes confidently without re-reading every file.

For setup and run instructions, see [README.md](README.md). For known issues and the cleanup roadmap, see [PLAN.md](PLAN.md).

---

## 1. High-level topology

```
            ┌──────────────────────────────────────────────────────┐
            │                       Browser                        │
            │  React 19 SPA (Vite build) → Firebase Hosting/CDN    │
            │  ─ React Router 7  ─ Tailwind/DaisyUI  ─ XState v5   │
            │  ─ i18next (en, hi)  ─ TipTap  ─ html2canvas/jsPDF   │
            └─────────────┬────────────────────────────────────────┘
                          │ Firebase Web SDK
                          ▼
            ┌──────────────────────────────────────────────────────┐
            │                   Firebase project                   │
            │                                                      │
            │  ┌────────────┐ ┌────────────────┐ ┌──────────────┐  │
            │  │ Auth       │ │ Firestore      │ │ Storage      │  │
            │  │ (email +   │ │ (words, users, │ │ (future:     │  │
            │  │  Google)   │ │  comments…)    │ │  audio/img)  │  │
            │  └────────────┘ └───────┬────────┘ └──────────────┘  │
            │                         │                            │
            │  ┌──────────────────────┴───────────────────────┐    │
            │  │              Cloud Functions (Node 22)        │   │
            │  │  HTTP: getDictionaryStats, getWordOfTheDay,   │   │
            │  │        triggerHomePageUpdate, helloWorld      │   │
            │  │  Callable: createUser, createGoogleUser,      │   │
            │  │            reviewWord, resolveReport,         │   │
            │  │            getWordReports                     │   │
            │  │  Scheduled (daily): updateDailyStats,         │   │
            │  │            updateHomePageData                 │   │
            │  └───────────────────────────────────────────────┘   │
            └──────────────────────────────────────────────────────┘
```

Everything runs on Firebase. There is no separate API server — the SDK talks to Firestore directly for most reads/writes, and Cloud Functions handle privileged or aggregate operations (user creation, admin actions, scheduled rollups). In development the same paths point at the Firebase Emulator Suite via `import.meta.env.DEV` in [src/config/firebase.js](src/config/firebase.js).

## 2. Frontend application structure

### 2.1 Entry and routing

- [src/main.jsx](src/main.jsx) mounts `<ThemeProvider>` → `<App>`. i18n is initialised by importing [src/i18n/index.js](src/i18n/index.js) at boot so `t()` is ready before any component renders.
- [src/App.jsx](src/App.jsx) wires `<Router>` → `<AuthProvider>` → `<Layout>` → routes.
- Most pages are lazy-loaded with `React.lazy`. The home, contribute, login, register, and privacy-policy pages are bundled eagerly because they are common landing destinations.
- Several developer/test pages (`/firebase-test`, `/admin-debug`, `/like-test`, `/highlight-test`, `/word-review-demo`) are mounted only when `import.meta.env.DEV` is true. They are stripped from production builds by Vite.
- Auth gating is done via two small wrappers: [`ProtectedRoute`](src/components/auth/ProtectedRoute.jsx) (logged-in users) and [`AdminRoute`](src/components/auth/AdminRoute.jsx) (users with the `admin` role).

### 2.2 Layout and design system

The visual language lives under [src/components/kd/](src/components/kd/) — the "kd" namespace is the project's local design system on top of Tailwind/DaisyUI. Tokens are CSS variables (`--kd-bg`, `--kd-ink`, `--kd-accent`, `--kd-surface`, …) defined in `src/styles/` and consumed via inline `style` props. This keeps tokens scoped to the dictionary brand without fighting DaisyUI themes.

The `Layout` component conditionally hides its chrome on the `/kurukh-editor` route so the editor can take the full viewport.

### 2.3 State management

The app uses three layers, deliberately kept simple:

1. **React Context** for cross-cutting concerns:
   - [`AuthContext`](src/contexts/AuthContext.jsx) — holds `currentUser`, `isAdmin`, and exposes `login`, `logout`, `register`, `loginWithGoogle`. Subscribes to `onAuthStateChanged` and merges the Firestore `users/{uid}` document into the user object (so `roles` is available everywhere).
   - [`ThemeContext`](src/contexts/ThemeContext.jsx) — light/dark toggle persisted to `localStorage`.
2. **Local component state / custom hooks** — most pages own their own state. The notable hooks are:
   - [`useSearch`](src/hooks/useSearch.js) — debounce + search call wrapper used by the home and `SearchBar`.
   - [`useWordReview`](src/hooks/useWordReview.js) — bridges the XState machine into React.
   - [`useKeyboardShortcut`](src/hooks/useKeyboardShortcut.js) — used for `⌘K` / `Ctrl+K` search focus.
3. **XState v5** for the word-review workflow only (see §5).

There is no Redux/Zustand. If the app outgrows context for some cross-cutting concern, that's a deliberate decision to revisit then.

### 2.4 i18n

- Languages: English (default) and Hindi.
- Detection order: `localStorage` (`kd-language`) → browser navigator → `<html lang>`.
- The detected language is mirrored onto `document.documentElement.lang` so CSS can branch on `:lang(hi)` for Devanagari font fallbacks (see [src/i18n/index.js](src/i18n/index.js)).
- Translation files are flat JSON under [src/i18n/locales/](src/i18n/locales/). New keys must exist in both files, even if the value is identical, to keep i18next from logging missing-key warnings.

## 3. Backend (Cloud Functions)

All function code is in [functions/index.js](functions/index.js), which delegates to modules under [functions/modules/](functions/modules/):

| Module | Responsibility |
|--------|----------------|
| `adminService.js` | `reviewWord`, `resolveReport`; both verify admin role from Firestore. |
| `statsService.js` | Aggregate counts of approved/pending words and users; called by the home page and the scheduled rollup. |
| `wordOfTheDayService.js` | Picks a deterministic word-of-the-day. |
| `homePageDataService.js` | Pre-renders the home-page payload into `static_data/home-page` so the home route can do a single document read. |
| `reportsService.js` | Returns reports for a given word (admin-only). |

The functions use **Cloud Functions v2** (`onRequest`, `onCall`, `onSchedule`) with `maxInstances: 10`. Two scheduled jobs run nightly at `0 0 * * *` (UTC) to refresh `static_data` and stats counts.

### Why some calls go through Functions and others don't

| Operation | Path | Why |
|-----------|------|-----|
| Search, get word, list contributions | Firestore SDK direct | Public/cheap reads; covered by security rules. |
| Like / unlike | Firestore SDK direct | Rule allows targeted updates to `likedBy`/`likesCount`. |
| Add word, vote on word, submit correction | Firestore SDK direct | Rule restricts to authenticated users; status is locked to `community_review`. |
| Register (email or Google) | Callable Function | Forces `roles: ['user']` server-side. Prevents clients from giving themselves the `admin` role. |
| Approve/reject word, resolve report | Callable Function | Verifies the caller's role server-side from `users/{uid}` before touching the doc. |
| Stats / word-of-the-day | HTTP Function | Cheap aggregations that benefit from server caching (and a single endpoint). |
| Home-page payload refresh | Scheduled Function | Pre-computed so the home route doesn't pay aggregation cost on every load. |

This split keeps the trust boundary clear: **anything that affects authorisation lives in a function and verifies the caller**.

## 4. Data model (Firestore)

```
users/{uid}
  uid, username, email, roles: ['user' | 'admin'], createdAt, updatedAt

words/{wordId}
  kurukh_word                 string (indexed via composite index)
  meanings[]                  [{ language, definition, example_sentence_kurukh, example_sentence_translation }]
  part_of_speech              string?
  pronunciation_guide         string?
  tags[]                      string[]?
  contributor_id              users/{uid}
  status                      'draft' | 'submitted' | 'community_review' | 'community_approved' |
                              'community_rejected' | 'pending_review' | 'in_admin_review' |
                              'approved' | 'rejected'
  community_votes_for         number
  community_votes_against     number
  reviewed_by[]               [{ user_id, vote, comment, timestamp }]
  likedBy[]                   string[]      (uids OR anonymous IDs)
  likesCount                  number
  commentsCount               number        (maintained by commentService)
  rejection_reason            string?
  createdAt, updatedAt        timestamp

comments/{commentId}
  wordId, userId, content, parentCommentId, createdAt, updatedAt,
  upvotes, downvotes, upvotedBy[], downvotedBy[], replyCount, isDeleted

corrections/{correctionId}
  word_id, user_id, correction_type, current_value, proposed_change, explanation,
  status: 'shallow_review' | 'approved' | 'rejected' | 'applied',
  votes_for, votes_against, reviewed_by[], createdAt, updatedAt

reports/{reportId}
  word_id, user_id, reason, details, status: 'open' | 'resolved',
  resolution?, action_taken?, resolved_by?, resolved_at?, createdAt

static_data/home-page
  recentWords[], wordOfTheDay, lastUpdated, generatedAt, date
```

### Composite indexes

Maintained in [firestore.indexes.json](firestore.indexes.json):

- `words` × (`status` ASC, `createdAt` DESC) — feeds the recent/approved listings.
- `words` × (`contributor_id` ASC, `createdAt` DESC) — feeds user profiles.
- Four `comments` composites for the threaded-comment queries.

### Security rules

Rules live in [firestore.rules](firestore.rules) and rely on two helpers — `isRegisteredUser()` and `isAdmin()` — both of which read the caller's `users/{uid}` document. The notable rule shapes:

- **`words/`**: public read only when `status == 'approved'`; registered users and admins can read all statuses (so they can see in-flight community items). Writes are gated to registered users / admins. A separate `update` clause permits *only* `likedBy`, `likesCount`, and `updatedAt` to change, which is what lets anonymous likes work.
- **`users/`**: a user can read/write *their own* document; admins can read all (for the admin UI).
- **`reports/`**: admins read all; users read only their own.
- **`comments/`**: any registered user can read/create/update; only the comment author or an admin can delete.
- **`static_data/`**: world-readable; only authenticated writes (used by the scheduled function via the admin SDK, which bypasses rules).

> The current `isLikeUpdate` permits any caller — including unauthenticated ones — to modify `likedBy`/`likesCount`. That's intentional today (anonymous likes), but it also means votes are not anti-abuse hardened; see [PLAN.md](PLAN.md) §6.

## 5. Word review workflow (XState)

The review pipeline is the most complex piece of business logic in the app, so it lives in a formal state machine ([src/state/wordReviewMachine.js](src/state/wordReviewMachine.js)) rather than ad-hoc booleans.

```
draft
  └── SUBMIT ─▶ submitted
                  ├── SEND_TO_COMMUNITY_REVIEW ─▶ pendingCommunityReview
                  │       └── START_COMMUNITY_REVIEW ─▶ inCommunityReview
                  │             ├── COMMUNITY_APPROVED ─▶ communityApproved ─▶ pendingAdminReview
                  │             ├── COMMUNITY_REJECTED ─▶ communityRejected (final)
                  │             └── ADMIN_OVERRIDE     ─▶ pendingAdminReview
                  └── SEND_TO_ADMIN_REVIEW ─▶ pendingAdminReview
                            └── START_ADMIN_REVIEW ─▶ inAdminReview
                                  ├── ADMIN_APPROVE      ─▶ approved (final)
                                  ├── ADMIN_REJECT       ─▶ rejected (final)
                                  └── SEND_BACK_TO_COMMUNITY ─▶ pendingCommunityReview
```

- The `community_votes_for >= 5` / `community_votes_against >= 5` thresholds are enforced in [`voteOnWord` in dictionaryService.js](src/services/dictionaryService.js#L874) and they're what actually drive transitions in Firestore today. The XState machine mirrors those states so React components can reason about them in one place.
- [`wordReviewService.js`](src/services/wordReviewService.js) maps machine state ↔ Firestore status via two lookup tables, persists transitions, and offers `subscribeToWordStatus` for real-time updates.
- [`useWordReview`](src/hooks/useWordReview.js) gives components a friendly API: `state`, `context`, `send`, `isInState`, `canBeEdited`, `isInFinalState`, plus an opt-in real-time listener.

The split between "Firestore as source of truth" and "XState as in-memory model" means the machine can fall out of sync if rules let through an unexpected status. The mapping tables are the single place to fix that.

## 6. Request flows

### 6.1 Searching for a word

1. `useSearch` debounces input and calls `searchWords(term, options)` ([src/services/dictionaryService.js:143](src/services/dictionaryService.js#L143)).
2. The service runs **one** Firestore query for all `status == 'approved'` words.
3. Filtering, ranking (starts-with > contains, then locale-compare), and language/POS filtering happen **client-side**.
4. Results render via `WordList` → `WordCard`.

> This is fine for small dictionaries but is the single biggest scalability constraint. The service downloads every approved word on every search; it cannot use prefix matching, fuzzy search, or pagination. See [PLAN.md](PLAN.md) §3.

### 6.2 Contributing a word

1. The user fills the contribution form on `/contribute`.
2. `addWord` ([src/services/dictionaryService.js:231](src/services/dictionaryService.js#L231)) forces a token refresh, sets `status = 'community_review'`, and writes to `words/`.
3. Other registered users open `/review` and vote via `voteOnWord`.
4. Once 5 approvals are reached the status flips to `pending_review` and the entry is surfaced in the admin UI.
5. An admin calls the `reviewWord` Cloud Function from `/admin`, which transitions to `approved` or `rejected`.

### 6.3 Liking a word (anonymous or signed-in)

1. The frontend reads/writes `localStorage['kurukh_anonymous_id']` if no auth user exists.
2. `toggleWordLike` writes to `words/{wordId}` with only `likedBy`, `likesCount`, `updatedAt`.
3. The `isLikeUpdate` clause in `firestore.rules` permits this update regardless of auth state.

### 6.4 Home page render

1. Browser reads `static_data/home-page` (single doc).
2. If absent, `getHomePageData` falls back to live queries: `getRecentWords(6)` + `getWordOfTheDay()`.
3. The scheduled `updateHomePageData` job refreshes that doc nightly so the fast path stays warm.

## 7. Build and deploy pipeline

- **Build:** `vite build` outputs to `dist/`. Path aliases (`@`, `@components`, `@pages`, …) defined in [vite.config.js](vite.config.js) are mirrored in [jest.config.cjs](jest.config.cjs) so tests resolve the same paths.
- **Hosting:** `firebase.json` rewrites every route to `/index.html` for SPA routing.
- **Functions:** Deployed from `functions/` with Node 22 runtime. `firebase deploy` deploys hosting, functions, Firestore rules, and indexes in one shot.
- **Emulators:** Configured in `firebase.json` on fixed ports so the frontend can hardcode them in dev mode (see [src/config/firebase.js:30](src/config/firebase.js#L30)).

There is no CI yet — see [PLAN.md](PLAN.md) §7.

## 8. Testing strategy

- **Unit / component tests** under [src/__tests__/](src/__tests__/) use Jest + React Testing Library with JSDOM. The Jest config injects `import.meta.env` stubs so Firebase config code doesn't crash inside tests.
- **Integration scripts** under [scripts/](scripts/) use the admin SDK against the Firestore emulator. They are not run by `npm test`; they are documented in [TESTING_GUIDE.md](TESTING_GUIDE.md) and the various `docs/COMMUNITY_REVIEW_*` files.
- **E2E**: the [e2e/](e2e/) directory is reserved but empty.

## 9. Conventions

- **File extensions**: components and pages are `.jsx`; services, hooks, utils, and config are `.js`. A handful of files exist in both forms (`highlightUtils.js` + `.jsx`, `babel.config.cjs` + `.js`) — those are duplicates flagged in [PLAN.md](PLAN.md) §1.
- **Imports**: prefer the path aliases over deep relative imports. `import x from '../../components/...'` is a refactor smell.
- **Service shape**: each service module exports plain async functions that wrap Firestore. They return `{ success, ...payload }` or `{ success: false, error }` rather than throwing, so call-sites can render a UI message uniformly.
- **Component shape**: function components only. Side-effects belong in hooks, not components.
- **Naming**: Firestore field names use `snake_case` (`kurukh_word`, `contributor_id`) — this came from the original schema and should be preserved for compatibility, even though JavaScript local variables use camelCase.

## 10. Known trade-offs and constraints

A short, frank list of things to keep in mind when changing the system. The full remediation plan is in [PLAN.md](PLAN.md).

1. **Search is client-side and unbounded.** Every search downloads all approved words. Acceptable today; will break around 5–10k words.
2. **Firestore rules grant broad read access to authenticated users.** Useful for the community review UI, but it also means a logged-in user can read every in-flight contribution — fine here, but worth knowing.
3. **The anonymous-like rule is permissive.** It only checks *which fields* changed, not *how often* or *by whom*. A malicious client can inflate like counts.
4. **Auth context calls `logout()` from its own `onAuthStateChanged` else-branch.** It can recurse on sign-out edge cases — see [PLAN.md](PLAN.md) §4.
5. **There are duplicate config and source files** (`babel.config.cjs`/`.js`, `jest.config.cjs`/`.js`, `wordReviewMachine.js`/`.new.js`, `WordReviewStateMachine.jsx`/`.v5.jsx`, `highlightUtils.js`/`.jsx`). The active one wins by load order but the others mislead readers.
6. **`scripts/` is overgrown** (47+ scripts), mixing one-off debugging, seed scripts, and feature tests. Most aren't documented.
7. **Functions and the main app pin different `firebase-admin` majors** (root: 13.x, functions: 11.x). They run in different processes so it works, but the divergence is unintentional.
8. **`dist/`, `coverage/`, and `firestore-debug.log` may be tracked in git** depending on local state — they should be ignored.
9. **No TypeScript.** Service signatures are documented via JSDoc only.
10. **No CI/CD.** Lint and tests must be run locally before a PR.

Each of these has a concrete fix proposed in [PLAN.md](PLAN.md).
