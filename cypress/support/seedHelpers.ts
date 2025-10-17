import { createClient } from '@supabase/supabase-js';

// * Get environment variables from process.env (for cy.task() Node.js context)
// ! Service role key bypasses Row Level Security (RLS) - use only for testing
const getSupabaseUrl = () => {
  // Try process.env first (cy.task()), fallback to Cypress.env() (browser context)
  const url = process.env.VITE_SUPABASE_URL ||
              (typeof Cypress !== 'undefined' ? Cypress.env('VITE_SUPABASE_URL') : '') ||
              'https://cbyvpuqisqmepubzrwuo.supabase.co';
  return url;
};

const getServiceRoleKey = () => {
  // Try process.env first (cy.task()), fallback to Cypress.env() (browser context)
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ||
              (typeof Cypress !== 'undefined' ? Cypress.env('SUPABASE_SERVICE_ROLE_KEY') : '') ||
              '';
  return key;
};

// * Create Supabase admin client with service role key
const supabaseAdmin = createClient(
  getSupabaseUrl(),
  getServiceRoleKey(),
);

export interface SeedUserData {
  email: string;
  password: string;
  metadata?: Record<string, unknown>;
}

// * ==========================================
// * Utility Functions
// * ==========================================

/**
 * Sleep utility for adding delays
 * @param ms - Milliseconds to sleep
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry an async operation with exponential backoff
 * @param operation - Async function to retry
 * @param maxRetries - Maximum number of retry attempts
 * @param baseDelay - Base delay in milliseconds
 */
async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      // * Don't retry if it's the last attempt
      if (attempt === maxRetries) {
        break;
      }

      // * Calculate exponential backoff delay: 1s, 2s, 4s
      const delay = baseDelay * Math.pow(2, attempt);
      console.log(`⚠️ Attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
      await sleep(delay);
    }
  }

  throw lastError;
}

/**
 * Seeds a test user into Supabase using the Admin API
 * NOTE: Fails if user already exists. Call cleanup before seeding if needed.
 * @param userData - User email, password, and optional metadata
 * @returns Created user object
 */
export async function seedUser(userData: SeedUserData) {
  try {
    // * Check if user already exists
    const existingUser = await getUserByEmail(userData.email);
    if (existingUser) {
      const error = new Error(
        `User ${userData.email} already exists. Call deleteUserByEmail() or cleanupUsers() first to remove existing users.`
      );
      console.error('❌ Cannot seed user:', error.message);
      throw error;
    }

    // * Create the user
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true, // * Auto-confirm email for testing
      user_metadata: userData.metadata || {},
    });

    if (error) {
      console.error('❌ Failed to seed user:', error);
      throw error;
    }

    console.log('✅ User seeded successfully:', data.user.email);
    return data.user;
  } catch (err) {
    console.error('❌ Unexpected error seeding user:', err);
    throw err;
  }
}

/**
 * Cleans up test users from Supabase
 * Removes users whose emails contain 'test' or 'cypress'
 * NOTE: Silently continues on deletion errors (users might have dependencies)
 */
export async function cleanupUsers() {
  try {
    // * Get all users from Supabase
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
      console.error('❌ Failed to list users:', listError);
      // * Don't throw - return silently so tests can continue
      console.log('⚠️ Continuing without cleanup...');
      return;
    }

    // * Filter test users by email pattern
    const testUsers = users.filter(u =>
      u.email?.toLowerCase().includes('test') ||
      u.email?.toLowerCase().includes('cypress')
    );

    if (testUsers.length === 0) {
      console.log('✨ No test users to clean up');
      return;
    }

    console.log(`🧹 Found ${testUsers.length} test users to clean up`);

    // * Attempt to delete each test user with retry logic
    // * Use exponential backoff for each user deletion
    let successCount = 0;
    let failCount = 0;

    for (const user of testUsers) {
      try {
        // * Use retry logic with exponential backoff for each user
        await retryWithBackoff(async () => {
          // ! Supabase v2: deleteUser() performs hard delete by default, removing all related data
          const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);

          if (deleteError) {
            // * If user doesn't exist error, treat as success
            if (deleteError.message?.includes('not found') || deleteError.message?.includes('does not exist')) {
              console.log(`⚠️ User already deleted: ${user.email}`);
              return;
            }

            // * Throw error to trigger retry
            throw deleteError;
          }

          console.log(`✅ Deleted user: ${user.email}`);
        }, 3, 1000);

        successCount++;
      } catch (err) {
        const error = err as Error;
        // * Handle "user not found" errors gracefully
        if (error.message?.includes('not found') || error.message?.includes('does not exist')) {
          console.log(`⚠️ User not found: ${user.email}`);
          successCount++; // Count as success since user doesn't exist anyway
        } else {
          console.log(`⚠️ Could not delete user ${user.email} after retries:`, error.message);
          failCount++;
        }
      }
    }

    console.log(`✅ Cleanup completed: ${successCount} deleted, ${failCount} skipped`);
  } catch (err) {
    // * Don't throw - just log and continue
    // * Tests should be able to run even if cleanup fails
    console.warn('⚠️ Cleanup encountered an error, continuing anyway:', err);
  }
}

/**
 * Gets a user by email from Supabase
 * @param email - User email to search for
 * @returns User object if found, null otherwise
 */
export async function getUserByEmail(email: string) {
  try {
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();

    if (error) {
      console.error('❌ Failed to list users:', error);
      throw error;
    }

    return users.find(u => u.email === email) || null;
  } catch (err) {
    console.error('❌ Unexpected error getting user:', err);
    throw err;
  }
}

/**
 * Deletes a specific user by email
 * Uses hard delete (shouldSoftDelete: false) with retry logic
 * @param email - User email to delete
 */
export async function deleteUserByEmail(email: string) {
  try {
    const user = await getUserByEmail(email);

    if (!user) {
      console.log(`⚠️ User not found, skipping delete: ${email}`);
      return; // * Silent success - user doesn't exist
    }

    // * Use retry logic with exponential backoff for deletion
    await retryWithBackoff(async () => {
      // ! CRITICAL: In Supabase v2, deleteUser() performs hard delete by default
      // ! No shouldSoftDelete parameter needed
      const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id);

      if (error) {
        // * If user doesn't exist error, treat as success
        if (error.message?.includes('not found') || error.message?.includes('does not exist')) {
          console.log(`⚠️ User already deleted: ${email}`);
          return;
        }

        // * Throw error to trigger retry
        console.error(`❌ Delete attempt failed for ${email}:`, error.message);
        throw error;
      }

      console.log(`✅ Deleted user: ${email}`);
    }, 3, 1000); // 3 retries with 1s, 2s, 4s delays

  } catch (err) {
    // * Handle "user not found" errors gracefully
    const error = err as Error;
    if (error.message?.includes('not found') || error.message?.includes('does not exist')) {
      console.log(`⚠️ User not found, skipping: ${email}`);
      return;
    }

    console.error('❌ Unexpected error deleting user after retries:', err);
    throw err;
  }
}
