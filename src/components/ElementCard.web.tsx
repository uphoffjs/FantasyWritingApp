/**
 * ElementCard Component - Web Version
 * Displays element information in a card format without ThemeProvider dependency
 */

import React, { memo } from 'react';
import { WorldElement } from '../types/models';
import { getCategoryIcon } from '../utils/categoryMapping';
import { getElementColor } from '../utils/elementColors';
import { ProgressRing } from './ProgressRing';

interface ElementCardProps {
  element: WorldElement;
  icon?: string;
  onPress: () => void;
}

export const ElementCard = memo(function ElementCard({
  element,
  icon,
  onPress,
}: ElementCardProps) {
  const categoryIcon = icon || getCategoryIcon(element.category);
  const categoryColor = getElementColor(element.category);

  // * Calculate completion percentage safely
  const completionPercentage = element.completionPercentage || 0;

  // * Get completion color based on percentage (without theme)
  const getCompletionColor = (percentage: number) => {
    if (percentage >= 80) return '#10B981'; // green
    if (percentage >= 50) return '#F59E0B'; // yellow
    if (percentage > 0) return '#EF4444'; // red
    return '#6B7280'; // gray
  };

  const getCompletionBadge = (percentage: number) => {
    if (percentage === 100) return {
      text: 'Complete',
      color: '#FBBF24', // gold
      icon: '🏅'
    };
    if (percentage >= 80) return {
      text: 'Nearly Done',
      color: '#E5E7EB', // silver
      icon: '⭐'
    };
    if (percentage >= 50) return {
      text: 'Progressing',
      color: '#10B981', // green
      icon: '🚀'
    };
    if (percentage > 0) return {
      text: 'Started',
      color: '#60A5FA', // blue
      icon: '✏️'
    };
    return {
      text: 'Not Started',
      color: '#6B7280', // gray
      icon: '📝'
    };
  };

  const badge = getCompletionBadge(completionPercentage);

  return (
    <div
      onClick={onPress}
      className="bg-gray-800 hover:bg-gray-700 rounded-lg p-4 cursor-pointer transition-colors duration-200 border border-gray-700 hover:border-gray-600"
      data-cy={`element-card-${element.id}`}
    >
      {/* Header Section */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center flex-1 min-w-0">
          <span className="text-2xl mr-3">{categoryIcon}</span>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-100 truncate">
              {element.name || 'Unnamed Element'}
            </h3>
            <p className="text-sm text-gray-400 capitalize">
              {element.category || 'uncategorized'} • {element.type || 'general'}
            </p>
          </div>
        </div>

        {/* Progress Ring */}
        <div className="ml-3 flex-shrink-0">
          <ProgressRing
            percentage={completionPercentage}
            size={48}
            strokeWidth={4}
            color={getCompletionColor(completionPercentage)}
          />
        </div>
      </div>

      {/* Description */}
      {element.description && (
        <p className="text-sm text-gray-300 mb-3 line-clamp-2">
          {element.description}
        </p>
      )}

      {/* Completion Badge */}
      <div className="flex items-center justify-between">
        <div
          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
          style={{ backgroundColor: `${badge.color}20`, color: badge.color }}
        >
          <span className="mr-1">{badge.icon}</span>
          {badge.text}
        </div>

        {/* Relationships Count */}
        {element.relationships && element.relationships.length > 0 && (
          <div className="flex items-center text-xs text-gray-500">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
            </svg>
            {element.relationships.length} connections
          </div>
        )}
      </div>

      {/* Questions Progress */}
      {element.questions && element.questions.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Questions</span>
            <span className="text-gray-400">
              {element.questions.filter(q => q.answer).length} / {element.questions.length} answered
            </span>
          </div>
        </div>
      )}
    </div>
  );
});

export default ElementCard;