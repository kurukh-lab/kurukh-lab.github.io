# Kurukh Dictionary

A web application designed to be a crowd-sourced repository of Kurukh words and their meanings. This project aims to provide a platform for users to search for Kurukh words and for authenticated users to contribute new words and definitions, helping to preserve and grow the Kurukh language.

## Features

- Search for Kurukh words and view their meanings with advanced filtering options
- User authentication (register/login)
- Add new Kurukh words and definitions (for authenticated users)
- User profiles with contribution history
- Admin dashboard for word review and approval
- Report issues with word definitions
- Dictionary statistics and word of the day
- Responsive design for all devices

## Tech Stack

- **Frontend:** React (with Vite)
- **Styling:** Tailwind CSS with DaisyUI
- **Backend:** Firebase (Authentication, Firestore)
- **Deployment:** Firebase Hosting
- **State Management:** XState for complex workflows

## Development Setup

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Firebase CLI (`npm install -g firebase-tools`)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/kurukh-dictionary.git
   cd kurukh-dictionary
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```

4. Set up a Firebase project:
   - Go to the [Firebase Console](https://console.firebase.google.com/)
   - Click "Add Project" and name it "Kurukh Dictionary" (or any name you prefer)
   - Enable Google Analytics if desired
   - Create the project
   - Add a web app to your project by clicking the web icon (</>)
   - Register the app with a nickname (e.g., "Kurukh Dictionary Web")
   - Copy the Firebase configuration values

5. Update your `.env` file with the Firebase configuration values:
   ```
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

6. Set up Firebase Authentication:
   - In the Firebase Console, go to Authentication
   - Click "Get Started"
   - Enable the Email/Password sign-in method
   - Optionally, enable other authentication providers as needed

7. Set up Firestore Database:
   - In the Firebase Console, go to Firestore Database
   - Click "Create database"
   - Start in production mode
   - Select a location closest to your target audience
   
8. Initialize Firebase CLI:
   - Login to Firebase CLI if you haven't already:
     ```bash
     firebase login
     ```
   - Initialize Firebase in your project directory:
     ```bash
     firebase use --add
     ```
   - Select your Firebase project
### Running Locally

You have multiple options to run the project locally:

#### Option 1: Development server only (without Firebase emulators):
```bash
npm run dev
```

#### Option 2: Full development environment with Firebase emulators:
```bash
npm run dev:firebase
```
This runs both the Vite development server and Firebase emulators (Authentication, Firestore, Functions, Hosting, and Storage).

### Testing

To test your application, follow these steps:

1. Run the application with Firebase emulators:
   ```bash
   npm run dev:firebase
   ```

2. Create test users with different roles:
   - Register a regular user
   - Register an admin user
   - You can assign admin role by directly modifying the user document in Firestore emulator UI (available at http://localhost:4000/firestore)
   
   Example admin user document:
   ```
   {
     "uid": "user-id",
     "username": "admin",
     "email": "admin@example.com",
     "roles": ["admin"]
   }
   ```

3. Test all the features:
   - Search functionality
   - User registration and login
   - Word contribution
   - Admin word approval
   - Word details and pronunciation
   - User profiles
   - Word reporting system

### Deployment

When you're ready to deploy to production:

1. Build the application:
   ```bash
   npm run build
   ```

2. Deploy to Firebase:
   ```bash
   npm run deploy
   ```

This will deploy the application to Firebase Hosting using the configuration in `firebase.json`.

### Project Structure

```
├── firebase.json         # Firebase configuration
├── firestore.rules       # Firestore security rules
├── storage.rules         # Firebase Storage security rules
├── functions/            # Firebase Cloud Functions
├── public/               # Static assets
└── src/
    ├── App.jsx           # Main application component
    ├── main.jsx          # Entry point
    ├── assets/           # Static assets
    ├── components/       # Reusable UI components
    ├── config/           # Firebase configuration
    ├── contexts/         # React Context providers
    ├── hooks/            # Custom React hooks
    ├── pages/            # Page components
    ├── services/         # Firebase service functions
    └── utils/            # Utility functions
```

### Adding Admin Users

To add admin users to your application:

1. Create a regular user through the registration page
2. Go to the Firebase Console > Firestore Database
3. Find the user document in the "users" collection
4. Edit the document to add a "roles" array field with the value ["admin"]
5. Save the document

Admin users will now have access to the admin dashboard at `/admin` path.
```

#### With Firebase emulators:
```bash
npm run dev:firebase
```

### Building for production
```bash
npm run build
```

### Deployment
```bash
npm run deploy
```

## Project Structure

- `/src/components` - Reusable UI components
  - `/auth` - Authentication-related components like ProtectedRoute
  - `/common` - Common UI components like SearchBar
  - `/dictionary` - Dictionary-specific components like WordCard
  - `/layout` - Layout components like Header, Footer
  - `/logo` - Logo components
- `/src/contexts` - React context providers (AuthContext for user authentication)
- `/src/pages` - Application pages/routes
  - Home - Main search page
  - WordDetails - Individual word view
  - Contribute - Word contribution form
  - Admin - Admin dashboard for word review
  - UserProfile - User profile and contributions
  - Login/Register - Authentication pages
- `/src/services` - Firebase service integrations
- `/src/hooks` - Custom React hooks
- `/src/utils` - Utility functions
- `/src/config` - Configuration files
## Contributing

Contributions to the Kurukh Dictionary project are welcome! Here's how you can contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code follows the existing style and includes appropriate tests.

## Feature Spotlight: XState Word Review System

We use XState to manage the word review workflow in the Kurukh Dictionary. This provides a structured and visual way to understand and control how words progress through different review states.

Key features include:
- State machine visualization for developers and admins
- Integration with Firestore for state persistence
- Full history tracking of state transitions
- React hooks for simple component integration

See [Word Review XState Documentation](docs/WORD_REVIEW_XSTATE.md) for more details.

## Future Roadmap

- **PWA Implementation:** Enable offline access and installation as a progressive web app
- **Audio Pronunciation:** Allow users to upload audio pronunciations for words
- **Mobile App:** Develop mobile applications using React Native
- **Expanded Language Support:** Add support for more languages beyond English and Hindi
- **Enhanced Search:** Implement fuzzy search and phonetic matching
- **Community Features:** Add discussion forums and comments on word entries
- **Gamification:** Add badges, points, and leaderboards for contributors

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Kurukh language community
- Firebase team for their excellent documentation
- React and Vite communities for their tools and resources
- All contributors who help build and maintain this project
=======
# kurukh-dictionary.github.io
