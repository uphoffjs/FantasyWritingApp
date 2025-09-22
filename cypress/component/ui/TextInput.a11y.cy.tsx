/**
 * @fileoverview Text Input.a11y Component Tests
 * Tests for US-X.X: [User Story Name]
 *
 * User Story:
 * As a [user type]
 * I want to [action]
 * So that [benefit]
 *
 * Acceptance Criteria:
 * - [Criterion 1]
 * - [Criterion 2]
 * - [Criterion 3]
 */

/// <reference types="cypress" />
import React from 'react';
import { TextInput } from '../../../src/components/TextInput';
import {
  AccessibilityHelpers,
  ComponentAccessibilityTests,
  KeyboardPatterns,
  ScreenReaderUtils,
  WCAGCriteria
} from '../../support/accessibility-utils';

describe('TextInput - Accessibility (A11Y)', () => {
  // * Test wrapper with proper ARIA attributes
  const A11yTestWrapper = ({ 
    label,
    error,
    required,
    helperText,
    ...props 
  }: any) => {
    const inputId = 'test-input';
    const errorId = 'test-error';
    const helperId = 'test-helper';
    
    return (
      <div>
        {label && (
          <label htmlFor={inputId} id="test-label">
            {label}
            {required && <span aria-label="required"> *</span>}
          </label>
        )}
        
        <TextInput
          {...props}
          id={inputId}
          data-cy="text-input"
          aria-label={!label ? props['aria-label'] || 'Text input' : undefined}
          aria-labelledby={label ? 'test-label' : undefined}
          aria-describedby={
            [
              helperText && helperId,
              error && errorId
            ].filter(Boolean).join(' ') || undefined
          }
          aria-invalid={error ? 'true' : 'false'}
          aria-required={required ? 'true' : 'false'}
          aria-errormessage={error ? errorId : undefined}
        />
        
        {helperText && (
          <div id={helperId} className="helper-text">
            {helperText}
          </div>
        )}
        
        {error && (
          <div id={errorId} role="alert" aria-live="assertive" className="error-text">
            {error}
          </div>
        )}
      </div>
    );
  };

  beforeEach(function() {
    // ! MANDATORY: Comprehensive debug setup
    cy.comprehensiveDebug();

    // * Clean state before each test
    cy.cleanState();

    // * Initialize axe-core for accessibility testing
    cy.visit('/');
    AccessibilityHelpers.initializeAxe();
  });

  describe('WCAG Compliance', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    cy.captureFailureDebug();
  });

    it('passes WCAG 2.1 Level A criteria', () => {
      cy.mount(<A11yTestWrapper label="Username" />);
      
      // * Run axe accessibility check for Level A
      cy.checkAccessibility(null, {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag21a']
        }
      });
    });

    it('passes WCAG 2.1 Level AA criteria', () => {
      cy.mount(<A11yTestWrapper label="Email Address" type="email" />);
      
      // * Run axe accessibility check for Level AA
      cy.checkAccessibility(null, {
        runOnly: {
          type: 'tag',
          values: ['wcag2aa', 'wcag21aa']
        }
      });
    });

    it('passes best practice criteria', () => {
      cy.mount(<A11yTestWrapper label="Password" type="password" />);
      
      cy.checkAccessibility(null, {
        runOnly: {
          type: 'tag',
          values: ['best-practice']
        }
      });
    });

    it('has sufficient color contrast', () => {
      cy.mount(<A11yTestWrapper label="High Contrast Input" />);
      
      // * Check color contrast specifically
      cy.checkAccessibility('[data-cy="text-input"]', {
        runOnly: {
          type: 'rule',
          values: ['color-contrast']
        }
      });
    });
  });

  describe('ARIA Attributes', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    cy.captureFailureDebug();
  });

    it('has proper ARIA attributes when labeled', () => {
      cy.mount(<A11yTestWrapper label="Full Name" required={true} />);
      
      cy.verifyARIAAttributes('[data-cy="text-input"]', {
        'aria-labelledby': 'test-label',
        'aria-required': 'true',
        'aria-invalid': 'false'
      });
    });

    it('has aria-label when no visible label', () => {
      cy.mount(<A11yTestWrapper aria-label="Search query" placeholder="Search..." />);
      
      cy.get('[data-cy="text-input"]')
        .should('have.attr', 'aria-label', 'Search query');
    });

    it('has proper error state ARIA attributes', () => {
      cy.mount(
        <A11yTestWrapper 
          label="Email"
          error="Please enter a valid email address"
          required={true}
        />
      );
      
      cy.verifyARIAAttributes('[data-cy="text-input"]', {
        'aria-invalid': 'true',
        'aria-errormessage': 'test-error',
        'aria-describedby': 'test-error'
      });
      
      // * Verify error message is announced
      cy.get('#test-error')
        .should('have.attr', 'role', 'alert')
        .and('have.attr', 'aria-live', 'assertive');
    });

    it('has proper helper text association', () => {
      cy.mount(
        <A11yTestWrapper 
          label="Username"
          helperText="Must be 3-20 characters"
        />
      );
      
      cy.get('[data-cy="text-input"]')
        .should('have.attr', 'aria-describedby', 'test-helper');
    });

    it('handles multiline text areas properly', () => {
      cy.mount(
        <A11yTestWrapper 
          label="Comments"
          multiline={true}
          rows={4}
          aria-multiline="true"
        />
      );
      
      cy.get('[data-cy="text-input"]')
        .should('have.attr', 'aria-multiline', 'true');
    });
  });

  describe('Keyboard Navigation', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    cy.captureFailureDebug();
  });

    it('can be focused with Tab key', () => {
      cy.mount(
        <div>
          <button>Previous Element</button>
          <A11yTestWrapper label="Tabbable Input" />
          <button>Next Element</button>
        </div>
      );
      
      // * Tab to input
      cy.get('button').first().focus();
      cy.realPress('Tab');
      cy.focused().should('have.attr', 'data-cy', 'text-input');
      
      // * Tab to next element
      cy.realPress('Tab');
      cy.focused().should('contain', 'Next Element');
      
      // Shift+Tab back to input
      cy.realPress(['Shift', 'Tab']);
      cy.focused().should('have.attr', 'data-cy', 'text-input');
    });

    it('supports all standard keyboard shortcuts', () => {
      cy.mount(<A11yTestWrapper label="Keyboard Test" />);
      
      cy.get('[data-cy="text-input"]').focus().type('Hello World');
      
      // * Select all
      cy.realPress(['Control', 'a']);
      
      // Copy
      cy.realPress(['Control', 'c']);
      
      // * Delete and paste
      cy.realPress('Delete');
      cy.realPress(['Control', 'v']);
      
      cy.get('[data-cy="text-input"]').should('have.value', 'Hello World');
    });

    it('allows text navigation with arrow keys', () => {
      cy.mount(<A11yTestWrapper label="Navigation Test" />);
      
      cy.get('[data-cy="text-input"]').focus().type('Test');
      
      // * Move cursor with arrow keys
      cy.realPress('ArrowLeft');
      cy.realPress('ArrowLeft');
      cy.type('X');
      
      cy.get('[data-cy="text-input"]').should('have.value', 'TeXst');
    });

    it('respects readonly state for keyboard input', () => {
      cy.mount(<A11yTestWrapper label="Readonly Field" readOnly={true} value="Cannot edit" />);
      
      cy.get('[data-cy="text-input"]').focus();
      cy.type('Trying to type');
      
      // TODO: * Value should not change
      cy.get('[data-cy="text-input"]').should('have.value', 'Cannot edit');
    });

    it('respects disabled state for keyboard navigation', () => {
      cy.mount(
        <div>
          <button>Before</button>
          <A11yTestWrapper label="Disabled Field" disabled={true} />
          <button>After</button>
        </div>
      );
      
      // TODO: * Should skip disabled input when tabbing
      cy.get('button').first().focus();
      cy.realPress('Tab');
      cy.focused().should('contain', 'After');
    });
  });

  describe('Screen Reader Support', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    cy.captureFailureDebug();
  });

    it('announces label correctly', () => {
      cy.mount(<A11yTestWrapper label="Your Name" required={true} />);
      
      // TODO: * Label should be associated
      cy.get('label').should('have.attr', 'for', 'test-input');
      cy.get('[data-cy="text-input"]').should('have.attr', 'id', 'test-input');
      
      // TODO: * Required indicator should have accessible text
      cy.get('label span').should('have.attr', 'aria-label', 'required');
    });

    it('announces error messages immediately', () => {
      cy.mount(<A11yTestWrapper label="Email" />);
      
      // * Type invalid email
      cy.get('[data-cy="text-input"]').type('invalid');
      
      // * Trigger error
      cy.mount(
        <A11yTestWrapper 
          label="Email"
          value="invalid"
          error="Invalid email format"
        />
      );
      
      // TODO: * Error should be announced via live region
      cy.get('[role="alert"]')
        .should('have.attr', 'aria-live', 'assertive')
        .and('contain', 'Invalid email format');
    });

    it('announces character count for limited inputs', () => {
      const CharCountWrapper = () => {
        const [value, setValue] = React.useState('');
        const maxLength = 50;
        
        return (
          <div>
            <label htmlFor="limited-input">Bio</label>
            <TextInput
              id="limited-input"
              data-cy="text-input"
              value={value}
              onChange={(e: any) => setValue(e.target.value)}
              maxLength={maxLength}
              aria-describedby="char-count"
            />
            <div 
              id="char-count"
              aria-live="polite"
              aria-atomic="true"
            >
              {value.length} of {maxLength} characters
            </div>
          </div>
        );
      };
      
      cy.mount(<CharCountWrapper />);
      
      cy.get('[data-cy="text-input"]').type('Hello');
      cy.get('#char-count')
        .should('have.attr', 'aria-live', 'polite')
        .and('contain', '5 of 50 characters');
    });

    it('provides clear focus indication', () => {
      cy.mount(<A11yTestWrapper label="Focus Test" />);
      
      // * Focus the input
      cy.get('[data-cy="text-input"]').focus();
      
      // * Check for visible focus indicator (outline)
      cy.get('[data-cy="text-input"]').should(($input) => {
        const styles = window.getComputedStyle($input[0]);
        const hasOutline = styles.outlineStyle !== 'none' && styles.outlineWidth !== '0px';
        const hasBorder = styles.borderStyle !== 'none';
        const hasBoxShadow = styles.boxShadow !== 'none';
        
        expect(hasOutline || hasBorder || hasBoxShadow).to.be.true;
      });
    });
  });

  describe('Form Integration', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    cy.captureFailureDebug();
  });

    it('works correctly in a form with proper labeling', () => {
      cy.mount(
        <form>
          <A11yTestWrapper 
            label="Username"
            required={true}
            helperText="Enter your username"
          />
          <A11yTestWrapper 
            label="Password"
            type="password"
            required={true}
            helperText="Must be at least 8 characters"
          />
          <button type="submit">Submit</button>
        </form>
      );
      
      // * Check form structure
      ComponentAccessibilityTests.testFormInput('[id="test-input"]', 'Username');
      
      // * Navigate with Tab
      cy.get('[id="test-input"]').first().focus();
      cy.realPress('Tab');
      cy.focused().should('have.attr', 'type', 'password');
      cy.realPress('Tab');
      cy.focused().should('contain', 'Submit');
    });

    it('supports autocomplete attributes', () => {
      cy.mount(
        <form>
          <A11yTestWrapper 
            label="Email"
            type="email"
            autoComplete="email"
          />
          <A11yTestWrapper 
            label="Full Name"
            autoComplete="name"
          />
        </form>
      );
      
      cy.get('[type="email"]').should('have.attr', 'autocomplete', 'email');
      cy.get('[autocomplete="name"]').should('exist');
    });
  });

  describe('Error Prevention', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    cy.captureFailureDebug();
  });

    it('provides clear constraints for input', () => {
      cy.mount(
        <A11yTestWrapper 
          label="Phone Number"
          type="tel"
          pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
          placeholder="123-456-7890"
          helperText="Format: 123-456-7890"
          required={true}
        />
      );
      
      // TODO: * Pattern should be indicated
      cy.get('[data-cy="text-input"]')
        .should('have.attr', 'pattern')
        .and('have.attr', 'placeholder', '123-456-7890');
      
      // * Helper text provides format
      cy.get('#test-helper').should('contain', 'Format: 123-456-7890');
    });

    it('prevents submission with invalid data', () => {
      const FormWithValidation = () => {
        const [error, setError] = React.useState('');
        
        const handleSubmit = (e: React.FormEvent) => {
          e.preventDefault();
          const input = (e.target as HTMLFormElement).elements.namedItem('email') as HTMLInputElement;
          
          if (!input.value.includes('@')) {
            setError('Please enter a valid email');
          }
        };
        
        return (
          <form onSubmit={handleSubmit}>
            <A11yTestWrapper 
              label="Email"
              name="email"
              type="email"
              error={error}
              required={true}
            />
            <button type="submit">Submit</button>
          </form>
        );
      };
      
      cy.mount(<FormWithValidation />);
      
      // * Try to submit with invalid email
      cy.get('[data-cy="text-input"]').type('notanemail');
      cy.get('button[type="submit"]').click();
      
      // ? TODO: * Error should be shown and announced
      cy.get('[role="alert"]').should('contain', 'valid email');
    });
  });

  describe('Mobile and Touch Accessibility', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    cy.captureFailureDebug();
  });

    it('has appropriate touch target size', () => {
      cy.mount(<A11yTestWrapper label="Touch Target" />);
      
      cy.get('[data-cy="text-input"]').should(($input) => {
        const rect = $input[0].getBoundingClientRect();
        // TODO: WCAG 2.5.5 - Target size should be at least 44x44 pixels
        expect(rect.height).to.be.at.least(44);
      });
    });

    it('works with touch gestures', () => {
      cy.mount(<A11yTestWrapper label="Touch Input" />);
      
      // * Simulate touch interaction
      cy.get('[data-cy="text-input"]')
        .trigger('touchstart')
        .trigger('touchend')
        .should('have.focus');
    });
  });

  describe('Comprehensive A11Y Test', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    cy.captureFailureDebug();
  });

    it('passes all accessibility checks for a complete form', () => {
      cy.mount(
        <main role="main">
          <h1>User Registration</h1>
          <form>
            <A11yTestWrapper 
              label="Username"
              required={true}
              helperText="3-20 characters, letters and numbers only"
            />
            
            <A11yTestWrapper 
              label="Email"
              type="email"
              required={true}
              helperText="We'll never share your email"
            />
            
            <A11yTestWrapper 
              label="Password"
              type="password"
              required={true}
              helperText="Minimum 8 characters"
            />
            
            <A11yTestWrapper 
              label="Bio"
              multiline={true}
              rows={4}
              helperText="Tell us about yourself (optional)"
            />
            
            <button type="submit">Register</button>
          </form>
        </main>
      );
      
      // * Run comprehensive accessibility check
      cy.checkAccessibility();
      
      // * Test keyboard navigation through entire form
      const elements = [
        '[id="test-input"]',
        '[type="email"]',
        '[type="password"]',
        '[aria-multiline="true"]',
        'button[type="submit"]'
      ];
      
      cy.testKeyboardNavigation(elements);
      
      // * Verify all inputs have proper labels
      cy.get('input, textarea').each(($input) => {
        cy.wrap($input).should('have.attr', 'aria-labelledby')
          .or('have.attr', 'aria-label');
      });
    });
  });
});