-- Fix Supabase Row Level Security (RLS) Policies for 403 Forbidden Error
-- Run this script in your Supabase SQL Editor to fix the projects table access issue

-- First, let's check if RLS is enabled on the projects table
DO $$
BEGIN
    -- Check and drop existing policies if they exist
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'projects' AND policyname = 'Users can view own projects') THEN
        DROP POLICY "Users can view own projects" ON projects;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'projects' AND policyname = 'Users can create own projects') THEN
        DROP POLICY "Users can create own projects" ON projects;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'projects' AND policyname = 'Users can update own projects') THEN
        DROP POLICY "Users can update own projects" ON projects;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'projects' AND policyname = 'Users can delete own projects') THEN
        DROP POLICY "Users can delete own projects" ON projects;
    END IF;
END $$;

-- Enable RLS on the projects table (if not already enabled)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create comprehensive RLS policies for the projects table
-- These policies ensure authenticated users can only access their own projects

-- Policy for SELECT operations
CREATE POLICY "Users can view own projects" ON projects
    FOR SELECT 
    USING (auth.uid() = user_id);

-- Policy for INSERT operations
CREATE POLICY "Users can create own projects" ON projects
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Policy for UPDATE operations  
CREATE POLICY "Users can update own projects" ON projects
    FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy for DELETE operations
CREATE POLICY "Users can delete own projects" ON projects
    FOR DELETE 
    USING (auth.uid() = user_id);

-- Also ensure the service role can bypass RLS (for admin operations)
-- This is automatic in Supabase, but let's verify the policies are working

-- Test query to verify policies (run this after applying the above)
-- This should return only projects belonging to the authenticated user:
-- SELECT * FROM projects WHERE user_id = auth.uid();

-- Additional debugging: Check if auth.uid() is returning a value
-- SELECT auth.uid();

-- If auth.uid() returns NULL, there might be an issue with authentication
-- In that case, check that:
-- 1. The user is properly authenticated before making requests
-- 2. The Supabase client is configured with the correct anon key
-- 3. The authentication token is being passed in the request headers

-- Verification query to see all policies on the projects table:
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'projects'
ORDER BY policyname;