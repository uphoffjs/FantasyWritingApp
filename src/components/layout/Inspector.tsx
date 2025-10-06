import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import { useTheme, Theme } from '../../providers/ThemeProvider';
import { WorldElement } from '../../types/models';
import { getCategoryIcon } from '../../utils/categoryMapping';
import { getElementColor } from '../../utils/elementColors';
import { ProgressRing } from '../ProgressRing';
import { getTestProps } from '../../utils/react-native-web-polyfills';

// ! Inspector Panel Component for Element Details
// * Contextual content that changes based on selected element
// * Includes Details, Relationships, and History tabs
// * Collapsible on tablet/desktop for better space management

interface InspectorProps {
  selectedElement: WorldElement | null;
  onEdit?: (element: WorldElement) => void;
  onDelete?: (element: WorldElement) => void;
  onDuplicate?: (element: WorldElement) => void;
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  relationships?: Array<{
    id: string;
    type: string;
    targetElement: WorldElement;
    description?: string;
  }>;
  history?: Array<{
    id: string;
    action: string;
    timestamp: Date;
    user?: string;
    details?: string;
  }>;
}

type TabType = 'details' | 'relationships' | 'history';

export const Inspector: React.FC<InspectorProps> = ({
  selectedElement,
  onEdit,
  onDelete,
  onDuplicate,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
  relationships = [],
  history = [],
}) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('details');
  const [slideAnim] = useState(new Animated.Value(isCollapsed ? -400 : 0));
  const windowWidth = Dimensions.get('window').width;
  const isTablet = windowWidth >= 768;
  const isDesktop = windowWidth >= 1024;

  // * Animate panel sliding for tablet/desktop
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isCollapsed ? -400 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isCollapsed, slideAnim]);

  const styles = React.useMemo(
    () => createStyles(theme, isTablet, isDesktop),
    [theme, isTablet, isDesktop]
  );

  const handleTabPress = useCallback((tab: TabType) => {
    setActiveTab(tab);
  }, []);

  if (!selectedElement) {
    // * Empty state when no element is selected
    return (
      <View style={styles.container} {...getTestProps('inspector-empty')}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyTitle}>No Element Selected</Text>
          <Text style={styles.emptySubtitle}>
            Select an element to view its details
          </Text>
        </View>
      </View>
    );
  }

  const elementColors = getElementColor(selectedElement.category);
  const categoryIcon = getCategoryIcon(selectedElement.category);

  // * Format date helper
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // * Get completion status color
  const getCompletionColor = () => {
    const percentage = selectedElement.completionPercentage;
    if (percentage === 100) return theme.colors.metal.gold;
    if (percentage >= 80) return theme.colors.semantic.success;
    if (percentage >= 50) return theme.colors.semantic.warning;
    if (percentage > 0) return theme.colors.semantic.error;
    return theme.colors.text.tertiary;
  };

  return (
    <Animated.View 
      style={[
        styles.container,
        isTablet && {
          transform: [{ translateX: slideAnim }],
        },
      ]}
      {...getTestProps('inspector-panel')}
    >
      {/* Header with Element Info */}
      <View style={[styles.header, { backgroundColor: elementColors.bg }]}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <View style={[styles.categoryIconContainer, { backgroundColor: elementColors.accent }]}>
              <Text style={styles.categoryIcon}>{categoryIcon}</Text>
            </View>
            <View style={styles.headerInfo}>
              <Text style={[styles.elementName, { color: elementColors.text }]} {...getTestProps('inspector-element-name')}>
                {selectedElement.name}
              </Text>
              <Text style={styles.categoryText} {...getTestProps('inspector-element-category')}>
                {selectedElement.category.replace('-', ' ')}
              </Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            {isTablet && onToggleCollapse && (
              <TouchableOpacity
                onPress={onToggleCollapse}
                style={styles.collapseButton}
                {...getTestProps('inspector-collapse-button')}
              >
                <Text style={styles.actionIcon}>{isCollapsed ? '◀' : '▶'}</Text>
              </TouchableOpacity>
            )}
            {onClose && !isTablet && (
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeButton}
                {...getTestProps('inspector-close-button')}
              >
                <Text style={styles.actionIcon}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          {onEdit && (
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={() => onEdit(selectedElement)}
              {...getTestProps('inspector-edit-button')}
            >
              <Text style={styles.actionButtonText}>✏️ Edit</Text>
            </TouchableOpacity>
          )}
          {onDuplicate && (
            <TouchableOpacity
              style={[styles.actionButton, styles.duplicateButton]}
              onPress={() => onDuplicate(selectedElement)}
              {...getTestProps('inspector-duplicate-button')}
            >
              <Text style={styles.actionButtonText}>📋 Duplicate</Text>
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => onDelete(selectedElement)}
              {...getTestProps('inspector-delete-button')}
            >
              <Text style={styles.actionButtonText}>🗑️ Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'details' && styles.activeTab]}
          onPress={() => handleTabPress('details')}
          {...getTestProps('inspector-details-tab')}
        >
          <Text style={[styles.tabText, activeTab === 'details' && styles.activeTabText]}>
            Details
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'relationships' && styles.activeTab]}
          onPress={() => handleTabPress('relationships')}
          {...getTestProps('inspector-relationships-tab')}
        >
          <Text style={[styles.tabText, activeTab === 'relationships' && styles.activeTabText]}>
            Relationships ({relationships.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.activeTab]}
          onPress={() => handleTabPress('history')}
          {...getTestProps('inspector-history-tab')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
            History
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'details' && (
          <View style={styles.tabContent} {...getTestProps('inspector-details-content')}>
            {/* Completion Status */}
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Completion Status</Text>
              <View style={styles.completionContainer}>
                <ProgressRing
                  progress={selectedElement.completionPercentage}
                  size="medium"
                  showPercentage={true}
                  colorPreset={selectedElement.category}
                  {...getTestProps('inspector-progress-ring')}
                />
                <View style={styles.completionInfo}>
                  <Text style={[styles.completionText, { color: getCompletionColor() }]}>
                    {selectedElement.completionPercentage === 100
                      ? '🏅 Complete'
                      : selectedElement.completionPercentage >= 80
                      ? '⭐ Nearly Done'
                      : selectedElement.completionPercentage >= 50
                      ? '⚡ In Progress'
                      : selectedElement.completionPercentage > 0
                      ? '✨ Started'
                      : '📋 Not Started'}
                  </Text>
                  <Text style={styles.completionSubtext}>
                    {selectedElement.completionPercentage}% complete
                  </Text>
                </View>
              </View>
            </View>

            {/* Description */}
            {selectedElement.description && (
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Description</Text>
                <Text style={styles.descriptionText} {...getTestProps('inspector-description')}>
                  {selectedElement.description}
                </Text>
              </View>
            )}

            {/* Tags */}
            {selectedElement.tags && selectedElement.tags.length > 0 && (
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Tags</Text>
                <View style={styles.tagContainer}>
                  {selectedElement.tags.map((tag, index) => (
                    <View key={index} style={styles.tag} {...getTestProps('inspector-tag')}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Metadata */}
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Metadata</Text>
              <View style={styles.metadataRow}>
                <Text style={styles.metadataLabel}>Created:</Text>
                <Text style={styles.metadataValue}>
                  {formatDate(selectedElement.createdAt)}
                </Text>
              </View>
              <View style={styles.metadataRow}>
                <Text style={styles.metadataLabel}>Updated:</Text>
                <Text style={styles.metadataValue}>
                  {formatDate(selectedElement.updatedAt)}
                </Text>
              </View>
              {selectedElement.id && (
                <View style={styles.metadataRow}>
                  <Text style={styles.metadataLabel}>ID:</Text>
                  <Text style={[styles.metadataValue, styles.monoText]}>
                    {selectedElement.id.substring(0, 8)}...
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {activeTab === 'relationships' && (
          <View style={styles.tabContent} {...getTestProps('inspector-relationships-content')}>
            {relationships.length === 0 ? (
              <View style={styles.emptyTabState}>
                <Text style={styles.emptyTabIcon}>🔗</Text>
                <Text style={styles.emptyTabText}>No relationships yet</Text>
                <Text style={styles.emptyTabSubtext}>
                  Connect this element to others to build your world
                </Text>
              </View>
            ) : (
              relationships.map((rel) => (
                <View key={rel.id} style={styles.relationshipCard} {...getTestProps('inspector-relationship')}>
                  <View style={styles.relationshipHeader}>
                    <Text style={styles.relationshipType}>{rel.type}</Text>
                    <Text style={styles.relationshipArrow}>→</Text>
                  </View>
                  <View style={styles.relationshipTarget}>
                    <View style={[
                      styles.relTargetIcon,
                      { backgroundColor: getElementColor(rel.targetElement.category).bg }
                    ]}>
                      <Text style={styles.relTargetIconText}>
                        {getCategoryIcon(rel.targetElement.category)}
                      </Text>
                    </View>
                    <View style={styles.relTargetInfo}>
                      <Text style={styles.relTargetName}>{rel.targetElement.name}</Text>
                      <Text style={styles.relTargetCategory}>
                        {rel.targetElement.category.replace('-', ' ')}
                      </Text>
                    </View>
                  </View>
                  {rel.description && (
                    <Text style={styles.relationshipDesc}>{rel.description}</Text>
                  )}
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === 'history' && (
          <View style={styles.tabContent} {...getTestProps('inspector-history-content')}>
            {history.length === 0 ? (
              <View style={styles.emptyTabState}>
                <Text style={styles.emptyTabIcon}>📜</Text>
                <Text style={styles.emptyTabText}>No history yet</Text>
                <Text style={styles.emptyTabSubtext}>
                  Changes to this element will appear here
                </Text>
              </View>
            ) : (
              history.map((entry) => (
                <View key={entry.id} style={styles.historyEntry} {...getTestProps('inspector-history-entry')}>
                  <View style={styles.historyHeader}>
                    <Text style={styles.historyAction}>{entry.action}</Text>
                    <Text style={styles.historyTime}>
                      {formatDate(entry.timestamp)}
                    </Text>
                  </View>
                  {entry.user && (
                    <Text style={styles.historyUser}>by {entry.user}</Text>
                  )}
                  {entry.details && (
                    <Text style={styles.historyDetails}>{entry.details}</Text>
                  )}
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </Animated.View>
  );
};

// * Dynamic styles based on theme and device type
const createStyles = (theme: Theme, isTablet: boolean, _isDesktop: boolean) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface.primary,
      borderLeftWidth: isTablet ? 1 : 0,
      borderLeftColor: theme.colors.primary.border,
      width: isTablet ? 400 : '100%',
      height: '100%',
      position: isTablet ? 'absolute' : 'relative',
      right: 0,
      top: 0,
      zIndex: 10,
      shadowColor: theme.colors.effects.shadow,
      shadowOffset: {
        width: -2,
        height: 0,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 5,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.xl,
    },
    emptyIcon: {
      fontSize: 48,
      marginBottom: theme.spacing.md,
    },
    emptyTitle: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: '600',
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.bold,
      marginBottom: theme.spacing.sm,
    },
    emptySubtitle: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.secondary,
      textAlign: 'center',
    },
    header: {
      padding: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.primary.border,
    },
    headerTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: theme.spacing.md,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    categoryIconContainer: {
      width: 48,
      height: 48,
      borderRadius: theme.borderRadius.md,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.sm,
    },
    categoryIcon: {
      fontSize: 28,
    },
    headerInfo: {
      flex: 1,
    },
    elementName: {
      fontSize: theme.typography.fontSize.xl,
      fontWeight: '600',
      fontFamily: theme.typography.fontFamily.bold,
      marginBottom: 4,
    },
    categoryText: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.secondary,
      textTransform: 'capitalize',
    },
    headerActions: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    collapseButton: {
      padding: theme.spacing.sm,
    },
    closeButton: {
      padding: theme.spacing.sm,
    },
    actionIcon: {
      fontSize: theme.typography.fontSize.lg,
      color: theme.colors.text.secondary,
    },
    quickActions: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    actionButton: {
      flex: 1,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    editButton: {
      backgroundColor: theme.colors.primary.subtle,
    },
    duplicateButton: {
      backgroundColor: theme.colors.surface.backgroundElevated,
    },
    deleteButton: {
      backgroundColor: theme.colors.semantic.error + '20',
    },
    actionButtonText: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: '500',
      color: theme.colors.text.primary,
    },
    tabs: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.primary.border,
    },
    tab: {
      flex: 1,
      paddingVertical: theme.spacing.md,
      alignItems: 'center',
      borderBottomWidth: 2,
      borderBottomColor: 'transparent',
    },
    activeTab: {
      borderBottomColor: theme.colors.primary.main,
    },
    tabText: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.secondary,
    },
    activeTabText: {
      color: theme.colors.primary.main,
      fontWeight: '600',
    },
    content: {
      flex: 1,
    },
    tabContent: {
      padding: theme.spacing.md,
    },
    detailSection: {
      marginBottom: theme.spacing.lg,
    },
    sectionTitle: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: '600',
      color: theme.colors.text.secondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: theme.spacing.sm,
    },
    completionContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    completionInfo: {
      flex: 1,
    },
    completionText: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: '600',
      marginBottom: 4,
    },
    completionSubtext: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.secondary,
    },
    descriptionText: {
      fontSize: theme.typography.fontSize.md,
      color: theme.colors.text.primary,
      lineHeight: 22,
    },
    tagContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.xs,
    },
    tag: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      backgroundColor: theme.colors.surface.backgroundElevated,
      borderRadius: theme.borderRadius.sm,
      borderWidth: 1,
      borderColor: theme.colors.primary.borderLight,
    },
    tagText: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.primary,
    },
    metadataRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.xs,
    },
    metadataLabel: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.secondary,
    },
    metadataValue: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.primary,
    },
    monoText: {
      fontFamily: Platform.select({
        ios: 'Courier',
        android: 'monospace',
        web: 'monospace',
      }),
    },
    emptyTabState: {
      alignItems: 'center',
      paddingVertical: theme.spacing.xl * 2,
    },
    emptyTabIcon: {
      fontSize: 36,
      marginBottom: theme.spacing.md,
    },
    emptyTabText: {
      fontSize: theme.typography.fontSize.md,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.xs,
    },
    emptyTabSubtext: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.secondary,
      textAlign: 'center',
      paddingHorizontal: theme.spacing.xl,
    },
    relationshipCard: {
      backgroundColor: theme.colors.surface.backgroundElevated,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      borderWidth: 1,
      borderColor: theme.colors.primary.borderLight,
    },
    relationshipHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    relationshipType: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: '600',
      color: theme.colors.primary.main,
      textTransform: 'uppercase',
    },
    relationshipArrow: {
      marginHorizontal: theme.spacing.sm,
      color: theme.colors.text.secondary,
    },
    relationshipTarget: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    relTargetIcon: {
      width: 32,
      height: 32,
      borderRadius: theme.borderRadius.sm,
      justifyContent: 'center',
      alignItems: 'center',
    },
    relTargetIconText: {
      fontSize: 18,
    },
    relTargetInfo: {
      flex: 1,
    },
    relTargetName: {
      fontSize: theme.typography.fontSize.md,
      fontWeight: '500',
      color: theme.colors.text.primary,
    },
    relTargetCategory: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.text.secondary,
      textTransform: 'capitalize',
    },
    relationshipDesc: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.secondary,
      marginTop: theme.spacing.sm,
      fontStyle: 'italic',
    },
    historyEntry: {
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.primary.borderLight,
    },
    historyHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.xs,
    },
    historyAction: {
      fontSize: theme.typography.fontSize.md,
      fontWeight: '600',
      color: theme.colors.text.primary,
    },
    historyTime: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.text.tertiary,
    },
    historyUser: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.secondary,
      fontStyle: 'italic',
    },
    historyDetails: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.secondary,
      marginTop: theme.spacing.xs,
    },
  });