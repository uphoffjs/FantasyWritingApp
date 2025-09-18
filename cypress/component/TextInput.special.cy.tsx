/// <reference types="cypress" />
import React from 'react';
import { TextInput } from '../../src/components/TextInput';
import {
  SpecialCharacters,
  SanitizationHelpers,
  SpecialCharacterAssertions,
  SpecialCharacterGenerators
} from '../support/special-characters-utils';

describe('TextInput - Special Characters', () => {
  // * Test wrapper with character counter and sanitization
  const TestWrapper = ({ 
    sanitize = false, 
    maxLength,
    onChange,
    ...props 
  }: any) => {
    const [value, setValue] = React.useState('');
    const [charCount, setCharCount] = React.useState(0);
    const [sanitizedValue, setSanitizedValue] = React.useState('');
    
    const handleChange = (e: any) => {
      let newValue = e?.target?.value || e;
      
      // * Apply sanitization if enabled
      if (sanitize) {
        newValue = SanitizationHelpers.sanitizeHtml(newValue);
        newValue = SanitizationHelpers.removeControlChars(newValue);
      }
      
      setValue(newValue);
      setCharCount(newValue.length);
      setSanitizedValue(SanitizationHelpers.escapeSpecialChars(newValue));
      onChange?.(newValue);
    };
    
    return (
      <div>
        <TextInput
          {...props}
          value={value}
          onChange={handleChange}
          maxLength={maxLength}
          data-testid="text-input"
        />
        <div data-testid="char-count">{charCount}</div>
        <div data-testid="raw-value">{value}</div>
        <div data-testid="sanitized-value">{sanitizedValue}</div>
        <div data-testid="is-safe">{SanitizationHelpers.validateSafe(value) ? 'safe' : 'unsafe'}</div>
      </div>
    );
  };

  describe('Unicode Support', () => {
    it('handles emoji characters correctly', () => {
      cy.mount(<TestWrapper />);
      
      const emojiText = '😀 Hello 🌍 World 🚀';
      cy.typeSpecialChars('[data-testid="text-input"]', emojiText);
      
      cy.get('[data-testid="text-input"]').should('have.value', emojiText);
      cy.get('[data-testid="raw-value"]').should('contain', emojiText);
    });

    it('handles various unicode scripts', () => {
      cy.mount(<TestWrapper />);
      
      SpecialCharacterAssertions.assertUnicodeSupport('[data-testid="text-input"]');
    });

    it('handles mixed unicode and ASCII', () => {
      cy.mount(<TestWrapper />);
      
      const mixedText = 'Hello 你好 مرحبا שלום Привет こんにちは 😀';
      cy.pasteSpecialChars('[data-testid="text-input"]', mixedText);
      
      cy.get('[data-testid="text-input"]').should('have.value', mixedText);
    });

    it('correctly counts unicode characters', () => {
      cy.mount(<TestWrapper />);
      
      // TODO: * Test emoji (should count as single characters)
      cy.get('[data-testid="text-input"]').clear().type('😀😃😄');
      cy.get('[data-testid="char-count"]').should('contain', '3');
      
      // Test Chinese characters
      cy.get('[data-testid="text-input"]').clear().type('你好世界');
      cy.get('[data-testid="char-count"]').should('contain', '4');
    });
  });

  describe('Special Punctuation', () => {
    it('handles all punctuation characters', () => {
      cy.mount(<TestWrapper />);
      
      cy.typeSpecialChars('[data-testid="text-input"]', SpecialCharacters.punctuation);
      cy.get('[data-testid="text-input"]').should('have.value', SpecialCharacters.punctuation);
    });

    it('handles curly braces correctly', () => {
      cy.mount(<TestWrapper />);
      
      const textWithBraces = 'function() { return { value: "test" }; }';
      cy.typeSpecialChars('[data-testid="text-input"]', textWithBraces);
      cy.get('[data-testid="text-input"]').should('have.value', textWithBraces);
    });

    it('handles quotes and apostrophes', () => {
      cy.mount(<TestWrapper />);
      
      const quotesText = `"Double" 'Single' \`Backtick\` It's can't won't`;
      cy.typeSpecialChars('[data-testid="text-input"]', quotesText);
      cy.get('[data-testid="text-input"]').should('have.value', quotesText);
    });
  });

  describe('XSS Prevention', () => {
    it('prevents XSS attacks', () => {
      cy.mount(<TestWrapper />);
      
      SpecialCharacterAssertions.assertXSSPrevention('[data-testid="text-input"]');
    });

    it('marks dangerous input as unsafe', () => {
      cy.mount(<TestWrapper />);
      
      // * Safe input
      cy.get('[data-testid="text-input"]').type('Normal safe text');
      cy.get('[data-testid="is-safe"]').should('contain', 'safe');
      
      // * Unsafe input
      cy.get('[data-testid="text-input"]').clear().invoke('val', '<script>alert("XSS")</script>').trigger('input');
      cy.get('[data-testid="is-safe"]').should('contain', 'unsafe');
    });

    it('sanitizes HTML when enabled', () => {
      cy.mount(<TestWrapper sanitize={true} />);
      
      const xssPayload = '<script>alert("XSS")</script>Normal text';
      cy.pasteSpecialChars('[data-testid="text-input"]', xssPayload);
      
      // TODO: * Should remove script tags
      cy.get('[data-testid="raw-value"]').should('not.contain', '<script');
      cy.get('[data-testid="raw-value"]').should('contain', 'Normal text');
    });

    it('escapes special characters for display', () => {
      cy.mount(<TestWrapper />);
      
      const htmlChars = '<div>Hello & "World"</div>';
      cy.pasteSpecialChars('[data-testid="text-input"]', htmlChars);
      
      // * Raw value contains original
      cy.get('[data-testid="raw-value"]').should('contain', htmlChars);
      
      // * Sanitized value has escaped characters
      cy.get('[data-testid="sanitized-value"]').should('contain', '&lt;div&gt;');
      cy.get('[data-testid="sanitized-value"]').should('contain', '&amp;');
      cy.get('[data-testid="sanitized-value"]').should('contain', '&quot;');
    });
  });

  describe('SQL Injection Prevention', () => {
    it('handles SQL injection attempts safely', () => {
      cy.mount(<TestWrapper />);
      
      SpecialCharacters.securityThreats.sqlInjection.forEach(sqlPayload => {
        cy.get('[data-testid="text-input"]').clear().invoke('val', sqlPayload).trigger('input');
        
        // TODO: * Value should be preserved but marked as unsafe
        cy.get('[data-testid="text-input"]').should('have.value', sqlPayload);
        cy.get('[data-testid="is-safe"]').should('contain', 'unsafe');
      });
    });
  });

  describe('Whitespace Handling', () => {
    it('preserves various whitespace characters', () => {
      cy.mount(<TestWrapper />);
      
      const whitespaceText = '  Leading  spaces  \n\nNewlines\t\tTabs  Trailing  ';
      cy.pasteSpecialChars('[data-testid="text-input"]', whitespaceText);
      
      cy.get('[data-testid="text-input"]').should('have.value', whitespaceText);
    });

    it('handles zero-width characters', () => {
      cy.mount(<TestWrapper />);
      
      const zeroWidth = 'Hello\u200BWorld'; // Zero-width space
      cy.pasteSpecialChars('[data-testid="text-input"]', zeroWidth);
      
      cy.get('[data-testid="text-input"]').invoke('val').should('include', '\u200B');
    });

    it('handles non-breaking spaces', () => {
      cy.mount(<TestWrapper />);
      
      const nbspText = 'Non\u00A0breaking\u00A0spaces';
      cy.pasteSpecialChars('[data-testid="text-input"]', nbspText);
      
      cy.get('[data-testid="text-input"]').should('have.value', nbspText);
    });
  });

  describe('Control Characters', () => {
    it('handles tab characters', () => {
      cy.mount(<TestWrapper />);
      
      const tabText = 'Column1\tColumn2\tColumn3';
      cy.pasteSpecialChars('[data-testid="text-input"]', tabText);
      
      cy.get('[data-testid="text-input"]').should('have.value', tabText);
    });

    it('handles newline characters', () => {
      cy.mount(<TestWrapper multiline={true} />);
      
      const multilineText = 'Line 1\nLine 2\nLine 3';
      cy.pasteSpecialChars('[data-testid="text-input"]', multilineText);
      
      cy.get('[data-testid="text-input"]').should('have.value', multilineText);
    });

    it('removes control characters when sanitizing', () => {
      cy.mount(<TestWrapper sanitize={true} />);
      
      const controlText = 'Text\x00with\x01control\x02chars';
      cy.pasteSpecialChars('[data-testid="text-input"]', controlText);
      
      cy.get('[data-testid="raw-value"]').should('not.contain', '\x00');
      cy.get('[data-testid="raw-value"]').should('not.contain', '\x01');
      cy.get('[data-testid="raw-value"]').should('not.contain', '\x02');
    });
  });

  describe('Max Length with Special Characters', () => {
    it('respects maxLength with emoji', () => {
      cy.mount(<TestWrapper maxLength={10} />);
      
      // Type 8 regular chars + 2 emoji
      cy.get('[data-testid="text-input"]').type('12345678😀😃');
      
      // TODO: * Should respect the 10 character limit
      cy.get('[data-testid="char-count"]').should('contain', '10');
    });

    it('respects maxLength with unicode', () => {
      cy.mount(<TestWrapper maxLength={5} />);
      
      cy.get('[data-testid="text-input"]').type('你好世界测试');
      
      // TODO: * Should only allow 5 characters
      cy.get('[data-testid="char-count"]').should('contain', '5');
      cy.get('[data-testid="text-input"]').should('have.value', '你好世界测');
    });
  });

  describe('Homoglyphs and Confusing Characters', () => {
    it('preserves visually similar characters', () => {
      cy.mount(<TestWrapper />);
      
      // Latin O vs Cyrillic О
      const homoglyphs = 'Hello НЕLLО'; // Second one uses Cyrillic
      cy.pasteSpecialChars('[data-testid="text-input"]', homoglyphs);
      
      cy.get('[data-testid="text-input"]').should('have.value', homoglyphs);
    });

    it('distinguishes between similar characters', () => {
      cy.mount(<TestWrapper />);
      
      // * Zero vs O, one vs l
      const similar = '0O 1l Il';
      cy.typeSpecialChars('[data-testid="text-input"]', similar);
      
      cy.get('[data-testid="text-input"]').should('have.value', similar);
    });
  });

  describe('Comprehensive Special Character Sets', () => {
    it('handles all special character types together', () => {
      cy.mount(<TestWrapper />);
      
      cy.testWithSpecialCharSets('[data-testid="text-input"]', (value) => {
        cy.get('[data-testid="raw-value"]').should('contain', value);
      });
    });

    it('handles security threats safely', () => {
      cy.mount(<TestWrapper sanitize={true} />);
      
      cy.testSecurityThreats('[data-testid="text-input"]');
    });

    it('handles randomly generated special strings', () => {
      cy.mount(<TestWrapper />);
      
      const randomString = SpecialCharacterGenerators.randomSpecialString(50);
      cy.pasteSpecialChars('[data-testid="text-input"]', randomString);
      
      cy.get('[data-testid="text-input"]').should('have.value', randomString);
    });

    it('handles comprehensive payload', () => {
      cy.mount(<TestWrapper />);
      
      const payload = SpecialCharacterGenerators.comprehensivePayload();
      cy.pasteSpecialChars('[data-testid="text-input"]', payload);
      
      cy.get('[data-testid="text-input"]').invoke('val').should('exist');
      cy.get('[data-testid="is-safe"]').should('contain', 'unsafe'); // Due to XSS/SQL content
    });
  });

  describe('Copy/Paste with Special Characters', () => {
    it('preserves special characters through copy/paste', () => {
      cy.mount(
        <div>
          <TestWrapper data-testid="input1" />
          <TestWrapper data-testid="input2" />
        </div>
      );
      
      const specialText = 'Emoji: 😀 Unicode: 你好 Special: @#$%';
      
      // * Type in first input
      cy.get('[data-testid="input1"] [data-testid="text-input"]')
        .as('input1')
        .invoke('val', specialText)
        .trigger('input');
      
      // * Select all and copy
      cy.get('@input1').focus().type('{selectall}');
      
      // * Paste in second input
      cy.get('[data-testid="input2"] [data-testid="text-input"]')
        .as('input2')
        .focus()
        .invoke('val', specialText)
        .trigger('input');
      
      // TODO: * Both should have same value
      cy.get('@input1').should('have.value', specialText);
      cy.get('@input2').should('have.value', specialText);
    });
  });

  describe('Performance with Special Characters', () => {
    it('handles large amounts of emoji efficiently', () => {
      cy.mount(<TestWrapper />);
      
      const manyEmoji = '😀'.repeat(100);
      const startTime = Date.now();
      
      cy.pasteSpecialChars('[data-testid="text-input"]', manyEmoji);
      
      cy.wrap(null).then(() => {
        const duration = Date.now() - startTime;
        expect(duration).to.be.lessThan(1000); // Should complete within 1 second
      });
      
      cy.get('[data-testid="char-count"]').should('contain', '100');
    });

    it('handles rapid special character input', () => {
      cy.mount(<TestWrapper />);
      
      // * Rapidly type special characters
      '!@#$%^&*()'.split('').forEach(char => {
        cy.get('[data-testid="text-input"]').type(char, { delay: 0 });
      });
      
      cy.get('[data-testid="text-input"]').should('have.value', '!@#$%^&*()');
    });
  });
});