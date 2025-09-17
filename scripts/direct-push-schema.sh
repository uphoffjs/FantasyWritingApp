#!/bin/bash

# Direct Schema Push Script for Supabase
# This script connects directly to the database and executes the SQL

# Extract database connection details
PROJECT_REF="cbyvpuqisqmepubzrwuo"
DB_PASSWORD="higZoz-xizvaf-zujzi0"
DB_HOST="aws-0-us-west-1.pooler.supabase.com"
DB_PORT="5432"
DB_NAME="postgres"
DB_USER="postgres.${PROJECT_REF}"

# Build the database URL
DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

# Path to migration file
MIGRATION_FILE="supabase/migrations/20250916171739_worldbuilding_schema.sql"

echo "🚀 Direct Schema Push to Supabase"
echo "📍 Target: ${DB_HOST}"
echo "📄 Migration: ${MIGRATION_FILE}"
echo ""

# Check if migration file exists
if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Migration file not found: $MIGRATION_FILE"
    exit 1
fi

# Execute the migration using psql
echo "📤 Executing migration..."
psql "$DATABASE_URL" < "$MIGRATION_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Migration successfully applied!"
else
    echo "❌ Migration failed. Please check the error messages above."
    exit 1
fi