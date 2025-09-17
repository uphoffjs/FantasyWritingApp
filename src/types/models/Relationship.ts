export type RelationshipType = 
  | 'parent_of'
  | 'child_of'
  | 'sibling_of'
  | 'spouse_of'
  | 'friend_of'
  | 'enemy_of'
  | 'ally_of'
  | 'member_of'
  | 'leader_of'
  | 'located_in'
  | 'owns'
  | 'created_by'
  | 'part_of'
  | 'related_to'
  | 'belongs_to_race';

export interface Relationship {
  id: string;
  fromId: string;
  fromName?: string;
  toId: string;
  toName?: string;
  type: RelationshipType;
  description?: string;
  createdAt: Date;
  metadata?: RelationshipMetadata;
}

export interface RelationshipMetadata {
  strength?: 'weak' | 'moderate' | 'strong';
  startDate?: Date;
  endDate?: Date;
  notes?: string;
}

export interface CreateRelationshipInput {
  fromId: string;
  toId: string;
  type: RelationshipType;
  description?: string;
  metadata?: RelationshipMetadata;
}

export const RELATIONSHIP_TYPE_LABELS: Record<RelationshipType, string> = {
  'parent_of': 'Parent of',
  'child_of': 'Child of',
  'sibling_of': 'Sibling of',
  'spouse_of': 'Spouse of',
  'friend_of': 'Friend of',
  'enemy_of': 'Enemy of',
  'ally_of': 'Ally of',
  'member_of': 'Member of',
  'leader_of': 'Leader of',
  'located_in': 'Located in',
  'owns': 'Owns',
  'created_by': 'Created by',
  'part_of': 'Part of',
  'related_to': 'Related to',
  'belongs_to_race': 'Belongs to race'
};

export const BIDIRECTIONAL_RELATIONSHIPS: RelationshipType[] = [
  'sibling_of',
  'spouse_of',
  'friend_of',
  'enemy_of',
  'ally_of',
  'related_to'
];

export function getInverseRelationship(type: RelationshipType): RelationshipType | null {
  const inverseMap: Partial<Record<RelationshipType, RelationshipType>> = {
    'parent_of': 'child_of',
    'child_of': 'parent_of',
    'member_of': 'leader_of',
    'leader_of': 'member_of',
    'owns': 'created_by',
    'created_by': 'owns'
  };
  
  return inverseMap[type] || null;
}