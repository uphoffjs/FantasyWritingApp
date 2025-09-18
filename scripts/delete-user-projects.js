#!/usr/bin/env node

/**
 * Script to delete all projects for a specific user from Supabase
 * Use this to clean up and start fresh when there are synchronization issues
 * 
 * Usage:
 *   node scripts/delete-user-projects.js <user_id>
 *   node scripts/delete-user-projects.js --dry-run <user_id>
 *   node scripts/delete-user-projects.js --force <user_id>
 */

const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');
require('dotenv').config();

// ! Critical: This script will permanently delete all projects for a user
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials. Please check your .env file.');
  console.error('   Required: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or VITE_SUPABASE_ANON_KEY)');
  process.exit(1);
}

// * Create Supabase client with service role key for admin operations
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// * Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const isForce = args.includes('--force');
const userIdArg = args.find(arg => !arg.startsWith('--'));

// * Prompt for user confirmation
async function confirmDeletion(projectCount, userId) {
  if (isForce) {
    console.log('⚠️  Force flag detected - skipping confirmation');
    return true;
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => {
    rl.question(
      `\n⚠️  WARNING: This will permanently delete ${projectCount} project(s) for user ${userId}\n` +
      `This action CANNOT be undone. Type 'DELETE' to confirm: `,
      (answer) => {
        rl.close();
        resolve(answer === 'DELETE');
      }
    );
  });
}

// * Main deletion function
async function deleteUserProjects(userId) {
  try {
    console.log('\n🔍 Fetching projects for user:', userId);
    
    // * First, fetch all projects for this user
    const { data: projects, error: fetchError } = await supabase
      .from('projects')
      .select(`
        id,
        name,
        description,
        created_at,
        updated_at,
        world_elements (count)
      `)
      .eq('user_id', userId);

    if (fetchError) {
      console.error('❌ Error fetching projects:', fetchError.message);
      return;
    }

    if (!projects || projects.length === 0) {
      console.log('ℹ️  No projects found for this user.');
      return;
    }

    // * Display projects that will be deleted
    console.log(`\n📊 Found ${projects.length} project(s):\n`);
    projects.forEach((project, index) => {
      const elementCount = project.world_elements?.[0]?.count || 0;
      console.log(`  ${index + 1}. ${project.name || 'Unnamed'} (ID: ${project.id})`);
      console.log(`     - Created: ${new Date(project.created_at).toLocaleDateString()}`);
      console.log(`     - Elements: ${elementCount}`);
      console.log(`     - Description: ${project.description || 'None'}`);
      console.log();
    });

    if (isDryRun) {
      console.log('🔵 DRY RUN MODE - No data will be deleted');
      console.log('Remove --dry-run flag to perform actual deletion');
      return;
    }

    // * Get confirmation from user
    const confirmed = await confirmDeletion(projects.length, userId);
    
    if (!confirmed) {
      console.log('❌ Deletion cancelled by user');
      return;
    }

    console.log('\n🗑️  Starting deletion process...\n');

    // * Delete each project (cascading deletes will handle related data)
    let deletedCount = 0;
    let failedCount = 0;

    for (const project of projects) {
      process.stdout.write(`  Deleting "${project.name || 'Unnamed'}" (${project.id})... `);
      
      const { error: deleteError } = await supabase
        .from('projects')
        .delete()
        .eq('id', project.id);

      if (deleteError) {
        console.log('❌ Failed');
        console.error(`    Error: ${deleteError.message}`);
        failedCount++;
      } else {
        console.log('✅ Success');
        deletedCount++;
      }
    }

    // * Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 Deletion Summary:');
    console.log(`   ✅ Successfully deleted: ${deletedCount} project(s)`);
    if (failedCount > 0) {
      console.log(`   ❌ Failed to delete: ${failedCount} project(s)`);
    }
    console.log('='.repeat(50) + '\n');

    if (deletedCount > 0) {
      console.log('✨ User projects have been cleared. The user can now start fresh.');
      console.log('💡 Tip: Clear local storage in the browser to ensure a clean state.');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    process.exit(1);
  }
}

// * Script entry point
async function main() {
  console.log('🧹 Supabase User Projects Deletion Tool');
  console.log('=' .repeat(50));

  if (!userIdArg) {
    console.error('\n❌ Error: User ID is required');
    console.log('\nUsage:');
    console.log('  node scripts/delete-user-projects.js <user_id>');
    console.log('  node scripts/delete-user-projects.js --dry-run <user_id>');
    console.log('  node scripts/delete-user-projects.js --force <user_id>');
    console.log('\nExample:');
    console.log('  node scripts/delete-user-projects.js e782392e-56e7-4812-9f57-356f288663dc');
    console.log('\nFlags:');
    console.log('  --dry-run   Show what would be deleted without actually deleting');
    console.log('  --force     Skip confirmation prompt (use with caution!)');
    process.exit(1);
  }

  // * Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(userIdArg)) {
    console.error('\n❌ Error: Invalid user ID format. Must be a valid UUID.');
    console.error('   Provided:', userIdArg);
    process.exit(1);
  }

  await deleteUserProjects(userIdArg);
}

// * Run the script
main().catch(console.error);