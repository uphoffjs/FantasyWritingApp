#!/usr/bin/env node

/**
 * Supabase Test User Cleanup Script
 *
 * Force-deletes all test users from Supabase authentication system.
 * This script handles stuck users that cannot be deleted through normal means.
 *
 * Usage:
 *   node scripts/cleanup-supabase-users.js
 *   npm run cleanup:supabase
 *
 * Environment Requirements:
 *   - VITE_SUPABASE_URL: Your Supabase project URL
 *   - SUPABASE_SERVICE_ROLE_KEY: Service role key with admin privileges
 */

// Load environment variables
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Create Supabase admin client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(`${colors.red}❌ Error: Missing required environment variables${colors.reset}`);
  console.error('Please ensure .env file contains:');
  console.error('  - VITE_SUPABASE_URL');
  console.error('  - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

/**
 * Sleep utility for delays between operations
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry an operation with exponential backoff
 */
async function retryWithBackoff(operation, maxRetries = 5, baseDelay = 1000) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      const delay = baseDelay * Math.pow(2, attempt);
      console.log(`${colors.yellow}⚠️  Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms...${colors.reset}`);
      await sleep(delay);
    }
  }
}

/**
 * Main cleanup function
 */
async function cleanupTestUsers() {
  console.log(`${colors.blue}╔════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.blue}║  Supabase Test User Cleanup Script            ║${colors.reset}`);
  console.log(`${colors.blue}╚════════════════════════════════════════════════╝${colors.reset}`);
  console.log('');

  try {
    // Step 1: List all users
    console.log(`${colors.cyan}📋 Step 1: Fetching all users...${colors.reset}`);
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      throw new Error(`Failed to list users: ${listError.message}`);
    }

    console.log(`${colors.green}✅ Found ${users.length} total users${colors.reset}`);
    console.log('');

    // Step 2: Filter test users
    console.log(`${colors.cyan}🔍 Step 2: Identifying test users...${colors.reset}`);
    const testUsers = users.filter(u => {
      const email = u.email?.toLowerCase() || '';
      return email.includes('test') ||
             email.includes('cypress') ||
             email.includes('fantasy-app.test');
    });

    if (testUsers.length === 0) {
      console.log(`${colors.green}✨ No test users found - database is clean!${colors.reset}`);
      return;
    }

    console.log(`${colors.yellow}⚠️  Found ${testUsers.length} test users to delete:${colors.reset}`);
    testUsers.forEach(user => {
      console.log(`   - ${user.email} (ID: ${user.id})`);
    });
    console.log('');

    // Step 3: Confirm deletion (optional - remove if running in CI)
    if (process.stdout.isTTY && !process.env.CI) {
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      const answer = await new Promise(resolve => {
        rl.question(`${colors.yellow}⚠️  Proceed with deletion? (yes/no): ${colors.reset}`, resolve);
      });
      rl.close();

      if (answer.toLowerCase() !== 'yes' && answer.toLowerCase() !== 'y') {
        console.log(`${colors.blue}ℹ️  Deletion cancelled by user${colors.reset}`);
        return;
      }
      console.log('');
    }

    // Step 4: Delete each test user with retry logic
    console.log(`${colors.cyan}🗑️  Step 3: Deleting test users...${colors.reset}`);
    let successCount = 0;
    let failCount = 0;
    const failed = [];

    for (const user of testUsers) {
      try {
        await retryWithBackoff(async () => {
          const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);

          if (deleteError) {
            // If user not found, that's actually success (already gone)
            if (deleteError.message?.includes('not found') ||
                deleteError.message?.includes('does not exist')) {
              console.log(`${colors.green}✅ ${user.email} (already deleted)${colors.reset}`);
              return;
            }
            throw deleteError;
          }

          console.log(`${colors.green}✅ Deleted: ${user.email}${colors.reset}`);
        }, 5, 1000);

        successCount++;

        // Add small delay between deletions to avoid rate limits
        await sleep(100);

      } catch (err) {
        const error = err;
        console.error(`${colors.red}❌ Failed: ${user.email} - ${error.message}${colors.reset}`);
        failed.push({ email: user.email, error: error.message });
        failCount++;
      }
    }

    // Step 5: Summary
    console.log('');
    console.log(`${colors.blue}╔════════════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.blue}║  Cleanup Summary                               ║${colors.reset}`);
    console.log(`${colors.blue}╚════════════════════════════════════════════════╝${colors.reset}`);
    console.log(`${colors.green}✅ Successfully deleted: ${successCount}${colors.reset}`);
    if (failCount > 0) {
      console.log(`${colors.red}❌ Failed to delete: ${failCount}${colors.reset}`);
      console.log('');
      console.log(`${colors.yellow}Failed users:${colors.reset}`);
      failed.forEach(f => {
        console.log(`   - ${f.email}: ${f.error}`);
      });
    }
    console.log('');

    if (failCount === 0) {
      console.log(`${colors.green}🎉 All test users cleaned up successfully!${colors.reset}`);
    } else {
      console.log(`${colors.yellow}⚠️  Some users could not be deleted. You may need to:${colors.reset}`);
      console.log('   1. Check Supabase Dashboard for active sessions');
      console.log('   2. Manually delete via Supabase Dashboard → Authentication → Users');
      console.log('   3. Verify service role key has admin privileges');
    }

  } catch (error) {
    console.error(`${colors.red}❌ Fatal error: ${error.message}${colors.reset}`);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run cleanup
cleanupTestUsers()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(`${colors.red}❌ Unexpected error: ${error.message}${colors.reset}`);
    process.exit(1);
  });
