/* eslint-disable @typescript-eslint/no-explicit-any */
// * Element screen (web) requires flexible typing for navigation params and route state

/**
 * Element Screen - Web Version
 * Displays element details and questionnaire
 * Uses HTML elements and Tailwind for web rendering
 */

import React, { useState, useEffect } from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RootStackScreenProps, NavigationProp } from '../navigation/types';
// eslint-disable-next-line no-restricted-imports
import { ElementEditor } from '../components/ElementEditor.web';
// eslint-disable-next-line no-restricted-imports
import { RelationshipManager } from '../components/RelationshipManager.web';
// eslint-disable-next-line no-restricted-imports
import { TemplateSelector } from '../components/TemplateSelector.web';
import { useWorldbuildingStore } from '../store/worldbuildingStore';
import { getCategoryIcon } from '../utils/categoryMapping';
import { getTestProps } from '../utils/react-native-web-polyfills';

export function ElementScreen() {
  const route = useRoute<RootStackScreenProps<'Element'>['route']>();
  const navigation = useNavigation<NavigationProp>();
  const { projects, deleteElement } = useWorldbuildingStore();
  const [activeTab, setActiveTab] = useState<'editor' | 'relationships'>('editor');
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);

  const project = projects.find(p => p.id === route.params.projectId);
  const element = project?.elements?.find(e => e.id === route.params.elementId);

  useEffect(() => {
    // * If element doesn't have questions, show template selector
    if (element && (!element.questions || element.questions.length === 0)) {
      setShowTemplateSelector(true);
    }
  }, [element]);

  if (!project || !element) {
    return (
      <div className="flex-1 bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11 15h2v2h-2zm0-8h2v6h-2zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
          </svg>
          <h2 className="text-xl text-white mb-4">
            {!project ? 'Project not found' : 'Element not found'}
          </h2>
          <button
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            onClick={() => navigation.goBack()}
            {...getTestProps('back-button')}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const handleDeleteElement = () => {
    // eslint-disable-next-line no-alert -- User confirmation for destructive action is appropriate
    if (confirm(`Are you sure you want to delete "${element.name}"? This action cannot be undone.`)) {
      deleteElement(project.id, element.id);
      navigation.goBack();
    }
  };

  const handleSelectTemplate = (_template: any) => {
    // * Template will be applied to the element through the store
    setShowTemplateSelector(false);
  };

  return (
    <div className="flex-1 bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigation.goBack()}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                {...getTestProps('back-button')}
              >
                <svg className="w-6 h-6 text-gray-100" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
                </svg>
              </button>
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{getCategoryIcon(element.category)}</span>
                <div>
                  <h1 className="text-xl font-bold text-gray-100">{element.name}</h1>
                  <p className="text-sm text-gray-400">
                    {element.category} • {element.completionPercentage || 0}% complete
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={handleDeleteElement}
              className="p-2 text-red-400 hover:text-red-300 hover:bg-gray-700 rounded-lg transition-all"
              {...getTestProps('delete-element-button')}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
              </svg>
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Progress</span>
              <span>{element.completionPercentage || 0}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
                style={{ width: `${element.completionPercentage || 0}%` }}
              />
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex mt-4 border-b border-gray-700 -mb-px">
            <button
              className={`pb-3 px-4 transition-colors ${
                activeTab === 'editor'
                  ? 'text-indigo-400 border-b-2 border-indigo-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('editor')}
              {...getTestProps('editor-tab')}
            >
              Details & Questions
            </button>
            <button
              className={`pb-3 px-4 transition-colors ${
                activeTab === 'relationships'
                  ? 'text-indigo-400 border-b-2 border-indigo-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('relationships')}
              {...getTestProps('relationships-tab')}
            >
              Relationships
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        {activeTab === 'editor' ? (
          <ElementEditor
            element={element}
            projectId={project.id}
            autoSave={true}
          />
        ) : (
          <RelationshipManager
            elements={project.elements || []}
            projectId={project.id}
          />
        )}
      </div>

      {/* Template Selector Modal */}
      {showTemplateSelector && (
        <TemplateSelector
          visible={showTemplateSelector}
          category={element.category}
          onSelectTemplate={handleSelectTemplate}
          onClose={() => setShowTemplateSelector(false)}
        />
      )}
    </div>
  );
}

export default ElementScreen;