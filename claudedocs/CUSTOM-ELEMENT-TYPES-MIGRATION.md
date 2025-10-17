# Custom Element Types Migration Guide

**Date**: 2025-10-06
**Migration**: `20251006000000_add_custom_element_types.sql`
**Status**: ✅ Ready to Apply

---

## Overview

This migration adds the `custom_element_types` table to support user-defined worldbuilding categories beyond the predefined types (Character, Location, Item, Faction, Event, Lore).

## Problem Statement

The TypeScript models defined a `CustomElementType` interface with a `name` field, but the database schema didn't include a corresponding `custom_element_types` table. This caused:

1. **Type Errors**: TypeScript expected `name` field that didn't exist in database
2. **Runtime Failures**: Queries for custom types failed
3. **Feature Gap**: Users couldn't create custom element categories

## Solution: Database Schema Addition

Added `custom_element_types` table with complete schema matching the TypeScript interface.

---

## Table Schema

```sql
CREATE TABLE custom_element_types (
  -- Primary identification
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id        UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  client_id         TEXT NOT NULL,

  -- Type naming and display
  name              TEXT NOT NULL,              -- Identifier (e.g., "artifacts", "religions")
  singular_name     TEXT NOT NULL,              -- UI singular (e.g., "Artifact")
  plural_name       TEXT NOT NULL,              -- UI plural (e.g., "Artifacts")

  -- Visual customization
  icon              TEXT,                       -- Icon identifier or emoji
  color             TEXT,                       -- Hex color for UI theming
  description       TEXT,

  -- Template questions
  base_questions    JSONB NOT NULL DEFAULT '[]', -- Default questions array

  -- Ownership and sharing
  created_by        UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  is_shared         BOOLEAN DEFAULT false,       -- Can other project users use it

  -- Metadata
  metadata          JSONB DEFAULT '{}',          -- usage_count, tags, etc.

  -- Timestamps
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  deleted_at        TIMESTAMPTZ,                 -- Soft delete support

  -- Constraints
  UNIQUE(project_id, client_id),                 -- Sync consistency
  UNIQUE(project_id, name)                       -- Unique names per project
);
```

---

## Features Included

### 1. Indexes for Performance

```sql
CREATE INDEX idx_custom_element_types_project_id ON custom_element_types(project_id);
CREATE INDEX idx_custom_element_types_created_by ON custom_element_types(created_by);
CREATE INDEX idx_custom_element_types_name ON custom_element_types(project_id, name);
```

### 2. Row Level Security (RLS)

- Users can view custom types in their projects
- Users can create custom types in their projects
- Users can update custom types in their projects
- Users can delete custom types in their projects

### 3. Automatic Timestamps

- `updated_at` automatically updates on row modification
- Uses existing `update_updated_at_column()` trigger function

### 4. Documentation Comments

- Table and column comments for database documentation
- Explains purpose and usage of each field

---

## Applying the Migration

### Method 1: Supabase Dashboard (Recommended)

1. **Navigate to SQL Editor**:

   ```
   https://app.supabase.com/project/cbyvpuqisqmepubzrwuo/sql
   ```

2. **Create New Query**

3. **Copy Migration SQL**:

   ```bash
   cat supabase/migrations/20251006000000_add_custom_element_types.sql
   ```

4. **Paste and Run** in SQL Editor

5. **Verify Success**:
   - Go to Table Editor
   - Confirm `custom_element_types` table exists
   - Check columns match schema

### Method 2: npm Scripts

```bash
# Generate instructions and save SQL
npm run db:push

# Alternative
npm run supabase:push
```

---

## Verification Steps

### 1. Check Table Exists

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name = 'custom_element_types';
```

### 2. Verify Columns

```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'custom_element_types'
ORDER BY ordinal_position;
```

### 3. Check RLS Policies

```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'custom_element_types';
```

### 4. Test Basic Operations

```sql
-- Insert test record (requires auth context)
INSERT INTO custom_element_types (
  project_id,
  client_id,
  name,
  singular_name,
  plural_name,
  base_questions,
  created_by
) VALUES (
  'your-project-uuid',
  'test-client-id',
  'artifacts',
  'Artifact',
  'Artifacts',
  '[]'::jsonb,
  'your-user-uuid'
);

-- Query test
SELECT * FROM custom_element_types WHERE name = 'artifacts';

-- Cleanup
DELETE FROM custom_element_types WHERE client_id = 'test-client-id';
```

---

## TypeScript Interface Alignment

The migration aligns with the TypeScript interface:

```typescript
export interface CustomElementType {
  id: string; // ✅ UUID PRIMARY KEY
  name: string; // ✅ TEXT NOT NULL
  singularName: string; // ✅ singular_name TEXT NOT NULL
  pluralName: string; // ✅ plural_name TEXT NOT NULL
  icon?: string; // ✅ icon TEXT (nullable)
  color?: string; // ✅ color TEXT (nullable)
  description?: string; // ✅ description TEXT (nullable)
  baseQuestions: Question[]; // ✅ base_questions JSONB
  createdBy: string; // ✅ created_by UUID
  createdAt: Date; // ✅ created_at TIMESTAMPTZ
  updatedAt: Date; // ✅ updated_at TIMESTAMPTZ
  isShared?: boolean; // ✅ is_shared BOOLEAN
  metadata?: CustomTypeMetadata; // ✅ metadata JSONB
}
```

---

## Rollback Plan

If you need to rollback this migration:

```sql
-- Drop the table (cascades to dependent objects)
DROP TABLE IF EXISTS custom_element_types CASCADE;
```

**Warning**: This will permanently delete all custom element types and any data referencing them.

---

## Next Steps After Migration

1. **Test in Application**:

   - Try creating a custom element type
   - Verify it appears in the database
   - Test CRUD operations

2. **Update Application Code** (if needed):

   - Ensure services query the correct table name
   - Verify field mappings (name vs display_name)

3. **Seed Default Types** (optional):

   - Consider adding common custom types as seed data
   - Examples: Artifacts, Religions, Magic Systems, etc.

4. **Monitor Performance**:
   - Check query performance with indexes
   - Adjust indexes if needed based on usage patterns

---

## Related Files

- **Migration**: [supabase/migrations/20251006000000_add_custom_element_types.sql](../supabase/migrations/20251006000000_add_custom_element_types.sql)
- **TypeScript Model**: [src/types/models/CustomElementType.ts](../src/types/models/CustomElementType.ts)
- **Project Model**: [src/types/models/Project.ts](../src/types/models/Project.ts)
- **Supabase README**: [supabase/README.md](../supabase/README.md)

---

## Troubleshooting

### Migration Fails with "relation already exists"

The table already exists. Check if it was created manually:

```sql
SELECT * FROM custom_element_types LIMIT 1;
```

### RLS Policies Not Working

Verify user is authenticated and has access to the project:

```sql
-- Check current user
SELECT auth.uid();

-- Check project ownership
SELECT * FROM projects WHERE user_id = auth.uid();
```

### Trigger Not Firing

Verify the trigger function exists:

```sql
SELECT * FROM pg_proc WHERE proname = 'update_updated_at_column';
```

---

**Migration Author**: Claude (via /sc:implement)
**Reviewed By**: Pending
**Applied Date**: Pending
**Version**: 1.0
