/* eslint-disable @typescript-eslint/no-explicit-any */
// * Project screen (web) requires flexible typing for navigation params and route state

/**
 * Project Screen - Web Version
 * Displays project details and list of elements
 * Uses HTML elements and Tailwind for proper web rendering
 */

import React, { useState } from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RootStackScreenProps, NavigationProp } from '../navigation/types';
import { useWorldbuildingStore } from '../store/worldbuildingStore';
// eslint-disable-next-line no-restricted-imports
import { ElementBrowser } from '../components/ElementBrowser.web';
// eslint-disable-next-line no-restricted-imports
import { CreateElementModal } from '../components/CreateElementModal.web';
// eslint-disable-next-line no-restricted-imports
import { RelationshipManager } from '../components/RelationshipManager.web';
import { getTestProps } from '../utils/react-native-web-polyfills';

export function ProjectScreen() {
  const route = useRoute<RootStackScreenProps<'Project'>['route']>();
  const navigation = useNavigation<NavigationProp>();
  const { projects } = useWorldbuildingStore();
  const [activeTab, setActiveTab] = useState<'elements' | 'relationships'>('elements');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const project = projects.find(p => p.id === route.params.projectId);

  if (!project) {
    return (
      <div className="flex-1 bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11 15h2v2h-2zm0-8h2v6h-2zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
          </svg>
          <h2 className="text-xl text-white mb-4">Project not found</h2>
          <button
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            onClick={() => navigation.goBack()}
            {...getTestProps('back-to-projects-button')}
          >
            Back to Projects
          </button>
        </div>
      </div>
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

  // Calculate stats
  const completeElements = project.elements?.filter(e => e.completionPercentage === 100).length || 0;
  const averageProgress = project.elements?.length
    ? Math.round(project.elements.reduce((sum, e) => sum + e.completionPercentage, 0) / project.elements.length)
    : 0;

  return (
    <div className="flex-1 bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="px-4 pt-6 pb-4">
          {/* Header Content */}
          <div className="flex items-center mb-4">
            <button
              onClick={() => navigation.goBack()}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors mr-3"
              {...getTestProps('back-button')}
            >
              <svg className="w-6 h-6 text-gray-100" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
              </svg>
            </button>
            <div className="flex-1 mr-3">
              <h1 className="text-2xl font-bold text-gray-100 truncate">{project.name}</h1>
              {project.description && (
                <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                  {project.description}
                </p>
              )}
            </div>
            <button
              onClick={handleCreateElement}
              className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors"
              {...getTestProps('add-element-button')}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
            </button>
          </div>

          {/* Project Stats */}
          <div className="flex justify-around bg-gray-900 rounded-lg p-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-400">{project.elements?.length || 0}</div>
              <div className="text-xs text-gray-500">Elements</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{completeElements}</div>
              <div className="text-xs text-gray-500">Complete</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">{averageProgress}%</div>
              <div className="text-xs text-gray-500">Progress</div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex mt-4 border-b border-gray-700">
            <button
              className={`flex-1 pb-3 px-4 transition-colors ${
                activeTab === 'elements'
                  ? 'text-indigo-400 border-b-2 border-indigo-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('elements')}
              {...getTestProps('elements-tab')}
            >
              Elements
            </button>
            <button
              className={`flex-1 pb-3 px-4 transition-colors ${
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

      {/* Tab Content */}
      <div className="flex-1 p-4">
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
      </div>

      {/* Create Element Modal */}
      <CreateElementModal
        visible={showCreateModal}
        projectId={project.id}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleElementCreated}
      />
    </div>
  );
}