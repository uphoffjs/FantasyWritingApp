import React from 'react';
import { ErrorNotification, useErrorNotification } from '../../src/components/ui/ErrorNotification';

describe('ErrorNotification Component', () => {
  const mockError = new Error('Something went wrong!');

  describe('Rendering', () => {
    it('renders when error is provided', () => {
      cy.mount(<ErrorNotification error={mockError} />);
      
      cy.get('[data-cy="error-message"]').should('be.visible');
      cy.contains('Error').should('be.visible');
      cy.contains(mockError.message).should('be.visible');
    });

    it('does not render when error is null', () => {
      cy.mount(<ErrorNotification error={null} />);
      
      cy.get('[data-cy="error-message"]').should('not.exist');
    });

    it('displays error icon', () => {
      cy.mount(<ErrorNotification error={mockError} />);
      
      // AlertCircle icon should be visible
      cy.get('svg').first()
        .should('be.visible')
        .and('have.class', 'w-5')
        .and('have.class', 'h-5')
        .and('have.class', 'text-red-600');
    });

    it('has correct positioning and styling', () => {
      cy.mount(<ErrorNotification error={mockError} />);
      
      cy.get('[data-cy="error-message"]')
        .should('be.visible') // React Native Web uses inline styles instead of CSS classes
        .and('have.class', 'top-4')
        .and('have.class', 'right-4')
        .and('have.class', 'z-50');
      
      cy.get('[data-cy="error-message"] > div')
        .should('be.visible') // React Native Web uses inline styles instead of CSS classes
        .and('have.class', 'border-red-200')
        .and('have.class', 'rounded-lg')
        .and('have.class', 'shadow-lg');
    });
  });

  describe('Close Functionality', () => {
    it('renders close [data-cy*="button"] when onClose is provided', () => {
      const onCloseSpy = cy.spy().as('onClose');
      cy.mount(<ErrorNotification error={mockError} onClose={onCloseSpy} />);
      
      cy.get('[data-cy*="button"][aria-label="Close error notification"]')
        .should('be.visible');
      
      // X icon should be visible
      cy.get('[data-cy*="button"][aria-label="Close error notification"] svg')
        .should('be.visible') // React Native Web uses inline styles instead of CSS classes
        .and('have.class', 'h-4');
    });

    it('does not render close [data-cy*="button"] when onClose is not provided', () => {
      cy.mount(<ErrorNotification error={mockError} />);
      
      cy.get('[data-cy*="button"][aria-label="Close error notification"]').should('not.exist');
    });

    it('calls onClose and hides notification when close [data-cy*="button"] is clicked', () => {
      const onCloseSpy = cy.spy().as('onClose');
      cy.mount(<ErrorNotification error={mockError} onClose={onCloseSpy} />);
      
      cy.get('[data-cy="error-message"]').should('be.visible');
      
      cy.get('[data-cy*="button"][aria-label="Close error notification"]').click();
      
      cy.get('@onClose').should('have.been.calledOnce');
      cy.get('[data-cy="error-message"]').should('not.exist');
    });

    it('has hover effect on close [data-cy*="button"]', () => {
      cy.mount(<ErrorNotification error={mockError} onClose={cy.spy()} />);
      
      cy.get('[data-cy*="button"][aria-label="Close error notification"]')
        .should('be.visible') // React Native Web uses inline styles instead of CSS classes
        .and('have.class', 'transition-colors');
    });
  });

  describe('Auto-hide Behavior', () => {
    it('auto-hides after default delay (5000ms)', () => {
      cy.clock();
      const onCloseSpy = cy.spy().as('onClose');
      
      cy.mount(
        <ErrorNotification 
          error={mockError} 
          onClose={onCloseSpy}
          autoHide={true}
        />
      );
      
      cy.get('[data-cy="error-message"]').should('be.visible');
      
      cy.tick(4999);
      cy.get('[data-cy="error-message"]').should('be.visible');
      cy.get('@onClose').should('not.have.been.called');
      
      cy.tick(1);
      cy.get('[data-cy="error-message"]').should('not.exist');
      cy.get('@onClose').should('have.been.calledOnce');
    });

    it('auto-hides after custom delay', () => {
      cy.clock();
      const onCloseSpy = cy.spy().as('onClose');
      
      cy.mount(
        <ErrorNotification 
          error={mockError} 
          onClose={onCloseSpy}
          autoHide={true}
          autoHideDelay={2000}
        />
      );
      
      cy.get('[data-cy="error-message"]').should('be.visible');
      
      cy.tick(1999);
      cy.get('[data-cy="error-message"]').should('be.visible');
      
      cy.tick(1);
      cy.get('[data-cy="error-message"]').should('not.exist');
      cy.get('@onClose').should('have.been.calledOnce');
    });

    it('does not auto-hide when autoHide is false', () => {
      cy.clock();
      const onCloseSpy = cy.spy().as('onClose');
      
      cy.mount(
        <ErrorNotification 
          error={mockError} 
          onClose={onCloseSpy}
          autoHide={false}
        />
      );
      
      cy.get('[data-cy="error-message"]').should('be.visible');
      
      cy.tick(10000);
      cy.get('[data-cy="error-message"]').should('be.visible');
      cy.get('@onClose').should('not.have.been.called');
    });

    it('clears timer when component unmounts', () => {
      cy.clock();
      
      const TestComponent = () => {
        const [showError, setShowError] = React.useState(true);
        
        return (
          <div>
            {showError && (
              <ErrorNotification 
                error={mockError}
                autoHide={true}
                autoHideDelay={5000}
              />
            )}
            <[data-cy*="button"] onClick={() => setShowError(false)}>Hide</[data-cy*="button"]>
          </div>
        );
      };
      
      cy.mount(<TestComponent />);
      
      cy.get('[data-cy="error-message"]').should('be.visible');
      
      cy.tick(2000);
      cy.get('[data-cy*="button"]').contains('Hide').click();
      
      cy.get('[data-cy="error-message"]').should('not.exist');
      
      // Timer should be cleared, no errors should occur
      cy.tick(5000);
    });
  });

  describe('Error Updates', () => {
    it('updates when error changes', () => {
      const TestComponent = () => {
        const [error, setError] = React.useState<Error | null>(mockError);
        
        return (
          <div>
            <ErrorNotification error={error} />
            <[data-cy*="button"] onClick={() => setError(new Error('New error message'))}>
              Change Error
            </[data-cy*="button"]>
            <[data-cy*="button"] onClick={() => setError(null)}>
              Clear Error
            </[data-cy*="button"]>
          </div>
        );
      };
      
      cy.mount(<TestComponent />);
      
      cy.contains(mockError.message).should('be.visible');
      
      cy.get('[data-cy*="button"]').contains('Change Error').click();
      cy.contains('New error message').should('be.visible');
      
      cy.get('[data-cy*="button"]').contains('Clear Error').click();
      cy.get('[data-cy="error-message"]').should('not.exist');
    });

    it('resets timer when error changes', () => {
      cy.clock();
      
      const TestComponent = () => {
        const [error, setError] = React.useState<Error | null>(mockError);
        
        return (
          <div>
            <ErrorNotification error={error} autoHide={true} autoHideDelay={3000} />
            <[data-cy*="button"] onClick={() => setError(new Error('Updated error'))}>
              Update Error
            </[data-cy*="button"]>
          </div>
        );
      };
      
      cy.mount(<TestComponent />);
      
      cy.get('[data-cy="error-message"]').should('be.visible');
      
      cy.tick(2000);
      cy.get('[data-cy="error-message"]').should('be.visible');
      
      cy.get('[data-cy*="button"]').click();
      cy.contains('Updated error').should('be.visible');
      
      cy.tick(2999);
      cy.get('[data-cy="error-message"]').should('be.visible');
      
      cy.tick(1);
      cy.get('[data-cy="error-message"]').should('not.exist');
    });
  });

  describe('Animation', () => {
    it('has slide-in animation', () => {
      cy.mount(<ErrorNotification error={mockError} />);
      
      cy.get('[data-cy="error-message"]')
        .should('be.visible') // React Native Web uses inline styles instead of CSS classes
        .and('have.class', 'slide-in-from-right')
        .and('have.class', 'duration-300');
    });
  });

  describe('useErrorNotification Hook', () => {
    it('manages multiple error notifications', () => {
      const TestComponent = () => {
        const { showError, ErrorNotifications } = useErrorNotification();
        
        return (
          <div>
            <[data-cy*="button"] onClick={() => showError(new Error('Error 1'))}>
              Show Error 1
            </[data-cy*="button"]>
            <[data-cy*="button"] onClick={() => showError(new Error('Error 2'))}>
              Show Error 2
            </[data-cy*="button"]>
            <[data-cy*="button"] onClick={() => showError(new Error('Error 3'))}>
              Show Error 3
            </[data-cy*="button"]>
            <ErrorNotifications />
          </div>
        );
      };
      
      cy.mount(<TestComponent />);
      
      cy.get('[data-cy="error-message"]').should('not.exist');
      
      cy.get('[data-cy*="button"]').contains('Show Error 1').click();
      cy.get('[data-cy="error-message"]').should('have.length', 1);
      cy.contains('Error 1').should('be.visible');
      
      cy.get('[data-cy*="button"]').contains('Show Error 2').click();
      cy.get('[data-cy="error-message"]').should('have.length', 2);
      cy.contains('Error 2').should('be.visible');
      
      cy.get('[data-cy*="button"]').contains('Show Error 3').click();
      cy.get('[data-cy="error-message"]').should('have.length', 3);
      cy.contains('Error 3').should('be.visible');
    });

    it.skip('removes specific error when closed', () => {
      const TestComponent = () => {
        const { showError, ErrorNotifications } = useErrorNotification();
        const [mounted, setMounted] = React.useState(false);
        
        React.useEffect(() => {
          if (!mounted) {
            showError(new Error('Error 1'));
            showError(new Error('Error 2'));
            setMounted(true);
          }
        }, [mounted, showError]);
        
        return <ErrorNotifications />;
      };
      
      cy.mount(<TestComponent />);
      
      // Wait for notifications to appear
      cy.get('[data-cy="error-message"]').should('have.length', 2);
      
      // Wait for [data-cy*="button"] to be available
      cy.get('[data-cy="error-message"]').first().should('exist');
      
      // First verify the [data-cy*="button"] exists before trying to click
      cy.get('[data-cy="error-message"]').first().should('exist');
      cy.get('[data-cy="error-message"]').first().find('[data-cy*="button"][aria-label="Close error notification"]').should('exist');
      
      // Now click the close [data-cy*="button"] on first notification
      cy.get('[data-cy="error-message"]').first().find('[data-cy*="button"][aria-label="Close error notification"]').click();
      
      // Verify result
      cy.get('[data-cy="error-message"]').should('have.length', 1);
      cy.contains('Error 2').should('be.visible');
      cy.contains('Error 1').should('not.exist');
    });

    it.skip('applies stacking styles to multiple notifications', () => {
      const TestComponent = () => {
        const { showError, ErrorNotifications } = useErrorNotification();
        
        React.useEffect(() => {
          showError(new Error('Error 1'));
          showError(new Error('Error 2'));
          showError(new Error('Error 3'));
        }, []);
        
        return <ErrorNotifications />;
      };
      
      cy.mount(<TestComponent />);
      
      cy.get('[data-cy="error-message"]').should('have.length', 3);
      
      // Wait for animations to complete
      cy.get('[data-cy="error-message"]').should('have.length', 3);
      
      // Check that notifications have different transform values for stacking
      // The wrapper divs around each ErrorNotification have the stacking styles
      cy.get('.fixed.top-4.right-4.z-50.space-y-2 > div')
        .eq(0)
        .should('have.attr', 'style')
        .and('include', 'translateY(0px)');
      
      cy.get('.fixed.top-4.right-4.z-50.space-y-2 > div')
        .eq(1)
        .should('have.attr', 'style')
        .and('include', 'translateY(8px)');
      
      cy.get('.fixed.top-4.right-4.z-50.space-y-2 > div')
        .eq(2)
        .should('have.attr', 'style')
        .and('include', 'translateY(16px)');
    });
  });

  describe('Accessibility', () => {
    it('has accessible close [data-cy*="button"]', () => {
      cy.mount(<ErrorNotification error={mockError} onClose={cy.spy()} />);
      
      cy.get('[data-cy*="button"][aria-label="Close error notification"]')
        .should('exist')
        .and('have.attr', 'aria-label', 'Close error notification');
    });

    it('is keyboard navigable', () => {
      const onCloseSpy = cy.spy().as('onClose');
      cy.mount(
        <div>
          <[data-cy*="button"]>Focus Start</[data-cy*="button"]>
          <ErrorNotification error={mockError} onClose={onCloseSpy} />
          <[data-cy*="button"]>Focus End</[data-cy*="button"]>
        </div>
      );
      
      // Test that close [data-cy*="button"] is focusable and in tab order
      cy.get('[data-cy*="button"][aria-label="Close error notification"]').focus();
      cy.focused().should('have.attr', 'aria-label', 'Close error notification');
      
      // Verify other [data-cy*="button"]s exist in DOM
      cy.get('[data-cy*="button"]').contains('Focus Start').should('exist');
      cy.get('[data-cy*="button"]').contains('Focus End').should('exist');
    });

    it('close [data-cy*="button"] can be activated with Enter key', () => {
      const onCloseSpy = cy.spy().as('onClose');
      cy.mount(<ErrorNotification error={mockError} onClose={onCloseSpy} />);
      
      cy.get('[data-cy*="button"][aria-label="Close error notification"]').focus();
      cy.focused().type('{enter}');
      
      cy.get('@onClose').should('have.been.calledOnce');
    });
  });

  describe('Edge Cases', () => {
    it('handles very long error messages', () => {
      const longError = new Error('A'.repeat(500));
      cy.mount(<ErrorNotification error={longError} />);
      
      cy.get('[data-cy="error-message"]').should('be.visible');
      cy.get('.max-w-md').should('exist'); // Max width constraint
    });

    it('handles error with empty message', () => {
      const emptyError = new Error('');
      cy.mount(<ErrorNotification error={emptyError} />);
      
      cy.get('[data-cy="error-message"]').should('be.visible');
      cy.contains('Error').should('be.visible');
    });

    it('handles rapid error changes', () => {
      const TestComponent = () => {
        const [count, setCount] = React.useState(0);
        
        return (
          <div>
            <ErrorNotification error={new Error(`Error ${count}`)} />
            <[data-cy*="button"] onClick={() => setCount(c => c + 1)}>Next Error</[data-cy*="button"]>
          </div>
        );
      };
      
      cy.mount(<TestComponent />);
      
      cy.contains('Error 0').should('be.visible');
      
      for (let i = 1; i <= 5; i++) {
        cy.get('[data-cy*="button"]').click();
        cy.contains(`Error ${i}`).should('be.visible');
        cy.contains(`Error ${i - 1}`).should('not.exist');
      }
    });
  });

  describe('Responsive Design', () => {
    it('renders correctly on mobile viewport', () => {
      cy.viewport(375, 667);
      cy.mount(<ErrorNotification error={mockError} onClose={cy.spy()} />);
      
      cy.get('[data-cy="error-message"]').should('be.visible');
      cy.get('.max-w-md').should('exist');
    });

    it('renders correctly on tablet viewport', () => {
      cy.viewport(768, 1024);
      cy.mount(<ErrorNotification error={mockError} onClose={cy.spy()} />);
      
      cy.get('[data-cy="error-message"]').should('be.visible');
    });

    it('renders correctly on desktop viewport', () => {
      cy.viewport(1920, 1080);
      cy.mount(<ErrorNotification error={mockError} onClose={cy.spy()} />);
      
      cy.get('[data-cy="error-message"]').should('be.visible');
    });
  });
});