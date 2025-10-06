import { createClient } from '@supabase/supabase-js';

// * Get environment variables from Cypress config
// ! Service role key bypasses Row Level Security (RLS) - use only for testing
const getSupabaseUrl = () => {
  return Cypress.env('VITE_SUPABASE_URL') || 'https://cbyvpuqisqmepubzrwuo.supabase.co';
};

const getServiceRoleKey = () => {
  return Cypress.env('SUPABASE_SERVICE_ROLE_KEY') || '';
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

/**
 * Seeds a test user into Supabase using the Admin API
 * @param userData - User email, password, and optional metadata
 * @returns Created user object
 */
export async function seedUser(userData: SeedUserData) {
  try {
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
 */
export async function cleanupUsers() {
  try {
    // * Get all users from Supabase
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
      console.error('❌ Failed to list users:', listError);
      throw listError;
    }

    // * Filter test users by email pattern
    const testUsers = users.filter(u =>
      u.email?.toLowerCase().includes('test') ||
      u.email?.toLowerCase().includes('cypress')
    );

    console.log(`🧹 Cleaning up ${testUsers.length} test users...`);

    // * Delete each test user
    for (const user of testUsers) {
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);

      if (deleteError) {
        console.error(`❌ Failed to delete user ${user.email}:`, deleteError);
      } else {
        console.log(`✅ Deleted user: ${user.email}`);
      }
    }

    console.log('✅ Cleanup completed');
  } catch (err) {
    console.error('❌ Unexpected error during cleanup:', err);
    throw err;
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
 * @param email - User email to delete
 */
export async function deleteUserByEmail(email: string) {
  try {
    const user = await getUserByEmail(email);

    if (!user) {
      console.log(`⚠️ User not found, skipping delete: ${email}`);
      return; // * Silent success - user doesn't exist
    }

    const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id);

    if (error) {
      // * If user doesn't exist error, treat as success
      if (error.message?.includes('not found') || error.message?.includes('does not exist')) {
        console.log(`⚠️ User already deleted: ${email}`);
        return;
      }

      console.error(`❌ Failed to delete user ${email}:`, error);
      throw error;
    }

    console.log(`✅ Deleted user: ${email}`);
  } catch (err) {
    // * Handle "user not found" errors gracefully
    const error = err as Error;
    if (error.message?.includes('not found') || error.message?.includes('does not exist')) {
      console.log(`⚠️ User not found, skipping: ${email}`);
      return;
    }

    console.error('❌ Unexpected error deleting user:', err);
    throw err;
  }
}
