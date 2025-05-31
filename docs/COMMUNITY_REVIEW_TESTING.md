# Community Review Feature Testin### 1. Basic Testing

**Important**: Before running tests, initialize the database with test data:
```sh
node scripts/initializeDatabase.js
```

Then run the verification script to automatically test the entire flow:
```sh
node scripts/verifyCommunityReviewFlow.js
```

1. **View Community Review Page**:
   - Sign in as any user (e.g., user@kurukhdictionary.com / User123!)
   - Navigate to "Community Review" from the header
   - Verify that you see words in community review statuse

This guide provides instructions for testing the community review feature for new word contributions in the Kurukh Dictionary application.

## Overview

The community review feature implements a two-stage review process for new word contributions:

1. **Community Review**: When a new word is added, it enters the "community_review" status. All users can vote (approve or reject) on these words.
   - If a word receives 5 approve votes, it moves to admin review.
   - If a word receives 5 reject votes, it is marked as "community_rejected".

2. **Admin Review**: Words that pass community review go to administrators for final review.
   - Admins can approve or reject these words.
   - Approved words become publicly available in the dictionary.

## Test Environment Setup

1. Start the Firebase emulators:
   ```sh
   firebase emulators:start
   ```

2. Initialize the test database with sample data:
   ```sh
   node scripts/initializeDatabase.js
   ```

3. In a separate terminal, run the application:
   ```sh
   npm run dev
   ```

## Basic Testing

1. **View Community Review Page**:
   - Sign in as any user (e.g., user@kurukhdictionary.com / User123!)
   - Navigate to "Community Review" from the header
   - Verify that you see words in community review status

2. **Contribute a New Word**:
   - Navigate to "Contribute"
   - Add a new word
   - Verify that the success message informs you about the community review process
   - Verify that the word appears in your profile with "Community Review" status

3. **Vote on Words**:
   - Go to "Community Review"
   - Approve or reject words
   - Verify that you cannot vote on your own contributions
   - Verify that you cannot vote twice on the same word

4. **Admin Review**:
   - Sign in as admin (admin@kurukhdictionary.com / Admin123!)
   - Navigate to the Admin page
   - Verify that words that passed community review appear for admin approval
   - Approve or reject words
   - Verify that approved words become publicly available

## Automated Tests

Run the automated test scripts to verify the feature:

1. Test the main community review flow:
   ```sh
   node scripts/testCommunityReview.js
   ```

2. Test edge cases:
   ```sh
   node scripts/testCommunityReviewEdgeCases.js
   ```

## Test Scenarios

1. **Normal Flow**:
   - User adds a new word → status: "community_review"
   - 5 different users approve the word → status: "pending_review"  
   - Admin approves the word → status: "approved"
   - Word appears in dictionary search results

2. **Rejection Flow**:
   - User adds a new word → status: "community_review"
   - 5 different users reject the word → status: "community_rejected"
   - Word does not appear for admin review or in search results

3. **Mixed Voting**:
   - User adds a new word → status: "community_review"
   - Some users approve, some reject (less than 5 of either)
   - Word remains in "community_review" status

4. **Edge Cases**:
   - User tries to vote on their own contribution (should be prevented)
   - User tries to vote twice on the same word (should be prevented)
   - Admin tries to directly approve a word in community review (should be allowed)
   - User tries to vote on a word that already completed community review (should be prevented)

## What to Look For

- **UI Feedback**: Clear messages about the review process and voting results
- **Status Updates**: Correct status changes based on voting thresholds
- **Validation**: Proper validation to prevent invalid voting patterns
- **Admin Flow**: Smooth transition from community review to admin approval
- **User Experience**: Clear information about the review process at all stages

## Reporting Issues

If you find any issues during testing, document:
1. The steps to reproduce the issue
2. The expected behavior
3. The actual behavior
4. Any error messages or unexpected UI states
