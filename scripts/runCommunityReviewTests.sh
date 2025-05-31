#!/usr/bin/env bash

# Run all community review tests in the correct order
# This script will run the necessary tests to verify the community review feature
# 
# Usage: ./scripts/runCommunityReviewTests.sh

# Text formatting
BOLD='\033[1m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BOLD}=======================================================${NC}"
echo -e "${BOLD}Running Community Review Tests${NC}"
echo -e "${BOLD}=======================================================${NC}"

# Check if emulators are running
curl -s http://127.0.0.1:9098 > /dev/null
AUTH_RUNNING=$?

curl -s http://127.0.0.1:8081 > /dev/null
FIRESTORE_RUNNING=$?

if [ $AUTH_RUNNING -ne 0 ] || [ $FIRESTORE_RUNNING -ne 0 ]; then
  echo -e "${RED}Firebase emulators are not running!${NC}"
  echo -e "${YELLOW}Starting Firebase emulators...${NC}"
  
  # Start emulators in the background
  firebase emulators:start &
  
  # Store the process ID
  EMULATOR_PID=$!
  
  # Wait for emulators to be ready
  echo "Waiting for emulators to start..."
  sleep 10
else
  echo -e "${GREEN}Firebase emulators are already running${NC}"
fi

echo -e "\n${YELLOW}Step 1: Ensuring test users exist...${NC}"
node scripts/ensureTestUsers.js

echo -e "\n${YELLOW}Step 2: Initializing database...${NC}"
node scripts/initializeDatabase.js

echo -e "\n${YELLOW}Step 3: Running basic community review tests...${NC}"
node scripts/testCommunityReview.js

echo -e "\n${YELLOW}Step 4: Running edge cases tests...${NC}"
node scripts/testCommunityReviewEdgeCases.js

echo -e "\n${YELLOW}Step 5: Running verification flow...${NC}"
node scripts/verifyCommunityReviewFlow.js

echo -e "\n${GREEN}${BOLD}All community review tests completed!${NC}"
echo -e "Check the output above for any errors or failures."

# If we started the emulators, ask if we should stop them
if [ ! -z "$EMULATOR_PID" ]; then
  echo -e "\n${YELLOW}Emulators were started by this script.${NC}"
  read -p "Do you want to stop the emulators? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    kill $EMULATOR_PID
    echo -e "${GREEN}Emulators stopped.${NC}"
  else
    echo -e "${YELLOW}Emulators left running. Stop them manually when finished.${NC}"
  fi
fi
