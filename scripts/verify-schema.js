#!/usr/bin/env node

/**
 * Verify Schema Deployment
 * Checks if the database tables exist in Supabase
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://cbyvpuqisqmepubzrwuo.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNieXZwdXFpc3FtZXB1Ynpyd3VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzMjEyNDgsImV4cCI6MjA3MTg5NzI0OH0.aRvZRU-iU52M9N85NJc7BrmpiBF776-GcKlYblIWzF4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifySchema() {
  console.log('🔍 Verifying Schema Deployment...\n');

  const tables = [
    'projects',
    'world_elements',
    'relationships',
    'questionnaire_templates',
    'questionnaire_responses',
    'sync_metadata'
  ];

  let existingTables = 0;
  const missingTables = [];

  for (const table of tables) {
    try {
      // Try to select from the table
      const { data: _data, error } = await supabase
        .from(table)
        .select('*')
        .limit(0);

      if (error) {
        if (error.message.includes('does not exist') || error.message.includes('relation') || error.code === '42P01') {
          console.log(`❌ Table '${table}' does not exist`);
          missingTables.push(table);
        } else {
          console.log(`⚠️  Table '${table}' exists but has issues: ${error.message}`);
          existingTables++;
        }
      } else {
        console.log(`✅ Table '${table}' exists`);
        existingTables++;
      }
    } catch (err) {
      console.log(`❌ Error checking table '${table}': ${err.message}`);
      missingTables.push(table);
    }
  }

  console.log('\n📊 Summary:');
  console.log(`   ✅ Existing tables: ${existingTables}/${tables.length}`);
  console.log(`   ❌ Missing tables: ${missingTables.length}/${tables.length}`);
  
  if (missingTables.length > 0) {
    console.log(`\n⚠️  Missing tables: ${missingTables.join(', ')}`);
    console.log('\n💡 Schema needs to be deployed. The migration might be marked as applied but not actually executed.');
    console.log('   You can manually apply the schema via Supabase Dashboard SQL Editor.');
    process.exit(1);
  } else {
    console.log('\n🎉 All tables exist! Schema deployment verified successfully.');
    process.exit(0);
  }
}

// Run the verification
verifySchema().catch(error => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});