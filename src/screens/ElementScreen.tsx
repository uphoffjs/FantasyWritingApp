/**
 * Element Screen
 * Displays element details and questionnaire
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RootStackScreenProps, NavigationProp } from '../navigation/types';
import { Button } from '../components/Button';
import { ElementEditor } from '../components/ElementEditor';
import { RelationshipManager } from '../components/RelationshipManager';
import { TemplateSelector } from '../components/TemplateSelector';
import { useWorldbuildingStore } from '../store/worldbuildingStore';
import Icon from 'react-native-vector-icons/MaterialIcons';

export function ElementScreen() {
  const route = useRoute<RootStackScreenProps<'Element'>['route']>();
  const navigation = useNavigation<NavigationProp>();
  const { projects, deleteElement } = useWorldbuildingStore();
  const [activeTab, setActiveTab] = useState<'editor' | 'relationships'>('editor');
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  
  const project = projects.find(p => p.id === route.params.projectId);
  const element = project?.elements?.find(e => e.id === route.params.elementId);

  useEffect(() => {
    // ? TODO: * If element doesn't have questions, show template selector
    if (element && (!element.questions || element.questions.length === 0)) {
      setShowTemplateSelector(true);
    }
  }, [element]);

  if (!project || !element) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Icon name="error-outline" size={64} color="#EF4444" />
          <Text style={styles.errorText}>
            {!project ? 'Project not found' : 'Element not found'}
          </Text>
          <Button 
            title="Back" 
            variant="secondary"
            onPress={() => navigation.goBack()}
          />
        </View>
      </View>
    );
  }

  const handleDeleteElement = () => {
    Alert.alert(
      'Delete Element',
      `Are you sure you want to delete "${element.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteElement(project.id, element.id);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleSelectTemplate = (template: any) => {
    // TODO: * Template will be applied to the element through the store
    setShowTemplateSelector(false);
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
            <Icon name="arrow-back" size={24} color="#F9FAFB" />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={1}>{element.name}</Text>
            <Text style={styles.subtitle}>
              {element.category} • {element.completionPercentage}% complete
            </Text>
          </View>
          <TouchableOpacity 
            onPress={handleDeleteElement}
            style={styles.deleteButton}
          >
            <Icon name="delete" size={24} color="#EF4444" />
          </TouchableOpacity>
        </View>
        
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, { width: `${element.completionPercentage}%` }]}
            />
          </View>
          <Text style={styles.progressText}>{element.completionPercentage}% Complete</Text>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'editor' && styles.activeTab]}
            onPress={() => setActiveTab('editor')}
          >
            <Text style={[styles.tabText, activeTab === 'editor' && styles.activeTabText]}>
              Editor
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
        {activeTab === 'editor' ? (
          element.questions && element.questions.length > 0 ? (
            <ElementEditor
              element={element}
              autoSave={true}
            />
          ) : (
            <View style={styles.noQuestionsContainer}>
              <Icon name="quiz" size={64} color="#6B7280" />
              <Text style={styles.noQuestionsTitle}>No Questions Yet</Text>
              <Text style={styles.noQuestionsText}>
                This element needs a template to get started with questions.
              </Text>
              <Button
                title="Choose Template"
                onPress={() => setShowTemplateSelector(true)}
                variant="primary"
              />
            </View>
          )
        ) : (
          <RelationshipManager
            elements={project.elements || []}
            projectId={project.id}
            focusElementId={element.id}
          />
        )}
      </View>

      {/* Template Selector Modal */}
      {showTemplateSelector && (
        <TemplateSelector
          visible={showTemplateSelector}
          category={element.category}
          onSelectTemplate={handleSelectTemplate}
          onClose={() => setShowTemplateSelector(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  header: {
    backgroundColor: '#1F2937',
    paddingTop: Platform.OS === 'ios' ? 44 : 24,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F9FAFB',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  deleteButton: {
    padding: 8,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#374151',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
  },
  progressText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#374151',
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
    backgroundColor: '#6366F1',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  activeTabText: {
    color: '#FFFFFF',
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
    color: '#EF4444',
    textAlign: 'center',
    marginVertical: 16,
  },
  noQuestionsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  noQuestionsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#F9FAFB',
    marginTop: 16,
    marginBottom: 8,
  },
  noQuestionsText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
});