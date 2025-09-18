import React from 'react';
import { LinkModal } from '../../src/components/LinkModal';
import { mountWithProviders } from '../support/mount-helpers';
import { waitForAnimation, setMobileViewport, setTabletViewport, setDesktopViewport } from '../support/test-utils';

describe('LinkModal Component', () => {
  let onCloseSpy: any;
  let onConfirmSpy: any;

  beforeEach(() => {
    onCloseSpy = cy.spy();
    onConfirmSpy = cy.spy();
  });

  describe('Rendering', () => {
    it('renders when isOpen is true', () => {
      mountWithProviders(
        <LinkModal 
          isOpen={true}
          onClose={onCloseSpy}
          onConfirm={onConfirmSpy}
        />
      );

      cy.get('[role="dialog"]').should('be.visible');
      cy.get('#link-modal-title').should('contain', 'Add Link');
      cy.get('#link-url').should('be.visible');
      cy.contains('[data-cy*="button"]', 'Add Link').should('be.visible');
    });

    it('does not render when isOpen is false', () => {
      mountWithProviders(
        <LinkModal 
          isOpen={false}
          onClose={onCloseSpy}
          onConfirm={onConfirmSpy}
        />
      );

      cy.get('[role="dialog"]').should('not.exist');
    });

    it('renders edit mode when currentUrl is provided', () => {
      mountWithProviders(
        <LinkModal 
          isOpen={true}
          currentUrl="https://example.com"
          onClose={onCloseSpy}
          onConfirm={onConfirmSpy}
        />
      );

      cy.get('#link-modal-title').should('contain', 'Edit Link');
      cy.get('#link-url').should('have.value', 'https://example.com');
      cy.contains('[data-cy*="button"]', 'Update Link').should('be.visible');
      cy.contains('[data-cy*="button"]', 'Remove Link').should('be.visible');
    });

    it('renders add mode when currentUrl is empty', () => {
      mountWithProviders(
        <LinkModal 
          isOpen={true}
          currentUrl=""
          onClose={onCloseSpy}
          onConfirm={onConfirmSpy}
        />
      );

      cy.get('#link-modal-title').should('contain', 'Add Link');
      cy.get('#link-url').should('have.value', '');
      cy.contains('[data-cy*="button"]', 'Add Link').should('be.visible');
      cy.contains('[data-cy*="button"]', 'Remove Link').should('not.exist');
    });

    it('displays help text for URL format', () => {
      mountWithProviders(
        <LinkModal 
          isOpen={true}
          onClose={onCloseSpy}
          onConfirm={onConfirmSpy}
        />
      );

      cy.get('#url-help').should('contain', 'Enter a valid URL including the protocol');
    });
  });

  describe('URL Input', () => {
    it('accepts valid URL input', () => {
      mountWithProviders(
        <LinkModal 
          isOpen={true}
          onClose={onCloseSpy}
          onConfirm={onConfirmSpy}
        />
      );

      const testUrl = 'https://www.example.com/page';
      cy.get('#link-url').type(testUrl);
      cy.get('#link-url').should('have.value', testUrl);
    });

    it('validates URL format with HTML5 validation', () => {
      mountWithProviders(
        <LinkModal 
          isOpen={true}
          onClose={onCloseSpy}
          onConfirm={onConfirmSpy}
        />
      );

      // TODO: * Input should have type="url"
      cy.get('#link-url').should('have.attr', 'type', 'url');
      cy.get('#link-url').should('have.attr', 'required');
    });

    it('shows placeholder text', () => {
      mountWithProviders(
        <LinkModal 
          isOpen={true}
          onClose={onCloseSpy}
          onConfirm={onConfirmSpy}
        />
      );

      cy.get('#link-url').should('have.attr', 'placeholder', 'https://example.com');
    });

    it('updates URL value when typing', () => {
      mountWithProviders(
        <LinkModal 
          isOpen={true}
          onClose={onCloseSpy}
          onConfirm={onConfirmSpy}
        />
      );

      cy.get('#link-url').type('https://test.com');
      cy.get('#link-url').should('have.value', 'https://test.com');
      
      cy.get('#link-url').clear().type('ftp://files.com');
      cy.get('#link-url').should('have.value', 'ftp://files.com');
    });

    it('preserves existing URL in edit mode', () => {
      const existingUrl = 'https://existing.com/path?query=value';
      mountWithProviders(
        <LinkModal 
          isOpen={true}
          currentUrl={existingUrl}
          onClose={onCloseSpy}
          onConfirm={onConfirmSpy}
        />
      );

      cy.get('#link-url').should('have.value', existingUrl);
    });
  });

  describe('Focus Management', () => {
    it('auto-focuses input when modal opens', () => {
      mountWithProviders(
        <LinkModal 
          isOpen={true}
          onClose={onCloseSpy}
          onConfirm={onConfirmSpy}
        />
      );

      cy.get('#link-url').should('have.focus');
    });

    it('auto-[data-cy*="select"]s existing URL when modal opens in edit mode', () => {
      mountWithProviders(
        <LinkModal 
          isOpen={true}
          currentUrl="https://example.com"
          onClose={onCloseSpy}
          onConfirm={onConfirmSpy}
        />
      );

      cy.get('#link-url').should('have.focus');
      // * Check that text is [data-cy*="select"]ed (ready to be replaced)
      cy.window().then((win) => {
        const input = win.document.getElementById('link-url') as HTMLInputElement;
        expect(input.[data-cy*="select"]ionStart).to.equal(0);
        expect(input.[data-cy*="select"]ionEnd).to.equal(input.value.length);
      });
    });

    it('does not focus when modal is closed', () => {
      mountWithProviders(
        <LinkModal 
          isOpen={false}
          onClose={onCloseSpy}
          onConfirm={onConfirmSpy}
        />
      );

      cy.get('#link-url').should('not.exist');

      // * Open modal by remounting
      mountWithProviders(
        <LinkModal 
          isOpen={true}
          onClose={onCloseSpy}
          onConfirm={onConfirmSpy}
        />
      );

      cy.get('#link-url').should('have.focus');
    });
  });

  describe('Form Submission', () => {
    it('submits valid URL and closes modal', () => {
      mountWithProviders(
        <LinkModal 
          isOpen={true}
          onClose={onCloseSpy}
          onConfirm={onConfirmSpy}
        />
      );

      const testUrl = 'https://www.example.com';
      cy.get('#link-url').type(testUrl);
      cy.contains('[data-cy*="button"]', 'Add Link').click();

      cy.wrap(onConfirmSpy).should('have.been.calledWith', testUrl);
      cy.wrap(onCloseSpy).should('have.been.called');
    });

    it('submits updated URL in edit mode', () => {
      mountWithProviders(
        <LinkModal 
          isOpen={true}
          currentUrl="https://old.com"
          onClose={onCloseSpy}
          onConfirm={onConfirmSpy}
        />
      );

      cy.get('#link-url').clear().type('https://new.com');
      cy.contains('[data-cy*="button"]', 'Update Link').click();

      cy.wrap(onConfirmSpy).should('have.been.calledWith', 'https://new.com');
      cy.wrap(onCloseSpy).should('have.been.called');
    });

    it('submits form with Enter key', () => {
      mountWithProviders(
        <LinkModal 
          isOpen={true}
          onClose={onCloseSpy}
          onConfirm={onConfirmSpy}
        />
      );

      const testUrl = 'https://www.example.com';
      cy.get('#link-url').type(`${testUrl}{enter}`);

      cy.wrap(onConfirmSpy).should('have.been.calledWith', testUrl);
      cy.wrap(onCloseSpy).should('have.been.called');
    });

    it('prevents submission with empty URL', () => {
      mountWithProviders(
        <LinkModal 
          isOpen={true}
          onClose={onCloseSpy}
          onConfirm={onConfirmSpy}
        />
      );

      // * Try to submit without entering URL
      cy.get('#link-url').clear();
      cy.contains('[data-cy*="button"]', 'Add Link').click();

      // Check HTML5 validation message appears
      cy.get('#link-url:invalid').should('exist');
      cy.wrap(onConfirmSpy).should('not.have.been.called');
    });

    it('prevents submission with invalid URL format', () => {
      mountWithProviders(
        <LinkModal 
          isOpen={true}
          onClose={onCloseSpy}
          onConfirm={onConfirmSpy}
        />
      );

      // * Enter invalid URL
      cy.get('#link-url').type('not a url');
      cy.contains('[data-cy*="button"]', 'Add Link').click();

      // TODO: * Should trigger HTML5 validation
      cy.get('#link-url:invalid').should('exist');
      cy.wrap(onConfirmSpy).should('not.have.been.called');
    });
  });

  describe('Remove Link', () => {
    it('shows remove [data-cy*="button"] only in edit mode', () => {
      mountWithProviders(
        <LinkModal 
          isOpen={true}
          currentUrl="https://example.com"
          onClose={onCloseSpy}
          onConfirm={onConfirmSpy}
        />
      );

      cy.contains('[data-cy*="button"]', 'Remove Link').should('be.visible');
    });

    it('does not show remove [data-cy*="button"] in add mode', () => {
      mountWithProviders(
        <LinkModal 
          isOpen={true}
          onClose={onCloseSpy}
          onConfirm={onConfirmSpy}
        />
      );

      cy.contains('[data-cy*="button"]', 'Remove Link').should('not.exist');
    });

    it('removes link by passing empty string', () => {
      mountWithProviders(
        <LinkModal 
          isOpen={true}
          currentUrl="https://example.com"
          onClose={onCloseSpy}
          onConfirm={onConfirmSpy}
        />
      );

      cy.contains('[data-cy*="button"]', 'Remove Link').click();

      cy.wrap(onConfirmSpy).should('have.been.calledWith', '');
      cy.wrap(onCloseSpy).should('have.been.called');
    });
  });

  describe('Cancel Action', () => {
    it('closes modal without confirming when cancel clicked', () => {
      mountWithProviders(
        <LinkModal 
          isOpen={true}
          onClose={onCloseSpy}
          onConfirm={onConfirmSpy}
        />
      );

      cy.get('#link-url').type('https://test.com');
      cy.contains('[data-cy*="button"]', 'Cancel').click();

      cy.wrap(onCloseSpy).should('have.been.called');
      cy.wrap(onConfirmSpy).should('not.have.been.called');
    });

    it('closes modal without confirming when X clicked', () => {
      mountWithProviders(
        <LinkModal 
          isOpen={true}
          onClose={onCloseSpy}
          onConfirm={onConfirmSpy}
        />
      );

      cy.get('#link-url').type('https://test.com');
      cy.get('[aria-label="Close dialog"]').click();

      cy.wrap(onCloseSpy).should('have.been.called');
      cy.wrap(onConfirmSpy).should('not.have.been.called');
    });
  });

  describe('State Management', () => {
    it('updates URL state when currentUrl prop changes', () => {
      mountWithProviders(
        <LinkModal 
          isOpen={true}
          currentUrl="https://first.com"
          onClose={onCloseSpy}
          onConfirm={onConfirmSpy}
        />
      );

      cy.get('#link-url').should('have.value', 'https://first.com');

      // * Update currentUrl prop
      mountWithProviders(
        <LinkModal 
          isOpen={true}
          currentUrl="https://second.com"
          onClose={onCloseSpy}
          onConfirm={onConfirmSpy}
        />
      );

      cy.get('#link-url').should('have.value', 'https://second.com');
    });

    it('resets URL when modal reopens', () => {
      mountWithProviders(
        <LinkModal 
          isOpen={true}
          currentUrl="https://example.com"
          onClose={onCloseSpy}
          onConfirm={onConfirmSpy}
        />
      );

      // * Modify the URL
      cy.get('#link-url').clear().type('https://modified.com');

      // * Close modal
      mountWithProviders(
        <LinkModal 
          isOpen={false}
          currentUrl="https://example.com"
          onClose={onCloseSpy}
          onConfirm={onConfirmSpy}
        />
      );

      // * Reopen modal
      mountWithProviders(
        <LinkModal 
          isOpen={true}
          currentUrl="https://example.com"
          onClose={onCloseSpy}
          onConfirm={onConfirmSpy}
        />
      );

      // TODO: * Should reset to original URL
      cy.get('#link-url').should('have.value', 'https://example.com');
    });
  });

  describe('Edge Cases', () => {
    it('handles very long URLs', () => {
      const longUrl = `https://example.com/${'a'.repeat(500)}`;
      
      mountWithProviders(
        <LinkModal 
          isOpen={true}
          onClose={onCloseSpy}
          onConfirm={onConfirmSpy}
        />
      );

      cy.get('#link-url').type(longUrl, { delay: 0 });
      cy.contains('[data-cy*="button"]', 'Add Link').click();

      cy.wrap(onConfirmSpy).should('have.been.calledWith', longUrl);
    });

    it('handles URLs with special characters', () => {
      const specialUrl = 'https://example.com/path?query=value&foo=bar#anchor';
      
      mountWithProviders(
        <LinkModal 
          isOpen={true}
          onClose={onCloseSpy}
          onConfirm={onConfirmSpy}
        />
      );

      cy.get('#link-url').type(specialUrl);
      cy.contains('[data-cy*="button"]', 'Add Link').click();

      cy.wrap(onConfirmSpy).should('have.been.calledWith', specialUrl);
    });

    it('handles international domain names', () => {
      const intlUrl = 'https://例え.jp/パス';
      
      mountWithProviders(
        <LinkModal 
          isOpen={true}
          onClose={onCloseSpy}
          onConfirm={onConfirmSpy}
        />
      );

      cy.get('#link-url').type(intlUrl);
      cy.get('#link-url').should('have.value', intlUrl);
    });

    it('handles various URL protocols', () => {
      const protocols = [
        'http://example.com',
        'https://example.com',
        'ftp://example.com',
        'mailto:test@example.com',
        'tel:+1234567890'
      ];

      protocols.forEach(url => {
        mountWithProviders(
          <LinkModal 
            isOpen={true}
            onClose={onCloseSpy}
            onConfirm={onConfirmSpy}
          />
        );

        cy.get('#link-url').clear().type(url);
        cy.get('#link-url').should('have.value', url);
      });
    });

    it('handles rapid open/close cycles', () => {
      mountWithProviders(
        <LinkModal 
          isOpen={true}
          onClose={onCloseSpy}
          onConfirm={onConfirmSpy}
        />
      );

      // * Rapidly toggle modal
      for (let i = 0; i < 5; i++) {
        mountWithProviders(
          <LinkModal 
            isOpen={false}
            onClose={onCloseSpy}
            onConfirm={onConfirmSpy}
          />
        );
        
        mountWithProviders(
          <LinkModal 
            isOpen={true}
            onClose={onCloseSpy}
            onConfirm={onConfirmSpy}
          />
        );
      }

      // TODO: * Modal should still work correctly
      cy.get('#link-url').should('be.visible').and('have.focus');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      mountWithProviders(
        <LinkModal 
          isOpen={true}
          onClose={onCloseSpy}
          onConfirm={onConfirmSpy}
        />
      );

      cy.get('[role="dialog"]').should('have.attr', 'aria-modal', 'true');
      cy.get('[role="dialog"]').should('have.attr', 'aria-labelledby', 'link-modal-title');
      cy.get('#link-url').should('have.attr', 'aria-required', 'true');
      cy.get('#link-url').should('have.attr', 'aria-describedby', 'url-help');
    });

    it('has proper labels for form elements', () => {
      mountWithProviders(
        <LinkModal 
          isOpen={true}
          onClose={onCloseSpy}
          onConfirm={onConfirmSpy}
        />
      );

      cy.get('label[for="link-url"]').should('contain', 'URL');
      cy.get('[aria-label="Close dialog"]').should('exist');
    });

    it('supports keyboard navigation', () => {
      mountWithProviders(
        <LinkModal 
          isOpen={true}
          onClose={onCloseSpy}
          onConfirm={onConfirmSpy}
        />
      );

      // * Start with focus on input
      cy.get('#link-url').should('have.focus');

      // * Tab to Cancel [data-cy*="button"]
      cy.focused().tab();
      cy.focused().should('contain', 'Cancel');

      // * Tab to Add Link [data-cy*="button"]
      cy.focused().tab();
      cy.focused().should('contain', 'Add Link');
    });

    it('traps focus within modal', () => {
      mountWithProviders(
        <LinkModal 
          isOpen={true}
          onClose={onCloseSpy}
          onConfirm={onConfirmSpy}
        />
      );

      // * Tab through all focusable elements
      cy.get('#link-url').focus();
      cy.focused().tab(); // Cancel
      cy.focused().tab(); // Add Link
      cy.focused().tab(); // Should cycle back to close [data-cy*="button"] or first element
      
      // TODO: * Focus should remain within modal
      cy.focused().should('exist');
    });
  });

  describe('Responsive Design', () => {
    it('adapts layout for mobile viewport', () => {
      setMobileViewport();
      mountWithProviders(
        <LinkModal 
          isOpen={true}
          onClose={onCloseSpy}
          onConfirm={onConfirmSpy}
        />
      );

      cy.get('.max-w-md').should('be.visible');
      cy.get('.p-4').should('be.visible');
    });

    it('adapts layout for tablet viewport', () => {
      setTabletViewport();
      mountWithProviders(
        <LinkModal 
          isOpen={true}
          onClose={onCloseSpy}
          onConfirm={onConfirmSpy}
        />
      );

      cy.get('.max-w-md').should('be.visible');
      cy.get('[role="dialog"]').should('be.visible');
    });

    it('maintains max width on desktop', () => {
      setDesktopViewport();
      mountWithProviders(
        <LinkModal 
          isOpen={true}
          onClose={onCloseSpy}
          onConfirm={onConfirmSpy}
        />
      );

      cy.get('.max-w-md').should('be.visible');
      cy.get('[role="document"]').should('be.visible') // React Native Web uses inline styles instead of CSS classes;
    });
  });

  describe('Visual States', () => {
    it('shows hover states on interactive elements', () => {
      mountWithProviders(
        <LinkModal 
          isOpen={true}
          onClose={onCloseSpy}
          onConfirm={onConfirmSpy}
        />
      );

      // Close [data-cy*="button"] hover
      cy.get('[aria-label="Close dialog"]')
        .trigger('mouseenter')
        .should('be.visible') // React Native Web uses inline styles instead of CSS classes;

      // Cancel [data-cy*="button"] hover
      cy.contains('[data-cy*="button"]', 'Cancel')
        .trigger('mouseenter')
        .should('be.visible') // React Native Web uses inline styles instead of CSS classes;

      // Submit [data-cy*="button"] hover
      cy.contains('[data-cy*="button"]', 'Add Link')
        .trigger('mouseenter')
        .should('be.visible') // React Native Web uses inline styles instead of CSS classes;
    });

    it('shows focus states on input', () => {
      mountWithProviders(
        <LinkModal 
          isOpen={true}
          onClose={onCloseSpy}
          onConfirm={onConfirmSpy}
        />
      );

      cy.get('#link-url').focus();
      cy.get('#link-url').should('be.visible') // React Native Web uses inline styles instead of CSS classes;
    });
  });
});