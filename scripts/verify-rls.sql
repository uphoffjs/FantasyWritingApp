-- Verify RLS Policies Script
-- Run this in Supabase SQL Editor to verify RLS is working

-- Step 1: Check if policies exist
SELECT 
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'projects'
ORDER BY policyname;

-- Step 2: Check if RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'projects';

-- Step 3: Get a sample user ID from auth.users (if any exist)
SELECT id, email 
FROM auth.users 
LIMIT 5;

-- Step 4: Test with mock user context
-- Replace 'your-user-id-here' with an actual user ID from step 3
-- Uncomment these lines and replace the UUID:
-- SET request.jwt.claim.sub = 'your-user-id-here';
-- SELECT auth.uid() as mocked_user_id;
-- SELECT * FROM projects WHERE user_id = auth.uid() LIMIT 5;

-- Step 5: Check if there are any projects in the table
SELECT COUNT(*) as total_projects FROM projects;

-- Step 6: Check project ownership distribution
SELECT 
    user_id,
    COUNT(*) as project_count
FROM projects
GROUP BY user_id
LIMIT 10;