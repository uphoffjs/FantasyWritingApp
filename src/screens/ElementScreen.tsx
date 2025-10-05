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
          <Icon name="error-outline" size={64} color=fantasyTomeColors.semantic.error />
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

  const handleSelectTemplate = (_template: any) => {
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
            <Icon name="arrow-back" size={24} color=fantasyTomeColors.ink.black />
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
            <Icon name="delete" size={24} color=fantasyTomeColors.semantic.error />
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
    fontSize: 20,
    fontWeight: 'bold',
    color: fantasyTomeColors.ink.black,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: fantasyTomeColors.ink.light,
  },
  deleteButton: {
    padding: 8,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: fantasyTomeColors.ink.brown,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: fantasyTomeColors.semantic.success,
  },
  progressText: {
    fontSize: 12,
    color: fantasyTomeColors.ink.light,
    textAlign: 'right',
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
  noQuestionsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  noQuestionsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: fantasyTomeColors.ink.black,
    marginTop: 16,
    marginBottom: 8,
  },
  noQuestionsText: {
    fontSize: 14,
    color: fantasyTomeColors.ink.light,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
});