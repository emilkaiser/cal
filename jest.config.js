module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // Only run files with .test.ts or .spec.ts extensions as tests
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.spec.ts'],
  // Explicitly mark these directories as not containing tests
  testPathIgnorePatterns: [
    '/node_modules/',
    '/__tests__/fixtures/',
    '/__tests__/mocks/',
    '/__tests__/setup.ts',
  ],
};
