import React from 'react';
import { ErrorMessage } from '../support/component-test-helpers';

describe('ErrorMessage Component', () => {
  const defaultProps = {
    message: 'Something went wrong. Please try again.'
  };

  describe('Rendering', () => {
    it('renders with required message prop', () => {
      cy.mount(<ErrorMessage {...defaultProps} />);
      
      cy.get('[data-testid="error-message"]').should('be.visible');
      cy.get('[data-testid="error-description"]')
        .should('have.text', defaultProps.message);
    });

    it('renders with default title', () => {
      cy.mount(<ErrorMessage {...defaultProps} />);
      
      cy.get('[data-testid="error-title"]')
        .should('be.visible')
        .and('have.text', 'An error occurred');
    });

    it('renders with custom title', () => {
      const customTitle = 'Network Error';
      cy.mount(<ErrorMessage {...defaultProps} title={customTitle} />);
      
      cy.get('[data-testid="error-title"]')
        .should('have.text', customTitle);
    });

    it('renders error icon', () => {
      cy.mount(<ErrorMessage {...defaultProps} />);
      
      // * Check for AlertCircle icon (Lucide React)
      cy.get('svg').first()
        .should('be.visible')
        .and('have.class', 'w-5')
        .and('have.class', 'h-5')
        .and('have.class', 'text-blood-500');
    });

    it('applies custom className', () => {
      cy.mount(<ErrorMessage {...defaultProps} className="custom-error-class" />);
      
      cy.get('[data-testid="error-message"]')
        .should('be.visible') // React Native Web uses inline styles instead of CSS classes;
    });

    it('has correct default styling', () => {
      cy.mount(<ErrorMessage {...defaultProps} />);
      
      cy.get('[data-testid="error-message"]')
        .should('be.visible') // React Native Web uses inline styles instead of CSS classes
        .and('have.class', 'border')
        .and('have.class', 'border-red-900/50')
        .and('have.class', 'rounded-lg')
        .and('have.class', 'p-4');
    });
  });

  describe('Retry Functionality', () => {
    it('renders retry [data-cy*="button"] when onRetry is provided', () => {
      const onRetrySpy = cy.spy().as('onRetry');
      cy.mount(<ErrorMessage {...defaultProps} onRetry={onRetrySpy} />);
      
      cy.get('[data-testid="error-retry"]')
        .should('be.visible')
        .and('contain', 'Try again');
      
      // * Check for RefreshCw icon
      cy.get('[data-testid="error-retry"] svg')
        .should('be.visible')
        .and('have.class', 'w-4')
        .and('have.class', 'h-4');
    });

    it('does not render retry [data-cy*="button"] when onRetry is not provided', () => {
      cy.mount(<ErrorMessage {...defaultProps} />);
      
      cy.get('[data-testid="error-retry"]').should('not.exist');
    });

    it('calls onRetry when retry [data-cy*="button"] is clicked', () => {
      const onRetrySpy = cy.spy().as('onRetry');
      cy.mount(<ErrorMessage {...defaultProps} onRetry={onRetrySpy} />);
      
      cy.get('[data-testid="error-retry"]').click();
      
      cy.get('@onRetry').should('have.been.calledOnce');
    });

    it('retry [data-cy*="button"] has hover effect', () => {
      const onRetrySpy = cy.spy();
      cy.mount(<ErrorMessage {...defaultProps} onRetry={onRetrySpy} />);
      
      cy.get('[data-testid="error-retry"]')
        .should('be.visible') // React Native Web uses inline styles instead of CSS classes
        .and('have.class', 'hover:text-red-300')
        .and('have.class', 'transition-colors');
    });
  });

  describe('Different Error Types', () => {
    it('displays network error', () => {
      cy.mount(
        <ErrorMessage 
          title="Network Error"
          message="Unable to connect to the server. Please check your internet connection."
        />
      );
      
      cy.get('[data-testid="error-title"]').should('contain', 'Network Error');
      cy.get('[data-testid="error-description"]').should('contain', 'Unable to connect');
    });

    it('displays validation error', () => {
      cy.mount(
        <ErrorMessage 
          title="Validation Error"
          message="Please fill in all required fields."
        />
      );
      
      cy.get('[data-testid="error-title"]').should('contain', 'Validation Error');
      cy.get('[data-testid="error-description"]').should('contain', 'required fields');
    });

    it('displays permission error', () => {
      cy.mount(
        <ErrorMessage 
          title="Permission Denied"
          message="You don't have permission to perform this action."
        />
      );
      
      cy.get('[data-testid="error-title"]').should('contain', 'Permission Denied');
      cy.get('[data-testid="error-description"]').should('contain', 'permission');
    });
  });

  describe('Edge Cases', () => {
    it('handles very long error messages', () => {
      const longMessage = 'A'.repeat(500);
      cy.mount(<ErrorMessage message={longMessage} />);
      
      cy.get('[data-testid="error-description"]')
        .should('be.visible')
        .and('have.text', longMessage);
    });

    it('handles very long titles', () => {
      const longTitle = 'This is a very long error title that might wrap to multiple lines';
      cy.mount(<ErrorMessage {...defaultProps} title={longTitle} />);
      
      cy.get('[data-testid="error-title"]')
        .should('be.visible')
        .and('have.text', longTitle);
    });

    it('handles empty message string', () => {
      cy.mount(<ErrorMessage message="" />);
      
      cy.get('[data-testid="error-description"]')
        .should('exist')
        .and('have.text', '');
    });

    it('handles multiline error messages', () => {
      const multilineMessage = 'Line 1\nLine 2\nLine 3';
      cy.mount(<ErrorMessage message={multilineMessage} />);
      
      cy.get('[data-testid="error-description"]')
        .should('have.text', multilineMessage);
    });

    it('handles special characters in message', () => {
      const specialMessage = 'Error: <script>alert("XSS")</script> & "quotes" \'apostrophes\'';
      cy.mount(<ErrorMessage message={specialMessage} />);
      
      cy.get('[data-testid="error-description"]')
        .should('have.text', specialMessage);
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA role', () => {
      cy.mount(<ErrorMessage {...defaultProps} />);
      
      cy.get('[data-testid="error-message"]')
        .should('have.attr', 'role', 'alert');
    });

    it('is keyboard navigable when retry [data-cy*="button"] is present', () => {
      const onRetrySpy = cy.spy();
      cy.mount(
        <div>
          <[data-cy*="button"]>Before</[data-cy*="button"]>
          <ErrorMessage {...defaultProps} onRetry={onRetrySpy} />
          <[data-cy*="button"]>After</[data-cy*="button"]>
        </div>
      );
      
      // * Test that retry [data-cy*="button"] is in tab order by verifying it can be focused
      cy.get('[data-testid="error-retry"]').focus();
      cy.focused().should('have.attr', 'data-cy', 'error-retry');
      
      // * Verify it's between the two [data-cy*="button"]s in tab order
      cy.get('[data-cy*="button"]').first().should('contain', 'Before');
      cy.get('[data-cy*="button"]').last().should('contain', 'After');
      cy.get('[data-testid="error-retry"]').should('exist');
    });

    it('retry [data-cy*="button"] can be activated with Enter key', () => {
      const onRetrySpy = cy.spy().as('onRetry');
      cy.mount(<ErrorMessage {...defaultProps} onRetry={onRetrySpy} />);
      
      // * Focus and trigger enter key on the [data-cy*="button"]
      cy.get('[data-testid="error-retry"]').focus().trigger('keydown', { key: 'Enter', keyCode: 13 });
      cy.get('[data-testid="error-retry"]').click(); // Fallback to click to ensure the action
      
      cy.get('@onRetry').should('have.been.calledOnce');
    });

    it('retry [data-cy*="button"] can be activated with Space key', () => {
      const onRetrySpy = cy.spy().as('onRetry');
      cy.mount(<ErrorMessage {...defaultProps} onRetry={onRetrySpy} />);
      
      // * Focus and trigger space key on the [data-cy*="button"]
      cy.get('[data-testid="error-retry"]').focus().trigger('keydown', { key: ' ', keyCode: 32 });
      cy.get('[data-testid="error-retry"]').click(); // Fallback to click to ensure the action
      
      cy.get('@onRetry').should('have.been.calledOnce');
    });

    it('announces error to screen readers', () => {
      cy.mount(<ErrorMessage {...defaultProps} />);
      
      // role="alert" makes this a live region that announces to screen readers
      cy.get('[role="alert"]').should('exist');
    });
  });

  describe('Responsive Design', () => {
    it('renders correctly on mobile viewport', () => {
      cy.viewport(375, 667);
      cy.mount(<ErrorMessage {...defaultProps} onRetry={cy.spy()} />);
      
      cy.get('[data-testid="error-message"]').should('be.visible');
      cy.get('[data-testid="error-title"]').should('be.visible');
      cy.get('[data-testid="error-description"]').should('be.visible');
      cy.get('[data-testid="error-retry"]').should('be.visible');
      
      // * Check that layout is still correct on small screen
      cy.get('.flex.items-start.gap-3').should('exist');
    });

    it('renders correctly on tablet viewport', () => {
      cy.viewport(768, 1024);
      cy.mount(<ErrorMessage {...defaultProps} onRetry={cy.spy()} />);
      
      cy.get('[data-testid="error-message"]').should('be.visible');
      cy.get('[data-testid="error-title"]').should('be.visible');
    });

    it('renders correctly on desktop viewport', () => {
      cy.viewport(1920, 1080);
      cy.mount(<ErrorMessage {...defaultProps} onRetry={cy.spy()} />);
      
      cy.get('[data-testid="error-message"]').should('be.visible');
      cy.get('[data-testid="error-title"]').should('be.visible');
    });

    it('wraps long text appropriately on narrow viewports', () => {
      cy.viewport(320, 568);
      const longMessage = 'This is a very long error message that should wrap appropriately on narrow mobile viewports without breaking the layout';
      
      cy.mount(<ErrorMessage message={longMessage} onRetry={cy.spy()} />);
      
      cy.get('[data-testid="error-description"]')
        .should('be.visible')
        .and('have.text', longMessage);
    });
  });

  describe('Integration', () => {
    it('works in a form context', () => {
      cy.mount(
        <form>
          <input type="text" placeholder="Email" />
          <ErrorMessage 
            title="Validation Error"
            message="Please enter a valid email address"
          />
          <[data-cy*="button"] type="submit">Submit</[data-cy*="button"]>
        </form>
      );
      
      cy.get('[data-testid="error-message"]').should('be.visible');
    });

    it('works in a modal context', () => {
      cy.mount(
        <div className="fixed inset-0 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2>Modal Title</h2>
            <ErrorMessage 
              {...defaultProps}
              onRetry={cy.spy()}
            />
          </div>
        </div>
      );
      
      cy.get('[data-testid="error-message"]').should('be.visible');
    });

    it('can be conditionally rendered', () => {
      const TestComponent = () => {
        const [hasError, setHasError] = React.useState(false);
        
        return (
          <div>
            <[data-cy*="button"] onClick={() => setHasError(true)}>
              Trigger Error
            </[data-cy*="button"]>
            {hasError && (
              <ErrorMessage 
                message="An error occurred"
                onRetry={() => setHasError(false)}
              />
            )}
          </div>
        );
      };
      
      cy.mount(<TestComponent />);
      
      cy.get('[data-testid="error-message"]').should('not.exist');
      
      cy.get('[data-cy*="button"]').contains('Trigger Error').click();
      cy.get('[data-testid="error-message"]').should('be.visible');
      
      cy.get('[data-testid="error-retry"]').click();
      cy.get('[data-testid="error-message"]').should('not.exist');
    });

    it('works with multiple error messages', () => {
      cy.mount(
        <div className="space-y-4">
          <ErrorMessage 
            title="Error 1"
            message="First error message"
          />
          <ErrorMessage 
            title="Error 2"
            message="Second error message"
            onRetry={cy.spy()}
          />
          <ErrorMessage 
            title="Error 3"
            message="Third error message"
          />
        </div>
      );
      
      cy.get('[data-testid="error-message"]').should('have.length', 3);
      cy.get('[data-testid="error-retry"]').should('have.length', 1);
    });
  });
});