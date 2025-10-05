/**
 * CreateElementModal - Web Version
 * Modal for creating new worldbuilding elements
 * Uses HTML elements and Tailwind for web rendering
 */

import React, { useState, useCallback } from 'react';
import { useWorldbuildingStore } from '../store/worldbuildingStore';
import { ElementCategory } from '../types/models';
import { getCategoryIcon as _getCategoryIcon } from '../utils/categoryMapping';
import { getTestProps } from '../utils/react-native-web-polyfills';

interface CreateElementModalProps {
  visible: boolean;
  projectId: string;
  onClose: () => void;
  onSuccess?: (elementId: string) => void;
}

// * Element categories with icons
const ELEMENT_CATEGORIES = [
  { value: 'character', label: 'Character', icon: '👤', description: 'Protagonists, antagonists, supporting characters' },
  { value: 'location', label: 'Location', icon: '📍', description: 'Cities, buildings, landmarks' },
  { value: 'item-object', label: 'Item/Object', icon: '🗝️', description: 'Weapons, artifacts, tools' },
  { value: 'magic-system', label: 'Magic/Power', icon: '✨', description: 'Magical systems, abilities' },
  { value: 'historical-event', label: 'Event', icon: '📅', description: 'Historical events, battles' },
  { value: 'organization', label: 'Organization', icon: '🏛️', description: 'Groups, factions, guilds' },
  { value: 'race-species', label: 'Creature/Species', icon: '🐉', description: 'Monsters, races, animals' },
  { value: 'culture-society', label: 'Culture/Society', icon: '🌍', description: 'Civilizations, customs' },
  { value: 'religion-belief', label: 'Religion/Belief', icon: '⛪', description: 'Faiths, philosophies' },
  { value: 'language', label: 'Language', icon: '💬', description: 'Languages, dialects' },
  { value: 'technology', label: 'Technology', icon: '⚙️', description: 'Tools, inventions' },
  { value: 'custom', label: 'Custom', icon: '📝', description: 'Create your own category' },
];

// * Generate a unique default name for an element
function generateDefaultElementName(
  projectId: string,
  category: ElementCategory | 'custom'
): string {
  const state = useWorldbuildingStore.getState();
  const project = state.projects.find((p) => p.id === projectId);
  if (!project) return 'Untitled Element';

  const elements = project.elements.filter((e) => e.category === category);
  const categoryInfo = ELEMENT_CATEGORIES.find((c) => c.value === category);
  const categoryLabel = categoryInfo?.label || 'Element';

  // * Get all existing numbers for this category type
  const existingNumbers = elements
    .map((e) => {
      const match = e.name.match(new RegExp(`^Untitled ${categoryLabel} (\\d+)$`));
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter((n) => n > 0);

  // * Find the next available number
  let nextNumber = 1;
  if (existingNumbers.length > 0) {
    const maxNumber = Math.max(...existingNumbers);
    for (let i = 1; i <= maxNumber + 1; i++) {
      if (!existingNumbers.includes(i)) {
        nextNumber = i;
        break;
      }
    }
  }

  return `Untitled ${categoryLabel} ${nextNumber}`;
}

export function CreateElementModal({
  visible,
  projectId,
  onClose,
  onSuccess,
}: CreateElementModalProps) {
  const { createElement } = useWorldbuildingStore();
  const [selectedCategory, setSelectedCategory] = useState<ElementCategory | 'custom' | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleClose = useCallback(() => {
    setSelectedCategory(null);
    onClose();
  }, [onClose]);

  const handleCreate = useCallback(async () => {
    if (!selectedCategory || isCreating) return;

    setIsCreating(true);
    try {
      const defaultName = generateDefaultElementName(projectId, selectedCategory);
      // * Map custom to a valid category
      const elementCategory: ElementCategory =
        selectedCategory === 'custom' ? 'custom' : selectedCategory;

      const newElement = await createElement(projectId, defaultName, elementCategory);

      // * Small delay for visual feedback
      await new Promise((resolve) => setTimeout(resolve, 300));

      onSuccess?.(newElement.id);
      handleClose();
    } catch (error) {
      console.error('Failed to create element:', error);
      alert('Failed to create element. Please try again.');
    } finally {
      setIsCreating(false);
    }
  }, [selectedCategory, projectId, createElement, onSuccess, isCreating, handleClose]);

  const handleCategoryPress = (category: ElementCategory | 'custom') => {
    setSelectedCategory(category);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />

      {/* Modal Content */}
      <div className="relative bg-gray-800 rounded-t-3xl w-full max-w-2xl max-h-[90vh] shadow-xl transform transition-transform">
        {/* Header */}
        <div className="text-center pt-2 pb-4 px-6">
          {/* Drag Indicator */}
          <div className="w-9 h-1 bg-gray-600 rounded-full mx-auto mb-4" />

          <h2 className="text-xl font-semibold text-gray-100">Create New Element</h2>

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-2 right-6 p-2 text-gray-400 hover:text-gray-200 transition-colors"
            {...getTestProps('close-modal')}
          >
            <span className="text-2xl">✕</span>
          </button>
        </div>

        {/* Instructions */}
        <p className="text-sm text-gray-400 text-center mb-5 px-6">
          Choose a category for your new element
        </p>

        {/* Category Grid */}
        <div className="overflow-y-auto max-h-[60vh] px-6 pb-6">
          <div className="grid grid-cols-2 gap-3">
            {ELEMENT_CATEGORIES.map((category) => (
              <button
                key={category.value}
                className={`p-4 bg-gray-700 rounded-xl transition-all hover:bg-gray-600 ${
                  selectedCategory === category.value
                    ? 'ring-2 ring-indigo-500 bg-indigo-900 bg-opacity-20'
                    : ''
                }`}
                onClick={() => handleCategoryPress(category.value as ElementCategory | 'custom')}
                {...getTestProps(`category-${category.value}`)}
              >
                <div className="text-3xl mb-2">{category.icon}</div>
                <div className={`font-semibold mb-1 ${
                  selectedCategory === category.value ? 'text-indigo-400' : 'text-gray-100'
                }`}>
                  {category.label}
                </div>
                <div className={`text-xs ${
                  selectedCategory === category.value ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  {category.description}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 border-t border-gray-700">
          <button
            className="flex-1 py-3 px-4 bg-gray-700 text-gray-100 font-semibold rounded-lg hover:bg-gray-600 transition-colors"
            onClick={handleClose}
            {...getTestProps('cancel-button')}
          >
            Cancel
          </button>
          <button
            className={`flex-1 py-3 px-4 font-semibold rounded-lg transition-all ${
              !selectedCategory || isCreating
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50'
                : 'bg-indigo-500 text-white hover:bg-indigo-600'
            }`}
            onClick={handleCreate}
            disabled={!selectedCategory || isCreating}
            {...getTestProps('create-button')}
          >
            {isCreating ? (
              <span className="inline-flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creating...
              </span>
            ) : (
              selectedCategory ? 'Create Element' : 'Select a Category'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateElementModal;