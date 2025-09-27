/**
 * ElementCard Component Tests
 * Tests element card display and interaction using React Native Testing Library
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ElementCard } from '../../src/components/ElementCard';
import { renderWithProviders, mockNavigation } from '../../src/test/testUtils';
import { WorldElement } from '../../src/types/models';

// * Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate
  })
}));

// * Mock element data
const mockElement: WorldElement = {
  id: 'element-1',
  projectId: 'project-1',
  type: 'character',
  name: 'Aragorn',
  description: 'Ranger of the North, heir to the throne of Gondor',
  category: 'hero',
  tags: ['ranger', 'king', 'hero'],
  imageUrl: null,
  answers: {},
  relationships: [],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-15T00:00:00Z',
  completionPercentage: 75
};

describe('ElementCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Display', () => {
    it('renders element name', () => {
      const { getByText } = renderWithProviders(
        <ElementCard element={mockElement} />
      );

      expect(getByText('Aragorn')).toBeTruthy();
    });

    it('renders element description', () => {
      const { getByText } = renderWithProviders(
        <ElementCard element={mockElement} />
      );

      expect(getByText('Ranger of the North, heir to the throne of Gondor')).toBeTruthy();
    });

    it('displays element type badge', () => {
      const { getByText } = renderWithProviders(
        <ElementCard element={mockElement} />
      );

      expect(getByText('Character')).toBeTruthy();
    });

    it('displays category when available', () => {
      const { getByText } = renderWithProviders(
        <ElementCard element={mockElement} />
      );

      expect(getByText('hero')).toBeTruthy();
    });

    it('displays tags when available', () => {
      const { getByText } = renderWithProviders(
        <ElementCard element={mockElement} />
      );

      expect(getByText('ranger')).toBeTruthy();
      expect(getByText('king')).toBeTruthy();
    });

    it('truncates long descriptions', () => {
      const longDescElement = {
        ...mockElement,
        description: 'A'.repeat(200)
      };

      const { getByText } = renderWithProviders(
        <ElementCard element={longDescElement} />
      );

      // * Should truncate and add ellipsis
      expect(getByText(/\.\.\.$/)).toBeTruthy();
    });

    it('handles missing description gracefully', () => {
      const elementWithoutDesc = { ...mockElement, description: null };
      const { queryByText } = renderWithProviders(
        <ElementCard element={elementWithoutDesc} />
      );

      expect(queryByText('Ranger of the North')).toBeNull();
    });
  });

  describe('Element Type Display', () => {
    const elementTypes = [
      'character',
      'location',
      'item',
      'event',
      'organization',
      'creature',
      'magic',
      'culture'
    ];

    elementTypes.forEach(type => {
      it(`displays correct icon and color for ${type}`, () => {
        const element = { ...mockElement, type };
        const { getByTestId, getByText } = renderWithProviders(
          <ElementCard element={element} />
        );

        const typeIcon = getByTestId(`${type}-icon`);
        expect(typeIcon).toBeTruthy();

        const typeBadge = getByText(type.charAt(0).toUpperCase() + type.slice(1));
        expect(typeBadge).toBeTruthy();
      });
    });
  });

  describe('Navigation', () => {
    it('navigates to element detail on press', () => {
      const { getByTestId } = renderWithProviders(
        <ElementCard element={mockElement} />
      );

      const card = getByTestId('element-card');
      fireEvent.press(card);

      expect(mockNavigate).toHaveBeenCalledWith('Element', {
        elementId: 'element-1',
        projectId: 'project-1'
      });
    });

    it('handles onPress callback when provided', () => {
      const onPress = jest.fn();
      const { getByTestId } = renderWithProviders(
        <ElementCard element={mockElement} onPress={onPress} />
      );

      const card = getByTestId('element-card');
      fireEvent.press(card);

      expect(onPress).toHaveBeenCalledWith(mockElement);
    });
  });

  describe('Edit and Delete Actions', () => {
    it('shows edit button when onEdit provided', () => {
      const onEdit = jest.fn();
      const { getByTestId } = renderWithProviders(
        <ElementCard element={mockElement} onEdit={onEdit} />
      );

      expect(getByTestId('edit-element-button')).toBeTruthy();
    });

    it('calls onEdit when edit button pressed', () => {
      const onEdit = jest.fn();
      const { getByTestId } = renderWithProviders(
        <ElementCard element={mockElement} onEdit={onEdit} />
      );

      const editButton = getByTestId('edit-element-button');
      fireEvent.press(editButton);

      expect(onEdit).toHaveBeenCalledWith(mockElement);
      expect(mockNavigate).not.toHaveBeenCalled(); // Edit should not navigate
    });

    it('shows delete button when onDelete provided', () => {
      const onDelete = jest.fn();
      const { getByTestId } = renderWithProviders(
        <ElementCard element={mockElement} onDelete={onDelete} />
      );

      expect(getByTestId('delete-element-button')).toBeTruthy();
    });

    it('shows confirmation before deleting', async () => {
      const onDelete = jest.fn();
      const { getByTestId, getByText } = renderWithProviders(
        <ElementCard element={mockElement} onDelete={onDelete} />
      );

      const deleteButton = getByTestId('delete-element-button');
      fireEvent.press(deleteButton);

      await waitFor(() => {
        expect(getByText(/Delete.*Aragorn/i)).toBeTruthy();
      });
    });

    it('calls onDelete after confirmation', async () => {
      const onDelete = jest.fn();
      const { getByTestId, getByText } = renderWithProviders(
        <ElementCard element={mockElement} onDelete={onDelete} />
      );

      const deleteButton = getByTestId('delete-element-button');
      fireEvent.press(deleteButton);

      const confirmButton = getByText('Delete');
      fireEvent.press(confirmButton);

      await waitFor(() => {
        expect(onDelete).toHaveBeenCalledWith(mockElement.id);
      });
    });
  });

  describe('Image Display', () => {
    it('displays element image when available', () => {
      const elementWithImage = {
        ...mockElement,
        imageUrl: 'https://example.com/aragorn.jpg'
      };

      const { getByTestId } = renderWithProviders(
        <ElementCard element={elementWithImage} />
      );

      const image = getByTestId('element-image');
      expect(image.props.source).toEqual({ uri: 'https://example.com/aragorn.jpg' });
    });

    it('shows type icon when no image', () => {
      const { getByTestId } = renderWithProviders(
        <ElementCard element={mockElement} />
      );

      const icon = getByTestId('character-icon');
      expect(icon).toBeTruthy();
    });

    it('handles image loading errors', async () => {
      const elementWithBadImage = {
        ...mockElement,
        imageUrl: 'https://invalid-url.com/404.jpg'
      };

      const { getByTestId } = renderWithProviders(
        <ElementCard element={elementWithBadImage} />
      );

      const image = getByTestId('element-image');
      fireEvent(image, 'onError');

      await waitFor(() => {
        expect(getByTestId('character-icon')).toBeTruthy();
      });
    });
  });

  describe('Completion Display', () => {
    it('shows completion percentage', () => {
      const { getByText } = renderWithProviders(
        <ElementCard element={mockElement} />
      );

      expect(getByText('75% Complete')).toBeTruthy();
    });

    it('shows completion progress bar', () => {
      const { getByTestId } = renderWithProviders(
        <ElementCard element={mockElement} />
      );

      const progressBar = getByTestId('completion-progress');
      expect(progressBar.props.style).toEqual(
        expect.objectContaining({ width: '75%' })
      );
    });

    it('shows complete badge when 100%', () => {
      const completeElement = { ...mockElement, completionPercentage: 100 };
      const { getByText } = renderWithProviders(
        <ElementCard element={completeElement} />
      );

      expect(getByText('Complete')).toBeTruthy();
    });

    it('handles undefined completion percentage', () => {
      const elementNoCompletion = { ...mockElement, completionPercentage: undefined };
      const { getByText } = renderWithProviders(
        <ElementCard element={elementNoCompletion} />
      );

      expect(getByText('0% Complete')).toBeTruthy();
    });
  });

  describe('Relationships Display', () => {
    it('shows relationship count when available', () => {
      const elementWithRelations = {
        ...mockElement,
        relationships: [
          { id: '1', type: 'friend', targetId: '2', targetName: 'Legolas' },
          { id: '2', type: 'friend', targetId: '3', targetName: 'Gimli' }
        ]
      };

      const { getByText } = renderWithProviders(
        <ElementCard element={elementWithRelations} />
      );

      expect(getByText('2 Relationships')).toBeTruthy();
    });

    it('does not show relationships when none exist', () => {
      const { queryByText } = renderWithProviders(
        <ElementCard element={mockElement} />
      );

      expect(queryByText(/Relationships/)).toBeNull();
    });
  });

  describe('Compact Mode', () => {
    it('renders in compact mode', () => {
      const { getByTestId, queryByText } = renderWithProviders(
        <ElementCard element={mockElement} compact />
      );

      const card = getByTestId('element-card');
      expect(card).toBeTruthy();

      // * Description hidden in compact mode
      expect(queryByText('Ranger of the North')).toBeNull();
    });

    it('shows only essential info in compact mode', () => {
      const { getByText, queryByText } = renderWithProviders(
        <ElementCard element={mockElement} compact />
      );

      expect(getByText('Aragorn')).toBeTruthy();
      expect(getByText('Character')).toBeTruthy();
      expect(queryByText('ranger')).toBeNull(); // Tags hidden
    });
  });

  describe('Selection Mode', () => {
    it('shows checkbox in selection mode', () => {
      const { getByTestId } = renderWithProviders(
        <ElementCard
          element={mockElement}
          selectionMode
        />
      );

      expect(getByTestId('element-checkbox')).toBeTruthy();
    });

    it('toggles selection on checkbox press', () => {
      const onSelectionChange = jest.fn();
      const { getByTestId } = renderWithProviders(
        <ElementCard
          element={mockElement}
          selectionMode
          onSelectionChange={onSelectionChange}
        />
      );

      const checkbox = getByTestId('element-checkbox');
      fireEvent.press(checkbox);

      expect(onSelectionChange).toHaveBeenCalledWith(mockElement.id, true);
    });

    it('shows selected state', () => {
      const { getByTestId } = renderWithProviders(
        <ElementCard
          element={mockElement}
          selectionMode
          isSelected
        />
      );

      const card = getByTestId('element-card');
      expect(card.props.style).toEqual(
        expect.objectContaining({ borderWidth: expect.any(Number) })
      );
    });

    it('disables navigation in selection mode', () => {
      const { getByTestId } = renderWithProviders(
        <ElementCard
          element={mockElement}
          selectionMode
        />
      );

      const card = getByTestId('element-card');
      fireEvent.press(card);

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Loading States', () => {
    it('shows skeleton loader when loading', () => {
      const { getByTestId } = renderWithProviders(
        <ElementCard element={mockElement} isLoading />
      );

      expect(getByTestId('element-card-skeleton')).toBeTruthy();
    });

    it('hides content when loading', () => {
      const { queryByText } = renderWithProviders(
        <ElementCard element={mockElement} isLoading />
      );

      expect(queryByText('Aragorn')).toBeNull();
    });
  });

  describe('Accessibility', () => {
    it('has proper accessibility labels', () => {
      const { getByTestId } = renderWithProviders(
        <ElementCard element={mockElement} />
      );

      const card = getByTestId('element-card');
      expect(card.props.accessibilityLabel).toBe(
        'Character: Aragorn, 75% complete'
      );
      expect(card.props.accessibilityRole).toBe('button');
    });

    it('indicates disabled state for accessibility', () => {
      const { getByTestId } = renderWithProviders(
        <ElementCard element={mockElement} disabled />
      );

      const card = getByTestId('element-card');
      expect(card.props.accessibilityState?.disabled).toBe(true);
    });

    it('announces selection state', () => {
      const { getByTestId } = renderWithProviders(
        <ElementCard
          element={mockElement}
          selectionMode
          isSelected
        />
      );

      const card = getByTestId('element-card');
      expect(card.props.accessibilityState?.selected).toBe(true);
    });
  });

  describe('Favoriting', () => {
    it('shows favorite button when onFavorite provided', () => {
      const onFavorite = jest.fn();
      const { getByTestId } = renderWithProviders(
        <ElementCard element={mockElement} onFavorite={onFavorite} />
      );

      expect(getByTestId('favorite-button')).toBeTruthy();
    });

    it('toggles favorite state', () => {
      const onFavorite = jest.fn();
      const { getByTestId } = renderWithProviders(
        <ElementCard
          element={mockElement}
          onFavorite={onFavorite}
          isFavorite={false}
        />
      );

      const favoriteButton = getByTestId('favorite-button');
      fireEvent.press(favoriteButton);

      expect(onFavorite).toHaveBeenCalledWith(mockElement.id, true);
    });

    it('shows filled star when favorited', () => {
      const { getByTestId } = renderWithProviders(
        <ElementCard
          element={mockElement}
          onFavorite={() => {}}
          isFavorite={true}
        />
      );

      const favoriteIcon = getByTestId('favorite-icon-filled');
      expect(favoriteIcon).toBeTruthy();
    });
  });

  describe('Error States', () => {
    it('handles missing required element data', () => {
      const invalidElement = { id: '1', name: '', type: 'character' } as WorldElement;
      const { getByText } = renderWithProviders(
        <ElementCard element={invalidElement} />
      );

      expect(getByText('Unnamed Element')).toBeTruthy();
    });

    it('displays error state when provided', () => {
      const { getByText } = renderWithProviders(
        <ElementCard
          element={mockElement}
          error="Failed to load element"
        />
      );

      expect(getByText('Failed to load element')).toBeTruthy();
    });
  });
});