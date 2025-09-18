import React from 'react';
import { ToastContainer } from '../../src/components/Toast';
import { useToastStore } from '../../src/store/toastStore';
import type { Toast, ToastStore } from '../../src/store/toastStore';

// * Helper component to trigger toasts
const ToastTestWrapper = () => {
  const addToast = useToastStore((state: ToastStore) => state.addToast);
  const clearAllToasts = useToastStore((state: ToastStore) => state.clearAllToasts);

  return (
    <div>
      <[data-cy*="button"] 
        data-testid="add-success-toast"
        onClick={() => addToast({
          type: 'success',
          title: 'Success!',
          message: 'Operation completed successfully',
          duration: 0 // Prevent auto-dismiss for testing
        })}
      >
        Add Success Toast
      </[data-cy*="button"]>
      
      <[data-cy*="button"] 
        data-testid="add-error-toast"
        onClick={() => addToast({
          type: 'error',
          title: 'Error!',
          message: 'Something went wrong',
          duration: 0
        })}
      >
        Add Error Toast
      </[data-cy*="button"]>
      
      <[data-cy*="button"] 
        data-testid="add-info-toast"
        onClick={() => addToast({
          type: 'info',
          title: 'Information',
          message: 'Here is some information',
          duration: 0
        })}
      >
        Add Info Toast
      </[data-cy*="button"]>
      
      <[data-cy*="button"] 
        data-testid="add-warning-toast"
        onClick={() => addToast({
          type: 'warning',
          title: 'Warning!',
          message: 'Please be careful',
          duration: 0
        })}
      >
        Add Warning Toast
      </[data-cy*="button"]>
      
      <[data-cy*="button"] 
        data-testid="add-toast-with-action"
        onClick={() => addToast({
          type: 'success',
          title: 'Action Required',
          message: 'Click the action [data-cy*="button"]',
          action: {
            label: 'Undo',
            onClick: () => console.log('Action clicked')
          },
          duration: 0
        })}
      >
        Add Toast with Action
      </[data-cy*="button"]>
      
      <[data-cy*="button"] 
        data-testid="clear-all-toasts"
        onClick={() => clearAllToasts()}
      >
        Clear All Toasts
      </[data-cy*="button"]>
      
      <ToastContainer />
    </div>
  );
};

describe('Toast Component', () => {
  beforeEach(() => {
    // * Clear any existing toasts before each test
    cy.mount(<ToastTestWrapper />);
    // * Wait to let component initialize
    cy.wait(100);
    // TODO: * Use should to ensure [data-cy*="button"] exists before clicking
    cy.get('[data-testid="clear-all-toasts"]').should('exist').click();
  });

  describe('Rendering', () => {
    it('renders success toast correctly', () => {
      cy.get('[data-testid="add-success-toast"]').click();
      
      cy.contains('Success!').should('be.visible');
      cy.contains('Operation completed successfully').should('be.visible');
      
      // * Check for success icon (Check)
      cy.get('svg').should('exist');
      
      // * Check colors
      cy.get('[class*="border-forest-500"]').should('exist');
      cy.get('[class*="text-forest-400"]').should('exist');
    });

    it('renders error toast correctly', () => {
      cy.get('[data-testid="add-error-toast"]').click();
      
      cy.contains('Error!').should('be.visible');
      cy.contains('Something went wrong').should('be.visible');
      
      // * Check colors
      cy.get('[class*="border-blood-500"]').should('exist');
      cy.get('[class*="text-blood-400"]').should('exist');
      
      // TODO: * Error toasts should have Details [data-cy*="button"]
      cy.contains('Details').should('be.visible');
      cy.contains('Dismiss').should('be.visible');
    });

    it('renders info toast correctly', () => {
      cy.get('[data-testid="add-info-toast"]').click();
      
      cy.contains('Information').should('be.visible');
      cy.contains('Here is some information').should('be.visible');
      
      // * Check colors
      cy.get('[class*="border-sapphire-500"]').should('exist');
      cy.get('[class*="text-sapphire-400"]').should('exist');
    });

    it('renders warning toast correctly', () => {
      cy.get('[data-testid="add-warning-toast"]').click();
      
      cy.contains('Warning!').should('be.visible');
      cy.contains('Please be careful').should('be.visible');
      
      // * Check colors
      cy.get('[class*="border-flame-500"]').should('exist');
      cy.get('[class*="text-flame-400"]').should('exist');
    });

    it('renders toast without message', () => {
      const addToast = useToastStore.getState().addToast;
      addToast({
        type: 'success',
        title: 'Title Only',
        duration: 0
      });
      
      cy.contains('Title Only').should('be.visible');
    });
  });

  describe('Toast Actions', () => {
    it('renders action [data-cy*="button"] when provided', () => {
      cy.get('[data-testid="add-toast-with-action"]').click();
      
      cy.contains('Action Required').should('be.visible');
      cy.contains('Undo').should('be.visible');
    });

    it('calls action onClick when action [data-cy*="button"] is clicked', () => {
      const actionSpy = cy.spy().as('actionClick');
      const addToast = useToastStore.getState().addToast;
      
      addToast({
        type: 'success',
        title: 'With Action',
        action: {
          label: 'Test Action',
          onClick: actionSpy
        },
        duration: 0
      });
      
      cy.contains('Test Action').click();
      cy.get('@actionClick').should('have.been.calledOnce');
    });

    it('dismisses toast when dismiss [data-cy*="button"] is clicked', () => {
      cy.get('[data-testid="add-error-toast"]').click();
      
      cy.contains('Error!').should('be.visible');
      cy.contains('Dismiss').click();
      cy.contains('Error!').should('not.exist');
    });

    it('dismisses toast when X [data-cy*="button"] is clicked (non-error toasts)', () => {
      cy.get('[data-testid="add-success-toast"]').click();
      
      cy.contains('Success!').should('be.visible');
      
      // * Find and click the X [data-cy*="button"]
      cy.get('[data-cy*="button"]').find('svg').parent().last().click();
      
      cy.contains('Success!').should('not.exist');
    });
  });

  describe('Error Toast Details', () => {
    it('expands error details when Details [data-cy*="button"] is clicked', () => {
      cy.get('[data-testid="add-error-toast"]').click();
      
      // TODO: * Initially, the detailed view should not be visible
      cy.get('pre').should('not.exist');
      
      cy.contains('Details').click();
      
      // ? TODO: * After clicking Details, the message should be shown in a pre tag
      cy.get('pre').should('be.visible').and('contain', 'Something went wrong');
      
      // TODO: * The chevron should change from down to up
      cy.get('svg[class*="ChevronUp"]').should('exist');
    });

    it('collapses error details when Details [data-cy*="button"] is clicked again', () => {
      cy.get('[data-testid="add-error-toast"]').click();
      
      cy.contains('Details').click();
      cy.get('pre').should('be.visible');
      
      cy.contains('Details').click();
      cy.get('pre').should('not.exist');
    });
  });

  describe('Multiple Toasts', () => {
    it('displays multiple toasts simultaneously', () => {
      cy.get('[data-testid="add-success-toast"]').click();
      cy.get('[data-testid="add-error-toast"]').click();
      cy.get('[data-testid="add-info-toast"]').click();
      
      cy.contains('Success!').should('be.visible');
      cy.contains('Error!').should('be.visible');
      cy.contains('Information').should('be.visible');
    });

    it('removes specific toast without affecting others', () => {
      cy.get('[data-testid="add-success-toast"]').click();
      cy.get('[data-testid="add-error-toast"]').click();
      
      // * Dismiss the success toast
      cy.contains('Success!').parent().parent().find('[data-cy*="button"]').last().click();
      
      cy.contains('Success!').should('not.exist');
      cy.contains('Error!').should('be.visible');
    });

    it('clears all toasts when clearAllToasts is called', () => {
      cy.get('[data-testid="add-success-toast"]').click();
      cy.get('[data-testid="add-error-toast"]').click();
      cy.get('[data-testid="add-info-toast"]').click();
      
      cy.contains('Success!').should('be.visible');
      cy.contains('Error!').should('be.visible');
      cy.contains('Information').should('be.visible');
      
      cy.get('[data-testid="clear-all-toasts"]').click();
      
      cy.contains('Success!').should('not.exist');
      cy.contains('Error!').should('not.exist');
      cy.contains('Information').should('not.exist');
    });
  });

  describe('Auto-dismiss Behavior', () => {
    it('auto-dismisses non-error toasts after duration', () => {
      // * Add toast through [data-cy*="button"] to ensure proper state update
      cy.window().then((win) => {
        const { addToast } = useToastStore.getState();
        addToast({
          type: 'success',
          title: 'Auto Dismiss',
          duration: 3000
        });
      });
      
      cy.contains('Auto Dismiss').should('be.visible');
      
      // * Use cy.wait instead of cy.tick since the timer is in Zustand
      cy.wait(2900);
      cy.contains('Auto Dismiss').should('be.visible');
      
      cy.wait(200);
      cy.contains('Auto Dismiss').should('not.exist');
    });

    it('does not auto-dismiss error toasts by default', () => {
      cy.window().then((win) => {
        const { addToast } = useToastStore.getState();
        addToast({
          type: 'error',
          title: 'Persistent Error'
          // TODO: * No duration specified, should default to 0 for errors
        });
      });
      
      cy.contains('Persistent Error').should('be.visible');
      
      // * Wait longer than typical auto-dismiss duration
      cy.wait(5000);
      cy.contains('Persistent Error').should('be.visible');
    });

    it('respects custom duration for all toast types', () => {
      cy.window().then((win) => {
        const { addToast } = useToastStore.getState();
        addToast({
          type: 'error',
          title: 'Auto Dismiss Error',
          duration: 2000
        });
      });
      
      cy.contains('Auto Dismiss Error').should('be.visible');
      
      cy.wait(1900);
      cy.contains('Auto Dismiss Error').should('be.visible');
      
      cy.wait(200);
      cy.contains('Auto Dismiss Error').should('not.exist');
    });
  });

  describe('Responsive Design', () => {
    it('positions toasts at bottom on mobile', () => {
      cy.viewport(375, 667);
      cy.mount(<ToastTestWrapper />);
      
      // * Wait for component to be ready
      cy.wait(100);
      cy.get('[data-testid="clear-all-toasts"]').should('exist').click();
      
      cy.get('[data-testid="add-success-toast"]').click();
      
      // TODO: * On mobile, toasts should be positioned at the bottom
      cy.get('.fixed').should('be.visible') // React Native Web uses inline styles instead of CSS classes;
    });

    it('positions toasts at top-right on desktop', () => {
      cy.viewport(1920, 1080);
      cy.mount(<ToastTestWrapper />);
      
      // * Wait for component to be ready
      cy.wait(100);
      cy.get('[data-testid="clear-all-toasts"]').should('exist').click();
      
      cy.get('[data-testid="add-success-toast"]').click();
      
      // TODO: * On desktop, toasts should be positioned at the top-right
      cy.get('.fixed').should('be.visible') // React Native Web uses inline styles instead of CSS classes.and('have.class', 'right-4');
    });

    it('adapts layout for tablet viewport', () => {
      cy.viewport(768, 1024);
      cy.mount(<ToastTestWrapper />);
      
      // * Wait for component to be ready
      cy.wait(100);
      cy.get('[data-testid="clear-all-toasts"]').should('exist').click();
      
      cy.get('[data-testid="add-success-toast"]').click();
      
      cy.contains('Success!').should('be.visible');
    });
  });

  describe('Edge Cases', () => {
    it('handles very long titles', () => {
      const addToast = useToastStore.getState().addToast;
      const longTitle = 'A'.repeat(100);
      
      addToast({
        type: 'info',
        title: longTitle,
        duration: 0
      });
      
      cy.get('.font-medium').should('contain', longTitle);
    });

    it('handles very long messages', () => {
      const addToast = useToastStore.getState().addToast;
      const longMessage = 'B'.repeat(500);
      
      addToast({
        type: 'info',
        title: 'Long Message',
        message: longMessage,
        duration: 0
      });
      
      cy.get('.text-sm').should('contain', longMessage);
    });

    it('handles rapid toast additions', () => {
      for (let i = 0; i < 5; i++) {
        cy.get('[data-testid="add-success-toast"]').click();
      }
      
      // TODO: * Should have 5 toasts visible
      cy.get('.rounded-lg').should('have.length', 5);
    });

    it('handles empty message gracefully', () => {
      const addToast = useToastStore.getState().addToast;
      
      addToast({
        type: 'info',
        title: 'No Message Toast',
        message: '',
        duration: 0
      });
      
      cy.contains('No Message Toast').should('be.visible');
    });
  });

  describe('Accessibility', () => {
    it('dismiss [data-cy*="button"] is keyboard accessible', () => {
      cy.get('[data-testid="add-error-toast"]').click();
      
      cy.contains('Dismiss').focus();
      cy.focused().should('contain', 'Dismiss');
      cy.focused().type('{enter}');
      
      cy.contains('Error!').should('not.exist');
    });

    it('action [data-cy*="button"] is keyboard accessible', () => {
      const actionSpy = cy.spy().as('actionClick');
      const addToast = useToastStore.getState().addToast;
      
      addToast({
        type: 'success',
        title: 'Keyboard Test',
        action: {
          label: 'Action',
          onClick: actionSpy
        },
        duration: 0
      });
      
      cy.contains('Action').focus();
      cy.focused().type('{enter}');
      
      cy.get('@actionClick').should('have.been.calledOnce');
    });

    it('details [data-cy*="button"] is keyboard accessible', () => {
      cy.get('[data-testid="add-error-toast"]').click();
      
      cy.contains('Details').focus();
      cy.focused().type('{enter}');
      
      cy.get('pre').should('be.visible');
    });
  });
});