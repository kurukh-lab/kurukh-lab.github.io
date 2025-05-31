# Community Review Feature Manual Test Plan

This document outlines the manual testing steps for validating the community review feature. The tests should be performed in order, as each builds upon the previous steps.

## Prerequisites

- Firebase emulators running: `firebase emulators:start`
- Database initialized with test data: `node scripts/initializeDatabase.js`
- Application running in development: `npm run dev`
- Multiple test accounts ready (admin and regular users)

## Test Cases

### 1. Word Contribution Flow

**Test 1.1: Submit new word**
1. Log in as a regular user (user@kurukhdictionary.com)
2. Navigate to "Contribute" page
3. Fill out the form with a test word and submit
4. Verify that the success message mentions the community review process 
5. Expected: Word is created with "community_review" status

**Test 1.2: Check submitted word in user profile**
1. Navigate to user profile
2. Verify that the newly submitted word appears with "Community Review" status
3. Expected: Word appears in contributions with correct status indicator

### 2. Community Review Interface

**Test 2.1: View community review page**
1. Navigate to "Community Review" from main navigation
2. Verify that both "New Words" and "Corrections" tabs are visible
3. Select "New Words" tab
4. Expected: List of words in community review appears

**Test 2.2: Review interface elements**
1. For each word card, verify:
   - Word is displayed with meanings
   - Example sentences appear (if any)
   - Vote counts are visible
   - Approve and Reject buttons are present
2. Expected: All interface elements display properly

### 3. Voting Functionality

**Test 3.1: Vote on someone else's word**
1. Log in as a different user (e.g., user1@kurukhdictionary.com)
2. Navigate to Community Review
3. Vote "Approve" on a word
4. Expected: Vote is recorded, vote count increases, success message appears

**Test 3.2: Attempt to vote twice**
1. Try voting again on the same word
2. Expected: Button is disabled, message indicates you already voted

**Test 3.3: Test voting protection**
1. Submit your own word (as the current user)
2. Navigate to Community Review
3. Find your word in the list
4. Expected: Vote buttons are disabled, message indicates you cannot vote on your own contribution

**Test 3.4: Test vote thresholds**
1. Log in as five different users sequentially
2. Have each user vote "Approve" on the same word
3. Expected: After the fifth vote, word disappears from community review list

### 4. Admin Review Flow

**Test 4.1: Admin review interface**
1. Log in as admin (admin@kurukhdictionary.com)
2. Navigate to Admin page
3. Expected: Words that passed community review are visible in the pending words section

**Test 4.2: Admin approval**
1. Click "Approve" on a word that passed community review
2. Expected: Success message appears, word is removed from pending list

**Test 4.3: Verify word is public**
1. Navigate to home page or search page
2. Search for the approved word
3. Expected: Word appears in search results

**Test 4.4: Admin rejection**
1. Return to Admin page
2. Click "Reject" on a different word that passed community review
3. Expected: Success message appears, word is removed from pending list
4. Verify: Rejected word does not appear in search results

### 5. Edge Cases

**Test 5.1: Rejection threshold**
1. Log in as five different users sequentially
2. Have each user vote "Reject" on the same word
3. Expected: After the fifth rejection vote, word disappears from community review list
4. Verify: Word is marked as "community_rejected" in database

**Test 5.2: Mixed voting**
1. Have three users vote "Approve" on a word
2. Have two users vote "Reject" on the same word
3. Expected: Word remains in community review (hasn't reached either threshold)

**Test 5.3: Admin bypass**
1. Log in as admin
2. Directly approve a word that's still in community review (via database or admin interface)
3. Expected: Word should be publicly available despite bypassing community review

## Test Results Recording

For each test case:
1. Note the date and time of testing
2. Record whether the test passed or failed
3. If failed, note any error messages or unexpected behavior
4. Take screenshots of any issues for future reference

## Regression Testing

After fixing any issues found, repeat all failed tests and run the following regression test cases:

1. Ensure liked status is preserved for words after they go through community review
2. Confirm word reporting still works on approved words
3. Verify search functionality still works correctly with all status types
4. Check that user profile correctly displays all contribution statuses
