-- Fix projects with empty or null names in Supabase
-- Corrected version for schema without client_id column

-- First, let's see if there are any projects with empty/null names
SELECT id, name, description, created_at 
FROM projects 
WHERE name IS NULL OR name = '' OR TRIM(name) = '';

-- Option 1: Update projects with empty names to have a default name
-- Uncomment to use:
-- UPDATE projects 
-- SET name = CONCAT('Untitled Project ', SUBSTRING(id::text, 1, 8))
-- WHERE name IS NULL OR name = '' OR TRIM(name) = '';

-- Option 2: Delete projects with empty names (be careful!)
-- Uncomment to use:
-- DELETE FROM projects 
-- WHERE name IS NULL OR name = '' OR TRIM(name) = '';

-- Option 3: Update a specific project by ID
-- Replace the ID with the actual project ID from the error message
-- UPDATE projects 
-- SET name = 'My Fantasy World'
-- WHERE id = 'a3d082d2-04b1-41f2-b192-0ce4e64aab66';

-- To check the schema of your projects table:
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'projects';