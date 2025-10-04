#!/usr/bin/env node

/**
 * Alternative script using the existing Supabase CLI wrapper
 * This bypasses RLS policies by using the service role
 * 
 * Usage:
 *   node scripts/delete-user-projects-cli.js
 */

const readline = require('readline');
const { spawn } = require('child_process');
const path = require('path');

// * The user ID from your error message
const USER_ID = 'e782392e-56e7-4812-9f57-356f288663dc';

// * Create interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// * Run Supabase CLI command
function runSupabaseCommand(query) {
  return new Promise((resolve, reject) => {
    const child = spawn('node', [
      path.join(__dirname, 'supabase-cli.js'),
      query
    ], {
      stdio: 'pipe',
      env: process.env
    });

    let output = '';
    let errorOutput = '';

    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    child.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(errorOutput || 'Command failed'));
      } else {
        resolve(output);
      }
    });
  });
}

async function main() {
  console.log('🧹 Supabase User Projects Deletion Tool (CLI Version)');
  console.log('=' .repeat(50));
  console.log(`\nTarget User ID: ${USER_ID}\n`);

  try {
    // * First, let's check what projects exist
    console.log('🔍 Fetching all projects for this user...\n');
    
    const fetchQuery = `SELECT id, name, description, created_at, updated_at, local_id FROM projects WHERE user_id = '${USER_ID}'`;
    const projectsOutput = await runSupabaseCommand(fetchQuery);
    
    console.log('Raw output from database:');
    console.log(projectsOutput);
    console.log('\n' + '-'.repeat(50) + '\n');

    // * Parse the output to check if there are projects
    const lines = projectsOutput.split('\n').filter(line => line.trim());
    
    // Check if there are actual data rows (not just headers)
    const hasProjects = lines.some(line => 
      line.includes('c6fa6066-819e-45d3-b72c-f162582404a6') || // The project ID from your error
      (line.includes('|') && !line.includes('id') && !line.includes('---'))
    );

    if (!hasProjects) {
      console.log('ℹ️  No projects found for this user in the database.');
      
      // * Let's also check if there are any projects at all
      console.log('\n📊 Checking total projects in database...\n');
      const allProjectsQuery = `SELECT COUNT(*) as total, COUNT(DISTINCT user_id) as users FROM projects`;
      const statsOutput = await runSupabaseCommand(allProjectsQuery);
      console.log(statsOutput);
      
      rl.close();
      return;
    }

    // * Show confirmation prompt
    const answer = await new Promise(resolve => {
      rl.question(
        '\n⚠️  WARNING: This will permanently delete ALL projects for this user.\n' +
        'This includes the project "asfd" that\'s causing sync issues.\n' +
        'Type "DELETE" to confirm: ',
        resolve
      );
    });

    if (answer !== 'DELETE') {
      console.log('❌ Deletion cancelled');
      rl.close();
      return;
    }

    // * Perform the deletion
    console.log('\n🗑️  Deleting projects...\n');
    
    // First delete world_elements (due to foreign key constraints)
    const deleteElementsQuery = `DELETE FROM world_elements WHERE project_id IN (SELECT id FROM projects WHERE user_id = '${USER_ID}')`;
    console.log('Deleting world elements...');
    await runSupabaseCommand(deleteElementsQuery);
    
    // Then delete the projects
    const deleteProjectsQuery = `DELETE FROM projects WHERE user_id = '${USER_ID}'`;
    console.log('Deleting projects...');
    const deleteOutput = await runSupabaseCommand(deleteProjectsQuery);
    
    console.log('\n✅ Deletion complete!');
    console.log(deleteOutput);
    
    // * Verify deletion
    console.log('\n🔍 Verifying deletion...\n');
    const verifyOutput = await runSupabaseCommand(fetchQuery);
    console.log(verifyOutput);
    
    console.log('\n✨ All projects have been cleared for user:', USER_ID);
    console.log('💡 Remember to clear browser local storage as well!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    rl.close();
  }
}

main().catch(console.error);