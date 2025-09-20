/**
 * ElementBrowser - Web Version
 * Displays and filters worldbuilding elements
 * Uses HTML elements and Tailwind for web rendering
 */

import React, { useState, useMemo, useCallback } from 'react';
import { WorldElement, ElementCategory } from '../types/models';
import { ElementCard } from './ElementCard.web';
import { getCategoryIcon } from '../utils/categoryMapping';

interface ElementBrowserProps {
  elements: WorldElement[];
  onElementPress?: (element: WorldElement) => void;
  onCreateElement?: () => void;
  loading?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
}

// * Category filter options matching the database categories
const CATEGORY_FILTERS: Array<{ value: ElementCategory | 'all'; label: string; icon: string }> = [
  { value: 'all', label: 'All', icon: '📚' },
  { value: 'character', label: 'Characters', icon: '👤' },
  { value: 'location', label: 'Locations', icon: '📍' },
  { value: 'item-object', label: 'Items', icon: '🗝️' },
  { value: 'magic-system', label: 'Magic', icon: '✨' },
  { value: 'historical-event', label: 'Events', icon: '📅' },
  { value: 'organization', label: 'Organizations', icon: '🏛️' },
  { value: 'race-species', label: 'Creatures', icon: '🐉' },
  { value: 'culture-society', label: 'Cultures', icon: '🌍' },
  { value: 'religion-belief', label: 'Religions', icon: '⛪' },
  { value: 'language', label: 'Languages', icon: '💬' },
  { value: 'technology', label: 'Technology', icon: '⚙️' },
  { value: 'custom', label: 'Custom', icon: '📝' },
];

// * Sort options
const SORT_OPTIONS = [
  { value: 'name', label: 'Name' },
  { value: 'updated', label: 'Recently Updated' },
  { value: 'created', label: 'Recently Created' },
  { value: 'completion', label: 'Completion %' },
];

export function ElementBrowser({
  elements,
  onElementPress,
  onCreateElement,
  loading = false,
  refreshing = false,
  onRefresh,
}: ElementBrowserProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ElementCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'updated' | 'created' | 'completion'>('updated');
  const [showSortMenu, setShowSortMenu] = useState(false);

  // * Filter and sort elements
  const filteredElements = useMemo(() => {
    let filtered = [...elements];

    // * Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((el) => el.category === selectedCategory);
    }

    // * Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((el) =>
        el.name?.toLowerCase().includes(query) ||
        el.description?.toLowerCase().includes(query)
      );
    }

    // * Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'updated':
          return (b.updatedAt || 0) - (a.updatedAt || 0);
        case 'created':
          return (b.createdAt || 0) - (a.createdAt || 0);
        case 'completion':
          return (b.completionPercentage || 0) - (a.completionPercentage || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [elements, selectedCategory, searchQuery, sortBy]);

  const handleElementPress = useCallback(
    (element: WorldElement) => {
      onElementPress?.(element);
    },
    [onElementPress]
  );

  // * Calculate statistics
  const stats = useMemo(() => {
    const totalElements = elements.length;
    const completedElements = elements.filter((el) => el.completionPercentage === 100).length;
    const averageCompletion =
      elements.length > 0
        ? Math.round(
            elements.reduce((sum, el) => sum + (el.completionPercentage || 0), 0) /
              elements.length
          )
        : 0;

    return {
      total: totalElements,
      completed: completedElements,
      average: averageCompletion,
    };
  }, [elements]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-indigo-400">{stats.total}</div>
          <div className="text-xs text-gray-500">Total Elements</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{stats.completed}</div>
          <div className="text-xs text-gray-500">Completed</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">{stats.average}%</div>
          <div className="text-xs text-gray-500">Avg Progress</div>
        </div>
      </div>

      {/* Search and Sort Bar */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search elements..."
            className="w-full px-4 py-2 pl-10 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            data-cy="search-input"
          />
          <svg
            className="absolute left-3 top-2.5 w-5 h-5 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowSortMenu(!showSortMenu)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 hover:bg-gray-700 transition-colors flex items-center gap-2"
            data-cy="sort-button"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
              />
            </svg>
            Sort
          </button>
          {showSortMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10">
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setSortBy(option.value as any);
                    setShowSortMenu(false);
                  }}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors ${
                    sortBy === option.value ? 'text-indigo-400' : 'text-gray-100'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {CATEGORY_FILTERS.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setSelectedCategory(filter.value as ElementCategory | 'all')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${
              selectedCategory === filter.value
                ? 'bg-indigo-500 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
            data-cy={`category-filter-${filter.value}`}
          >
            <span>{filter.icon}</span>
            <span className="text-sm">{filter.label}</span>
          </button>
        ))}
      </div>

      {/* Elements Grid */}
      {filteredElements.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-6xl mb-4">
            {searchQuery ? '🔍' : selectedCategory === 'all' ? '📚' : getCategoryIcon(selectedCategory)}
          </div>
          <p className="text-gray-400 text-center mb-4">
            {searchQuery
              ? 'No elements match your search'
              : selectedCategory === 'all'
              ? 'No elements yet'
              : `No ${selectedCategory} elements yet`}
          </p>
          {!searchQuery && onCreateElement && (
            <button
              onClick={onCreateElement}
              className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
              data-cy="create-first-element"
            >
              Create First Element
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredElements.map((element) => (
            <ElementCard
              key={element.id}
              element={element}
              onPress={() => handleElementPress(element)}
            />
          ))}
        </div>
      )}

      {/* Floating Action Button */}
      {onCreateElement && filteredElements.length > 0 && (
        <button
          onClick={onCreateElement}
          className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-500 text-white rounded-full shadow-lg hover:bg-indigo-600 transition-colors flex items-center justify-center"
          data-cy="create-element-fab"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      )}
    </div>
  );
}

export default ElementBrowser;