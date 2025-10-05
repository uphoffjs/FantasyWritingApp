import React, { useState, memo, useMemo, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Project } from '../types/models';
import { useWorldbuildingStore } from '../store/worldbuildingStore';
import { ProgressRing } from './ProgressRing';
import { LazyImage } from './LazyImage';
import { getTestProps } from '../utils/react-native-web-polyfills';

// * Helper to safely use theme context
const useOptionalTheme = () => {
  try {

    const { useTheme } = require('../providers/ThemeProvider');
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useTheme();
  } catch {
    return null;
  }
};
import { BackgroundWithTexture } from './effects/ParchmentTexture';
import { ContentReveal } from './animations/ContentReveal';

interface ProjectCardProps {
  project: Project;
  onDelete?: (projectId: string) => void;
  isDeleting?: boolean;
  index?: number; // * For staggered animations in list
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ProjectCard = memo(function ProjectCard({
  project,
  onDelete,
  isDeleting = false,
  index = 0,
}: ProjectCardProps) {
  const navigation = useNavigation<NavigationProp>();
  const { setCurrentProject } = useWorldbuildingStore();
  const themeContext = useOptionalTheme();
  const theme = useMemo(() => themeContext?.theme || {
    // * Fallback theme values
    colors: {
      text: { primary: '#1A1613', secondary: '#6B5E52', muted: '#9B8C7D' },
      surface: {
        background: '#F5F2E8',
        card: '#FFFFFF',
        cardBorder: '#E5DCC7',
        backgroundElevated: '#FDFCF8',
      },
      primary: { DEFAULT: '#1C4FA3' },
      accent: { DEFAULT: '#C9A94F' },
      status: { success: '#2E7D4F', warning: '#E67E22', error: '#E74C3C' }
    },
    layout: { borderRadius: { medium: 16, small: 12 }, spacing: { md: 16, sm: 12, xs: 8 } }
  }, [themeContext]);
  const [showActions, setShowActions] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // * Create dynamic styles based on theme
  const styles = useMemo(() => createStyles(theme), [theme]);
  
  // * Animation values for smooth card interactions
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const elevationAnim = useRef(new Animated.Value(5)).current;
  const translateYAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  
  // * Calculate project completion percentage from elements
  const completionPercentage = useMemo(() => {
    if (!project.elements || project.elements.length === 0) return 0;
    const totalCompletion = project.elements.reduce(
      (sum, element) => sum + (element.completionPercentage || 0),
      0
    );
    return Math.round(totalCompletion / project.elements.length);
  }, [project.elements]);
  
  // * Calculate stats for the project
  const projectStats = useMemo(() => {
    const elementsByCategory = project.elements?.reduce((acc, element) => {
      const category = element.category;
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};
    
    // * Mock word count and chapters for now (these would come from actual content)
    const wordCount = project.elements?.length * 250 || 0; // Rough estimate
    const chapterCount = Math.max(1, Math.floor(project.elements?.length / 5) || 1);
    
    return {
      elementCount: project.elements?.length || 0,
      elementsByCategory,
      wordCount,
      chapterCount,
      relationshipCount: project.elements?.reduce(
        (sum, el) => sum + (el.relationships?.length || 0),
        0
      ) || 0,
    };
  }, [project.elements]);

  // * Handle hover animations for web
  const handleMouseEnter = useCallback(() => {
    if (Platform.OS === 'web') {
      setIsHovered(true);
      // * Lift the card with scale and translation
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1.02,
          friction: 4,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: -4,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(elevationAnim, {
          toValue: 12,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [scaleAnim, translateYAnim, elevationAnim]);

  const handleMouseLeave = useCallback(() => {
    if (Platform.OS === 'web') {
      setIsHovered(false);
      // * Return card to original position
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(elevationAnim, {
          toValue: 5,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [scaleAnim, translateYAnim, elevationAnim]);

  // * Handle press animations
  const handlePressIn = useCallback(() => {
    // * Subtle press effect
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        friction: 3,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.timing(elevationAnim, {
        toValue: 2,
        duration: 100,
        useNativeDriver: false,
      }),
    ]).start();
  }, [scaleAnim, elevationAnim]);

  const handlePressOut = useCallback(() => {
    // * Release effect
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: isHovered && Platform.OS === 'web' ? 1.02 : 1,
        friction: 3,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.timing(elevationAnim, {
        toValue: isHovered && Platform.OS === 'web' ? 12 : 5,
        duration: 150,
        useNativeDriver: false,
      }),
    ]).start();
  }, [scaleAnim, elevationAnim, isHovered]);

  // * Handle long press wiggle animation for mobile
  const handleLongPress = useCallback(() => {
    setShowActions(true);
    // * Wiggle animation to indicate interaction
    Animated.sequence([
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: -1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, [rotateAnim]);

  const handleOpenProject = () => {
    setCurrentProject(project.id);
    navigation.navigate('Project', { projectId: project.id });
  };

  const handleDuplicate = async () => {
    setIsDuplicating(true);
    try {
      // TODO: TODO: Implement project duplication
      Alert.alert('Coming Soon', 'Project duplication will be available soon.');
    } catch (error) {
      console.error('Failed to duplicate project:', error);
    } finally {
      setIsDuplicating(false);
    }
  };

  const handleDelete = () => {
    if (Platform.OS === 'web') {
      // * Use type assertion for web-specific API
      const confirmed = (globalThis as any).confirm?.(
        `Are you sure you want to delete "${project.name}"? This action cannot be undone.`
      );
      if (confirmed && onDelete) {
        onDelete(project.id);
      }
    } else {
      Alert.alert(
        'Delete Project',
        `Are you sure you want to delete "${project.name}"? This action cannot be undone.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => onDelete?.(project.id),
          },
        ]
      );
    }
  };

  const handleEdit = () => {
    // TODO: TODO: Implement edit functionality
    Alert.alert('Coming Soon', 'Project editing will be available soon.');
  };

  const getStatusColor = (status?: string) => {
    // * Use theme colors for status indicators
    switch (status) {
      case 'active':
        return theme.colors.semantic.success;
      case 'completed':
        return theme.colors.accent.finesse; // Gold/amber for completed
      case 'on-hold':
        return theme.colors.semantic.warning;
      case 'planning':
        return theme.colors.accent.swiftness; // Blue for planning
      case 'revision':
        return theme.colors.semantic.error;
      default:
        return theme.colors.text.secondary;
    }
  };

  const formatStatus = (status: string) => {
    return status
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // * Animated styles for the card
  const animatedCardStyle = {
    transform: [
      { scale: scaleAnim },
      { translateY: translateYAnim },
      {
        rotate: rotateAnim.interpolate({
          inputRange: [-1, 1],
          outputRange: ['-1deg', '1deg'],
        }),
      },
    ],
    elevation: elevationAnim,
    shadowOpacity: elevationAnim.interpolate({
      inputRange: [2, 5, 12],
      outputRange: [0.1, 0.15, 0.25],
    }),
    shadowRadius: elevationAnim.interpolate({
      inputRange: [2, 5, 12],
      outputRange: [4, 8, 12],
    }),
  };

  return (
    <ContentReveal
      animation="slideUp"
      duration={600}
      delay={index * 100} // * Stagger delay based on position in list
      distance={30}
      easing="spring"
      {...getTestProps(`project-card-reveal-${index}`)}
    >
      <BackgroundWithTexture 
        variant="subtle"
        style={styles.textureWrapper}
        {...getTestProps('project-card-texture')}
      >
        <Animated.View 
          style={[styles.card, animatedCardStyle]}
        // * Add mouse enter/leave for web hover effects
        {...(Platform.OS === 'web' && {
          onMouseEnter: handleMouseEnter,
          onMouseLeave: handleMouseLeave,
        })}
      >
        <Pressable
          style={[
            styles.cardPressable,
            Platform.OS === 'web' && styles.cardWeb,
          ]}
          onPress={handleOpenProject}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onLongPress={handleLongPress}
          {...getTestProps('project-card')}
        >
        {/* Cover Image or Default Header with Progress Ring Overlay */}
        <View style={styles.header}>
        {project.coverImage && !imageError ? (
          <LazyImage
            source={{ uri: project.coverImage }}
            style={styles.coverImage}
            resizeMode="cover"
            onError={() => setImageError(true)}
            {...getTestProps('project-card-cover-image')}
            fadeIn={true}
            showLoadingIndicator={true}
            threshold={0.5}
          />
        ) : (
          <View style={styles.defaultHeader}>
            <View style={styles.defaultHeaderContent}>
              <Text style={styles.folderIcon}>📚</Text>
              <Text style={styles.genreLabel}>
                {project.genre || 'Fantasy'}
              </Text>
            </View>
          </View>
        )}
        
        {/* Progress Ring Overlay in top right corner */}
        <View style={styles.progressOverlay}>
          <ProgressRing
            progress={completionPercentage}
            size="small"
            showPercentage={true}
            colorPreset="default"
            {...getTestProps('project-card-progress')}
          />
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Title and Actions */}
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={2}>
            {project.name}
          </Text>
          <Pressable
            style={styles.actionButton}
            onPress={() => setShowActions(!showActions)}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <Text style={styles.actionIcon}>⋮</Text>
          </Pressable>
        </View>

        {/* Tags */}
        <View style={styles.tags}>
          {project.genre && (
            <View style={styles.tag}>
              <Text style={styles.tagText}>{project.genre}</Text>
            </View>
          )}
          {project.status && (
            <View
              style={[
                styles.statusTag,
                { backgroundColor: `${getStatusColor(project.status)}20` },
              ]}
            >
              <Text
                style={[styles.statusText, { color: getStatusColor(project.status) }]}
              >
                {formatStatus(project.status)}
              </Text>
            </View>
          )}
        </View>

        {/* Description */}
        <Text style={styles.description} numberOfLines={2}>
          {project.description || 'No description provided'}
        </Text>

        {/* Enhanced Stats Display */}
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>📝</Text>
            <Text style={styles.statValue}>{projectStats.elementCount}</Text>
            <Text style={styles.statLabel}>Elements</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>🔗</Text>
            <Text style={styles.statValue}>{projectStats.relationshipCount}</Text>
            <Text style={styles.statLabel}>Links</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>📖</Text>
            <Text style={styles.statValue}>{projectStats.chapterCount}</Text>
            <Text style={styles.statLabel}>Chapters</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>✍️</Text>
            <Text style={styles.statValue}>
              {projectStats.wordCount >= 1000
                ? `${(projectStats.wordCount / 1000).toFixed(1)}k`
                : projectStats.wordCount}
            </Text>
            <Text style={styles.statLabel}>Words</Text>
          </View>
        </View>
        
        {/* Footer with dates and action */}
        <View style={styles.footer}>
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>
              📅 {formatDate(project.updatedAt)}
            </Text>
            <Pressable
              style={styles.openButton}
              onPress={handleOpenProject}
              {...getTestProps('project-card-open-button')}
            >
              <Text style={styles.openButtonText}>Open →</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Action Menu Overlay */}
      {showActions && (
        <>
          <Pressable
            style={styles.overlay}
            onPress={() => setShowActions(false)}
          />
          <View style={styles.actionMenu}>
            <Pressable style={styles.menuItem} onPress={handleEdit}>
              <Text style={styles.menuItemText}>✏️ Edit Project</Text>
            </Pressable>
            <Pressable
              style={styles.menuItem}
              onPress={handleDuplicate}
              disabled={isDuplicating}
            >
              {isDuplicating ? (
                <ActivityIndicator size="small" color={theme.colors.primary.DEFAULT} />
              ) : (
                <Text style={styles.menuItemText}>📋 Duplicate</Text>
              )}
            </Pressable>
            <View style={styles.menuDivider} />
            <Pressable
              style={styles.menuItem}
              onPress={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color={theme.colors.semantic.error} />
              ) : (
                <Text style={[styles.menuItemText, styles.deleteText]}>
                  🗑️ Delete Project
                </Text>
              )}
            </Pressable>
          </View>
        </>
      )}
        </Pressable>
      </Animated.View>
    </BackgroundWithTexture>
    </ContentReveal>
  );
});

// * Dynamic style creation based on theme
const createStyles = (theme: any) => StyleSheet.create({
  textureWrapper: {
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
  },
  card: {
    backgroundColor: theme.colors.surface.card,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.metal.gold + '40', // * Subtle gold border
    overflow: 'hidden',
    // * Enhanced fantasy theme shadow for magical depth (handled by animation now)
    shadowColor: theme.colors.effects.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  cardPressable: {
    flex: 1,
  },
  cardWeb: {
    cursor: 'pointer',
  },
  header: {
    height: 160,
    backgroundColor: theme.colors.surface.backgroundAlt,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  defaultHeader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: `${theme.colors.metal.silver}10`, // * Subtle metallic sheen
    // * Web-specific gradient styling
    ...Platform.select({
      web: {
        backgroundImage: `linear-gradient(135deg, ${theme.colors.metal.silver}05 0%, ${theme.colors.metal.gold}10 100%)`,
      },
      default: {},
    }),
  },
  defaultHeaderContent: {
    alignItems: 'center',
  },
  folderIcon: {
    fontSize: 56,
    marginBottom: theme.spacing.xs,
  },
  genreLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    fontStyle: 'italic',
    fontFamily: theme.typography.fontFamily.serif,
  },
  progressOverlay: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    backgroundColor: theme.colors.surface.modal + 'E0', // * Semi-transparent background
    borderRadius: theme.borderRadius.full,
    padding: 2,
    borderWidth: 1,
    borderColor: theme.colors.metal.gold + '40',
    shadowColor: theme.colors.effects.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    padding: theme.spacing.md + 4,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.xs,
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: '600',
    color: theme.colors.text.primary,
    flex: 1,
    marginRight: theme.spacing.xs,
    fontFamily: theme.typography.fontFamily.bold,
  },
  actionButton: {
    padding: theme.spacing.xs,
  },
  actionIcon: {
    fontSize: theme.typography.fontSize.xl,
    color: theme.colors.text.secondary,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.sm + 4,
  },
  tag: {
    backgroundColor: theme.colors.surface.backgroundAlt,
    paddingHorizontal: theme.spacing.sm + 2,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.metal.gold,
  },
  tagText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary,
    fontWeight: '500',
  },
  statusTag: {
    paddingHorizontal: theme.spacing.sm + 2,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.lg,
  },
  statusText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '500',
  },
  description: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.secondary,
    lineHeight: 20,
    marginBottom: theme.spacing.md,
    flex: 1,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.primary.borderLight,
    paddingTop: theme.spacing.sm + 4,
    marginTop: theme.spacing.sm + 4,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.primary.borderLight,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  statValue: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text.primary,
    fontFamily: theme.typography.fontFamily.bold,
  },
  statLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  footerText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
  },
  openButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.accent.finesse + '20',
    borderWidth: 1,
    borderColor: theme.colors.accent.finesse + '40',
  },
  openButtonText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.accent.finesse,
    fontWeight: '600',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  actionMenu: {
    position: 'absolute',
    top: 60,
    right: theme.spacing.md + 4,
    backgroundColor: theme.colors.surface.modal,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary.border,
    paddingVertical: theme.spacing.xs,
    minWidth: 180,
    shadowColor: theme.colors.effects.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  menuItem: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm + 4,
  },
  menuItemText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
  },
  deleteText: {
    color: theme.colors.semantic.error,
  },
  menuDivider: {
    height: 1,
    backgroundColor: theme.colors.primary.borderLight,
    marginVertical: theme.spacing.xs,
  },
});