/**
 * Test User Generator Utility
 *
 * Generates unique test user data for Cypress tests to ensure test isolation.
 * This eliminates the need for cleanup between test runs.
 *
 * @example
 * const user = generateTestUser('validUser');
 * cy.task('supabase:seedUser', { email: user.email, password: user.password });
 */

export interface TestUserTemplate {
  id: string;
  password: string;
  profile?: {
    username: string;
    created_at: string;
  };
}

export interface GeneratedTestUser {
  id: string;
  email: string;
  password: string;
  profile?: {
    username: string;
    created_at: string;
  };
}

/**
 * Generates a unique timestamp-based identifier
 */
function generateUniqueId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `${timestamp}-${random}`;
}

/**
 * Generates a unique email for a test user
 * @param baseEmail - The base email template (e.g., "valid.user@fantasy-app.test")
 * @returns Unique email with timestamp (e.g., "valid.user-1633024800000-abc123@fantasy-app.test")
 */
export function generateUniqueEmail(baseEmail: string): string {
  const [localPart, domain] = baseEmail.split('@');
  const uniqueId = generateUniqueId();
  return `${localPart}-${uniqueId}@${domain}`;
}

/**
 * Generates a test user with a unique email based on a template
 * @param userType - The type of user (e.g., 'validUser', 'rememberUser')
 * @param template - The user template with base configuration
 * @returns Generated user with unique email
 */
export function generateTestUser(
  userType: string,
  template: TestUserTemplate
): GeneratedTestUser {
  // Generate unique email based on user type
  const baseEmail = `${userType.toLowerCase().replace(/([A-Z])/g, '.')}@fantasy-app.test`;
  const uniqueEmail = generateUniqueEmail(baseEmail);

  return {
    id: template.id,
    email: uniqueEmail,
    password: template.password,
    profile: template.profile,
  };
}

/**
 * Generates multiple test users from a fixture template
 * @param fixtures - User fixture templates
 * @returns Map of generated users with unique emails
 */
export function generateTestUsers(
  fixtures: Record<string, TestUserTemplate>
): Record<string, GeneratedTestUser> {
  const generatedUsers: Record<string, GeneratedTestUser> = {};

  for (const [userType, template] of Object.entries(fixtures)) {
    generatedUsers[userType] = generateTestUser(userType, template);
  }

  return generatedUsers;
}

/**
 * Creates a test-specific email based on the current test context
 * @param testName - Name of the test
 * @param suffix - Optional suffix for the email
 * @returns Unique email for the test
 */
export function generateTestSpecificEmail(testName: string, suffix = ''): string {
  const sanitizedTestName = testName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 30); // Limit length

  const uniqueId = generateUniqueId();
  const emailSuffix = suffix ? `-${suffix}` : '';

  return `test-${sanitizedTestName}${emailSuffix}-${uniqueId}@fantasy-app.test`;
}

/**
 * Generates a session-unique prefix for all test users in a test run
 * Useful for bulk cleanup or filtering
 */
export function generateSessionPrefix(): string {
  return `session-${Date.now()}`;
}
