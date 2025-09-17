#!/usr/bin/env node

/**
 * Supabase Migration Script
 * Pushes the database schema to your Supabase instance
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_DB_PASSWORD;
const supabaseAccessToken = process.env.SUPABASE_ACCESS_TOKEN;

if (!supabaseUrl) {
  console.error('❌ VITE_SUPABASE_URL not found in .env file');
  process.exit(1);
}

console.log('🚀 Starting Supabase migration...');
console.log(`📍 Target: ${supabaseUrl}`);

// Read the migration file
const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '001_worldbuilding_schema.sql');

if (!fs.existsSync(migrationPath)) {
  console.error('❌ Migration file not found:', migrationPath);
  process.exit(1);
}

const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

// Function to execute migration using Supabase CLI
async function executeMigration() {
  const { exec } = require('child_process');
  const util = require('util');
  const execPromise = util.promisify(exec);
  
  try {
    // Extract project ID from URL
    const projectId = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
    
    if (!projectId) {
      throw new Error('Could not extract project ID from Supabase URL');
    }
    
    console.log(`📦 Project ID: ${projectId}`);
    
    // First, let's check if Supabase CLI is installed
    try {
      await execPromise('supabase --version');
      console.log('✅ Supabase CLI detected');
    } catch (error) {
      console.log('📦 Installing Supabase CLI...');
      await execPromise('npm install -g supabase');
    }
    
    // Login to Supabase using the access token
    console.log('🔐 Logging in to Supabase...');
    await execPromise(`supabase login --token ${supabaseAccessToken}`);
    
    // Link to the project
    console.log('🔗 Linking to project...');
    await execPromise(`supabase link --project-ref ${projectId}`);
    
    // Push the migration
    console.log('📤 Pushing migration to database...');
    await execPromise('supabase db push');
    
    console.log('✅ Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    
    // Fallback: provide manual instructions
    console.log('\n📝 Alternative: Manual Migration Instructions');
    console.log('================================================');
    console.log('1. Go to your Supabase dashboard: ' + supabaseUrl);
    console.log('2. Navigate to SQL Editor');
    console.log('3. Create a new query');
    console.log('4. Copy and paste the contents of:');
    console.log('   ' + migrationPath);
    console.log('5. Run the query');
    console.log('================================================\n');
    
    // Also save a direct-executable version
    const directMigrationPath = path.join(__dirname, 'migration-to-run.sql');
    fs.writeFileSync(directMigrationPath, migrationSQL);
    console.log('💾 Migration SQL saved to:', directMigrationPath);
    console.log('   You can copy this file content to Supabase SQL Editor');
    
    process.exit(1);
  }
}

// Run the migration
executeMigration().catch(error => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});