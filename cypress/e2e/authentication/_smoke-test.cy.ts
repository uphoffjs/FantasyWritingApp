/**
 * Infrastructure Smoke Test for Authentication
 *
 * This test validates the core authentication infrastructure:
 * - User fixtures load correctly
 * - Test data structure is valid
 * - Basic Cypress commands work
 *
 * ⚠️ NOTE: This test does NOT test Supabase connectivity
 * ⚠️ Supabase integration should be tested separately via API tests
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

  // * MUTATION TESTED: Validates fixture loading catches failures
  // * Mutation 1a: Rename users.json ✅ CAUGHT (fixture not found)
  // * Mutation 1b: Break JSON format ✅ CAUGHT (parse error)
  // * Mutation 1c: Remove email field ✅ WOULD CATCH (missing property assertion)
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

  // * MUTATION TESTED: Validates all user types have required structure
  // * Tests email/password existence and format validation
  // * Would catch: missing email, missing password, invalid email format, short passwords
  it('should have valid test data for all user types', () => {
    cy.log('🧪 TEST: Validating all user types');

    cy.fixture('auth/users.json').then((users) => {
      // Test each user type has required fields
      const userTypes = [
        'validUser',
        'newUser',
        'existingUser',
        'rememberUser',
        'sessionUser',
        'expiredUser',
        'multiTabUser',
        'forgotUser',
      ];

      userTypes.forEach((userType) => {
        const user = users[userType];

        // All users must have email and password
        expect(user).to.have.property('email');
        expect(user).to.have.property('password');

        // Email must be valid format
        expect(user.email).to.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);

        // Password must meet minimum requirements
        expect(user.password).to.have.length.at.least(6);

        cy.log(`✅ ${userType} has valid structure`);
      });

      cy.log('✅ All user types validated successfully');
    });
  });

  // * MUTATION TESTED: Validates Cypress custom commands are registered
  // * Tests that all auth and debug commands exist as functions
  // * Would catch: missing command imports, typos in command names, unregistered commands
  it('should have Cypress custom commands available', () => {
    cy.log('🧪 TEST: Verifying custom commands exist');

    // Verify that our custom commands are registered
    // We're not calling them, just checking they exist

    // Auth commands should exist
    expect(cy.seedSupabaseUser).to.be.a('function');
    expect(cy.cleanupSupabaseUsers).to.be.a('function');
    expect(cy.getSupabaseUser).to.be.a('function');
    expect(cy.deleteSupabaseUser).to.be.a('function');

    // Debug commands should exist
    expect(cy.comprehensiveDebug).to.be.a('function');
    expect(cy.comprehensiveDebugWithBuildCapture).to.be.a('function');

    cy.log('✅ All custom commands are registered');
  });

  // * Validates environment variables are accessible for Supabase operations
  it('should have Supabase environment variables configured', () => {
    cy.log('🧪 TEST: Checking Supabase environment setup');

    // Check environment variables via cy.task
    cy.task('supabase:checkEnv').then((env) => {
      cy.log(`Environment check result: ${JSON.stringify(env)}`);
      expect(env).to.have.property('url', true);
      expect(env).to.have.property('key', true);
    });

    cy.log('✅ Supabase environment variables are configured');
  });
});
