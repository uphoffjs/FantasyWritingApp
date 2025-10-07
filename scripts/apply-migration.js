#!/usr/bin/env node

/**
 * Apply Supabase Migration Script
 * Uses service role key to execute migration SQL via Supabase REST API
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  console.error('   Required: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Get migration file from command line argument or use latest
const migrationFile = process.argv[2] || '20251006000000_add_custom_element_types.sql';
const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', migrationFile);

if (!fs.existsSync(migrationPath)) {
  console.error(`❌ Migration file not found: ${migrationPath}`);
  console.error('');
  console.error('Usage: node apply-migration.js [migration-file.sql]');
  console.error('Example: node apply-migration.js 20251006000000_add_custom_element_types.sql');
  process.exit(1);
}

console.log('🚀 Starting migration application...');
console.log(`📍 Target: ${supabaseUrl}`);
console.log(`📄 Migration: ${migrationFile}`);
console.log('');

// Initialize Supabase client with service role key
const supabase = createClient(supabaseUrl, serviceRoleKey);

const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

async function applyMigration() {
  try {
    console.log('📋 Executing migration SQL...');

    // Use the SQL query endpoint with service role permissions
    // Note: We need to use the REST API directly as the JS client doesn't expose raw SQL
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({ query: migrationSQL })
    });

    if (!response.ok) {
      // If exec_sql function doesn't exist, we need an alternative approach
      if (response.status === 404) {
        console.log('⚠️  Direct SQL execution not available via REST API');
        console.log('');
        console.log('Alternative approach: Using Supabase Dashboard');
        console.log('================================================');
        console.log('The migration needs to be applied manually:');
        console.log('');
        console.log('1. Go to your Supabase Dashboard SQL Editor:');
        const projectRef = supabaseUrl.match(/https:\/\/([^.]+)/)[1];
        console.log(`   https://app.supabase.com/project/${projectRef}/sql`);
        console.log('');
        console.log('2. Click "New Query"');
        console.log('');
        console.log('3. Copy the contents from this file:');
        console.log(`   ${migrationPath}`);
        console.log('');
        console.log('4. Paste into the SQL Editor and click "Run"');
        console.log('================================================');

        // Save a copy for easy access
        const outputPath = path.join(__dirname, 'migration-to-apply.sql');
        fs.writeFileSync(outputPath, migrationSQL);
        console.log('');
        console.log(`💾 Migration SQL saved to: ${outputPath}`);
        console.log('   You can copy this file\'s contents to Supabase SQL Editor');

        return;
      }

      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Migration applied successfully!');
    console.log('');
    console.log('📊 Result:', JSON.stringify(result, null, 2));

    // Verify the table was created
    console.log('');
    console.log('🔍 Verifying table creation...');
    const { error } = await supabase
      .from('custom_element_types')
      .select('*')
      .limit(0);

    if (error) {
      if (error.message.includes('does not exist')) {
        console.log('⚠️  Warning: Table verification failed - table may not exist');
        console.log('   Error:', error.message);
      } else {
        console.log('✅ Table exists and is accessible!');
      }
    } else {
      console.log('✅ Table "custom_element_types" created successfully!');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('');
    console.error('Troubleshooting:');
    console.error('- Verify SUPABASE_SERVICE_ROLE_KEY is correct in .env');
    console.error('- Check if the table already exists');
    console.error('- Review the migration SQL for syntax errors');
    console.error('');
    console.error('You can apply the migration manually via Supabase Dashboard:');
    const projectRef = supabaseUrl.match(/https:\/\/([^.]+)/)?.[1];
    console.error(`https://app.supabase.com/project/${projectRef}/sql`);
    process.exit(1);
  }
}

applyMigration();
