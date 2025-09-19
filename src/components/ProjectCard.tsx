import React, { useState, memo, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { Project } from '../types/models';
import { useWorldbuildingStore } from '../store/worldbuildingStore';
import { useTheme } from '../providers/ThemeProvider';

interface ProjectCardProps {
  project: Project;
  onDelete?: (projectId: string) => void;
  isDeleting?: boolean;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ProjectCard = memo(function ProjectCard({
  project,
  onDelete,
  isDeleting = false,
}: ProjectCardProps) {
  const navigation = useNavigation<NavigationProp>();
  const { setCurrentProject } = useWorldbuildingStore();
  const { theme } = useTheme();
  const [showActions, setShowActions] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  
  // * Create dynamic styles based on theme
  const styles = useMemo(() => createStyles(theme), [theme]);

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
      const confirmed = window.confirm(
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

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
        Platform.OS === 'web' && styles.cardWeb,
      ]}
      onPress={handleOpenProject}
      onLongPress={() => setShowActions(true)}
      data-cy="project-card"
    >
      {/* Cover Image or Default Header */}
      <View style={styles.header}>
        {project.coverImage ? (
          <Image
            source={{ uri: project.coverImage }}
            style={styles.coverImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.defaultHeader}>
            <Text style={styles.folderIcon}>📁</Text>
          </View>
        )}
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

        {/* Footer Stats */}
        <View style={styles.footer}>
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>
              📝 {project.elements.length} elements
            </Text>
            <Text style={styles.openButton}>Open →</Text>
          </View>
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>
              📅 {formatDate(project.createdAt)}
            </Text>
            <Text style={styles.footerText}>
              🕐 {formatDate(project.updatedAt)}
            </Text>
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
  );
});

// * Dynamic style creation based on theme
const createStyles = (theme: any) => StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface.card,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.primary.border,
    overflow: 'hidden',
    marginBottom: theme.spacing.md,
    // * Fantasy theme: subtle shadow for depth
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
    transition: 'all 0.2s ease',
    cursor: 'pointer',
  },
  header: {
    height: 160,
    backgroundColor: theme.colors.surface.backgroundAlt,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  defaultHeader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surface.backgroundAlt,
  },
  folderIcon: {
    fontSize: 48,
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
  footerText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
  },
  openButton: {
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