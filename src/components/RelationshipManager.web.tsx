/**
 * RelationshipManager - Web Version
 * Manages relationships between worldbuilding elements
 * Uses HTML elements and Tailwind for web rendering
 */

import React, { useState, useMemo } from 'react';
import { WorldElement, Relationship } from '../types/models';
import { useWorldbuildingStore } from '../store/worldbuildingStore';
import { v4 as uuidv4 } from 'uuid';
import { getCategoryIcon } from '../utils/categoryMapping';

interface RelationshipManagerProps {
  elements: WorldElement[];
  projectId: string;
}

const RELATIONSHIP_TYPES = [
  // * Character relationships
  { value: 'parent_of', label: 'Parent of', reverse: 'child_of' },
  { value: 'child_of', label: 'Child of', reverse: 'parent_of' },
  { value: 'sibling_of', label: 'Sibling of', reverse: 'sibling_of' },
  { value: 'spouse_of', label: 'Spouse of', reverse: 'spouse_of' },
  { value: 'friend_of', label: 'Friend of', reverse: 'friend_of' },
  { value: 'enemy_of', label: 'Enemy of', reverse: 'enemy_of' },
  { value: 'mentor_of', label: 'Mentor of', reverse: 'student_of' },
  { value: 'student_of', label: 'Student of', reverse: 'mentor_of' },
  { value: 'ally_of', label: 'Ally of', reverse: 'ally_of' },
  { value: 'rival_of', label: 'Rival of', reverse: 'rival_of' },

  // * Location relationships
  { value: 'located_in', label: 'Located in', reverse: 'contains' },
  { value: 'contains', label: 'Contains', reverse: 'located_in' },
  { value: 'near', label: 'Near', reverse: 'near' },
  { value: 'connected_to', label: 'Connected to', reverse: 'connected_to' },

  // * Ownership relationships
  { value: 'owns', label: 'Owns', reverse: 'owned_by' },
  { value: 'owned_by', label: 'Owned by', reverse: 'owns' },
  { value: 'created_by', label: 'Created by', reverse: 'creator_of' },
  { value: 'creator_of', label: 'Creator of', reverse: 'created_by' },

  // * Organization relationships
  { value: 'member_of', label: 'Member of', reverse: 'has_member' },
  { value: 'has_member', label: 'Has member', reverse: 'member_of' },
  { value: 'leader_of', label: 'Leader of', reverse: 'led_by' },
  { value: 'led_by', label: 'Led by', reverse: 'leader_of' },

  // * Generic relationships
  { value: 'related_to', label: 'Related to', reverse: 'related_to' },
  { value: 'associated_with', label: 'Associated with', reverse: 'associated_with' },
];

export function RelationshipManager({ elements, projectId }: RelationshipManagerProps) {
  const { projects, createRelationship, updateRelationship, deleteRelationship } = useWorldbuildingStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSource, setSelectedSource] = useState<string>('');
  const [selectedTarget, setSelectedTarget] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [description, setDescription] = useState('');
  const [editingRelationship, setEditingRelationship] = useState<Relationship | null>(null);

  const project = projects.find(p => p.id === projectId);
  const relationships = project?.relationships || [];

  // * Group relationships by source element
  const relationshipsByElement = useMemo(() => {
    const grouped: Record<string, Relationship[]> = {};

    relationships.forEach(rel => {
      if (!grouped[rel.sourceId]) {
        grouped[rel.sourceId] = [];
      }
      grouped[rel.sourceId].push(rel);
    });

    return grouped;
  }, [relationships]);

  const handleAddRelationship = () => {
    if (!selectedSource || !selectedTarget || !selectedType) {
      alert('Please select source, target, and relationship type');
      return;
    }

    if (selectedSource === selectedTarget) {
      alert('An element cannot have a relationship with itself');
      return;
    }

    const newRelationship: Relationship = {
      id: uuidv4(),
      sourceId: selectedSource,
      targetId: selectedTarget,
      type: selectedType,
      description: description || undefined,
    };

    createRelationship(projectId, newRelationship);

    // * Reset form
    setSelectedSource('');
    setSelectedTarget('');
    setSelectedType('');
    setDescription('');
    setShowAddModal(false);
  };

  const handleDeleteRelationship = (relationshipId: string) => {
    if (confirm('Are you sure you want to delete this relationship?')) {
      deleteRelationship(projectId, relationshipId);
    }
  };

  const getElementName = (elementId: string) => {
    const element = elements.find(e => e.id === elementId);
    return element?.name || 'Unknown Element';
  };

  const getRelationshipLabel = (type: string) => {
    const rel = RELATIONSHIP_TYPES.find(r => r.value === type);
    return rel?.label || type;
  };

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-100">Relationships</h2>
          <p className="text-sm text-gray-400 mt-1">
            Manage connections between elements
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
          data-cy="add-relationship-button"
        >
          Add Relationship
        </button>
      </div>

      {/* Relationship List */}
      {relationships.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔗</div>
          <p className="text-gray-400 mb-4">No relationships defined yet</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
          >
            Create First Relationship
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {elements.map(element => {
            const elementRelationships = relationshipsByElement[element.id] || [];
            if (elementRelationships.length === 0) return null;

            return (
              <div key={element.id} className="bg-gray-800 rounded-lg p-4">
                <h3 className="font-semibold text-gray-100 mb-3 flex items-center gap-2">
                  <span>{getCategoryIcon(element.category)}</span>
                  {element.name}
                </h3>
                <div className="space-y-2">
                  {elementRelationships.map(rel => (
                    <div key={rel.id} className="flex items-center justify-between bg-gray-700 rounded-lg p-3">
                      <div className="flex-1">
                        <span className="text-gray-100">
                          {getRelationshipLabel(rel.type)}
                        </span>
                        <span className="mx-2 text-gray-500">→</span>
                        <span className="text-indigo-400 font-medium">
                          {getElementName(rel.targetId)}
                        </span>
                        {rel.description && (
                          <p className="text-sm text-gray-400 mt-1">{rel.description}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteRelationship(rel.id)}
                        className="ml-4 p-2 text-red-400 hover:text-red-300 transition-colors"
                        data-cy={`delete-relationship-${rel.id}`}
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Relationship Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowAddModal(false)}
          />
          <div className="relative bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-gray-100 mb-4">Add Relationship</h3>

            <div className="space-y-4">
              {/* Source Element */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Source Element
                </label>
                <select
                  value={selectedSource}
                  onChange={(e) => setSelectedSource(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Select element...</option>
                  {elements.map(el => (
                    <option key={el.id} value={el.id}>
                      {el.name} ({el.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Relationship Type */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Relationship Type
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Select type...</option>
                  {RELATIONSHIP_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Element */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Target Element
                </label>
                <select
                  value={selectedTarget}
                  onChange={(e) => setSelectedTarget(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Select element...</option>
                  {elements.filter(el => el.id !== selectedSource).map(el => (
                    <option key={el.id} value={el.id}>
                      {el.name} ({el.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add details about this relationship..."
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:border-indigo-500 h-20 resize-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2 bg-gray-700 text-gray-100 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddRelationship}
                className="flex-1 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
              >
                Add Relationship
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RelationshipManager;