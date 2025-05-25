// Quick test to verify the admin can log in and see reports through the web interface
console.log('🔍 Testing admin login and Word Reports access...');

// This script can be run in the browser console to test the functionality
// Navigate to http://localhost:5174/login and use this in the console

async function quickAdminTest() {
  console.log('📧 Admin login credentials:');
  console.log('Email: admin@kurukhdictionary.com');
  console.log('Password: Admin123!');
  console.log('');
  console.log('🎯 Steps to test:');
  console.log('1. Navigate to http://localhost:5174/login');
  console.log('2. Login with the above credentials');
  console.log('3. Navigate to http://localhost:5174/admin');
  console.log('4. Click on "Word Reports" tab');
  console.log('5. Verify you see 3 reports:');
  console.log('   - "chicka" - inappropriate_content');
  console.log('   - "abba" - incorrect_spelling');
  console.log('   - "mankhaa" - incorrect_definition');
  console.log('');
  console.log('✅ If you see these reports, the Word Reports fix is successful!');
}

quickAdminTest();
