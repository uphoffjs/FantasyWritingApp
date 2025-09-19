import React, { memo, useMemo } from 'react';
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
import { useTheme } from '../providers/ThemeProvider';
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
  const { theme } = useTheme();
  
  // * Create dynamic styles based on theme
  const styles = useMemo(() => createStyles(theme), [theme]);
  
  // * Use theme colors for completion states
  const getCompletionColor = (percentage: number) => {
    if (percentage >= 80) return theme.colors.semantic.success;
    if (percentage >= 50) return theme.colors.semantic.warning;
    if (percentage > 0) return theme.colors.semantic.error;
    return theme.colors.text.tertiary;
  };

  const getCompletionBadge = (percentage: number) => {
    if (percentage === 100) return { 
      text: 'Complete', 
      color: theme.colors.metal.gold, 
      icon: '🏅' 
    };
    if (percentage >= 80) return { 
      text: 'Nearly Done', 
      color: theme.colors.metal.silver, 
      icon: '⭐' 
    };
    if (percentage >= 50) return { 
      text: 'In Progress', 
      color: theme.colors.metal.bronze, 
      icon: '⚡' 
    };
    if (percentage > 0) return { 
      text: 'Started', 
      color: theme.colors.accent.warmth, 
      icon: '✨' 
    };
    return { 
      text: 'Not Started', 
      color: theme.colors.surface.backgroundElevated, 
      icon: '📋' 
    };
  };
  
  // * Get the appropriate color preset for ProgressRing based on element category
  const getProgressColorPreset = () => {
    switch (element.category) {
      case 'character':
        return 'character';
      case 'location':
        return 'location';
      case 'magic':
        return 'magic';
      case 'item':
        return 'item';
      default:
        return 'default';
    }
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
      <View style={[styles.badge, { backgroundColor: badge.color + '20', borderColor: badge.color }]}>
        <Text style={styles.badgeIcon}>{badge.icon}</Text>
        <Text style={[styles.badgeText, { color: badge.color }]}>{badge.text}</Text>
      </View>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.categoryIconContainer, { backgroundColor: elementColors.bg }]}>
            <Text style={styles.categoryIcon} data-cy="category-icon">
              {categoryIcon}
            </Text>
          </View>
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

        {/* Replace completion text with ProgressRing */}
        <View style={styles.progressRingContainer}>
          <ProgressRing
            progress={element.completionPercentage}
            size="small"
            showPercentage={true}
            colorPreset={getProgressColorPreset()}
            testID="element-card-progress"
          />
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

      {/* Remove the old progress bar - using ProgressRing instead */}

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

      {/* Relationships Badge */}
      {element.relationships && element.relationships.length > 0 && (
        <View style={styles.relationships}>
          <View style={styles.relationshipBadge}>
            <Text style={styles.relationshipIcon}>🔗</Text>
            <Text style={styles.relationshipsText}>
              {element.relationships.length} connection
              {element.relationships.length !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>
      )}
    </Pressable>
  );
});

// * Dynamic style creation based on theme
const createStyles = (theme: any) => StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    position: 'relative',
    minHeight: 140,
    // * Fantasy theme shadows
    shadowColor: theme.colors.effects.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardPressed: {
    opacity: 0.8,
  },
  cardWeb: {
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    '&:hover': {
      transform: 'translateY(-1px)',
      shadowOpacity: 0.15,
    },
  },
  badge: {
    position: 'absolute',
    top: -1,
    right: -1,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderBottomLeftRadius: theme.borderRadius.md,
    borderTopRightRadius: theme.borderRadius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  badgeIcon: {
    fontSize: theme.typography.fontSize.sm,
  },
  badgeText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '600',
    fontFamily: theme.typography.fontFamily.bold,
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
    gap: theme.spacing.sm,
  },
  categoryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.primary.borderLight,
  },
  categoryIcon: {
    fontSize: 24,
  },
  headerInfo: {
    flex: 1,
  },
  elementName: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '600',
    marginBottom: 2,
    fontFamily: theme.typography.fontFamily.bold,
  },
  categoryText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    textTransform: 'capitalize',
  },
  progressRingContainer: {
    marginRight: theme.spacing.xs,
  },
  description: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    lineHeight: 18,
    marginBottom: theme.spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  updatedText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
  },
  tags: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  tag: {
    paddingHorizontal: theme.spacing.xs + 2,
    paddingVertical: 2,
    backgroundColor: theme.colors.surface.backgroundElevated,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.primary.borderLight,
  },
  tagText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.primary,
  },
  moreTagsText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
  },
  relationships: {
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.primary.borderLight,
  },
  relationshipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  relationshipIcon: {
    fontSize: theme.typography.fontSize.sm,
  },
  relationshipsText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
  },
});