// Test setup file - not a test suite
// Add global test configuration and setup here

// Example: Mock fetch globally
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
  })
) as jest.Mock;

// Disable console.log during tests
console.log = jest.fn();

export {};
