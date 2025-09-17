-- Supabase Schema for Fantasy Writing App
-- This creates the tables needed for syncing worldbuilding data

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_id TEXT NOT NULL, -- The UUID generated on client side
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  UNIQUE(user_id, client_id)
);

-- Questionnaire templates table
CREATE TABLE IF NOT EXISTS questionnaire_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  client_id TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT false,
  questions JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  UNIQUE(project_id, client_id)
);

-- World elements table
CREATE TABLE IF NOT EXISTS world_elements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  client_id TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  template_id TEXT,
  answers JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  UNIQUE(project_id, client_id)
);

-- Relationships table
CREATE TABLE IF NOT EXISTS relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  client_id TEXT NOT NULL,
  source_id TEXT NOT NULL,
  target_id TEXT NOT NULL,
  relationship_type TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  UNIQUE(project_id, client_id)
);

-- Sync metadata table to track sync status
CREATE TABLE IF NOT EXISTS sync_metadata (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  last_sync_at TIMESTAMPTZ,
  sync_status TEXT DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_world_elements_project_id ON world_elements(project_id);
CREATE INDEX idx_questionnaire_templates_project_id ON questionnaire_templates(project_id);
CREATE INDEX idx_relationships_project_id ON relationships(project_id);
CREATE INDEX idx_sync_metadata_user_id ON sync_metadata(user_id);

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionnaire_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE world_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_metadata ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for projects
CREATE POLICY "Users can view own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON projects
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for questionnaire_templates
CREATE POLICY "Users can view own templates" ON questionnaire_templates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = questionnaire_templates.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own templates" ON questionnaire_templates
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = questionnaire_templates.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own templates" ON questionnaire_templates
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = questionnaire_templates.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own templates" ON questionnaire_templates
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = questionnaire_templates.project_id 
      AND projects.user_id = auth.uid()
    )
  );

-- Create RLS policies for world_elements
CREATE POLICY "Users can view own elements" ON world_elements
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = world_elements.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own elements" ON world_elements
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = world_elements.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own elements" ON world_elements
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = world_elements.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own elements" ON world_elements
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = world_elements.project_id 
      AND projects.user_id = auth.uid()
    )
  );

-- Create RLS policies for relationships
CREATE POLICY "Users can view own relationships" ON relationships
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = relationships.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own relationships" ON relationships
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = relationships.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own relationships" ON relationships
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = relationships.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own relationships" ON relationships
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = relationships.project_id 
      AND projects.user_id = auth.uid()
    )
  );

-- Create RLS policies for sync_metadata
CREATE POLICY "Users can view own sync metadata" ON sync_metadata
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sync metadata" ON sync_metadata
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sync metadata" ON sync_metadata
  FOR UPDATE USING (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questionnaire_templates_updated_at BEFORE UPDATE ON questionnaire_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_world_elements_updated_at BEFORE UPDATE ON world_elements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_relationships_updated_at BEFORE UPDATE ON relationships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sync_metadata_updated_at BEFORE UPDATE ON sync_metadata
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();