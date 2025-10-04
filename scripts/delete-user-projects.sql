-- Delete all projects for user e782392e-56e7-4812-9f57-356f288663dc
-- This will cascade delete all related data (world_elements, etc.)

-- First, show what we're about to delete
SELECT id, name, description, created_at 
FROM projects 
WHERE user_id = 'e782392e-56e7-4812-9f57-356f288663dc';

-- Delete all world_elements for these projects (due to foreign key constraints)
DELETE FROM world_elements 
WHERE project_id IN (
    SELECT id FROM projects 
    WHERE user_id = 'e782392e-56e7-4812-9f57-356f288663dc'
);

-- Delete all projects for this user
DELETE FROM projects 
WHERE user_id = 'e782392e-56e7-4812-9f57-356f288663dc';

-- Verify deletion
SELECT COUNT(*) as remaining_projects 
FROM projects 
WHERE user_id = 'e782392e-56e7-4812-9f57-356f288663dc';