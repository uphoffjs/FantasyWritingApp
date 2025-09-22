/**
 * @fileoverview Text Input.rapid Component Tests
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
  RapidInteractionUtils,
  RapidInteractionAssertions,
  RaceConditionHelpers,
  StressTestHelpers,
  PerformanceHelpers,
  RapidInteractionConfig
} from '../../support/rapid-interaction-utils';

describe('TextInput - Rapid Interactions', () => {
  beforeEach(function() {
    // ! Essential debug and state management
    cy.comprehensiveDebug();
    cy.cleanState();
  });

  afterEach(function() {
    // ! Capture debug info if test failed
    cy.captureFailureDebug();
  });

  // * Test wrapper component with state management
  const TestWrapper = ({ onChange, onBlur, debounceDelay = 0, ...props }: any) => {
    const [value, setValue] = React.useState('');
    const [changeCount, setChangeCount] = React.useState(0);
    const [blurCount, setBlurCount] = React.useState(0);
    const [isProcessing, setIsProcessing] = React.useState(false);
    
    const handleChange = React.useCallback((e: any) => {
      const newValue = e?.target?.value || e;
      
      if (debounceDelay > 0) {
        setIsProcessing(true);
        clearTimeout((window as any).debounceTimer);
        (window as any).debounceTimer = setTimeout(() => {
          setValue(newValue);
          setChangeCount(prev => prev + 1);
          onChange?.(newValue);
          setIsProcessing(false);
        }, debounceDelay);
      } else {
        setValue(newValue);
        setChangeCount(prev => prev + 1);
        onChange?.(newValue);
      }
    }, [onChange, debounceDelay]);
    
    const handleBlur = React.useCallback(() => {
      setBlurCount(prev => prev + 1);
      onBlur?.();
    }, [onBlur]);
    
    return (
      <div>
        <TextInput
          {...props}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          data-cy="text-input"
        />
        <div data-cy="change-count" data-action-count>{changeCount}</div>
        <div data-cy="blur-count">{blurCount}</div>
        <div data-cy="value-display">{value}</div>
        {isProcessing && <div data-cy="processing">Processing...</div>}
      </div>
    );
  };

  describe('Rapid Typing', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    cy.captureFailureDebug();
  });

    it('handles rapid typing without character loss', () => {
      const onChange = cy.stub();
      cy.mount(<TestWrapper onChange={onChange} />);
      
      const testText = 'The quick brown fox jumps over the lazy dog';
      
      // * Type rapidly with no delay
      cy.rapidType('[data-cy="text-input"]', testText, 0);
      
      // * Verify no character loss
      cy.get('[data-cy="text-input"]').should('have.value', testText);
      cy.get('[data-cy="value-display"]').should('contain', testText);
    });

    it('handles very fast typing (100+ WPM)', () => {
      cy.mount(<TestWrapper />);
      
      const testText = 'This is a test of rapid typing at high speed';
      
      // Simulate 100 WPM typing
      StressTestHelpers.simulateRapidTyping(
        '[data-cy="text-input"]',
        testText,
        100
      );
      
      // * Verify all text is captured
      cy.get('[data-cy="text-input"]').should('have.value', testText);
    });

    it('handles rapid paste operations', () => {
      cy.mount(<TestWrapper />);
      
      const longText = 'Lorem ipsum '.repeat(100);
      
      // * Rapid paste multiple times
      for (let i = 0; i < 5; i++) {
        cy.get('[data-cy="text-input"]')
          .clear()
          .invoke('val', longText)
          .trigger('input');
        cy.wait(10);
      }
      
      // TODO: * Final value should be the last paste
      cy.get('[data-cy="text-input"]').should('have.value', longText);
    });

    it('maintains correct cursor position during rapid typing', () => {
      cy.mount(<TestWrapper />);
      
      // * Type initial text
      cy.get('[data-cy="text-input"]').type('Hello World');
      
      // * Move cursor to middle and type rapidly
      cy.get('[data-cy="text-input"]')
        .type('{leftArrow}'.repeat(6))
        .type('Beautiful ', { delay: 0 });
      
      cy.get('[data-cy="text-input"]')
        .should('have.value', 'Hello Beautiful World');
    });
  });

  describe('Rapid Focus/Blur', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    cy.captureFailureDebug();
  });

    it('handles rapid focus and blur events', () => {
      const onBlur = cy.stub();
      cy.mount(<TestWrapper onBlur={onBlur} />);
      
      // * Rapidly focus and blur
      for (let i = 0; i < 10; i++) {
        cy.get('[data-cy="text-input"]').focus();
        cy.wait(5);
        cy.get('[data-cy="text-input"]').blur();
        cy.wait(5);
      }
      
      // TODO: * Should track all blur events
      cy.get('[data-cy="blur-count"]').should('contain', '10');
    });

    it('preserves value during rapid focus changes', () => {
      cy.mount(<TestWrapper />);
      
      const testValue = 'Test value';
      cy.get('[data-cy="text-input"]').type(testValue);
      
      // * Rapidly switch focus
      for (let i = 0; i < 5; i++) {
        cy.get('[data-cy="text-input"]').blur();
        cy.get('body').click();
        cy.get('[data-cy="text-input"]').focus();
      }
      
      // TODO: * Value should be preserved
      cy.get('[data-cy="text-input"]').should('have.value', testValue);
    });
  });

  describe('Debounced Input', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    cy.captureFailureDebug();
  });

    it('handles rapid typing with debounce correctly', () => {
      const onChange = cy.stub();
      cy.mount(<TestWrapper onChange={onChange} debounceDelay={300} />);
      
      // * Type rapidly
      cy.get('[data-cy="text-input"]').type('Hello', { delay: 50 });
      
      // ? TODO: * Should show processing
      cy.get('[data-cy="processing"]').should('exist');
      
      // ! PERFORMANCE: * Wait for debounce
      cy.waitForDebounce(300);
      
      // TODO: * Processing should be done and value updated
      cy.get('[data-cy="processing"]').should('not.exist');
      cy.get('[data-cy="value-display"]').should('contain', 'Hello');
      
      // TODO: ! PERFORMANCE: onChange should be called once after debounce
      cy.wrap(onChange).should('have.been.calledOnce');
    });

    it('cancels previous debounced calls correctly', () => {
      const onChange = cy.stub();
      cy.mount(<TestWrapper onChange={onChange} debounceDelay={200} />);
      
      // * Type first value
      cy.get('[data-cy="text-input"]').type('First');
      cy.wait(100); // Wait less than debounce
      
      // TODO: * Type second value (should cancel first)
      cy.get('[data-cy="text-input"]').clear().type('Second');
      
      // ! PERFORMANCE: * Wait for debounce
      cy.waitForDebounce(250);
      
      // TODO: * Only second value should be set
      cy.get('[data-cy="value-display"]').should('contain', 'Second');
      cy.get('[data-cy="value-display"]').should('not.contain', 'First');
    });
  });

  describe('Race Conditions', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    cy.captureFailureDebug();
  });

    it('handles concurrent state updates correctly', () => {
      cy.mount(<TestWrapper />);
      
      // * Simulate concurrent updates
      RaceConditionHelpers.synchronizeStateUpdates([
        () => cy.get('[data-cy="text-input"]').type('A'),
        () => cy.get('[data-cy="text-input"]').type('B'),
        () => cy.get('[data-cy="text-input"]').type('C'),
      ], 10);
      
      // TODO: * All characters should be present
      cy.get('[data-cy="text-input"]').should('have.value', 'ABC');
    });

    it('prevents duplicate submissions on rapid clicking', () => {
      const SubmitForm = () => {
        const [submissions, setSubmissions] = React.useState(0);
        const [isSubmitting, setIsSubmitting] = React.useState(false);
        
        const handleSubmit = async () => {
          if (isSubmitting) return;
          
          setIsSubmitting(true);
          await new Promise(resolve => setTimeout(resolve, 100));
          setSubmissions(prev => prev + 1);
          setIsSubmitting(false);
        };
        
        return (
          <div>
            <TextInput data-cy="text-input" />
            <button 
              onClick={handleSubmit}
              data-cy="submit-button"
              disabled={isSubmitting}
            >
              Submit
            </button>
            <div data-cy="submission-count" data-submission-count>
              {submissions}
            </div>
          </div>
        );
      };
      
      cy.mount(<SubmitForm />);
      
      // * Rapidly click submit
      StressTestHelpers.simulateRapidFormSubmit(
        'form',
        '[data-cy="submit-button"]',
        10
      );
      
      // TODO: * Should only have one submission
      cy.get('[data-cy="submission-count"]').should('contain', '1');
    });
  });

  describe('Performance', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    cy.captureFailureDebug();
  });

    it('remains responsive during rapid input', () => {
      cy.mount(<TestWrapper />);
      
      // Test UI responsiveness
      PerformanceHelpers.testResponsiveness(
        () => {
          // * Rapid typing
          for (let i = 0; i < 50; i++) {
            cy.get('[data-cy="text-input"]').type('a', { delay: 0 });
          }
        },
        '[data-cy="text-input"]',
        RapidInteractionConfig.MAX_RENDER_TIME
      );
    });

    it('handles rapid clear and type cycles efficiently', () => {
      cy.mount(<TestWrapper />);
      
      const startTime = Date.now();
      
      // * Rapid clear and type cycles
      for (let i = 0; i < 10; i++) {
        cy.get('[data-cy="text-input"]')
          .clear()
          .type(`Cycle ${i}`, { delay: 0 });
      }
      
      cy.wrap(null).then(() => {
        const duration = Date.now() - startTime;
        // TODO: * Should complete quickly
        expect(duration).to.be.lessThan(2000);
      });
      
      // TODO: * Final value should be correct
      cy.get('[data-cy="text-input"]').should('have.value', 'Cycle 9');
    });
  });

  describe('Stress Testing', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    cy.captureFailureDebug();
  });

    it('handles rage clicking without breaking', () => {
      cy.mount(<TestWrapper />);
      
      cy.get('[data-cy="text-input"]').type('Initial value');
      
      // * Simulate rage clicking
      StressTestHelpers.simulateRageClick('[data-cy="text-input"]', 1000);
      
      // TODO: * Component should still be functional
      cy.get('[data-cy="text-input"]')
        .clear()
        .type('Still works');
      
      cy.get('[data-cy="text-input"]').should('have.value', 'Still works');
    });

    it('handles rapid select all and replace', () => {
      cy.mount(<TestWrapper />);
      
      // * Rapid select all and replace
      for (let i = 0; i < 10; i++) {
        cy.get('[data-cy="text-input"]')
          .type('{selectall}')
          .type(`Replace ${i}`, { delay: 0 });
        cy.wait(10);
      }
      
      // TODO: * Should have final replacement
      cy.get('[data-cy="text-input"]').should('have.value', 'Replace 9');
    });

    it('handles rapid undo/redo operations', () => {
      cy.mount(<TestWrapper />);
      
      // * Type some text
      cy.get('[data-cy="text-input"]').type('Hello World');
      
      // * Rapid undo/redo (if supported)
      for (let i = 0; i < 5; i++) {
        cy.get('[data-cy="text-input"]').type('{cmd+z}'); // Undo
        cy.wait(10);
        cy.get('[data-cy="text-input"]').type('{cmd+shift+z}'); // Redo
        cy.wait(10);
      }
      
      // TODO: * Value should be maintained or properly handled
      cy.get('[data-cy="text-input"]').invoke('val').should('exist');
    });
  });

  describe('Assertions', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    cy.captureFailureDebug();
  });

    it('verifies no character loss during rapid input', () => {
      cy.mount(<TestWrapper />);
      
      const testText = 'Testing123!@#';
      
      RapidInteractionAssertions.assertNoCharacterLoss(
        '[data-cy="text-input"]',
        testText
      );
    });

    it('verifies UI responsiveness during rapid actions', () => {
      cy.mount(<TestWrapper />);
      
      RapidInteractionAssertions.assertUIResponsiveness(
        () => {
          // * Rapid typing action
          cy.get('[data-cy="text-input"]').type('Rapid text', { delay: 0 });
        },
        '[data-cy="text-input"]',
        RapidInteractionConfig.MAX_RESPONSE_TIME
      );
    });

    it('verifies correct change count tracking', () => {
      cy.mount(<TestWrapper />);
      
      // Type 10 characters rapidly
      'HelloWorld'.split('').forEach(char => {
        cy.get('[data-cy="text-input"]').type(char, { delay: 0 });
      });
      
      // TODO: * Change count should match
      cy.get('[data-cy="change-count"]')
        .invoke('text')
        .then(text => {
          const count = parseInt(text);
          expect(count).to.be.at.least(10);
        });
    });
  });
});