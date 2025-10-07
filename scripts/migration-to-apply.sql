-- Migration: Add custom_element_types table
-- Description: Creates the custom_element_types table to support user-defined worldbuilding categories
-- Date: 2025-10-06

-- Custom element types table
-- Allows users to define their own worldbuilding categories beyond predefined ones
CREATE TABLE IF NOT EXISTS custom_element_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  client_id TEXT NOT NULL,
  name TEXT NOT NULL,
  singular_name TEXT NOT NULL,
  plural_name TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  description TEXT,
  base_questions JSONB NOT NULL DEFAULT '[]',
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_shared BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  deleted_at TIMESTAMPTZ,
  UNIQUE(project_id, client_id),
  UNIQUE(project_id, name) -- Ensure unique names per project
);

-- Create indexes for better performance
CREATE INDEX idx_custom_element_types_project_id ON custom_element_types(project_id);
CREATE INDEX idx_custom_element_types_created_by ON custom_element_types(created_by);
CREATE INDEX idx_custom_element_types_name ON custom_element_types(project_id, name);

-- Enable Row Level Security
ALTER TABLE custom_element_types ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for custom_element_types
CREATE POLICY "Users can view custom types in their projects" ON custom_element_types
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = custom_element_types.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create custom types in their projects" ON custom_element_types
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = custom_element_types.project_id
      AND projects.user_id = auth.uid()
    )
    AND auth.uid() = created_by
  );

CREATE POLICY "Users can update custom types in their projects" ON custom_element_types
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = custom_element_types.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete custom types in their projects" ON custom_element_types
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = custom_element_types.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_custom_element_types_updated_at BEFORE UPDATE ON custom_element_types
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comment to table for documentation
COMMENT ON TABLE custom_element_types IS 'User-defined worldbuilding element types that extend beyond predefined categories';
COMMENT ON COLUMN custom_element_types.name IS 'Unique identifier name for the custom type (e.g., "artifacts", "religions")';
COMMENT ON COLUMN custom_element_types.singular_name IS 'Singular form for UI display (e.g., "Artifact")';
COMMENT ON COLUMN custom_element_types.plural_name IS 'Plural form for UI display (e.g., "Artifacts")';
COMMENT ON COLUMN custom_element_types.base_questions IS 'Default questions for elements of this type (JSONB array)';
COMMENT ON COLUMN custom_element_types.is_shared IS 'Whether this type can be used by other users in the project';
COMMENT ON COLUMN custom_element_types.metadata IS 'Additional metadata (usage_count, tags, template_version, is_archived)';
