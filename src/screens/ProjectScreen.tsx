/**
 * Project Screen
 * Displays project details and list of elements
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RootStackScreenProps, NavigationProp } from '../navigation/types';
import { Button } from '../components/Button';
import { useWorldbuildingStore } from '../store/worldbuildingStore';
import { ElementBrowser } from '../components/ElementBrowser';
import { CreateElementModal } from '../components/CreateElementModal';
import { RelationshipManager } from '../components/RelationshipManager';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { fantasyTomeColors } from '../constants/fantasyTomeColors';

export function ProjectScreen() {
  const route = useRoute<RootStackScreenProps<'Project'>['route']>();
  const navigation = useNavigation<NavigationProp>();
  const { projects } = useWorldbuildingStore();
  const [activeTab, setActiveTab] = useState<'elements' | 'relationships'>('elements');
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const project = projects.find(p => p.id === route.params.projectId);

  if (!project) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Icon name="error-outline" size={64} color={fantasyTomeColors.semantic.error} />
          <Text style={styles.errorText}>Project not found</Text>
          <Button 
            title="Back to Projects" 
            variant="secondary"
            onPress={() => navigation.goBack()}
          />
        </View>
      </View>
    );
  }

  const handleElementPress = (element: any) => {
    navigation.navigate('Element', { 
      projectId: project.id, 
      elementId: element.id 
    });
  };

  const handleCreateElement = () => {
    setShowCreateModal(true);
  };

  const handleElementCreated = (elementId: string) => {
    navigation.navigate('Element', { 
      projectId: project.id, 
      elementId 
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="arrow-back" size={24} color={fantasyTomeColors.ink.black} />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={1}>{project.name}</Text>
            {project.description && (
              <Text style={styles.description} numberOfLines={2}>
                {project.description}
              </Text>
            )}
          </View>
          <TouchableOpacity 
            onPress={handleCreateElement}
            style={styles.addButton}
          >
            <Icon name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        
        {/* Project Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{project.elements?.length || 0}</Text>
            <Text style={styles.statLabel}>Elements</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>
              {project.elements?.filter(e => e.completionPercentage === 100).length || 0}
            </Text>
            <Text style={styles.statLabel}>Complete</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>
              {project.elements?.length ? 
                Math.round(project.elements.reduce((sum, e) => sum + e.completionPercentage, 0) / project.elements.length) : 0
              }%
            </Text>
            <Text style={styles.statLabel}>Progress</Text>
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'elements' && styles.activeTab]}
            onPress={() => setActiveTab('elements')}
          >
            <Text style={[styles.tabText, activeTab === 'elements' && styles.activeTabText]}>
              Elements
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'relationships' && styles.activeTab]}
            onPress={() => setActiveTab('relationships')}
          >
            <Text style={[styles.tabText, activeTab === 'relationships' && styles.activeTabText]}>
              Relationships
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Content */}
      <View style={styles.content}>
        {activeTab === 'elements' ? (
          <ElementBrowser
            elements={project.elements || []}
            onElementPress={handleElementPress}
            onCreateElement={handleCreateElement}
            loading={false}
          />
        ) : (
          <RelationshipManager
            elements={project.elements || []}
            projectId={project.id}
          />
        )}
      </View>

      {/* Create Element Modal */}
      <CreateElementModal
        visible={showCreateModal}
        projectId={project.id}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleElementCreated}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: fantasyTomeColors.ink.scribe,
  },
  header: {
    backgroundColor: fantasyTomeColors.ink.black,
    paddingTop: Platform.OS === 'ios' ? 44 : 24,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: fantasyTomeColors.parchment.border,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: fantasyTomeColors.ink.black,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: fantasyTomeColors.ink.light,
    lineHeight: 20,
  },
  addButton: {
    backgroundColor: fantasyTomeColors.elements.magic.primary,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: fantasyTomeColors.ink.black,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: fantasyTomeColors.ink.faded,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: fantasyTomeColors.ink.brown,
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: fantasyTomeColors.elements.magic.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: fantasyTomeColors.ink.light,
  },
  activeTabText: {
    color: fantasyTomeColors.parchment.vellum,
  },
  content: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    color: fantasyTomeColors.semantic.error,
    textAlign: 'center',
    marginVertical: 16,
  },
});
