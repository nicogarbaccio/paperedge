/**
 * Test data fixtures for PaperEdge E2E tests
 */

export const testUsers = {
  // Valid test user credentials (match .env.test)
  validUser: {
    email: process.env.TEST_EMAIL || 'test@example.com',
    password: process.env.TEST_PASSWORD || 'test123456',
    name: 'Test User',
  },

  // Invalid/edge case users for auth validation tests
  invalidEmail: {
    email: 'invalid-email',
    password: 'Password123!',
  },

  weakPassword: {
    email: 'weak@paperedge.com',
    password: '123',
  },

  nonExistentUser: {
    email: 'nonexistent@paperedge.com',
    password: 'Password123!',
  },

  sqlInjection: {
    email: "admin'--",
    password: "' OR '1'='1",
  },

  xssAttempt: {
    email: '<script>alert("xss")</script>@test.com',
    password: 'Password123!',
  },
};
