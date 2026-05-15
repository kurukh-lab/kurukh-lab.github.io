# Kurukh Dictionary

A crowd-sourced, bilingual web dictionary for the **Kurukh** language — built so the community can search, contribute, and curate words together. Definitions are submitted by users, vetted through a two-stage review pipeline (community vote → admin approval), and served back to anyone who wants to learn the language.

> Live URL: https://kurukh-dictionary.web.app (Firebase Hosting)
> Default project ID: `kurukh-dictionary`

---

## Table of contents

- [What's inside](#whats-inside)
- [Tech stack](#tech-stack)
- [Repository layout](#repository-layout)
- [Getting started](#getting-started)
- [Running locally](#running-locally)
- [Testing](#testing)
- [Deployment](#deployment)
- [Environment variables](#environment-variables)
- [Documentation index](#documentation-index)
- [Contributing](#contributing)
- [License](#license)

---

## What's inside

| Area | Capability |
|------|------------|
| Search | Client-side substring/starts-with search across approved words, with optional language and part-of-speech filters. |
| Contribute | Authenticated users submit words; each entry carries Kurukh form, meanings (multi-language), examples, part of speech, and pronunciation guide. |
| Review pipeline | XState v5 machine moves words through `draft → submitted → community_review → community_approved → pending_review → approved/rejected`. 5+ community approvals promote to admin review; 5+ rejections kill the entry. |
| Comments | Reddit-style threaded comments per word (configurable depth via `VITE_COMMENT_MAX_LEVEL`). |
| Likes | Anonymous-friendly: anonymous users get a generated `localStorage` ID so they can like words without signing in. |
| Reports & corrections | Users report problematic entries or propose corrections (spelling, definition, example, pronunciation). Corrections also vote-gated. |
| Admin tools | Approve/reject words, resolve reports, manage static data; protected by Firestore role check (`roles: ['admin']`). |
| Internationalisation | UI translated via `i18next`. Currently English and Hindi (`src/i18n/locales/en.json`, `hi.json`). |
| Kurukh editor | A bespoke editor (TipTap-based) at `/kurukh-editor` for composing text in the Kurukh script. |
| Word of the Day | Pre-computed nightly by a scheduled Cloud Function and stored in `static_data/home-page`. |
| Theming | Light/dark theme tokens (`--kd-*` CSS variables) wired up via `ThemeContext` and `ThemeToggle`. |

## Tech stack

- **Frontend:** React 19 + Vite 6, React Router 7, Tailwind CSS 4 + DaisyUI 5
- **State:** React Context (`AuthContext`, `ThemeContext`) + XState v5 for the review workflow
- **Backend:** Firebase — Auth, Firestore, Cloud Functions (Node 22, gen 2), Hosting, Storage
- **Rich text:** TipTap 2 (extensions: starter-kit, underline, text-align, text-style, typography, placeholder)
- **i18n:** i18next + react-i18next + browser language detector
- **Testing:** Jest 29 + Testing Library (`@testing-library/react`, `jest-environment-jsdom`)
- **Exports:** jsPDF + html2canvas for offline word/page exports

## Repository layout

```
kurukh-dictionary/
├── firebase.json              Firebase project config (hosting, functions, emulators, ports)
├── firestore.rules            Security rules — see ARCHITECTURE.md for the access model
├── firestore.indexes.json     Composite indexes (words, comments)
├── vite.config.js             Vite + Tailwind + path aliases (@, @components, @pages, …)
├── jest.config.cjs            Jest config (jsdom, alias mirrors, css mock)
├── functions/                 Cloud Functions (Node 22)
│   ├── index.js               Function entry points (HTTP + callable + scheduled)
│   └── modules/               adminService, statsService, wordOfTheDayService, …
├── public/                    Static assets served as-is
├── scripts/                   One-off DB / debugging scripts (init, seeding, manual tests)
├── docs/                      Feature specs, migration notes, and historical reports
└── src/
    ├── main.jsx               React entry, mounts ThemeProvider + App + i18n
    ├── App.jsx                Routes (most pages lazy-loaded; dev-only routes gated on import.meta.env.DEV)
    ├── config/                firebase.js, firebase-emulator.js, comments.js
    ├── contexts/              AuthContext, ThemeContext
    ├── i18n/                  i18next setup + en/hi locale JSON
    ├── state/                 XState machines (wordReviewMachine.js)
    ├── services/              dictionaryService, wordReviewService, commentService
    ├── hooks/                 useSearch, useWordReview, useKeyboardShortcut
    ├── components/
    │   ├── kd/                Design-system primitives (KMark, WordRow, SectionLabel, …)
    │   ├── layout/            Header, Footer, Layout
    │   ├── common/            SearchBar, voice/search hint
    │   ├── dictionary/        WordCard, LikeButton, ReportWordModal, …
    │   ├── editor/            TiptapKurukhEditor
    │   ├── auth/              ProtectedRoute, AdminRoute
    │   ├── admin/             StaticDocumentManager
    │   └── ads/               GoogleAd
    ├── pages/                 Route components (Home, WordDetails, Contribute, Admin, …)
    ├── utils/                 wordUtils, highlightUtils, firebaseTest
    └── __tests__/             Jest test files mirroring features
```

A more detailed walk-through lives in [ARCHITECTURE.md](ARCHITECTURE.md). Planned cleanup work — including known duplicates and tech-debt items — is tracked in [PLAN.md](PLAN.md).

## Getting started

### Prerequisites

- **Node.js 22** (Cloud Functions target this version; using a different major may break `firebase emulators:start`)
- **npm** 10+
- **Firebase CLI** — `npm install -g firebase-tools` (or use the local `firebase-tools` dev dependency via `npx`)
- A Firebase project if you intend to deploy (local development can run against emulators only)

### Install

```bash
git clone https://github.com/kurukh-lab/kurukh-dictionary.git
cd kurukh-dictionary
npm install
cd functions && npm install && cd ..
```

### Configure environment

```bash
cp .env.example .env
```

Fill in your Firebase web-app config (see [Environment variables](#environment-variables)). The same keys can go in `.env.local` for overrides and `.env.production` for the deployed build.

## Running locally

There are two supported modes:

### 1. Vite only (no backend)

```bash
npm run dev
```

Starts the Vite dev server. Firebase SDK still tries to connect to emulators (see [src/config/firebase.js:30](src/config/firebase.js#L30)) so most data-driven pages will fail until the emulators are up.

### 2. Full stack (recommended)

```bash
npm run dev:firebase
```

This boots three things in parallel:

1. The Vite dev server
2. The Firebase Emulator Suite (Auth, Firestore, Functions, Hosting, Storage)
3. After ~60s, `scripts/initializeDatabase.js` seeds users and sample words

Default ports (from [firebase.json](firebase.json)):

| Service     | Port |
|-------------|------|
| Auth        | 9098 |
| Firestore   | 8081 |
| Functions   | 5011 |
| Hosting     | 5003 |
| Emulator UI | 4001 |

Seeded test users (created by `scripts/initializeDatabase.js`):

- Admin — `admin@kurukhdictionary.com` / `Admin123!`
- Regular — `user@kurukhdictionary.com` / `User123!`

## Testing

```bash
npm test           # Jest with coverage
npm run lint       # ESLint flat config (eslint.config.js)
```

Test files live under [src/__tests__/](src/__tests__/) and cover authentication, word search, contributions, admin features, reporting, and the review service. Integration-style scripts that hit the emulators directly live under [scripts/](scripts/) — most are not wired into Jest.

The `e2e/` directory exists but is currently empty; there is no Playwright/Cypress harness yet.

## Deployment

```bash
npm run build              # vite build → dist/
npm run deploy             # build:clean + firebase deploy (hosting + functions + rules)
npm run deploy:functions   # functions only
```

`firebase.json` points hosting at `dist/` and rewrites all routes to `index.html` for SPA support. See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for a longer walkthrough.

> **Promoting a user to admin:** in the Firestore console (or emulator UI), open the user's document under `users/` and set `roles` to `["user", "admin"]`. Admin routes (`/admin`) gate on this field via [src/components/auth/AdminRoute.jsx](src/components/auth/AdminRoute.jsx).

## Environment variables

Required at build time (read by Vite via `import.meta.env`):

| Variable | Purpose |
|----------|---------|
| `VITE_FIREBASE_API_KEY` | Web-app config |
| `VITE_FIREBASE_AUTH_DOMAIN` | Web-app config |
| `VITE_FIREBASE_PROJECT_ID` | Web-app config |
| `VITE_FIREBASE_STORAGE_BUCKET` | Web-app config |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Web-app config |
| `VITE_FIREBASE_APP_ID` | Web-app config |
| `VITE_FIREBASE_MEASUREMENT_ID` | Optional; Analytics only |
| `VITE_COMMENT_MAX_LEVEL` | Optional; max nesting depth for threaded comments (0–50, default 10) |

The `.env.example` is the source of truth — keep it in sync when adding new keys.

## Documentation index

| File | Topic |
|------|-------|
| [ARCHITECTURE.md](ARCHITECTURE.md) | System overview, data model, request flow, key trade-offs |
| [PLAN.md](PLAN.md) | Maintainability roadmap and tech-debt cleanup |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Long-form deploy walkthrough |
| [docs/WORD_REVIEW_XSTATE.md](docs/WORD_REVIEW_XSTATE.md) | The review state machine |
| [docs/XSTATE_IMPLEMENTATION.md](docs/XSTATE_IMPLEMENTATION.md) | XState wiring details |
| [docs/COMMENT_SYSTEM_SUMMARY.md](docs/COMMENT_SYSTEM_SUMMARY.md) | Threaded-comment design |
| [docs/COMMUNITY_REVIEW_IMPLEMENTATION_REPORT.md](docs/COMMUNITY_REVIEW_IMPLEMENTATION_REPORT.md) | Community-review feature notes |
| [TESTING_GUIDE.md](TESTING_GUIDE.md) | Manual testing checklist |

## Contributing

1. Fork the repo and create a feature branch from `main`.
2. Run `npm install` and `npm run dev:firebase` to confirm the stack boots.
3. Make your change. Add or update a Jest test under `src/__tests__/` when touching services/hooks.
4. `npm run lint && npm test` should pass cleanly.
5. Open a PR; include screenshots for UI changes.

For language contributors who want to add or correct dictionary entries, just use the site — every authenticated user can submit through `/contribute`.

## License

MIT — see [LICENSE](LICENSE) if present, otherwise the project defaults to MIT per the stated intent in earlier commits.

## Acknowledgements

- The Kurukh-speaking community whose vocabulary this project is dedicated to preserving.
- React, Vite, Firebase, XState, TipTap, and DaisyUI maintainers.
- Everyone who has filed a report, suggested a correction, or contributed a word.
