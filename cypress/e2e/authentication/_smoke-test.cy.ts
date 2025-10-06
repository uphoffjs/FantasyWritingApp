/**
 * Infrastructure Smoke Test for Authentication
 *
 * This test validates the core authentication infrastructure:
 * - User fixtures load correctly
 * - Seeding functions work
 * - Custom auth commands work
 * - Cleanup functions work
 *
 * ⚠️ CRITICAL: This test must pass 3x consecutively before proceeding to Phase 2
 */

describe('Authentication Infrastructure Smoke Test', () => {
  // ! MANDATORY: Must be first hook in every describe()
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.comprehensiveDebugWithBuildCapture();
    cy.comprehensiveDebug();
  });

  afterEach(() => {
    // * Cleanup: Clear all session data
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  it('should load user fixtures correctly', () => {
    cy.log('🧪 TEST: Loading user fixtures');

    // Load fixtures and verify structure
    cy.fixture('auth/users.json').then((users) => {
      // Verify all required user types exist
      expect(users).to.have.property('validUser');
      expect(users).to.have.property('newUser');
      expect(users).to.have.property('existingUser');
      expect(users).to.have.property('rememberUser');
      expect(users).to.have.property('sessionUser');
      expect(users).to.have.property('expiredUser');
      expect(users).to.have.property('multiTabUser');
      expect(users).to.have.property('forgotUser');

      // Verify validUser structure
      const validUser = users.validUser;
      expect(validUser).to.have.property('id');
      expect(validUser).to.have.property('email');
      expect(validUser).to.have.property('password');
      expect(validUser.password).to.have.length.at.least(6);

      // Verify email format
      expect(validUser.email).to.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);

      cy.log('✅ All user fixtures are valid');
    });
  });

  it('should seed a test user successfully', () => {
    cy.log('🧪 TEST: Seeding test user');

    // Load a user fixture
    cy.fixture('auth/users.json').then((users) => {
      const testUser = users.validUser;

      cy.log(`📝 Attempting to seed user: ${testUser.email}`);

      // * Clean up user first to ensure fresh test
      cy.deleteSupabaseUser(testUser.email);

      // Seed the user using Supabase Admin API
      cy.seedSupabaseUser({
        email: testUser.email,
        password: testUser.password,
        metadata: {
          testUser: true,
          createdBy: 'cypress-smoke-test',
        },
      }).then((user) => {
        cy.log('Seed result:', JSON.stringify(user));

        // Verify user was created successfully
        expect(user).to.exist;
        expect(user.email).to.equal(testUser.email);

        cy.log('✅ User seeded successfully via Supabase Admin API');
      });
    });
  });

  it('should handle cleanup gracefully', () => {
    cy.log('🧪 TEST: Cleanup functionality');

    // Load test users
    cy.fixture('auth/users.json').then((users) => {
      const testUser1 = users.validUser;
      const testUser2 = users.newUser;

      // Seed two test users
      cy.seedSupabaseUser({
        email: testUser1.email,
        password: testUser1.password,
      });

      cy.seedSupabaseUser({
        email: testUser2.email,
        password: testUser2.password,
      });

      // Verify users exist
      cy.getSupabaseUser(testUser1.email).then((user) => {
        expect(user).to.exist;
        expect(user.email).to.equal(testUser1.email);
      });

      cy.getSupabaseUser(testUser2.email).then((user) => {
        expect(user).to.exist;
        expect(user.email).to.equal(testUser2.email);
      });

      // Clean up all test users (using Admin API)
      cy.cleanupSupabaseUsers();

      // Verify cleanup worked
      cy.getSupabaseUser(testUser1.email).then((user) => {
        expect(user).to.be.null;
      });

      cy.getSupabaseUser(testUser2.email).then((user) => {
        expect(user).to.be.null;
      });

      cy.log('✅ Cleanup executed successfully via Supabase Admin API');
    });
  });
});
