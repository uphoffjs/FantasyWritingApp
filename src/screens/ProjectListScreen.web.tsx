/**
 * Project List Screen - Web Version
 * Displays all user projects with create/edit/delete functionality
 * Uses HTML elements and Tailwind for proper web rendering
 */

import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '../navigation/types';
import { useWorldbuildingStore } from '../store/worldbuildingStore';

export function ProjectListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { projects, createProject, deleteProject } = useWorldbuildingStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');

  console.log('[ProjectListScreen.web] Component rendered, projects count:', projects.length);
  console.log('[ProjectListScreen.web] Store functions:', { createProject: !!createProject, deleteProject: !!deleteProject });

  const handleCreateProject = () => {
    console.log('[ProjectListScreen.web] handleCreateProject called');
    console.log('[ProjectListScreen.web] Project name:', newProjectName);
    console.log('[ProjectListScreen.web] Project description:', newProjectDescription);
    
    if (!newProjectName.trim()) {
      console.log('[ProjectListScreen.web] Empty project name, showing alert');
      alert('Please enter a project name');
      return;
    }

    try {
      console.log('[ProjectListScreen.web] Calling createProject function...');
      const result = createProject(newProjectName, newProjectDescription);
      console.log('[ProjectListScreen.web] createProject result:', result);
      
      console.log('[ProjectListScreen.web] Clearing form fields...');
      setNewProjectName('');
      setNewProjectDescription('');
      setShowCreateModal(false);
      console.log('[ProjectListScreen.web] Form cleared and modal hidden');
    } catch (error) {
      console.error('[ProjectListScreen.web] Failed to create project:', error);
      alert('Failed to create project. Please try again.');
    }
  };

  const handleDeleteProject = (projectId: string, projectName: string) => {
    console.log('[ProjectListScreen.web] handleDeleteProject called for:', projectId, projectName);
    if (window.confirm(`Are you sure you want to delete "${projectName}"? This action cannot be undone.`)) {
      console.log('[ProjectListScreen.web] Calling deleteProject...');
      deleteProject(projectId);
      console.log('[ProjectListScreen.web] deleteProject called');
    }
  };

  const handleNewProjectClick = () => {
    console.log('[ProjectListScreen.web] New Project button clicked');
    console.log('[ProjectListScreen.web] Current showCreateModal state:', showCreateModal);
    setShowCreateModal(!showCreateModal);
    console.log('[ProjectListScreen.web] showCreateModal toggled to:', !showCreateModal);
  };

  return (
    <div className="flex-1 bg-parchment-100 min-h-screen">
      <div className="flex-1 p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 mt-2">
          <h1 className="text-3xl font-bold text-metals-gold font-cinzel">
            My Projects
          </h1>
          <button
            onClick={handleNewProjectClick}
            className="bg-might hover:bg-dragonfire transition-colors rounded-lg px-4 py-2 flex items-center text-white"
            data-cy="new-project-button"
          >
            <span className="text-white font-semibold font-cinzel">
              + New Project
            </span>
          </button>
        </div>

        {/* Create Project Form */}
        {showCreateModal && (
          <div className="bg-parchment-300 rounded-lg p-4 mb-6 border border-parchment-400">
            <h2 className="text-lg font-bold text-ink-primary mb-3 font-cinzel">
              Create New Project
            </h2>
            <div className="mb-3">
              <label className="text-sm text-ink-secondary mb-1 block">Project Name</label>
              <input
                className="w-full bg-parchment-100 rounded-lg px-3 py-2 text-ink-primary border border-parchment-400 focus:outline-none focus:border-might"
                placeholder="Enter project name..."
                value={newProjectName}
                onChange={(e) => {
                  console.log('[ProjectListScreen.web] Project name changed to:', e.target.value);
                  setNewProjectName(e.target.value);
                }}
                data-cy="project-name-input"
              />
            </div>
            <div className="mb-4">
              <label className="text-sm text-ink-secondary mb-1 block">Description (optional)</label>
              <textarea
                className="w-full bg-parchment-100 rounded-lg px-3 py-2 text-ink-primary border border-parchment-400 min-h-[80px] focus:outline-none focus:border-might resize-none"
                placeholder="Enter project description..."
                value={newProjectDescription}
                onChange={(e) => {
                  console.log('[ProjectListScreen.web] Project description changed to:', e.target.value);
                  setNewProjectDescription(e.target.value);
                }}
                data-cy="project-description-input"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  console.log('[ProjectListScreen.web] Cancel button clicked');
                  setShowCreateModal(false);
                  setNewProjectName('');
                  setNewProjectDescription('');
                }}
                className="bg-parchment-200 hover:bg-parchment-400 transition-colors rounded-lg px-4 py-2"
                data-cy="cancel-project-button"
              >
                <span className="text-ink-secondary font-semibold">Cancel</span>
              </button>
              <button
                onClick={handleCreateProject}
                className="bg-might hover:bg-dragonfire transition-colors rounded-lg px-4 py-2"
                data-cy="create-project-button"
              >
                <span className="text-white font-semibold">Create</span>
              </button>
            </div>
          </div>
        )}

        {/* Project List */}
        {projects.length === 0 ? (
          <div className="flex-1 flex flex-col justify-center items-center py-20">
            <svg className="w-16 h-16 text-metals-gold mb-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z"/>
            </svg>
            <h2 className="text-xl text-ink-secondary mt-4 font-cinzel">
              No projects yet
            </h2>
            <p className="text-sm text-ink-secondary mt-2">
              Create your first project to get started
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {projects.map((item) => (
              <div
                key={item.id}
                className="bg-parchment-200 hover:bg-parchment-300 transition-colors rounded-lg p-4 border border-parchment-400 cursor-pointer"
                onClick={() => {
                  console.log('[ProjectListScreen.web] Project clicked:', item.id);
                  navigation.navigate('Project', { projectId: item.id });
                }}
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xl font-bold text-ink-primary flex-1 font-cinzel">
                    {item.name}
                  </h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteProject(item.id, item.name);
                    }}
                    className="p-2 hover:bg-parchment-400 rounded transition-colors"
                    data-cy="delete-project-button"
                  >
                    <svg className="w-5 h-5 text-dragonfire" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                    </svg>
                  </button>
                </div>
                {item.description && (
                  <p className="text-sm text-ink-secondary mb-3 leading-5">
                    {item.description}
                  </p>
                )}
                <div className="flex justify-between">
                  <span className="text-xs text-ink-secondary">
                    {item.elements?.length || 0} elements
                  </span>
                  <span className="text-xs text-ink-secondary">
                    Created: {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}