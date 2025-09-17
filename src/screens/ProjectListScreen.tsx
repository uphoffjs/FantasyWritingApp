/**
 * Project List Screen
 * Displays all user projects with create/edit/delete functionality
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '../navigation/types';
import { useWorldbuildingStore } from '../store/worldbuildingStore';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { ProjectList } from '../components/ProjectList';
import { CreateProjectModal } from '../components/CreateProjectModal';
import { GlobalSearch } from '../components/GlobalSearch';

export function ProjectListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { projects, deleteProject } = useWorldbuildingStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);

  const handleProjectSelect = (project: any) => {
    navigation.navigate('Project', { projectId: project.id });
  };

  const handleProjectDelete = (projectId: string) => {
    deleteProject(projectId);
  };

  const handleCreateProject = () => {
    setShowCreateModal(true);
  };

  const handleProjectCreated = (projectId: string) => {
    navigation.navigate('Project', { projectId });
  };

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-parchment-100"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row justify-between items-center p-4 pt-6">
          <Text className="text-3xl font-bold text-metals-gold font-cinzel">
            My Projects
          </Text>
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => setShowGlobalSearch(true)}
              className="bg-parchment-200 rounded-lg p-2 border border-parchment-400"
            >
              <Icon name="search" size={20} color="#C9A94F" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleCreateProject}
              className="bg-might rounded-lg px-4 py-2 flex-row items-center"
            >
              <Icon name="add" size={20} color="white" />
              <Text className="text-white font-semibold ml-1 font-cinzel">
                New Project
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Project List */}
        <ProjectList
          projects={projects}
          onProjectSelect={handleProjectSelect}
          onProjectDelete={handleProjectDelete}
          onCreateProject={handleCreateProject}
          loading={false}
        />

        {/* Create Project Modal */}
        <CreateProjectModal
          visible={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onProjectCreated={handleProjectCreated}
        />

        {/* Global Search Modal */}
        <GlobalSearch
          visible={showGlobalSearch}
          onClose={() => setShowGlobalSearch(false)}
        />
      </View>
    </KeyboardAvoidingView>
  );
}