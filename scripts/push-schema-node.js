#!/usr/bin/env node

/**
 * Direct Database Schema Push Script
 * Connects directly to Supabase PostgreSQL and executes the migration
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

async function pushSchema() {
  // Database connection configuration
  // Using direct connection string format (not pooler)
  const connectionString = `postgresql://postgres:higZoz-xizvaf-zujzi0@db.cbyvpuqisqmepubzrwuo.supabase.co:5432/postgres`;

  // Create client
  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🚀 Direct Schema Push to Supabase');
    console.log('📍 Connecting to database...');
    
    // Connect to database
    await client.connect();
    console.log('✅ Connected successfully');

    // Read migration file
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20250916171739_worldbuilding_schema.sql');
    
    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Migration file not found: ${migrationPath}`);
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    console.log('📄 Migration file loaded');

    // Split SQL into individual statements and execute them
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📊 Executing ${statements.length} SQL statements...`);
    
    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      const preview = statement.substring(0, 60).replace(/\n/g, ' ');
      
      try {
        await client.query(statement);
        successCount++;
        console.log(`✅ [${i + 1}/${statements.length}] Executed: ${preview}...`);
      } catch (error) {
        errorCount++;
        
        // Some errors are expected (e.g., "already exists")
        if (error.message.includes('already exists')) {
          console.log(`⏭️  [${i + 1}/${statements.length}] Skipped (already exists): ${preview}...`);
        } else {
          console.error(`❌ [${i + 1}/${statements.length}] Failed: ${preview}...`);
          console.error(`   Error: ${error.message}`);
          errors.push({ statement: preview, error: error.message });
        }
      }
    }

    console.log('\n📊 Summary:');
    console.log(`   ✅ Successfully executed: ${successCount} statements`);
    console.log(`   ❌ Failed: ${errorCount} statements`);
    
    if (errors.length > 0 && !errors.every(e => e.error.includes('already exists'))) {
      console.log('\n⚠️  Some statements failed (see errors above)');
      console.log('   This might be okay if the objects already exist.');
    } else {
      console.log('\n🎉 Migration completed successfully!');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    // Close connection
    await client.end();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the migration
pushSchema().catch(error => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});