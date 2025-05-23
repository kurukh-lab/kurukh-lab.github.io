# PLAN.md

## Kurukh Dictionary - Project Plan

### 1. Overview

The Kurukh Dictionary is a web application designed to be a crowd-sourced repository of Kurukh words and their meanings. It aims to provide a platform for users to search for Kurukh words and for authenticated users to contribute new words and definitions, helping to preserve and grow the Kurukh language.

### 2. Key Features

*   **Word Search:** Users can search for Kurukh words and view their meanings, examples, and other relevant information.
*   **User Contributions:** Registered and logged-in users can add new Kurukh words, their meanings, and example sentences.
*   **User Authentication:** Secure user registration and login system.
*   **Data Storage:** MongoDB will be used to store dictionary entries and user information.
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

*   **Frontend:** React (using Create React App as a base - current setup)
    *   Styling: Tailwind CSS with DaisyUI (current setup)
    *   State Management: React Context API or a library like Zustand/Redux (to be decided based on complexity)
    *   Routing: React Router
*   **Backend:** Node.js with Express.js
    *   API Endpoints for:
        *   User authentication (register, login, logout)
        *   Word search
        *   Word contribution (CRUD operations for words)
*   **Database:** MongoDB
    *   Collections:
        *   `users`: Stores user credentials (hashed passwords) and profile information.
        *   `words`: Stores Kurukh words, meanings, examples, contributor ID, timestamps, etc.
*   **Deployment & Development Environment:**
    *   Docker: To containerize the frontend, backend, and MongoDB for easy local development and consistent environments.
    *   Docker Compose: To manage multi-container Docker applications.

### 5. Data Models (MongoDB)

*   **User Schema:**
    ```json
    {
      "_id": "ObjectId",
      "username": "String (unique, required)",
      "email": "String (unique, required)",
      "password": "String (hashed, required)",
      "createdAt": "Date",
      "updatedAt": "Date"
    }
    ```
*   **Word Schema:**
    ```json
    {
      "_id": "ObjectId",
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
      "contributor_id": "ObjectId (references User._id, required)",
      "status": "String (e.g., 'pending_review', 'approved', 'rejected', default: 'pending_review')",
      "createdAt": "Date",
      "updatedAt": "Date"
    }
    ```

### 6. Development Setup (Docker)

*   A `docker-compose.yml` file will define three services:
    1.  `frontend`: Builds from the React app's Dockerfile.
    2.  `backend`: Builds from the Node.js/Express app's Dockerfile.
    3.  `mongo`: Uses the official MongoDB image.
*   Dockerfiles for frontend and backend will be created.
*   Environment variables will be used for configuration (e.g., database connection strings, API ports).

### 7. Project Milestones (High-Level)

1.  **Phase 1: Core Backend & Database Setup**
    *   [ ] Setup Node.js/Express backend project.
    *   [ ] Define User and Word Mongoose schemas.
    *   [ ] Implement User authentication API endpoints (register, login).
    *   [ ] Implement basic CRUD API endpoints for Words.
    *   [ ] Setup Docker environment for backend and MongoDB.
2.  **Phase 2: Frontend - Basic Structure & Home Page**
    *   [ ] Integrate React Router.
    *   [ ] Develop Home Page UI ([`src/App.jsx`](src/App.jsx) can be adapted).
    *   [ ] Implement search functionality, fetching data from the backend API.
    *   [ ] Display search results.
    *   [ ] Setup Docker environment for frontend.
3.  **Phase 3: Frontend - Contribution & Authentication Flow**
    *   [ ] Develop Login and Registration pages.
    *   [ ] Implement frontend authentication logic (storing tokens, protecting routes).
    *   [ ] Develop Contribution Page UI.
    *   [ ] Implement form submission for new words to the backend API.
4.  **Phase 4: Refinements & Additional Features**
    *   [ ] Implement word review/approval system (if needed).
    *   [ ] Add "Word of the Day" or similar features.
    *   [ ] Improve UI/UX based on feedback.
    *   [ ] Write unit and integration tests.
    *   [ ] Prepare for deployment.

### 8. Future Enhancements (Post-MVP)

*   Admin panel for managing users and contributions.
*   Advanced search filters (e.g., by part of speech, tags).
*   User profiles and contribution history.
*   Voting or rating system for word definitions.
*   Audio pronunciations.
*   Offline access / PWA features.

This plan provides a roadmap for developing the Kurukh Dictionary. The existing React frontend ([`src/App.jsx`](src/App.jsx), [`src/components/logo/KurukhDictionaryLogo.jsx`](src/components/logo/KurukhDictionaryLogo.jsx)) can serve as a starting point for the Home Page UI.