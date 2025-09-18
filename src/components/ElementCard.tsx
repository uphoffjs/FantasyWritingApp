import React, { memo } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import { WorldElement } from '../types/models';
import { getCategoryIcon } from '../utils/categoryMapping';
import { getElementColor } from '../utils/elementColors';

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
  
  const getCompletionColor = (percentage: number) => {
    if (percentage >= 80) return '// ! HARDCODED: Should use design tokens
      #10B981'; // Green
    if (percentage >= 50) return '// ! HARDCODED: Should use design tokens
      #F59E0B'; // Amber
    if (percentage > 0) return '// ! HARDCODED: Should use design tokens
      #F97316'; // Orange
    return '// ! HARDCODED: Should use design tokens
      #6B7280'; // Gray
  };

  const getCompletionBadge = (percentage: number) => {
    if (percentage === 100) return { text: 'Complete', // ! HARDCODED: Should use design tokens
    color: '#FBBF24', icon: '🏅' };
    if (percentage >= 80) return { text: 'Nearly Done', // ! HARDCODED: Should use design tokens
    color: '#E5E7EB', icon: '⭐' };
    if (percentage >= 50) return { text: 'In Progress', // ! HARDCODED: Should use design tokens
    color: '#D97706', icon: '⚡' };
    if (percentage > 0) return { text: 'Started', // ! HARDCODED: Should use design tokens
    color: '#B91C1C', icon: '✨' };
    return { text: 'Not Started', // ! HARDCODED: Should use design tokens
    color: '#374151', icon: '📋' };
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const badge = getCompletionBadge(element.completionPercentage);
  const elementColors = getElementColor(element.category);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: elementColors.bg, borderColor: elementColors.border },
        pressed && styles.cardPressed,
        Platform.OS === 'web' && styles.cardWeb,
      ]}
      data-cy="element-card"
    >
      {/* Completion Badge */}
      <View style={[styles.badge, { backgroundColor: badge.color }]}>
        <Text style={styles.badgeIcon}>{badge.icon}</Text>
        <Text style={styles.badgeText}>{badge.text}</Text>
      </View>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.categoryIcon} data-cy="category-icon">
            {categoryIcon}
          </Text>
          <View style={styles.headerInfo}>
            <Text
              style={[styles.elementName, { color: elementColors.text }]}
              numberOfLines={2}
              data-cy="element-name"
            >
              {element.name}
            </Text>
            <Text style={styles.categoryText} data-cy="element-category">
              {element.category.replace('-', ' ')}
            </Text>
          </View>
        </View>

        <View style={styles.completionContainer}>
          <Text style={styles.completionIcon}>
            {element.completionPercentage === 100 ? '✓' : '⏰'}
          </Text>
          <Text
            style={[
              styles.completionText,
              { color: getCompletionColor(element.completionPercentage) },
            ]}
            data-cy="completion-text"
          >
            {element.completionPercentage}%
          </Text>
        </View>
      </View>

      {/* Description */}
      {element.description && (
        <Text
          style={styles.description}
          numberOfLines={2}
          data-cy="element-description"
        >
          {element.description}
        </Text>
      )}

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${element.completionPercentage}%`,
                backgroundColor: getCompletionColor(element.completionPercentage),
              },
            ]}
          />
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.updatedText}>
          Updated {formatDate(element.updatedAt)}
        </Text>
        {element.tags && element.tags.length > 0 && (
          <View style={styles.tags}>
            {element.tags.slice(0, 2).map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText} data-cy="element-tag">
                  {tag}
                </Text>
              </View>
            ))}
            {element.tags.length > 2 && (
              <Text style={styles.moreTagsText}>+{element.tags.length - 2}</Text>
            )}
          </View>
        )}
      </View>

      {/* Relationships */}
      {element.relationships && element.relationships.length > 0 && (
        <View style={styles.relationships}>
          <Text style={styles.relationshipsText}>
            {element.relationships.length} connection
            {element.relationships.length !== 1 ? 's' : ''}
          </Text>
        </View>
      )}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    borderWidth: 2,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    position: 'relative',
    minHeight: 120,
  },
  cardPressed: {
    opacity: 0.8,
  },
  cardWeb: {
    transition: 'all 0.2s ease',
    cursor: 'pointer',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderBottomLeftRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  badgeIcon: {
    fontSize: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    // ! HARDCODED: Should use design tokens
    color: '#111827',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: 8,
  },
  categoryIcon: {
    fontSize: 24,
  },
  headerInfo: {
    flex: 1,
  },
  elementName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  categoryText: {
    fontSize: 12,
    // ! HARDCODED: Should use design tokens
    color: '#9CA3AF',
    textTransform: 'capitalize',
  },
  completionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  completionIcon: {
    fontSize: 14,
  },
  completionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  description: {
    fontSize: 12,
    // ! HARDCODED: Should use design tokens
    color: '#9CA3AF',
    lineHeight: 18,
    marginBottom: 12,
  },
  progressBarContainer: {
    marginBottom: 12,
  },
  progressBarBackground: {
    height: 4,
    // ! HARDCODED: Should use design tokens
    backgroundColor: '#374151',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  updatedText: {
    fontSize: 11,
    // ! HARDCODED: Should use design tokens
    color: '#6B7280',
  },
  tags: {
    flexDirection: 'row',
    gap: 4,
  },
  tag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    // ! HARDCODED: Should use design tokens
    backgroundColor: '#374151',
    borderRadius: 4,
  },
  tagText: {
    fontSize: 10,
    // ! HARDCODED: Should use design tokens
    color: '#F9FAFB',
  },
  moreTagsText: {
    fontSize: 11,
    // ! HARDCODED: Should use design tokens
    color: '#6B7280',
  },
  relationships: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '// ! HARDCODED: Should use design tokens
      #374151',
  },
  relationshipsText: {
    fontSize: 11,
    // ! HARDCODED: Should use design tokens
    color: '#6B7280',
  },
});