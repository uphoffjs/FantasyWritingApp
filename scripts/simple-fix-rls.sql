-- Simple Fix for Supabase RLS 403 Forbidden Error
-- Run this ENTIRE script in your Supabase SQL Editor

-- Step 1: Drop existing policies (if any)
DROP POLICY IF EXISTS "Users can view own projects" ON projects;
DROP POLICY IF EXISTS "Users can create own projects" ON projects;
DROP POLICY IF EXISTS "Users can update own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON projects;

-- Step 2: Ensure RLS is enabled on the projects table
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Step 3: Create new, comprehensive RLS policies
-- These policies allow authenticated users to manage their own projects

-- Allow users to SELECT their own projects
CREATE POLICY "Users can view own projects" 
ON projects FOR SELECT 
USING (auth.uid() = user_id);

-- Allow users to INSERT projects with their user_id
CREATE POLICY "Users can create own projects" 
ON projects FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Allow users to UPDATE their own projects
CREATE POLICY "Users can update own projects" 
ON projects FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow users to DELETE their own projects
CREATE POLICY "Users can delete own projects" 
ON projects FOR DELETE 
USING (auth.uid() = user_id);

-- Step 4: Verify the policies are created
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

-- Step 5: Test the setup (this should return the current user's ID)
SELECT auth.uid() as current_user_id;

-- Step 6: Test query (this should work without 403 error)
-- If you have any projects in the table, this should return them
-- If not, it should return an empty result set (not an error)
SELECT * FROM projects WHERE user_id = auth.uid() LIMIT 5;