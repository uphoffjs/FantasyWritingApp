import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useTheme, Theme } from '../providers/ThemeProvider';
import { WorldElement } from '../types/models';
import { getCategoryIcon } from '../utils/categoryMapping';
import { getElementColor } from '../utils/elementColors';
import { fantasyMasterColors } from '../constants/fantasyMasterColors';
import { getTestProps } from '../utils/react-native-web-polyfills';

// ! RelationshipGraph Component with Fantasy Theme Colors
// * Displays element relationships in a visually appealing graph-like layout
// * Uses fantasy color palette for different element categories
// * Mobile-first design with responsive layout

interface Relationship {
  id: string;
  sourceId: string;
  targetId: string;
  type: string;
  description?: string;
}

interface RelationshipGraphProps {
  elements: WorldElement[];
  relationships: Relationship[];
  selectedElementId?: string | null;
  onElementPress?: (element: WorldElement) => void;
  onRelationshipPress?: (relationship: Relationship) => void;
  showLegend?: boolean;
  graphMode?: 'cards' | 'tree' | 'network';
}

export const RelationshipGraphV2: React.FC<RelationshipGraphProps> = ({
  elements,
  relationships,
  selectedElementId,
  onElementPress,
  onRelationshipPress,
  showLegend = true,
}) => {
  const { theme } = useTheme();
  const [focusedElementId, setFocusedElementId] = useState<string | null>(selectedElementId || null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const windowWidth = Dimensions.get('window').width;
  const isTablet = windowWidth >= 768;
  const isDesktop = windowWidth >= 1024;

  // * Group elements by category for organized display
  const elementsByCategory = useMemo(() => {
    const grouped = new Map<string, WorldElement[]>();
    elements.forEach(element => {
      const category = element.category;
      if (!grouped.has(category)) {
        grouped.set(category, []);
      }
      grouped.get(category)!.push(element);
    });
    return grouped;
  }, [elements]);

  // * Get relationships for a specific element
  const getElementRelationships = useCallback((elementId: string) => {
    return relationships.filter(
      rel => rel.sourceId === elementId || rel.targetId === elementId
    );
  }, [relationships]);

  // * Get connected elements for a specific element
  const getConnectedElements = useCallback((elementId: string) => {
    const connectedIds = new Set<string>();
    relationships.forEach(rel => {
      if (rel.sourceId === elementId) {
        connectedIds.add(rel.targetId);
      } else if (rel.targetId === elementId) {
        connectedIds.add(rel.sourceId);
      }
    });
    return elements.filter(el => connectedIds.has(el.id));
  }, [elements, relationships]);

  // * Toggle category expansion
  const toggleCategory = useCallback((category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  }, []);

  // * Handle element selection
  const handleElementPress = useCallback((element: WorldElement) => {
    setFocusedElementId(element.id);
    onElementPress?.(element);
  }, [onElementPress]);

  const styles = useMemo(
    () => createStyles(theme, isTablet, isDesktop),
    [theme, isTablet, isDesktop]
  );

  // * Get relationship line color based on type
  const getRelationshipColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'rules':
      case 'leads':
        return fantasyMasterColors.attributes.might.base;
      case 'loves':
      case 'family':
        return fantasyMasterColors.semantic.dragonfire.medium;
      case 'allies':
      case 'friend':
        return fantasyMasterColors.attributes.vitality.base;
      case 'enemy':
      case 'rival':
        return fantasyMasterColors.attributes.might.dark;
      case 'member':
      case 'belongs':
        return fantasyMasterColors.attributes.swiftness.base;
      case 'owns':
      case 'created':
        return fantasyMasterColors.ui.metals.gold.base;
      default:
        return theme.colors.primary.main;
    }
  };

  // * Render legend
  const renderLegend = () => {
    if (!showLegend) return null;

    const legendItems = [
      { type: 'Rules/Leads', color: fantasyMasterColors.attributes.might.base, icon: '👑' },
      { type: 'Love/Family', color: fantasyMasterColors.semantic.dragonfire.medium, icon: '❤️' },
      { type: 'Allies/Friends', color: fantasyMasterColors.attributes.vitality.base, icon: '🤝' },
      { type: 'Enemy/Rival', color: fantasyMasterColors.attributes.might.dark, icon: '⚔️' },
      { type: 'Member/Belongs', color: fantasyMasterColors.attributes.swiftness.base, icon: '🏛️' },
      { type: 'Owns/Created', color: fantasyMasterColors.ui.metals.gold.base, icon: '✨' },
    ];

    return (
      <View style={styles.legend} {...getTestProps('relationship-legend')}>
        <Text style={styles.legendTitle}>Relationship Types</Text>
        <View style={styles.legendItems}>
          {legendItems.map((item) => (
            <View key={item.type} style={styles.legendItem}>
              <Text style={styles.legendIcon}>{item.icon}</Text>
              <View style={[styles.legendLine, { backgroundColor: item.color }]} />
              <Text style={styles.legendText}>{item.type}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  // * Render element node
  const renderElementNode = (element: WorldElement, isConnected: boolean = false) => {
    const elementColors = getElementColor(element.category);
    const categoryIcon = getCategoryIcon(element.category);
    const isFocused = element.id === focusedElementId;
    const elementRelationships = getElementRelationships(element.id);

    return (
      <TouchableOpacity
        key={element.id}
        style={[
          styles.elementNode,
          { 
            backgroundColor: elementColors.bg,
            borderColor: isFocused ? fantasyMasterColors.ui.metals.gold.base : elementColors.border,
          },
          isFocused && styles.focusedNodeBorder,
          isConnected && styles.connectedNode,
          isFocused && styles.focusedNode,
        ]}
        onPress={() => handleElementPress(element)}
        {...getTestProps(`element-node-${element.id}`)}
      >
        <View style={styles.nodeHeader}>
          <View style={[styles.nodeIcon, { backgroundColor: elementColors.accent }]}>
            <Text style={styles.nodeIconText}>{categoryIcon}</Text>
          </View>
          <View style={styles.nodeInfo}>
            <Text style={[styles.nodeName, { color: elementColors.text }]} numberOfLines={1}>
              {element.name}
            </Text>
            <Text style={styles.nodeCategory}>
              {element.category.replace('-', ' ')}
            </Text>
          </View>
        </View>
        {elementRelationships.length > 0 && (
          <View style={styles.nodeRelationships}>
            <Text style={styles.relationshipCount}>
              🔗 {elementRelationships.length} connection{elementRelationships.length !== 1 ? 's' : ''}
            </Text>
          </View>
        )}
        {element.completionPercentage > 0 && (
          <View style={styles.nodeCompletion}>
            <View 
              style={[
                styles.completionBar,
                { 
                  width: `${element.completionPercentage}%`,
                  backgroundColor: element.completionPercentage === 100 
                    ? fantasyMasterColors.ui.metals.gold.base
                    : element.completionPercentage >= 80
                    ? fantasyMasterColors.attributes.vitality.base
                    : element.completionPercentage >= 50
                    ? fantasyMasterColors.semantic.sunburst.base
                    : fantasyMasterColors.semantic.dragonfire.base
                }
              ]}
            />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // * Render relationship connection
  const renderRelationshipConnection = (relationship: Relationship) => {
    const sourceElement = elements.find(el => el.id === relationship.sourceId);
    const targetElement = elements.find(el => el.id === relationship.targetId);
    
    if (!sourceElement || !targetElement) return null;

    const relationshipColor = getRelationshipColor(relationship.type);

    return (
      <TouchableOpacity
        key={relationship.id}
        style={[
          styles.relationshipCard,
          { borderLeftColor: relationshipColor }
        ]}
        onPress={() => onRelationshipPress?.(relationship)}
        {...getTestProps(`relationship-${relationship.id}`)}
      >
        <View style={styles.relationshipHeader}>
          <Text style={[styles.relationshipType, { color: relationshipColor }]}>
            {relationship.type}
          </Text>
        </View>
        <View style={styles.relationshipElements}>
          <View style={styles.relationshipElement}>
            <Text style={styles.elementIcon}>
              {getCategoryIcon(sourceElement.category)}
            </Text>
            <Text style={styles.elementName} numberOfLines={1}>
              {sourceElement.name}
            </Text>
          </View>
          <Text style={styles.relationshipArrow}>→</Text>
          <View style={styles.relationshipElement}>
            <Text style={styles.elementIcon}>
              {getCategoryIcon(targetElement.category)}
            </Text>
            <Text style={styles.elementName} numberOfLines={1}>
              {targetElement.name}
            </Text>
          </View>
        </View>
        {relationship.description && (
          <Text style={styles.relationshipDescription} numberOfLines={2}>
            {relationship.description}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  // * Render category section
  const renderCategorySection = (category: string, categoryElements: WorldElement[]) => {
    const isExpanded = expandedCategories.has(category) || focusedElementId !== null;
    const categoryColor = fantasyMasterColors.elements[category as keyof typeof fantasyMasterColors.elements] || theme.colors.primary.main;

    return (
      <View key={category} style={styles.categorySection} {...getTestProps(`category-section-${category}`)}>
        <TouchableOpacity
          style={[styles.categoryHeader, { backgroundColor: categoryColor + '10' }]}
          onPress={() => toggleCategory(category)}
        >
          <View style={styles.categoryHeaderLeft}>
            <View style={[styles.categoryIcon, { backgroundColor: categoryColor + '20' }]}>
              <Text style={styles.categoryIconText}>
                {getCategoryIcon(category)}
              </Text>
            </View>
            <Text style={[styles.categoryTitle, { color: categoryColor }]}>
              {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
            </Text>
            <Text style={styles.categoryCount}>
              ({categoryElements.length})
            </Text>
          </View>
          <Text style={styles.expandIcon}>
            {isExpanded ? '▼' : '▶'}
          </Text>
        </TouchableOpacity>
        
        {isExpanded && (
          <View style={styles.categoryElements}>
            {categoryElements.map(element => {
              const connectedElements = getConnectedElements(element.id);
              const isConnected = focusedElementId && connectedElements.some(el => el.id === focusedElementId);
              return renderElementNode(element, isConnected);
            })}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container} {...getTestProps('relationship-graph')}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Element Relationships</Text>
        <Text style={styles.subtitle}>
          {elements.length} elements • {relationships.length} connections
        </Text>
      </View>

      {/* Legend */}
      {renderLegend()}

      <ScrollView 
        style={styles.scrollContainer} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Focused Element Details */}
        {focusedElementId && (
          <View style={styles.focusSection} {...getTestProps('focused-element-section')}>
            <Text style={styles.focusSectionTitle}>Selected Element</Text>
            {renderElementNode(elements.find(el => el.id === focusedElementId)!, false)}
            
            {/* Connected Elements */}
            {getConnectedElements(focusedElementId).length > 0 && (
              <>
                <Text style={styles.focusSectionTitle}>Connected Elements</Text>
                <View style={styles.connectedElementsGrid}>
                  {getConnectedElements(focusedElementId).map(element => 
                    renderElementNode(element, true)
                  )}
                </View>
              </>
            )}

            {/* Clear Focus Button */}
            <TouchableOpacity
              style={styles.clearFocusButton}
              onPress={() => setFocusedElementId(null)}
              {...getTestProps('clear-focus-button')}
            >
              <Text style={styles.clearFocusText}>Clear Selection</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* All Elements by Category */}
        <View style={styles.categoriesContainer}>
          {Array.from(elementsByCategory.entries()).map(([category, categoryElements]) => 
            renderCategorySection(category, categoryElements)
          )}
        </View>

        {/* All Relationships */}
        <View style={styles.relationshipsSection}>
          <Text style={styles.sectionTitle}>All Relationships</Text>
          <View style={styles.relationshipsList}>
            {relationships.map(relationship => 
              renderRelationshipConnection(relationship)
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

// * Dynamic styles based on theme and device type
const createStyles = (theme: Theme, isTablet: boolean, isDesktop: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.surface.primary,
    },
    header: {
      padding: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.primary.border,
      backgroundColor: theme.colors.surface.backgroundElevated,
    },
    title: {
      fontSize: theme.typography.fontSize.xl,
      fontWeight: '600',
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fontFamily.bold,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.secondary,
    },
    legend: {
      padding: theme.spacing.md,
      backgroundColor: theme.colors.surface.backgroundElevated,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.primary.borderLight,
    },
    legendTitle: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: '600',
      color: theme.colors.text.secondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: theme.spacing.sm,
    },
    legendItems: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.md,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    legendIcon: {
      fontSize: 16,
    },
    legendLine: {
      width: 20,
      height: 3,
      borderRadius: 1.5,
    },
    legendText: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.text.secondary,
    },
    scrollContainer: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: theme.spacing.xl,
    },
    focusSection: {
      padding: theme.spacing.md,
      backgroundColor: fantasyMasterColors.ui.metals.gold.pale,
      borderBottomWidth: 2,
      borderBottomColor: fantasyMasterColors.ui.metals.gold.base,
      marginBottom: theme.spacing.md,
    },
    focusSectionTitle: {
      fontSize: theme.typography.fontSize.md,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.sm,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    connectedElementsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.sm,
    },
    clearFocusButton: {
      marginTop: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      backgroundColor: theme.colors.surface.background,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.primary.border,
      alignItems: 'center',
    },
    clearFocusText: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.secondary,
      fontWeight: '500',
    },
    categoriesContainer: {
      padding: theme.spacing.md,
    },
    categorySection: {
      marginBottom: theme.spacing.md,
    },
    categoryHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      marginBottom: theme.spacing.sm,
    },
    categoryHeaderLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    categoryIcon: {
      width: 36,
      height: 36,
      borderRadius: theme.borderRadius.sm,
      justifyContent: 'center',
      alignItems: 'center',
    },
    categoryIconText: {
      fontSize: 20,
    },
    categoryTitle: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: '600',
      fontFamily: theme.typography.fontFamily.bold,
    },
    categoryCount: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.secondary,
    },
    expandIcon: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.secondary,
    },
    categoryElements: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
      paddingHorizontal: theme.spacing.sm,
    },
    elementNode: {
      width: isDesktop ? 200 : isTablet ? 180 : 160,
      padding: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      shadowColor: theme.colors.effects.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    },
    connectedNode: {
      borderStyle: 'dashed',
    },
    focusedNode: {
      transform: [{ scale: 1.05 }],
    },
    focusedNodeBorder: {
      borderWidth: 2,
    },
    nodeHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      marginBottom: theme.spacing.xs,
    },
    nodeIcon: {
      width: 28,
      height: 28,
      borderRadius: theme.borderRadius.xs,
      justifyContent: 'center',
      alignItems: 'center',
    },
    nodeIconText: {
      fontSize: 16,
    },
    nodeInfo: {
      flex: 1,
    },
    nodeName: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: '600',
      marginBottom: 2,
    },
    nodeCategory: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.text.secondary,
      textTransform: 'capitalize',
    },
    nodeRelationships: {
      marginTop: theme.spacing.xs,
    },
    relationshipCount: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.text.secondary,
    },
    nodeCompletion: {
      height: 4,
      backgroundColor: theme.colors.surface.backgroundElevated,
      borderRadius: 2,
      marginTop: theme.spacing.xs,
      overflow: 'hidden',
    },
    completionBar: {
      height: '100%',
      borderRadius: 2,
    },
    relationshipsSection: {
      padding: theme.spacing.md,
    },
    sectionTitle: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.md,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    relationshipsList: {
      gap: theme.spacing.sm,
    },
    relationshipCard: {
      backgroundColor: theme.colors.surface.backgroundElevated,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      borderLeftWidth: 4,
    },
    relationshipHeader: {
      marginBottom: theme.spacing.sm,
    },
    relationshipType: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: '600',
      textTransform: 'uppercase',
    },
    relationshipElements: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    relationshipElement: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      flex: 1,
    },
    elementIcon: {
      fontSize: 18,
    },
    elementName: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.primary,
      flex: 1,
    },
    relationshipArrow: {
      fontSize: theme.typography.fontSize.md,
      color: theme.colors.text.secondary,
    },
    relationshipDescription: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.text.secondary,
      marginTop: theme.spacing.xs,
      fontStyle: 'italic',
    },
  });