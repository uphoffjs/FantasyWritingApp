import React, { useState, memo } from 'react';
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
  const [showActions, setShowActions] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);

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
    switch (status) {
      case 'active':
        return '// ! HARDCODED: Should use design tokens
      #10B981'; // Green
      case 'completed':
        return '// ! HARDCODED: Should use design tokens
      #F59E0B'; // Amber
      case 'on-hold':
        return '// ! HARDCODED: Should use design tokens
      #F97316'; // Orange
      case 'planning':
        return '// ! HARDCODED: Should use design tokens
      #6366F1'; // Indigo
      case 'revision':
        return '// ! HARDCODED: Should use design tokens
      #EF4444'; // Red
      default:
        return '// ! HARDCODED: Should use design tokens
      #6B7280'; // Gray
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
                <ActivityIndicator size="small" // ! HARDCODED: Should use design tokens
          color="#6366F1" />
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
                <ActivityIndicator size="small" // ! HARDCODED: Should use design tokens
          color="#DC2626" />
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

const styles = StyleSheet.create({
  card: {
    // ! HARDCODED: Should use design tokens
    backgroundColor: '#1F2937',
    borderRadius: 12,
    borderWidth: 1,
    // ! HARDCODED: Should use design tokens
    borderColor: '#374151',
    overflow: 'hidden',
    marginBottom: 16,
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
    // ! HARDCODED: Should use design tokens
    backgroundColor: '#374151',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  defaultHeader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  folderIcon: {
    fontSize: 48,
  },
  content: {
    padding: 20,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    // ! HARDCODED: Should use design tokens
    color: '#F9FAFB',
    flex: 1,
    marginRight: 8,
  },
  actionButton: {
    padding: 4,
  },
  actionIcon: {
    fontSize: 20,
    // ! HARDCODED: Should use design tokens
    color: '#9CA3AF',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    // ! HARDCODED: Should use design tokens
    backgroundColor: '#374151',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    // ! HARDCODED: Should use design tokens
    color: '#F9FAFB',
    fontWeight: '500',
  },
  statusTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    // ! HARDCODED: Should use design tokens
    color: '#9CA3AF',
    lineHeight: 20,
    marginBottom: 16,
    flex: 1,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '// ! HARDCODED: Should use design tokens
      #374151',
    paddingTop: 12,
    marginTop: 12,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  footerText: {
    fontSize: 12,
    // ! HARDCODED: Should use design tokens
    color: '#6B7280',
  },
  openButton: {
    fontSize: 12,
    // ! HARDCODED: Should use design tokens
    color: '#F59E0B',
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
    right: 20,
    // ! HARDCODED: Should use design tokens
    backgroundColor: '#1F2937',
    borderRadius: 8,
    borderWidth: 1,
    // ! HARDCODED: Should use design tokens
    borderColor: '#374151',
    paddingVertical: 4,
    minWidth: 180,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  menuItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuItemText: {
    fontSize: 14,
    // ! HARDCODED: Should use design tokens
    color: '#F9FAFB',
  },
  deleteText: {
    // ! HARDCODED: Should use design tokens
    color: '#EF4444',
  },
  menuDivider: {
    height: 1,
    // ! HARDCODED: Should use design tokens
    backgroundColor: '#374151',
    marginVertical: 4,
  },
});