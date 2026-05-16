// Separate jest config for Firestore security-rules tests. These run in a
// plain Node environment against the Firestore emulator, so they must NOT
// pick up the root jest.setup.js (which mocks every Firebase SDK and would
// short-circuit the very behaviour we are testing).

const path = require('path');

module.exports = {
  rootDir: path.resolve(__dirname, '../..'),
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/rules/**/*.test.cjs'],
  transform: {},
  // 30s — emulator-backed assertions are slower than mocked ones.
  testTimeout: 30000,
};
