# Kurukh Dictionary - Deployment Guide

This document contains step-by-step instructions for deploying the Kurukh Dictionary application to Firebase.

## Prerequisites

1. You have created a Firebase project in the Firebase Console
2. You have set up your environment variables in `.env` (copied from `.env.example`)
3. Firebase CLI is installed and you're logged in

## Step 1: Configure Firebase Project

If you haven't already connected your local project to Firebase:

```bash
firebase login
firebase use --add
```

Select your project when prompted.

## Step 2: Install Dependencies

Make sure all dependencies are installed:

```bash
npm install
```

## Step 3: Initialize the Database (Optional)

To populate the database with sample data for testing:

```bash
npm run init-db
```

This will create:
- 2 users: an admin and a regular user
- 5 sample Kurukh words (4 approved, 1 pending)

**Default Users:**
- Admin: admin@kurukhdictionary.com / Admin123!
- Regular User: user@kurukhdictionary.com / User123!

## Step 4: Deploy Firebase Functions

Deploy the Firebase Functions:

```bash
npm run deploy:functions
```

Or to deploy just the functions without the frontend:

```bash
firebase deploy --only functions
```

## Step 5: Deploy the Frontend Application

Build and deploy the full application:

```bash
npm run deploy
```

This will:
1. Build the React application using Vite
2. Deploy to Firebase Hosting

## Step 6: Set Up Custom Domain (Optional)

If you want to use a custom domain:

1. Go to the Firebase Console > Hosting
2. Click "Add custom domain"
3. Follow the verification steps
4. Update DNS records as instructed

## Step 7: Verify Deployment

1. Visit your Firebase Hosting URL (or custom domain)
2. Test the key functionality:
   - Search for words
   - User registration and login
   - Word contribution
   - Admin approval system

## Monitoring and Maintenance

- Monitor application performance in Firebase Console
- Check error logs in Firebase Functions logs
- Update security rules as needed in `firestore.rules` and `storage.rules`

## Future Updates

When you need to update the application:

1. Make your code changes
2. Test locally using `npm run dev:firebase`
3. Deploy with `npm run deploy`

## Troubleshooting

**Issue:** Functions not working
- Check function logs in Firebase Console
- Ensure environment variables are correctly set

**Issue:** Authentication problems
- Verify Authentication providers are enabled in Firebase Console
- Check security rules in `firestore.rules`

**Issue:** Missing data
- Run the database initialization script
- Check Firestore database in Firebase Console
