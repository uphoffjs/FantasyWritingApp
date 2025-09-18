// // DEPRECATED: Note: Old and new Relationship types are now the same after migration
import type { Relationship, RelationshipType, RelationshipMetadata } from '../types/worldbuilding';

/**
 * Migration utility to standardize relationship properties from old format to new format
 */

/**
 * Old relationship format from legacy system
 */
export interface OldRelationship {
  id: string;
  fromElementId: string;
  toElementId: string;
  relationshipType: string;
  description?: string;
}

/**
 * New relationship format (same as current Relationship interface)
 */
export type NewRelationship = Relationship;

// * Map common relationship types to the new enum values
const RELATIONSHIP_TYPE_MAP: Record<string, RelationshipType> = {
  // * Family relationships
  'parent of': 'parent_of',
  'child of': 'child_of',
  'sibling of': 'sibling_of',
  'spouse of': 'spouse_of',
  
  // * Social relationships
  'friend of': 'friend_of',
  'enemy of': 'enemy_of',
  'ally of': 'ally_of',
  
  // * Organizational relationships
  'member of': 'member_of',
  'leader of': 'leader_of',
  'rules over': 'leader_of',
  
  // * Spatial relationships
  'located in': 'located_in',
  'resides in': 'located_in',
  
  // * Ownership relationships
  'owns': 'owns',
  'created by': 'created_by',
  'created': 'created_by',
  
  // * Part relationships
  'part of': 'part_of',
  'belongs to': 'part_of',
  
  // * Generic relationships
  'related to': 'related_to',
  'connected to': 'related_to',
  
  // * Race relationships
  'belongs to race': 'belongs_to_race',
  'of race': 'belongs_to_race'
};

/**
 * Normalize relationship type string to match new enum format
 */
function normalizeRelationshipType(type: string): RelationshipType {
  // * First try exact match
  if (RELATIONSHIP_TYPE_MAP[type]) {
    return RELATIONSHIP_TYPE_MAP[type];
  }
  
  // * Try lowercase match
  const lowercaseType = type.toLowerCase().trim();
  if (RELATIONSHIP_TYPE_MAP[lowercaseType]) {
    return RELATIONSHIP_TYPE_MAP[lowercaseType];
  }
  
  // * Try to match by replacing spaces with underscores
  const underscoreType = lowercaseType.replace(/\s+/g, '_') as RelationshipType;
  const validTypes: RelationshipType[] = [
    'parent_of', 'child_of', 'sibling_of', 'spouse_of',
    'friend_of', 'enemy_of', 'ally_of', 'member_of',
    'leader_of', 'located_in', 'owns', 'created_by',
    'part_of', 'related_to', 'belongs_to_race'
  ];
  
  if (validTypes.includes(underscoreType)) {
    return underscoreType;
  }
  
  // * Default to 'related_to' for unknown types
  console.warn(`Unknown relationship type "${type}", defaulting to "related_to"`);
  return 'related_to';
}

/**
 * Old relationship format for migration purposes
 */
interface OldRelationshipExtended extends OldRelationship {
  fromName?: string;
  toName?: string;
  createdAt?: Date;
  metadata?: RelationshipMetadata;
}

/**
 * Migrate a single relationship from old format to new format
 */
export function migrateRelationship(
  oldRelationship: OldRelationshipExtended
): NewRelationship {
  return {
    id: oldRelationship.id,
    fromId: oldRelationship.fromElementId,
    fromName: oldRelationship.fromName,
    toId: oldRelationship.toElementId,
    toName: oldRelationship.toName,
    type: normalizeRelationshipType(oldRelationship.relationshipType),
    description: oldRelationship.description,
    createdAt: oldRelationship.createdAt || new Date(),
    metadata: oldRelationship.metadata
  } as NewRelationship;
}

/**
 * Migrate multiple relationships
 */
export function migrateRelationships(
  oldRelationships: OldRelationshipExtended[]
): NewRelationship[] {
  return oldRelationships.map(migrateRelationship);
}

/**
 * Check if a relationship is in the old format
 */
export function isOldFormatRelationship(relationship: any): relationship is OldRelationship {
  return (
    relationship &&
    typeof relationship === 'object' &&
    'fromElementId' in relationship &&
    'toElementId' in relationship &&
    'relationshipType' in relationship
  );
}

/**
 * Check if a relationship is in the new format
 */
export function isNewFormatRelationship(relationship: any): relationship is NewRelationship {
  return (
    relationship &&
    typeof relationship === 'object' &&
    'fromId' in relationship &&
    'toId' in relationship &&
    'type' in relationship &&
    typeof relationship.type === 'string'
  );
}

/**
 * Migrate relationship if needed (handles both old and new formats)
 */
export function ensureNewRelationshipFormat(relationship: any): NewRelationship {
  if (isNewFormatRelationship(relationship)) {
    return relationship;
  }
  
  if (isOldFormatRelationship(relationship)) {
    return migrateRelationship(relationship);
  }
  
  throw new Error('Invalid relationship format');
}

/**
 * Batch migrate relationships with validation
 */
export function batchMigrateRelationships(
  relationships: any[]
): { migrated: NewRelationship[], errors: Array<{ index: number; error: string }> } {
  const migrated: NewRelationship[] = [];
  const errors: Array<{ index: number; error: string }> = [];
  
  relationships.forEach((relationship, index) => {
    try {
      migrated.push(ensureNewRelationshipFormat(relationship));
    } catch (error) {
      errors.push({
        index,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  return { migrated, errors };
}