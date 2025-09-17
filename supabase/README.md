# Supabase Database Setup

This directory contains the database schema for the Fantasy Writing App.

## Quick Setup

### Method 1: Manual via Supabase Dashboard (Recommended)

1. **Go to your Supabase Dashboard:**
   ```
   https://app.supabase.com/project/cbyvpuqisqmepubzrwuo
   ```

2. **Navigate to SQL Editor** (in the left sidebar)

3. **Click "New Query"**

4. **Copy the entire contents** of `migrations/001_worldbuilding_schema.sql`

5. **Paste** into the SQL Editor and click **"Run"**

### Method 2: Using npm scripts

```bash
# This will generate instructions and save the SQL file
npm run db:push

# Alternative command
npm run supabase:push
```

The script will:
- Check your Supabase credentials
- Parse the migration SQL
- Provide manual instructions since DDL needs to be run via SQL Editor
- Save a copy of the migration to `scripts/push-to-supabase.sql`

## Database Schema

The schema includes the following tables:

### Core Tables
- **projects** - User's writing projects
- **world_elements** - Characters, locations, objects, etc.
- **relationships** - Connections between elements
- **questionnaire_templates** - Template questions for elements
- **sync_metadata** - Track sync status

### Features
- **Row Level Security (RLS)** - Users can only access their own data
- **Client ID tracking** - For offline/online sync
- **Automatic timestamps** - created_at, updated_at triggers
- **Soft deletes** - deleted_at field for recovery

## Environment Variables

Make sure your `.env` file contains:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## Troubleshooting

If you encounter issues:

1. **Check Authentication**: Make sure you're using the correct Supabase project
2. **RLS Policies**: The schema includes Row Level Security - users need to be authenticated
3. **UUID Extension**: The schema requires the uuid-ossp extension (automatically enabled)

## Migration Files

- `001_worldbuilding_schema.sql` - Initial schema with all tables and policies

## Testing the Schema

After running the migration, you can test it:

1. Go to the **Table Editor** in Supabase Dashboard
2. You should see the new tables: projects, world_elements, relationships, etc.
3. Check the **Authentication** section to ensure RLS is enabled

## Next Steps

After setting up the database:

1. **Test Authentication**: Try logging in with a user account
2. **Create a Project**: The app will automatically sync projects to Supabase
3. **Verify Sync**: Check the Supabase dashboard to see your data