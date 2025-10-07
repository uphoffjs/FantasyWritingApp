#!/usr/bin/env node

/**
 * Supabase Migration Push Script
 * Executes SQL migrations directly to Supabase PostgreSQL database
 *
 * Features:
 * - Direct PostgreSQL connection using pg library
 * - Migration tracking to avoid re-running migrations
 * - Automatic rollback on failure
 * - Supports multiple migration files
 * - Transaction safety
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Configuration
const config = {
  supabaseUrl: process.env.VITE_SUPABASE_URL,
  dbPassword: process.env.SUPABASE_DB_PASSWORD,
  migrationsDir: path.join(__dirname, '..', 'supabase', 'migrations'),
};

// Extract project reference from Supabase URL
const projectRef = config.supabaseUrl?.match(/https:\/\/([^.]+)/)?.[1];

if (!projectRef || !config.dbPassword) {
  console.error('❌ Missing required environment variables');
  console.error('   Required: VITE_SUPABASE_URL and SUPABASE_DB_PASSWORD');
  process.exit(1);
}

// Build PostgreSQL connection string
const connectionString = `postgresql://postgres:${config.dbPassword}@db.${projectRef}.supabase.co:5432/postgres`;

console.log('🚀 Supabase Migration Push Tool');
console.log('================================');
console.log(`📍 Project: ${projectRef}`);
console.log(`📂 Migrations: ${config.migrationsDir}`);
console.log('');

/**
 * Create migrations tracking table if it doesn't exist
 */
async function ensureMigrationsTable(client) {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS _migrations (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      executed_at TIMESTAMPTZ DEFAULT NOW(),
      checksum TEXT
    );
  `;

  await client.query(createTableSQL);
  console.log('✅ Migrations tracking table ready');
}

/**
 * Get list of already applied migrations
 */
async function getAppliedMigrations(client) {
  try {
    const result = await client.query('SELECT name FROM _migrations ORDER BY name');
    return new Set(result.rows.map(row => row.name));
  } catch (error) {
    // Table might not exist yet
    return new Set();
  }
}

/**
 * Get all migration files from directory
 */
function getMigrationFiles() {
  if (!fs.existsSync(config.migrationsDir)) {
    console.error(`❌ Migrations directory not found: ${config.migrationsDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(config.migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort(); // Ensure migrations run in order

  return files;
}

/**
 * Calculate simple checksum for migration file
 */
function calculateChecksum(content) {
  const crypto = require('crypto');
  return crypto.createHash('md5').update(content).digest('hex');
}

/**
 * Execute a single migration
 */
async function executeMigration(client, filename) {
  const filepath = path.join(config.migrationsDir, filename);
  const content = fs.readFileSync(filepath, 'utf8');
  const checksum = calculateChecksum(content);

  console.log(`\n📄 Executing: ${filename}`);
  console.log(`   Checksum: ${checksum}`);

  try {
    // Execute migration in a transaction
    await client.query('BEGIN');

    // Execute the migration SQL
    await client.query(content);

    // Record migration as applied
    await client.query(
      'INSERT INTO _migrations (name, checksum) VALUES ($1, $2)',
      [filename, checksum]
    );

    await client.query('COMMIT');
    console.log(`✅ Success: ${filename}`);
    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`❌ Failed: ${filename}`);
    console.error(`   Error: ${error.message}`);

    // Show more context for SQL errors
    if (error.position) {
      const lines = content.split('\n');
      const errorLine = Math.floor(parseInt(error.position, 10) / 80); // Approximate
      console.error(`   Near line ${errorLine}:`);
      if (lines[errorLine]) {
        console.error(`   ${lines[errorLine]}`);
      }
    }

    throw error;
  }
}

/**
 * Main migration execution
 */
async function runMigrations() {
  const client = new Client({ connectionString });

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected');

    // Ensure migrations table exists
    await ensureMigrationsTable(client);

    // Get applied migrations
    const appliedMigrations = await getAppliedMigrations(client);
    console.log(`📊 Already applied: ${appliedMigrations.size} migrations`);

    // Get all migration files
    const migrationFiles = getMigrationFiles();
    console.log(`📋 Found: ${migrationFiles.length} migration files`);

    // Filter to pending migrations
    const pendingMigrations = migrationFiles.filter(
      file => !appliedMigrations.has(file)
    );

    if (pendingMigrations.length === 0) {
      console.log('\n✨ All migrations are up to date!');
      return;
    }

    console.log(`\n🔄 Pending: ${pendingMigrations.length} migrations`);
    console.log('─────────────────────────────────────');

    // Execute pending migrations
    let successCount = 0;
    for (const migration of pendingMigrations) {
      await executeMigration(client, migration);
      successCount++;
    }

    console.log('\n─────────────────────────────────────');
    console.log(`✅ Successfully applied ${successCount} migrations`);

    // Show current migration status
    const allApplied = await getAppliedMigrations(client);
    console.log(`\n📊 Migration Status:`);
    console.log(`   Total Applied: ${allApplied.size}`);
    console.log(`   Latest: ${Array.from(allApplied).pop()}`);

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n🔌 Disconnected from database');
  }
}

// Run migrations
runMigrations().catch(error => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});
