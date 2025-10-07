#!/usr/bin/env node

/**
 * Mark Migration as Applied
 * Records a migration as already executed without running it
 * Useful when migrations were applied manually before tracking was set up
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const crypto = require('crypto');

dotenv.config();

const projectRef = process.env.VITE_SUPABASE_URL?.match(/https:\/\/([^.]+)/)?.[1];
const dbPassword = process.env.SUPABASE_DB_PASSWORD;

if (!projectRef || !dbPassword) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const connectionString = `postgresql://postgres:${dbPassword}@db.${projectRef}.supabase.co:5432/postgres`;
const migrationName = process.argv[2];

if (!migrationName) {
  console.error('Usage: node mark-migration-applied.js <migration-filename.sql>');
  console.error('Example: node mark-migration-applied.js 20250916171739_worldbuilding_schema.sql');
  process.exit(1);
}

const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', migrationName);

if (!fs.existsSync(migrationPath)) {
  console.error(`❌ Migration file not found: ${migrationPath}`);
  process.exit(1);
}

const content = fs.readFileSync(migrationPath, 'utf8');
const checksum = crypto.createHash('md5').update(content).digest('hex');

async function markAsApplied() {
  const client = new Client({ connectionString });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Ensure migrations table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        executed_at TIMESTAMPTZ DEFAULT NOW(),
        checksum TEXT
      )
    `);

    // Mark migration as applied
    await client.query(
      'INSERT INTO _migrations (name, checksum) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING',
      [migrationName, checksum]
    );

    console.log(`✅ Marked as applied: ${migrationName}`);
    console.log(`   Checksum: ${checksum}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

markAsApplied();
