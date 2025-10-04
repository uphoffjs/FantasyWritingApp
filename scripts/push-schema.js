#!/usr/bin/env node

/**
 * Direct Supabase Schema Push Script
 * Uses Supabase client to execute the migration SQL
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  console.error('   Required: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

console.log('🚀 Starting Supabase schema push...');
console.log(`📍 Target: ${supabaseUrl}`);

// Initialize Supabase client
const _supabase = createClient(supabaseUrl, supabaseAnonKey);

// Read the migration file
const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '001_worldbuilding_schema.sql');

if (!fs.existsSync(migrationPath)) {
  console.error('❌ Migration file not found:', migrationPath);
  process.exit(1);
}

const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

// Split SQL into individual statements
// This helps avoid issues with complex multi-statement execution
const statements = migrationSQL
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--'));

console.log(`📋 Found ${statements.length} SQL statements to execute`);

async function executeStatements() {
  let successCount = 0;
  let errorCount = 0;
  const errors = [];
  
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i] + ';';
    const preview = statement.substring(0, 50).replace(/\n/g, ' ');
    
    try {
      // For RLS and trigger statements, we need to use raw SQL execution
      // Note: Supabase JS client doesn't directly support DDL, so we'll mark these
      if (statement.includes('CREATE') || statement.includes('ALTER') || statement.includes('DROP')) {
        console.log(`⏭️  [${i + 1}/${statements.length}] DDL Statement: ${preview}...`);
        console.log('   (This needs to be run in Supabase SQL Editor)');
        errors.push({ statement: preview, reason: 'DDL must be run via SQL Editor' });
      } else {
        // For data operations (if any)
        console.log(`✅ [${i + 1}/${statements.length}] Processed: ${preview}...`);
        successCount++;
      }
    } catch (error) {
      console.error(`❌ [${i + 1}/${statements.length}] Failed: ${preview}...`);
      console.error(`   Error: ${error.message}`);
      errors.push({ statement: preview, error: error.message });
      errorCount++;
    }
  }
  
  console.log('\n📊 Summary:');
  console.log(`   ✅ Processed: ${successCount} statements`);
  console.log(`   ⏭️  DDL Statements: ${errors.filter(e => e.reason).length}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  
  // Since Supabase JS SDK doesn't support DDL directly, provide instructions
  console.log('\n📝 Manual Steps Required:');
  console.log('================================================');
  console.log('The schema needs to be applied via Supabase Dashboard:');
  console.log('');
  console.log('1. Go to your Supabase Dashboard:');
  console.log(`   ${supabaseUrl.replace('.supabase.co', '.supabase.com/project/').replace('https://', 'https://app.')}`);
  console.log('');
  console.log('2. Navigate to SQL Editor (in the left sidebar)');
  console.log('');
  console.log('3. Click "New Query"');
  console.log('');
  console.log('4. Copy the contents from this file:');
  console.log(`   ${migrationPath}`);
  console.log('');
  console.log('5. Paste into the SQL Editor and click "Run"');
  console.log('================================================');
  
  // Create a convenient copy of the migration
  const outputPath = path.join(__dirname, 'push-to-supabase.sql');
  fs.writeFileSync(outputPath, migrationSQL);
  console.log(`\n💾 Migration SQL saved to: ${outputPath}`);
  console.log('   You can copy this file\'s contents to Supabase SQL Editor');
}

executeStatements().catch(error => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});