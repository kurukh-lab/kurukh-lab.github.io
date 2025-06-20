# PLAN.md

## Kurukh Dictionary - Project Plan

### 1. Overview

The Kurukh Dictionary is a web application designed to be a crowd-sourced repository of Kurukh words and their meanings. It aims to provide a platform for users to search for Kurukh words and for authenticated users to contribute new words and definitions, helping to preserve and grow the Kurukh language.

### 2. Key Features

*   **Word Search:** Users can search for Kurukh words and view their meanings, examples, and other relevant information.
*   **User Contributions:** Registered and logged-in users can add new Kurukh words, their meanings, and example sentences.
*   **User Authentication:** Secure user registration and login system.
*   **Data Storage:** Firebase will be used to store dictionary entries and user information.
*   **Responsive Design:** The application will be accessible and usable across various devices (desktops, tablets, mobiles).

### 3. Application Pages

*   **Home Page (`/`)**
    *   Displays a search bar for looking up Kurukh words.
    *   Shows search results, including the word, its meaning(s), and example usage.
    *   May feature a "Word of the Day" or recently added words.
    *   Link/button to navigate to the Contribution page (visible to all, but contribution functionality locked for non-authenticated users).
    *   Links for Login/Register.
*   **Contribution Page (`/contribute`)**
    *   Accessible to all users, but word submission is restricted to authenticated users.
    *   If not logged in, prompts the user to log in or register.
    *   Provides a form for authenticated users to submit:
        *   Kurukh word
        *   Meaning(s) in a common language (e.g., English, Hindi)
        *   Example sentence(s) in Kurukh with translation
        *   Optional: Part of speech, pronunciation guide, regional variations.
    *   Displays a list of the user's past contributions (optional).
*   **Login Page (`/login`)**
    *   Form for existing users to log in.
*   **Registration Page (`/register`)**
    *   Form for new users to create an account.

### 4. Technology Stack

*   **Frontend:** React (using Vite as a build tool - modern and faster setup)
    *   Styling: Tailwind CSS with DaisyUI (current setup)
    *   State Management: React Context API or a library like Zustand/Redux (to be decided based on complexity)
    *   Routing: React Router
*   **Backend:** Node.js with Express.js (to be deployed as Firebase Functions)
    *   API Endpoints for:
        *   User authentication (register, login, logout)
        *   Word search
        *   Word contribution (CRUD operations for words)
*   **Database:** Firebase
    *   Firestore Collections:
        *   `users`: Stores user profiles and information.
        *   `words`: Stores Kurukh words, meanings, examples, contributor ID, timestamps, etc.
    *   Firebase Authentication: Handles user registration, login, and authentication.
*   **Deployment & Development Environment:**
    *   Firebase Emulator Suite: For local development of frontend, backend, and database.
    *   Firebase Hosting: For deployment and hosting of the production application.

### 5. Data Models (Firebase)

*   **User Data Structure:**
    ```json
    {
      "uid": "String (Firebase Auth generated ID)",
      "username": "String (unique, required)",
      "email": "String (unique, required)",
      "createdAt": "Timestamp",
      "updatedAt": "Timestamp"
    }
    ```
    Note: Authentication credentials (email, password) will be handled by Firebase Authentication service.

*   **Word Data Structure:**
    ```json
    {
      "id": "String (Firestore auto-generated ID)",
      "kurukh_word": "String (required, indexed)",
      "meanings": [
        {
          "language": "String (e.g., 'en', 'hi')",
          "definition": "String (required)",
          "example_sentence_kurukh": "String",
          "example_sentence_translation": "String"
        }
      ],
      "part_of_speech": "String (optional)",
      "pronunciation_guide": "String (optional)",
      "tags": ["String"] (optional, e.g., region, category),
      "contributor_id": "String (references User.uid, required)",
      "status": "String (e.g., 'pending_review', 'approved', 'rejected', default: 'pending_review')",
      "createdAt": "Timestamp",
      "updatedAt": "Timestamp"
    }
    ```

### 6. Development & Deployment Setup

#### Local Development (Firebase Emulator)
*   Firebase Emulator Suite will be used for local development:
    1.  Frontend: Vite development server with hot module replacement (HMR) enabled.
    2.  Backend: Firebase Functions Emulator to run the Express app locally.
    3.  Database: Firestore Emulator for local data storage.
    4.  Auth: Firebase Authentication Emulator for local user management.
*   The Express app will be structured to work as Firebase Functions.
*   `firebase.json` will define the configuration for the emulators.
*   Environment variables will be used for configuration (e.g., Firebase config, API endpoints).
*   Vite-specific configurations will be added to connect to the Firebase emulators during development.

#### Production Deployment (Firebase)
*   **Firebase Hosting:** Will serve the React frontend application.
    *   Configure with `firebase.json` for hosting settings, redirects, and rewrites.
    *   Setup single-page application (SPA) routing support.
    *   Specify `dist` as the Vite build output directory in `firebase.json`.
*   **Firebase Functions:** Will be used to host the Express.js API as serverless functions.
    *   The Express app will be wrapped in Firebase Functions using the `functions.https.onRequest()` method.
    *   Enables seamless integration with other Firebase services.
    *   Provides automatic scaling based on demand.
*   **Deployment Process:** 
    *   Frontend build artifacts (from Vite's `dist` directory) will be deployed to Firebase Hosting.
    *   Environment-specific configuration will be managed through Firebase project settings and Vite's `.env` files.

### 7. Project Milestones (High-Level)

1.  **Phase 1: Core Backend & Firebase Setup**
    *   [ ] Setup Node.js/Express backend project.
    *   [ ] Configure Firebase project and setup Firestore collections.
    *   [ ] Implement Firebase Authentication integration.
    *   [ ] Implement basic Firebase CRUD operations for Words.
    *   [ ] Setup Express app for Firebase Functions deployment.
    *   [ ] Create Firebase Functions configuration.
    *   [ ] Setup Firebase Emulator Suite for local development environment.
2.  **Phase 2: Frontend - Basic Structure & Home Page**
    *   [ ] Set up Vite project with React template.
    *   [ ] Configure Vite for optimal development experience (aliases, environment variables, plugins).
    *   [ ] Integrate React Router.
    *   [ ] Develop Home Page UI ([`src/App.jsx`](src/App.jsx) can be adapted).
    *   [ ] Implement search functionality, fetching data from the backend API.
    *   [ ] Display search results.
    *   [ ] Configure Vite to connect with Firebase Emulator Suite for local development.
3.  **Phase 3: Frontend - Contribution & Authentication Flow**
    *   [ ] Develop Login and Registration pages using Firebase Auth UI components.
    *   [ ] Implement frontend authentication logic with Firebase Auth (user sessions, protecting routes).
    *   [ ] Develop Contribution Page UI.
    *   [ ] Implement form submission for new words using Firebase SDK.
4.  **Phase 4: Refinements, Testing & Deployment**
    *   [ ] Implement word review/approval system (if needed).
    *   [ ] Add "Word of the Day" or similar features.
    *   [ ] Improve UI/UX based on feedback.
    *   [ ] Write unit and integration tests using Firebase Emulator for test environment.
    *   [ ] Configure Firebase Hosting:
        *   [ ] Setup `firebase.json` configuration file.
        *   [ ] Configure caching and security headers.
        *   [ ] Setup proper SPA routing with redirects.
    *   [ ] Setup CI/CD pipeline for automated deployment to Firebase Hosting.
    *   [ ] Implement monitoring and analytics using Firebase Performance Monitoring.

### 8. Future Enhancements (Post-MVP)

*   Admin panel for managing users and contributions using Firebase Admin SDK.
*   Advanced search filters (e.g., by part of speech, tags) using Firestore queries.
*   User profiles and contribution history.
*   Voting or rating system for word definitions.
*   Audio pronunciations stored in Firebase Storage.
*   Offline access / PWA features using Firebase offline capabilities.
*   Real-time updates for dictionary entries using Firestore listeners.
*   Enhanced deployment features:
    *   A/B testing with Firebase Remote Config.
    *   Localized content delivery using Firebase Hosting CDN.
    *   Custom domain configuration with SSL certificate.
    *   Automated rollbacks in case of deployment issues.

This plan provides a roadmap for developing the Kurukh Dictionary. The existing React frontend ([`src/App.jsx`](src/App.jsx), [`src/components/logo/KurukhDictionaryLogo.jsx`](src/components/logo/KurukhDictionaryLogo.jsx)) can serve as a starting point for the Home Page UI.