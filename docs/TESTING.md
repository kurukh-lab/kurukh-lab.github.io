# Kurukh Dictionary - Testing Guide

This document outlines how to test all features of the Kurukh Dictionary application.

## Prerequisites

1. The application is running locally with Firebase emulators:
   ```bash
   npm run dev:firebase
   ```

2. Database is initialized with sample data:
   ```bash
   npm run init-db
   ```

## Test Categories

### 1. Authentication

#### User Registration
1. Click "Register" in the navigation
2. Fill in the registration form with a new email
3. Submit the form
4. Verify you're redirected to the home page and logged in

#### User Login
1. Click "Logout" if you're already logged in
2. Click "Login" in the navigation
3. Enter credentials:
   - Admin: admin@kurukhdictionary.com / Admin123!
   - Regular User: user@kurukhdictionary.com / User123!
4. Submit the form
5. Verify you're redirected to the home page and logged in

#### Protected Routes
1. Logout if you're logged in
2. Try to access `/admin` directly in the URL
3. Verify you're redirected to the login page
4. Log in as a non-admin user
5. Try to access `/admin` directly
6. Verify you're denied access

### 2. Word Search

#### Basic Search
1. On the home page, enter "bai" in the search box
2. Click Search
3. Verify search results show the "bai" word card

#### Filtered Search
1. On the home page, click "Show Filters"
2. Select language "English" and part of speech "noun"
3. Enter "bai" in the search box
4. Click Search
5. Verify search results show the filtered words

#### Empty Search
1. Clear the search box
2. Click Search
3. Verify that default results or a prompt to enter search terms is shown

### 3. Word Details

#### View Word Details
1. Search for a word (e.g., "bai")
2. Click on the word card
3. Verify you're taken to the word details page
4. Verify all information is displayed:
   - Word in Kurukh
   - Meanings in different languages
   - Example sentences
   - Part of speech
   - Pronunciation

#### Pronunciation Feature
1. On a word details page
2. Click the pronunciation button
3. Verify the browser speaks the word

#### Social Sharing
1. On a word details page
2. Click a social sharing button
3. Verify share dialog appears

### 4. Word Contribution

#### Add New Word
1. Login if not already logged in
2. Navigate to "Contribute" in the navigation
3. Fill in all required fields:
   - Kurukh Word
   - Meanings (at least one language)
   - Part of speech
   - Example sentences
4. Submit the form
5. Verify success message and that the word appears in your profile contributions

#### Validation Checks
1. Navigate to "Contribute"
2. Submit the form without filling any fields
3. Verify validation errors appear
4. Fill only some fields and submit
5. Verify validation for remaining required fields

### 5. Admin Features

#### Word Approval
1. Login as admin
2. Navigate to "Admin" in the navigation
3. Find a word with "pending_review" status
4. Click "Approve"
5. Verify the word status changes
6. Go to home page and search for the approved word
7. Verify it appears in search results

#### Word Rejection
1. Login as admin
2. Navigate to "Admin"
3. Find a word with "pending_review" status
4. Click "Reject"
5. Enter a rejection reason
6. Submit the form
7. Verify the word status changes
8. Check that it doesn't appear in regular search results

#### Report Resolution
1. Login as admin
2. Navigate to "Admin"
3. Click "Reports" tab
4. Find a report (you may need to create one first)
5. Click "Resolve"
6. Enter resolution details
7. Submit the form
8. Verify the report is marked as resolved

### 6. User Profile

#### View Profile
1. Login
2. Click on your username or "Profile" in the navigation
3. Verify your profile information appears
4. Verify your contributions are listed

#### Contribution History
1. In your profile
2. Check that all words you've contributed appear
3. Verify their status is correctly displayed

### 7. Word Reporting

#### Report an Issue
1. Search for a word and go to its details page
2. Click "Report Issue"
3. Select a reason for the report
4. Add details in the text field
5. Submit the report
6. Verify success message

### 8. Dictionary Statistics

#### View Statistics
1. Go to the home page
2. Verify that dictionary statistics are displayed:
   - Total approved words
   - User count
   - Recent words
   - Other stats

#### Word of the Day
1. Go to the home page
2. Verify that Word of the Day is displayed
3. Verify it changes each day (you can test by changing the date logic temporarily)

## Performance and Responsive Testing

### Responsive Design
1. Test the application on different screen sizes:
   - Desktop
   - Tablet (landscape and portrait)
   - Mobile phone

### Performance Check
1. Check load times for:
   - Initial page load
   - Search operations
   - Navigation between pages

## Report any issues you find during testing, including:
- UI/UX issues
- Functional bugs
- Performance problems
- Security concerns

Happy Testing!
