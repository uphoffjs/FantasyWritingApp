/**
 * CreateElementModal Component Tests
 * Tests modal functionality for creating new elements using React Native Testing Library
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { CreateElementModal } from '../../src/components/CreateElementModal';
import { renderWithProviders, mockNavigation } from '../../src/test/test-utils';
import { ElementType } from '../../src/types/models';

// * Mock the worldbuilding store
jest.mock('../../src/store/worldbuildingStore', () => ({
  useWorldbuildingStore: () => ({
    addElement: jest.fn(),
    currentProject: { id: 'test-project-id', name: 'Test Project' },
    templates: {
      character: {
        type: 'character',
        name: 'Character',
        fields: [],
        questions: []
      }
    }
  })
}));

describe('CreateElementModal', () => {
  const defaultProps = {
    isVisible: true,
    onClose: jest.fn(),
    elementType: 'character' as ElementType,
    projectId: 'test-project-id'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Modal Display', () => {
    it('renders when visible', () => {
      const { getByText } = renderWithProviders(
        <CreateElementModal {...defaultProps} />
      );

      expect(getByText(/Create New Character/i)).toBeTruthy();
    });

    it('does not render when not visible', () => {
      const { queryByText } = renderWithProviders(
        <CreateElementModal {...defaultProps} isVisible={false} />
      );

      expect(queryByText(/Create New Character/i)).toBeNull();
    });

    it('displays correct title for different element types', () => {
      const types: ElementType[] = [
        'character',
        'location',
        'item',
        'event',
        'organization'
      ];

      types.forEach(type => {
        const { getByText, unmount } = renderWithProviders(
          <CreateElementModal {...defaultProps} elementType={type} />
        );

        const expectedTitle = `Create New ${type.charAt(0).toUpperCase() + type.slice(1)}`;
        expect(getByText(new RegExp(expectedTitle, 'i'))).toBeTruthy();
        unmount();
      });
    });
  });

  describe('Form Fields', () => {
    it('renders name input field', () => {
      const { getByTestId } = renderWithProviders(
        <CreateElementModal {...defaultProps} />
      );

      expect(getByTestId('element-name-input')).toBeTruthy();
    });

    it('renders description input field', () => {
      const { getByTestId } = renderWithProviders(
        <CreateElementModal {...defaultProps} />
      );

      expect(getByTestId('element-description-input')).toBeTruthy();
    });

    it('renders category selector for applicable types', () => {
      const { getByTestId } = renderWithProviders(
        <CreateElementModal {...defaultProps} elementType="character" />
      );

      expect(getByTestId('element-category-picker')).toBeTruthy();
    });

    it('updates name field on text input', () => {
      const { getByTestId } = renderWithProviders(
        <CreateElementModal {...defaultProps} />
      );

      const nameInput = getByTestId('element-name-input');
      fireEvent.changeText(nameInput, 'New Character Name');

      expect(nameInput.props.value).toBe('New Character Name');
    });

    it('updates description field on text input', () => {
      const { getByTestId } = renderWithProviders(
        <CreateElementModal {...defaultProps} />
      );

      const descInput = getByTestId('element-description-input');
      fireEvent.changeText(descInput, 'Character description');

      expect(descInput.props.value).toBe('Character description');
    });
  });

  describe('Form Validation', () => {
    it('disables create button when name is empty', () => {
      const { getByTestId } = renderWithProviders(
        <CreateElementModal {...defaultProps} />
      );

      const createButton = getByTestId('create-element-button');
      expect(createButton.props.accessibilityState?.disabled).toBe(true);
    });

    it('enables create button when name is provided', () => {
      const { getByTestId } = renderWithProviders(
        <CreateElementModal {...defaultProps} />
      );

      const nameInput = getByTestId('element-name-input');
      fireEvent.changeText(nameInput, 'Valid Name');

      const createButton = getByTestId('create-element-button');
      expect(createButton.props.accessibilityState?.disabled).toBe(false);
    });

    it('shows validation error for invalid name', async () => {
      const { getByTestId, getByText } = renderWithProviders(
        <CreateElementModal {...defaultProps} />
      );

      const nameInput = getByTestId('element-name-input');
      fireEvent.changeText(nameInput, '');

      const createButton = getByTestId('create-element-button');
      fireEvent.press(createButton);

      await waitFor(() => {
        expect(getByText(/Name is required/i)).toBeTruthy();
      });
    });

    it('validates name length limits', () => {
      const { getByTestId, queryByText } = renderWithProviders(
        <CreateElementModal {...defaultProps} />
      );

      const nameInput = getByTestId('element-name-input');
      const longName = 'a'.repeat(256); // Exceeds typical limit

      fireEvent.changeText(nameInput, longName);

      // * Check if validation message appears
      expect(queryByText(/Name is too long/i)).toBeTruthy();
    });
  });

  describe('Form Actions', () => {
    it('calls onClose when cancel button is pressed', () => {
      const onClose = jest.fn();
      const { getByText } = renderWithProviders(
        <CreateElementModal {...defaultProps} onClose={onClose} />
      );

      const cancelButton = getByText('Cancel');
      fireEvent.press(cancelButton);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('creates element and closes modal on successful submission', async () => {
      const onClose = jest.fn();
      const onCreate = jest.fn();

      const { getByTestId } = renderWithProviders(
        <CreateElementModal
          {...defaultProps}
          onClose={onClose}
          onCreate={onCreate}
        />
      );

      // * Fill in the form
      const nameInput = getByTestId('element-name-input');
      fireEvent.changeText(nameInput, 'New Character');

      const descInput = getByTestId('element-description-input');
      fireEvent.changeText(descInput, 'Character description');

      // * Submit the form
      const createButton = getByTestId('create-element-button');
      fireEvent.press(createButton);

      await waitFor(() => {
        expect(onCreate).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'New Character',
            description: 'Character description',
            type: 'character'
          })
        );
        expect(onClose).toHaveBeenCalled();
      });
    });

    it('resets form when modal is closed', () => {
      const { getByTestId, rerender } = renderWithProviders(
        <CreateElementModal {...defaultProps} />
      );

      // * Fill in the form
      const nameInput = getByTestId('element-name-input');
      fireEvent.changeText(nameInput, 'Test Name');

      // * Close and reopen modal
      rerender(<CreateElementModal {...defaultProps} isVisible={false} />);
      rerender(<CreateElementModal {...defaultProps} isVisible={true} />);

      // * Check form is reset
      const newNameInput = getByTestId('element-name-input');
      expect(newNameInput.props.value).toBe('');
    });
  });

  describe('Template Selection', () => {
    it('shows template options when available', () => {
      const { getByTestId } = renderWithProviders(
        <CreateElementModal {...defaultProps} />
      );

      expect(getByTestId('template-selector')).toBeTruthy();
    });

    it('updates form fields when template is selected', async () => {
      const { getByTestId } = renderWithProviders(
        <CreateElementModal {...defaultProps} />
      );

      const templatePicker = getByTestId('template-selector');
      fireEvent(templatePicker, 'onValueChange', 'hero-template');

      await waitFor(() => {
        // * Template should populate some fields
        const nameInput = getByTestId('element-name-input');
        expect(nameInput.props.placeholder).toBeTruthy();
      });
    });
  });

  describe('Loading States', () => {
    it('shows loading indicator during creation', async () => {
      const onCreate = jest.fn(() =>
        new Promise(resolve => setTimeout(resolve, 100))
      );

      const { getByTestId } = renderWithProviders(
        <CreateElementModal
          {...defaultProps}
          onCreate={onCreate}
        />
      );

      // * Fill and submit form
      const nameInput = getByTestId('element-name-input');
      fireEvent.changeText(nameInput, 'Test');

      const createButton = getByTestId('create-element-button');
      fireEvent.press(createButton);

      // * Check for loading state
      await waitFor(() => {
        expect(getByTestId('loading-indicator')).toBeTruthy();
      });
    });

    it('disables form during submission', async () => {
      const onCreate = jest.fn(() =>
        new Promise(resolve => setTimeout(resolve, 100))
      );

      const { getByTestId } = renderWithProviders(
        <CreateElementModal
          {...defaultProps}
          onCreate={onCreate}
        />
      );

      const nameInput = getByTestId('element-name-input');
      fireEvent.changeText(nameInput, 'Test');

      const createButton = getByTestId('create-element-button');
      fireEvent.press(createButton);

      // * Form should be disabled during submission
      expect(nameInput.props.editable).toBe(false);
      expect(createButton.props.accessibilityState?.disabled).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('displays error message on creation failure', async () => {
      const onCreate = jest.fn(() =>
        Promise.reject(new Error('Creation failed'))
      );

      const { getByTestId, getByText } = renderWithProviders(
        <CreateElementModal
          {...defaultProps}
          onCreate={onCreate}
        />
      );

      const nameInput = getByTestId('element-name-input');
      fireEvent.changeText(nameInput, 'Test');

      const createButton = getByTestId('create-element-button');
      fireEvent.press(createButton);

      await waitFor(() => {
        expect(getByText(/Creation failed/i)).toBeTruthy();
      });
    });

    it('allows retry after error', async () => {
      const onCreate = jest.fn()
        .mockRejectedValueOnce(new Error('First attempt failed'))
        .mockResolvedValueOnce({ id: '123', name: 'Test' });

      const { getByTestId } = renderWithProviders(
        <CreateElementModal
          {...defaultProps}
          onCreate={onCreate}
        />
      );

      const nameInput = getByTestId('element-name-input');
      fireEvent.changeText(nameInput, 'Test');

      const createButton = getByTestId('create-element-button');

      // * First attempt fails
      fireEvent.press(createButton);
      await waitFor(() => {
        expect(onCreate).toHaveBeenCalledTimes(1);
      });

      // * Second attempt succeeds
      fireEvent.press(createButton);
      await waitFor(() => {
        expect(onCreate).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Keyboard Handling', () => {
    it('dismisses keyboard on modal close', () => {
      const { getByTestId } = renderWithProviders(
        <CreateElementModal {...defaultProps} />
      );

      const nameInput = getByTestId('element-name-input');
      fireEvent(nameInput, 'focus');

      // * Close modal should blur input
      const cancelButton = getByTestId('cancel-button');
      fireEvent.press(cancelButton);

      expect(nameInput.props.autoFocus).toBeFalsy();
    });

    it('handles keyboard avoiding view for input fields', () => {
      const { getByTestId } = renderWithProviders(
        <CreateElementModal {...defaultProps} />
      );

      // * KeyboardAvoidingView should be present
      expect(getByTestId('keyboard-avoiding-view')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('has proper accessibility labels', () => {
      const { getByTestId } = renderWithProviders(
        <CreateElementModal {...defaultProps} />
      );

      const nameInput = getByTestId('element-name-input');
      expect(nameInput.props.accessibilityLabel).toBe('Element name');

      const createButton = getByTestId('create-element-button');
      expect(createButton.props.accessibilityLabel).toBe('Create element');
    });

    it('announces modal state changes', () => {
      const { getByTestId } = renderWithProviders(
        <CreateElementModal {...defaultProps} />
      );

      const modal = getByTestId('create-element-modal');
      expect(modal.props.accessibilityViewIsModal).toBe(true);
    });
  });
});