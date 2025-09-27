/**
 * ProjectCard Component Tests
 * Tests project card display and interaction using React Native Testing Library
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ProjectCard } from '../../src/components/ProjectCard';
import { renderWithProviders, mockNavigation } from '../../src/test/testUtils';
import { Project } from '../../src/types/models';

// * Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate
  })
}));

// * Mock project data
const mockProject: Project = {
  id: 'project-1',
  name: 'Test Project',
  description: 'A test project description',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-15T00:00:00Z',
  elementCount: 25,
  lastElement: 'Dragon Character',
  genre: 'Fantasy',
  status: 'active',
  coverImage: null,
  tags: ['fantasy', 'adventure']
};

describe('ProjectCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Display', () => {
    it('renders project name', () => {
      const { getByText } = renderWithProviders(
        <ProjectCard project={mockProject} />
      );

      expect(getByText('Test Project')).toBeTruthy();
    });

    it('renders project description', () => {
      const { getByText } = renderWithProviders(
        <ProjectCard project={mockProject} />
      );

      expect(getByText('A test project description')).toBeTruthy();
    });

    it('displays element count', () => {
      const { getByText } = renderWithProviders(
        <ProjectCard project={mockProject} />
      );

      expect(getByText('25 elements')).toBeTruthy();
    });

    it('displays genre when available', () => {
      const { getByText } = renderWithProviders(
        <ProjectCard project={mockProject} />
      );

      expect(getByText('Fantasy')).toBeTruthy();
    });

    it('displays tags when available', () => {
      const { getByText } = renderWithProviders(
        <ProjectCard project={mockProject} />
      );

      expect(getByText('fantasy')).toBeTruthy();
      expect(getByText('adventure')).toBeTruthy();
    });

    it('handles missing description gracefully', () => {
      const projectWithoutDesc = { ...mockProject, description: null };
      const { queryByText } = renderWithProviders(
        <ProjectCard project={projectWithoutDesc} />
      );

      expect(queryByText('A test project description')).toBeNull();
    });
  });

  describe('Navigation', () => {
    it('navigates to project on press', () => {
      const { getByTestId } = renderWithProviders(
        <ProjectCard project={mockProject} />
      );

      const card = getByTestId('project-card');
      fireEvent.press(card);

      expect(mockNavigate).toHaveBeenCalledWith('Project', {
        projectId: 'project-1'
      });
    });

    it('handles onPress callback when provided', () => {
      const onPress = jest.fn();
      const { getByTestId } = renderWithProviders(
        <ProjectCard project={mockProject} onPress={onPress} />
      );

      const card = getByTestId('project-card');
      fireEvent.press(card);

      expect(onPress).toHaveBeenCalledWith(mockProject);
    });

    it('calls both navigation and onPress when both provided', () => {
      const onPress = jest.fn();
      const { getByTestId } = renderWithProviders(
        <ProjectCard project={mockProject} onPress={onPress} />
      );

      const card = getByTestId('project-card');
      fireEvent.press(card);

      expect(mockNavigate).toHaveBeenCalled();
      expect(onPress).toHaveBeenCalledWith(mockProject);
    });
  });

  describe('Edit and Delete Actions', () => {
    it('shows edit button when onEdit provided', () => {
      const onEdit = jest.fn();
      const { getByTestId } = renderWithProviders(
        <ProjectCard project={mockProject} onEdit={onEdit} />
      );

      expect(getByTestId('edit-project-button')).toBeTruthy();
    });

    it('calls onEdit when edit button pressed', () => {
      const onEdit = jest.fn();
      const { getByTestId } = renderWithProviders(
        <ProjectCard project={mockProject} onEdit={onEdit} />
      );

      const editButton = getByTestId('edit-project-button');
      fireEvent.press(editButton);

      expect(onEdit).toHaveBeenCalledWith(mockProject);
    });

    it('shows delete button when onDelete provided', () => {
      const onDelete = jest.fn();
      const { getByTestId } = renderWithProviders(
        <ProjectCard project={mockProject} onDelete={onDelete} />
      );

      expect(getByTestId('delete-project-button')).toBeTruthy();
    });

    it('shows confirmation before deleting', async () => {
      const onDelete = jest.fn();
      const { getByTestId, getByText } = renderWithProviders(
        <ProjectCard project={mockProject} onDelete={onDelete} />
      );

      const deleteButton = getByTestId('delete-project-button');
      fireEvent.press(deleteButton);

      // * Should show confirmation dialog
      await waitFor(() => {
        expect(getByText(/Are you sure/i)).toBeTruthy();
      });
    });

    it('calls onDelete after confirmation', async () => {
      const onDelete = jest.fn();
      const { getByTestId, getByText } = renderWithProviders(
        <ProjectCard project={mockProject} onDelete={onDelete} />
      );

      const deleteButton = getByTestId('delete-project-button');
      fireEvent.press(deleteButton);

      // * Confirm deletion
      const confirmButton = getByText('Delete');
      fireEvent.press(confirmButton);

      await waitFor(() => {
        expect(onDelete).toHaveBeenCalledWith(mockProject.id);
      });
    });

    it('cancels deletion when cancel pressed', async () => {
      const onDelete = jest.fn();
      const { getByTestId, getByText, queryByText } = renderWithProviders(
        <ProjectCard project={mockProject} onDelete={onDelete} />
      );

      const deleteButton = getByTestId('delete-project-button');
      fireEvent.press(deleteButton);

      // * Cancel deletion
      const cancelButton = getByText('Cancel');
      fireEvent.press(cancelButton);

      await waitFor(() => {
        expect(onDelete).not.toHaveBeenCalled();
        expect(queryByText(/Are you sure/i)).toBeNull();
      });
    });
  });

  describe('Cover Image Display', () => {
    it('displays cover image when available', () => {
      const projectWithImage = {
        ...mockProject,
        coverImage: 'https://example.com/image.jpg'
      };

      const { getByTestId } = renderWithProviders(
        <ProjectCard project={projectWithImage} />
      );

      const image = getByTestId('project-cover-image');
      expect(image.props.source).toEqual({ uri: 'https://example.com/image.jpg' });
    });

    it('shows placeholder when no cover image', () => {
      const { getByTestId } = renderWithProviders(
        <ProjectCard project={mockProject} />
      );

      const placeholder = getByTestId('project-image-placeholder');
      expect(placeholder).toBeTruthy();
    });

    it('handles image loading errors', async () => {
      const projectWithBadImage = {
        ...mockProject,
        coverImage: 'https://invalid-url.com/404.jpg'
      };

      const { getByTestId } = renderWithProviders(
        <ProjectCard project={projectWithBadImage} />
      );

      const image = getByTestId('project-cover-image');
      fireEvent(image, 'onError');

      await waitFor(() => {
        expect(getByTestId('project-image-placeholder')).toBeTruthy();
      });
    });
  });

  describe('Status Display', () => {
    it('shows active status indicator', () => {
      const { getByTestId } = renderWithProviders(
        <ProjectCard project={mockProject} />
      );

      const statusIndicator = getByTestId('status-indicator');
      expect(statusIndicator.props.style).toEqual(
        expect.objectContaining({ backgroundColor: expect.any(String) })
      );
    });

    it('shows archived status', () => {
      const archivedProject = { ...mockProject, status: 'archived' };
      const { getByText } = renderWithProviders(
        <ProjectCard project={archivedProject} />
      );

      expect(getByText('Archived')).toBeTruthy();
    });

    it('shows draft status', () => {
      const draftProject = { ...mockProject, status: 'draft' };
      const { getByText } = renderWithProviders(
        <ProjectCard project={draftProject} />
      );

      expect(getByText('Draft')).toBeTruthy();
    });
  });

  describe('Timestamps', () => {
    it('displays last updated time', () => {
      const { getByText } = renderWithProviders(
        <ProjectCard project={mockProject} />
      );

      // * Should show formatted date
      expect(getByText(/Updated/i)).toBeTruthy();
    });

    it('displays created date when showCreatedDate is true', () => {
      const { getByText } = renderWithProviders(
        <ProjectCard project={mockProject} showCreatedDate />
      );

      expect(getByText(/Created/i)).toBeTruthy();
    });

    it('formats dates correctly', () => {
      const recentProject = {
        ...mockProject,
        updatedAt: new Date().toISOString()
      };

      const { getByText } = renderWithProviders(
        <ProjectCard project={recentProject} />
      );

      // * Should show relative time for recent updates
      expect(getByText(/moments? ago|just now/i)).toBeTruthy();
    });
  });

  describe('Loading States', () => {
    it('shows skeleton loader when loading', () => {
      const { getByTestId } = renderWithProviders(
        <ProjectCard project={mockProject} isLoading />
      );

      expect(getByTestId('project-card-skeleton')).toBeTruthy();
    });

    it('hides content when loading', () => {
      const { queryByText } = renderWithProviders(
        <ProjectCard project={mockProject} isLoading />
      );

      expect(queryByText('Test Project')).toBeNull();
    });
  });

  describe('Selection Mode', () => {
    it('shows checkbox in selection mode', () => {
      const { getByTestId } = renderWithProviders(
        <ProjectCard
          project={mockProject}
          selectionMode
        />
      );

      expect(getByTestId('project-checkbox')).toBeTruthy();
    });

    it('toggles selection on checkbox press', () => {
      const onSelectionChange = jest.fn();
      const { getByTestId } = renderWithProviders(
        <ProjectCard
          project={mockProject}
          selectionMode
          onSelectionChange={onSelectionChange}
        />
      );

      const checkbox = getByTestId('project-checkbox');
      fireEvent.press(checkbox);

      expect(onSelectionChange).toHaveBeenCalledWith(mockProject.id, true);
    });

    it('shows selected state', () => {
      const { getByTestId } = renderWithProviders(
        <ProjectCard
          project={mockProject}
          selectionMode
          isSelected
        />
      );

      const checkbox = getByTestId('project-checkbox');
      expect(checkbox.props.value).toBe(true);
    });
  });

  describe('Compact Mode', () => {
    it('renders in compact mode', () => {
      const { getByTestId, queryByText } = renderWithProviders(
        <ProjectCard project={mockProject} compact />
      );

      const card = getByTestId('project-card');
      expect(card).toBeTruthy();

      // * Description might be hidden in compact mode
      expect(queryByText('A test project description')).toBeNull();
    });

    it('shows only essential info in compact mode', () => {
      const { getByText, queryByText } = renderWithProviders(
        <ProjectCard project={mockProject} compact />
      );

      expect(getByText('Test Project')).toBeTruthy();
      expect(getByText('25 elements')).toBeTruthy();
      expect(queryByText('fantasy')).toBeNull(); // Tags hidden
    });
  });

  describe('Accessibility', () => {
    it('has proper accessibility labels', () => {
      const { getByTestId } = renderWithProviders(
        <ProjectCard project={mockProject} />
      );

      const card = getByTestId('project-card');
      expect(card.props.accessibilityLabel).toBe(
        `Project: Test Project, 25 elements`
      );
      expect(card.props.accessibilityRole).toBe('button');
    });

    it('indicates disabled state for accessibility', () => {
      const { getByTestId } = renderWithProviders(
        <ProjectCard project={mockProject} disabled />
      );

      const card = getByTestId('project-card');
      expect(card.props.accessibilityState?.disabled).toBe(true);
    });

    it('announces selection state', () => {
      const { getByTestId } = renderWithProviders(
        <ProjectCard
          project={mockProject}
          selectionMode
          isSelected
        />
      );

      const card = getByTestId('project-card');
      expect(card.props.accessibilityState?.selected).toBe(true);
    });
  });

  describe('Error States', () => {
    it('handles missing required project data', () => {
      const invalidProject = { id: '1', name: '' } as Project;
      const { getByText } = renderWithProviders(
        <ProjectCard project={invalidProject} />
      );

      expect(getByText('Untitled Project')).toBeTruthy();
    });

    it('displays error state when provided', () => {
      const { getByText } = renderWithProviders(
        <ProjectCard
          project={mockProject}
          error="Failed to load project"
        />
      );

      expect(getByText('Failed to load project')).toBeTruthy();
    });
  });
});