/// <reference types="cypress" />
import React from 'react';
import { TextInput } from '../../src/components/TextInput';
import { BoundaryValues, FormBoundaryData, BoundaryTestHelpers } from '../support/boundary-test-utils';

describe('TextInput - Boundary Conditions', () => {
  // * Test wrapper component
  const TestWrapper = ({ value, onChange, ...props }: any) => {
    const [currentValue, setCurrentValue] = React.useState(value || '');
    
    return (
      <TextInput
        {...props}
        value={currentValue}
        onChange={(e) => {
          const newValue = e?.target?.value || e;
          setCurrentValue(newValue);
          onChange?.(newValue);
        }}
        data-testid="text-input"
      />
    );
  };

  describe('String Boundaries', () => {
    it('handles empty string', () => {
      cy.mount(<TestWrapper value="" placeholder="Enter text" />);
      cy.get('[data-testid="text-input"]').should('have.value', '');
    });

    it('handles very long string', () => {
      const longString = 'a'.repeat(1000);
      cy.mount(<TestWrapper value={longString} />);
      cy.get('[data-testid="text-input"]').should('have.value', longString);
    });

    it('handles string with spaces', () => {
      cy.mount(<TestWrapper value="   spaced text   " />);
      cy.get('[data-testid="text-input"]').should('have.value', '   spaced text   ');
    });

    it('handles string with newlines', () => {
      const multiline = 'line1\nline2\nline3';
      cy.mount(<TestWrapper value={multiline} multiline={true} />);
      cy.get('[data-testid="text-input"]').should('contain.value', multiline);
    });

    it('handles string with special characters', () => {
      const special = '!@#$%^&*()_+-=[]{}|;\':",./<>?';
      cy.mount(<TestWrapper value={special} />);
      cy.get('[data-testid="text-input"]').should('have.value', special);
    });

    it('handles string with emoji', () => {
      const emoji = '😀 Hello 🎉 World 🚀';
      cy.mount(<TestWrapper value={emoji} />);
      cy.get('[data-testid="text-input"]').should('have.value', emoji);
    });

    it('handles string with unicode characters', () => {
      const unicode = '你好世界 مرحبا بالعالم हैलो वर्ल्ड';
      cy.mount(<TestWrapper value={unicode} />);
      cy.get('[data-testid="text-input"]').should('have.value', unicode);
    });

    it('handles potential XSS attack strings', () => {
      const xss = '<script>alert("xss")</script>';
      cy.mount(<TestWrapper value={xss} />);
      cy.get('[data-testid="text-input"]').should('have.value', xss);
      // * Verify script is not executed
      cy.window().then((win) => {
        cy.stub(win, 'alert').as('alertStub');
      });
      cy.get('@alertStub').should('not.have.been.called');
    });

    it('handles SQL injection strings', () => {
      const sql = "'; DROP TABLE users; --";
      cy.mount(<TestWrapper value={sql} />);
      cy.get('[data-testid="text-input"]').should('have.value', sql);
    });
  });

  describe('Input Constraints', () => {
    it('respects maxLength constraint', () => {
      cy.mount(<TestWrapper value="" maxLength={10} />);
      cy.get('[data-testid="text-input"]').type('This is a very long string');
      cy.get('[data-testid="text-input"]').should('have.value', 'This is a ');
    });

    it('respects minLength validation', () => {
      const onChange = cy.stub();
      cy.mount(
        <TestWrapper 
          value="" 
          minLength={5} 
          required={true}
          onChange={onChange}
        />
      );
      
      cy.get('[data-testid="text-input"]').type('abc');
      cy.get('[data-testid="text-input"]').blur();
      // TODO: * Input should be invalid
      cy.get('[data-testid="text-input"]').then(($input) => {
        expect($input[0].validity.tooShort).to.be.true;
      });
    });

    it('handles readonly state with boundary values', () => {
      const longString = 'x'.repeat(500);
      cy.mount(<TestWrapper value={longString} readOnly={true} />);
      cy.get('[data-testid="text-input"]').should('have.attr', 'readonly');
      cy.get('[data-testid="text-input"]').type('should not change');
      cy.get('[data-testid="text-input"]').should('have.value', longString);
    });

    it('handles disabled state with boundary values', () => {
      const special = '!@#$%^&*()';
      cy.mount(<TestWrapper value={special} disabled={true} />);
      cy.get('[data-testid="text-input"]').should('be.disabled');
      cy.get('[data-testid="text-input"]').should('have.value', special);
    });
  });

  describe('Null and Undefined Handling', () => {
    it('handles null value', () => {
      cy.mount(<TestWrapper value={null} placeholder="Enter text" />);
      cy.get('[data-testid="text-input"]').should('have.value', '');
      cy.get('[data-testid="text-input"]').should('have.attr', 'placeholder', 'Enter text');
    });

    it('handles undefined value', () => {
      cy.mount(<TestWrapper value={undefined} placeholder="Enter text" />);
      cy.get('[data-testid="text-input"]').should('have.value', '');
    });

    it('handles null onChange', () => {
      cy.mount(<TestWrapper value="test" onChange={null} />);
      cy.get('[data-testid="text-input"]').type(' more text');
      // TODO: * Should not throw error
      cy.get('[data-testid="text-input"]').should('have.value', 'test more text');
    });
  });

  describe('Performance with Large Data', () => {
    it('handles rapid typing of long strings', () => {
      const onChange = cy.stub();
      cy.mount(<TestWrapper value="" onChange={onChange} />);
      
      const longText = 'a'.repeat(100);
      cy.get('[data-testid="text-input"]').type(longText, { delay: 0 });
      cy.get('[data-testid="text-input"]').should('have.value', longText);
      // * Verify onChange was called for each character
      cy.wrap(onChange).its('callCount').should('be.gte', 50);
    });

    it('handles paste of very long string', () => {
      const veryLongString = 'x'.repeat(10000);
      cy.mount(<TestWrapper value="" />);
      
      cy.get('[data-testid="text-input"]').focus();
      cy.get('[data-testid="text-input"]').invoke('val', veryLongString).trigger('input');
      cy.get('[data-testid="text-input"]').should('have.value', veryLongString);
    });

    it('handles rapid clear and type cycles', () => {
      cy.mount(<TestWrapper value="initial" />);
      
      for (let i = 0; i < 10; i++) {
        cy.get('[data-testid="text-input"]').clear().type(`cycle ${i}`);
      }
      
      cy.get('[data-testid="text-input"]').should('have.value', 'cycle 9');
    });
  });

  describe('Email Validation Boundaries', () => {
    const testEmails = (emails: string[], shouldBeValid: boolean) => {
      emails.forEach(email => {
        it(`${shouldBeValid ? 'accepts' : 'rejects'} email: ${email}`, () => {
          cy.mount(
            <TestWrapper 
              value={email} 
              type="email"
              required={true}
            />
          );
          
          cy.get('[data-testid="text-input"]').blur();
          cy.get('[data-testid="text-input"]').then(($input) => {
            if (shouldBeValid) {
              expect($input[0].validity.valid).to.be.true;
            } else {
              expect($input[0].validity.typeMismatch || !$input[0].validity.valid).to.be.true;
            }
          });
        });
      });
    };

    describe('Valid emails', () => {
      testEmails(FormBoundaryData.emails.valid, true);
    });

    describe('Invalid emails', () => {
      testEmails(FormBoundaryData.emails.invalid, false);
    });

    describe('Edge case emails', () => {
      testEmails(FormBoundaryData.emails.edge, true);
    });
  });

  describe('Pattern Validation Boundaries', () => {
    it('handles complex regex patterns', () => {
      const pattern = '^[A-Z][a-z]+\\s[A-Z][a-z]+$'; // Name pattern
      cy.mount(
        <TestWrapper 
          value="" 
          pattern={pattern}
          placeholder="First Last"
          required={true}
        />
      );
      
      // * Test invalid patterns
      const invalidInputs = ['john doe', 'JOHN DOE', 'John', '123', 'John123 Doe'];
      invalidInputs.forEach(input => {
        cy.get('[data-testid="text-input"]').clear().type(input).blur();
        cy.get('[data-testid="text-input"]').then(($input) => {
          expect($input[0].validity.patternMismatch || !$input[0].validity.valid).to.be.true;
        });
      });
      
      // * Test valid pattern
      cy.get('[data-testid="text-input"]').clear().type('John Doe').blur();
      cy.get('[data-testid="text-input"]').then(($input) => {
        expect($input[0].validity.valid).to.be.true;
      });
    });
  });

  describe('Placeholder and Label Boundaries', () => {
    it('handles very long placeholder', () => {
      const longPlaceholder = 'This is a very long placeholder that might cause layout issues ' + 'x'.repeat(100);
      cy.mount(<TestWrapper value="" placeholder={longPlaceholder} />);
      cy.get('[data-testid="text-input"]').should('have.attr', 'placeholder', longPlaceholder);
    });

    it('handles placeholder with special characters', () => {
      const specialPlaceholder = 'Enter <your> "name" & \'email\'';
      cy.mount(<TestWrapper value="" placeholder={specialPlaceholder} />);
      cy.get('[data-testid="text-input"]').should('have.attr', 'placeholder', specialPlaceholder);
    });

    it('handles placeholder with unicode', () => {
      const unicodePlaceholder = '请输入您的名字 📝';
      cy.mount(<TestWrapper value="" placeholder={unicodePlaceholder} />);
      cy.get('[data-testid="text-input"]').should('have.attr', 'placeholder', unicodePlaceholder);
    });
  });

  describe('Error State Boundaries', () => {
    it('handles error state with empty value', () => {
      cy.mount(<TestWrapper value="" error={true} errorText="Required field" />);
      cy.get('[data-testid="text-input"]').should('have.attr', 'aria-invalid', 'true');
      cy.get('[data-testid="error-text"]').should('contain', 'Required field');
    });

    it('handles error state with very long error message', () => {
      const longError = 'This is a very long error message that explains in great detail what went wrong ' + 'x'.repeat(200);
      cy.mount(<TestWrapper value="invalid" error={true} errorText={longError} />);
      cy.get('[data-testid="error-text"]').should('contain', longError);
    });

    it('handles error state with special characters in message', () => {
      const specialError = 'Error: <script>alert("xss")</script> & "quotes"';
      cy.mount(<TestWrapper value="invalid" error={true} errorText={specialError} />);
      cy.get('[data-testid="error-text"]').should('contain.text', specialError);
      // * Verify no script execution
      cy.window().then((win) => {
        cy.stub(win, 'alert').as('alertStub');
      });
      cy.get('@alertStub').should('not.have.been.called');
    });
  });

  describe('Accessibility Boundaries', () => {
    it('handles aria-label with special characters', () => {
      const specialLabel = 'User\'s "Special" <Field> & More';
      cy.mount(<TestWrapper value="" aria-label={specialLabel} />);
      cy.get('[data-testid="text-input"]').should('have.attr', 'aria-label', specialLabel);
    });

    it('handles very long aria-describedby', () => {
      const longDescription = 'This field requires ' + 'very specific input '.repeat(20);
      cy.mount(
        <div>
          <span id="description">{longDescription}</span>
          <TestWrapper value="" aria-describedby="description" />
        </div>
      );
      cy.get('[data-testid="text-input"]').should('have.attr', 'aria-describedby', 'description');
    });
  });
});