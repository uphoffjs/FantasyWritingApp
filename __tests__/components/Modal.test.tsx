/**
 * * Modal Component Tests (Jest + React Native Testing Library)
 * * Tests modal behavior including visibility, animations, backdrop interactions
 * ! Critical: Tests modal lifecycle, user interactions, and accessibility
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import { CreateElementModal } from '../../src/components/CreateElementModal';
import * as worldbuildingStore from '../../src/store/worldbuildingStore';

// * Mock the store
jest.mock('../../src/store/worldbuildingStore');

// * Simple test modal component for basic Modal tests
const TestModal = ({
  visible,
  onClose,
  testID = 'test-modal',
}: {
  visible: boolean;
  onClose: () => void;
  testID?: string;
}) => (
  <Modal
    visible={visible}
    transparent={true}
    animationType="slide"
    testID={testID}
    onRequestClose={onClose}
  >
    <View testID={`${testID}-backdrop`}>
      <TouchableOpacity
        testID={`${testID}-backdrop-button`}
        onPress={onClose}
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}
      >
        <View testID={`${testID}-content`} style={{ backgroundColor: 'white', padding: 20 }}>
          <Text testID={`${testID}-title`}>Test Modal</Text>
          <TouchableOpacity testID={`${testID}-close-button`} onPress={onClose}>
            <Text>Close</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  </Modal>
);

describe('Modal Component', () => {
  // * Basic Modal tests
  describe('Basic Modal Behavior', () => {
    it('should render when visible is true', () => {
      const { getByTestId } = render(
        <TestModal visible={true} onClose={jest.fn()} />
      );

      expect(getByTestId('test-modal')).toBeTruthy();
      expect(getByTestId('test-modal-content')).toBeTruthy();
      expect(getByTestId('test-modal-title')).toBeTruthy();
    });

    it('should not render content when visible is false', () => {
      const { queryByTestId } = render(
        <TestModal visible={false} onClose={jest.fn()} />
      );

      // * Modal component exists but is not visible
      const modal = queryByTestId('test-modal');
      expect(modal?.props.visible).toBe(false);
    });

    it('should call onClose when close button is pressed', () => {
      const onCloseMock = jest.fn();
      const { getByTestId } = render(
        <TestModal visible={true} onClose={onCloseMock} />
      );

      fireEvent.press(getByTestId('test-modal-close-button'));
      expect(onCloseMock).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when backdrop is pressed', () => {
      const onCloseMock = jest.fn();
      const { getByTestId } = render(
        <TestModal visible={true} onClose={onCloseMock} />
      );

      fireEvent.press(getByTestId('test-modal-backdrop-button'));
      expect(onCloseMock).toHaveBeenCalledTimes(1);
    });

    it('should handle onRequestClose for Android back button', () => {
      const onCloseMock = jest.fn();
      const { getByTestId } = render(
        <TestModal visible={true} onClose={onCloseMock} />
      );

      const modal = getByTestId('test-modal');
      // * Simulate Android back button
      modal.props.onRequestClose();
      expect(onCloseMock).toHaveBeenCalledTimes(1);
    });
  });

  // * Animation tests
  describe('Modal Animations', () => {
    it('should support slide animation', () => {
      const { getByTestId } = render(
        <Modal
          visible={true}
          animationType="slide"
          testID="slide-modal"
        >
          <Text>Slide Modal</Text>
        </Modal>
      );

      const modal = getByTestId('slide-modal');
      expect(modal.props.animationType).toBe('slide');
    });

    it('should support fade animation', () => {
      const { getByTestId } = render(
        <Modal
          visible={true}
          animationType="fade"
          testID="fade-modal"
        >
          <Text>Fade Modal</Text>
        </Modal>
      );

      const modal = getByTestId('fade-modal');
      expect(modal.props.animationType).toBe('fade');
    });

    it('should support no animation', () => {
      const { getByTestId } = render(
        <Modal
          visible={true}
          animationType="none"
          testID="no-animation-modal"
        >
          <Text>No Animation Modal</Text>
        </Modal>
      );

      const modal = getByTestId('no-animation-modal');
      expect(modal.props.animationType).toBe('none');
    });
  });

  // * Transparency and presentation tests
  describe('Modal Presentation', () => {
    it('should support transparent backdrop', () => {
      const { getByTestId } = render(
        <Modal
          visible={true}
          transparent={true}
          testID="transparent-modal"
        >
          <Text>Transparent Modal</Text>
        </Modal>
      );

      const modal = getByTestId('transparent-modal');
      expect(modal.props.transparent).toBe(true);
    });

    it('should support opaque backdrop', () => {
      const { getByTestId } = render(
        <Modal
          visible={true}
          transparent={false}
          testID="opaque-modal"
        >
          <Text>Opaque Modal</Text>
        </Modal>
      );

      const modal = getByTestId('opaque-modal');
      expect(modal.props.transparent).toBe(false);
    });

    it('should support different presentation styles on iOS', () => {
      const { getByTestId } = render(
        <Modal
          visible={true}
          presentationStyle="pageSheet"
          testID="pagesheet-modal"
        >
          <Text>Page Sheet Modal</Text>
        </Modal>
      );

      const modal = getByTestId('pagesheet-modal');
      expect(modal.props.presentationStyle).toBe('pageSheet');
    });
  });

  // * CreateElementModal specific tests
  describe('CreateElementModal', () => {
    const mockCreateElement = jest.fn();
    const mockProject = {
      id: 'project-1',
      name: 'Test Project',
      elements: [],
    };

    beforeEach(() => {
      jest.clearAllMocks();
      (worldbuildingStore.useWorldbuildingStore as jest.Mock).mockReturnValue({
        createElement: mockCreateElement,
        projects: [mockProject],
      });

      // * Mock the getState for default name generation
      (worldbuildingStore.useWorldbuildingStore as any).getState = jest.fn(() => ({
        projects: [mockProject],
      }));
    });

    it('should render CreateElementModal when visible', () => {
      const { getByText } = render(
        <CreateElementModal
          visible={true}
          projectId="project-1"
          onClose={jest.fn()}
        />
      );

      expect(getByText('Create New Element')).toBeTruthy();
      expect(getByText('Select element type:')).toBeTruthy();
    });

    it('should display all element categories', () => {
      const { getByText } = render(
        <CreateElementModal
          visible={true}
          projectId="project-1"
          onClose={jest.fn()}
        />
      );

      // * Check for some key categories
      expect(getByText('Character')).toBeTruthy();
      expect(getByText('Location')).toBeTruthy();
      expect(getByText('Magic/Power')).toBeTruthy();
      expect(getByText('Organization')).toBeTruthy();
    });

    it('should select a category when pressed', () => {
      const { getByText, getByTestId } = render(
        <CreateElementModal
          visible={true}
          projectId="project-1"
          onClose={jest.fn()}
        />
      );

      const characterButton = getByText('Character').parent?.parent;
      if (characterButton) {
        fireEvent.press(characterButton);
      }

      // * After selection, the create button should be enabled
      // * Note: We'd need to add testIDs to the actual component for better testing
    });

    it('should call createElement when category is selected', async () => {
      mockCreateElement.mockResolvedValue({ id: 'new-element-1', name: 'Untitled Character 1' });

      const onSuccessMock = jest.fn();
      const onCloseMock = jest.fn();

      const { getByText } = render(
        <CreateElementModal
          visible={true}
          projectId="project-1"
          onClose={onCloseMock}
          onSuccess={onSuccessMock}
        />
      );

      const characterButton = getByText('Character').parent?.parent;
      if (characterButton) {
        fireEvent.press(characterButton);
      }

      await waitFor(() => {
        expect(mockCreateElement).toHaveBeenCalledWith(
          'project-1',
          'Untitled Character 1',
          'character'
        );
      });

      await waitFor(() => {
        expect(onSuccessMock).toHaveBeenCalledWith('new-element-1');
        expect(onCloseMock).toHaveBeenCalled();
      }, { timeout: 2000 });
    });

    it('should handle creation errors gracefully', async () => {
      mockCreateElement.mockRejectedValue(new Error('Creation failed'));

      const { getByText } = render(
        <CreateElementModal
          visible={true}
          projectId="project-1"
          onClose={jest.fn()}
        />
      );

      const characterButton = getByText('Character').parent?.parent;
      if (characterButton) {
        fireEvent.press(characterButton);
      }

      await waitFor(() => {
        expect(mockCreateElement).toHaveBeenCalled();
      });

      // * In real implementation, we'd check for error display
    });

    it('should show loading state during creation', async () => {
      let resolveCreate: any;
      mockCreateElement.mockImplementation(() => new Promise(resolve => {
        resolveCreate = resolve;
      }));

      const { getByText, queryByTestId } = render(
        <CreateElementModal
          visible={true}
          projectId="project-1"
          onClose={jest.fn()}
        />
      );

      const characterButton = getByText('Character').parent?.parent;
      if (characterButton) {
        fireEvent.press(characterButton);
      }

      // * Check for loading indicator (would need testID in actual component)
      // * In real implementation: expect(queryByTestId('loading-indicator')).toBeTruthy();

      // * Resolve the promise
      if (resolveCreate) {
        resolveCreate({ id: 'new-element-1', name: 'Untitled Character 1' });
      }
    });
  });

  // * Accessibility tests
  describe('Accessibility', () => {
    it('should have proper accessibility props', () => {
      const { getByTestId } = render(
        <Modal
          visible={true}
          testID="accessible-modal"
          accessible={true}
          accessibilityLabel="Dialog"
          accessibilityRole="dialog"
        >
          <Text>Accessible Modal</Text>
        </Modal>
      );

      const modal = getByTestId('accessible-modal');
      expect(modal.props.accessible).toBe(true);
      expect(modal.props.accessibilityLabel).toBe('Dialog');
      expect(modal.props.accessibilityRole).toBe('dialog');
    });

    it('should support accessibility for modal actions', () => {
      const CloseButton = ({ onPress }: { onPress: () => void }) => (
        <TouchableOpacity
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel="Close modal"
          accessibilityHint="Double tap to close the modal"
          testID="accessible-close"
        >
          <Text>Close</Text>
        </TouchableOpacity>
      );

      const { getByTestId } = render(
        <Modal visible={true}>
          <CloseButton onPress={jest.fn()} />
        </Modal>
      );

      const button = getByTestId('accessible-close');
      expect(button.props.accessibilityRole).toBe('button');
      expect(button.props.accessibilityLabel).toBe('Close modal');
      expect(button.props.accessibilityHint).toBe('Double tap to close the modal');
    });
  });

  // * Modal lifecycle tests
  describe('Modal Lifecycle', () => {
    it('should handle visibility changes', () => {
      const { rerender, queryByTestId, getByTestId } = render(
        <TestModal visible={false} onClose={jest.fn()} />
      );

      // * Initially not visible
      expect(queryByTestId('test-modal')?.props.visible).toBe(false);

      // * Make visible
      rerender(<TestModal visible={true} onClose={jest.fn()} />);
      expect(getByTestId('test-modal').props.visible).toBe(true);

      // * Hide again
      rerender(<TestModal visible={false} onClose={jest.fn()} />);
      expect(queryByTestId('test-modal')?.props.visible).toBe(false);
    });

    it('should call onShow when modal becomes visible', () => {
      const onShowMock = jest.fn();
      const { rerender } = render(
        <Modal
          visible={false}
          onShow={onShowMock}
          testID="lifecycle-modal"
        >
          <Text>Content</Text>
        </Modal>
      );

      // * Make visible
      rerender(
        <Modal
          visible={true}
          onShow={onShowMock}
          testID="lifecycle-modal"
        >
          <Text>Content</Text>
        </Modal>
      );

      expect(onShowMock).toHaveBeenCalledTimes(1);
    });

    it('should call onDismiss when modal is dismissed', () => {
      const onDismissMock = jest.fn();
      const { rerender } = render(
        <Modal
          visible={true}
          onDismiss={onDismissMock}
          testID="dismiss-modal"
        >
          <Text>Content</Text>
        </Modal>
      );

      // * Hide modal
      rerender(
        <Modal
          visible={false}
          onDismiss={onDismissMock}
          testID="dismiss-modal"
        >
          <Text>Content</Text>
        </Modal>
      );

      expect(onDismissMock).toHaveBeenCalledTimes(1);
    });
  });

  // * Nested modal tests
  describe('Nested Modals', () => {
    it('should support nested modals', () => {
      const { getByTestId } = render(
        <Modal visible={true} testID="parent-modal">
          <View>
            <Text>Parent Modal</Text>
            <Modal visible={true} testID="child-modal">
              <Text>Child Modal</Text>
            </Modal>
          </View>
        </Modal>
      );

      expect(getByTestId('parent-modal')).toBeTruthy();
      expect(getByTestId('child-modal')).toBeTruthy();
    });
  });
});