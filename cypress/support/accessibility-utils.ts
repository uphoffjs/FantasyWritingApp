// * Comprehensive accessibility testing utilities for Cypress
// Ensures WCAG 2.1 AA compliance and screen reader compatibility

import 'cypress-axe';

/**
 * ARIA attributes and roles reference
 */
export const ARIAReference = {
  // * Widget roles
  widgetRoles: [
    'button', 'checkbox', 'gridcell', 'link', 'menuitem', 'menuitemcheckbox',
    'menuitemradio', 'option', 'progressbar', 'radio', 'scrollbar', 'searchbox',
    'separator', 'slider', 'spinbutton', 'switch', 'tab', 'tabpanel', 'textbox',
    'treeitem', 'combobox', 'grid', 'listbox', 'menu', 'menubar', 'radiogroup',
    'tablist', 'tree', 'treegrid'
  ],
  
  // * Document structure roles
  documentRoles: [
    'application', 'article', 'cell', 'columnheader', 'definition', 'directory',
    'document', 'feed', 'figure', 'group', 'heading', 'img', 'list', 'listitem',
    'math', 'none', 'note', 'presentation', 'row', 'rowgroup', 'rowheader',
    'separator', 'table', 'term', 'toolbar', 'tooltip'
  ],
  
  // * Landmark roles
  landmarkRoles: [
    'banner', 'complementary', 'contentinfo', 'form', 'main', 'navigation',
    'region', 'search'
  ],
  
  // * Live region roles
  liveRegionRoles: [
    'alert', 'log', 'marquee', 'status', 'timer'
  ],
  
  // Required ARIA attributes by role
  requiredAttributes: {
    'combobox': ['aria-expanded'],
    'checkbox': ['aria-checked'],
    'radio': ['aria-checked'],
    'switch': ['aria-checked'],
    'slider': ['aria-valuenow', 'aria-valuemin', 'aria-valuemax'],
    'spinbutton': ['aria-valuenow'],
    'progressbar': ['aria-valuenow'],
    'scrollbar': ['aria-valuenow', 'aria-valuemin', 'aria-valuemax', 'aria-orientation'],
  },
  
  // Common ARIA properties
  properties: {
    widget: [
      'aria-autocomplete', 'aria-checked', 'aria-disabled', 'aria-errormessage',
      'aria-expanded', 'aria-haspopup', 'aria-hidden', 'aria-invalid', 'aria-label',
      'aria-level', 'aria-modal', 'aria-multiline', 'aria-multiselectable',
      'aria-orientation', 'aria-placeholder', 'aria-pressed', 'aria-readonly',
      'aria-required', 'aria-selected', 'aria-sort', 'aria-valuemax', 'aria-valuemin',
      'aria-valuenow', 'aria-valuetext'
    ],
    liveRegion: [
      'aria-live', 'aria-atomic', 'aria-relevant', 'aria-busy'
    ],
    dragAndDrop: [
      'aria-grabbed', 'aria-dropeffect'
    ],
    relationship: [
      'aria-activedescendant', 'aria-colcount', 'aria-colindex', 'aria-colspan',
      'aria-controls', 'aria-describedby', 'aria-details', 'aria-errormessage',
      'aria-flowto', 'aria-labelledby', 'aria-owns', 'aria-posinset', 'aria-rowcount',
      'aria-rowindex', 'aria-rowspan', 'aria-setsize'
    ]
  }
};

/**
 * Keyboard navigation patterns
 */
export const KeyboardPatterns = {
  // * Tab navigation
  tab: {
    forward: '{tab}',
    backward: '{shift}{tab}',
    description: 'Navigate through focusable elements'
  },
  
  // * Arrow key navigation
  arrows: {
    up: '{upArrow}',
    down: '{downArrow}',
    left: '{leftArrow}',
    right: '{rightArrow}',
    description: 'Navigate within components like menus, lists'
  },
  
  // * Action keys
  actions: {
    enter: '{enter}',
    space: ' ',
    escape: '{esc}',
    delete: '{del}',
    backspace: '{backspace}',
    description: 'Trigger actions or cancel operations'
  },
  
  // * Modifier combinations
  modifiers: {
    selectAll: '{ctrl}a',
    copy: '{ctrl}c',
    paste: '{ctrl}v',
    cut: '{ctrl}x',
    undo: '{ctrl}z',
    redo: '{ctrl}{shift}z',
    find: '{ctrl}f',
    save: '{ctrl}s'
  },
  
  // * Component-specific patterns
  componentPatterns: {
    menu: {
      open: ['{enter}', ' ', '{downArrow}'],
      navigate: ['{upArrow}', '{downArrow}'],
      select: ['{enter}', ' '],
      close: ['{esc}']
    },
    dialog: {
      close: ['{esc}'],
      submit: ['{enter}'],
      cancel: ['{esc}']
    },
    tabs: {
      next: ['{rightArrow}', '{downArrow}'],
      previous: ['{leftArrow}', '{upArrow}'],
      first: ['{home}'],
      last: ['{end}']
    },
    tree: {
      expand: ['{rightArrow}', '{enter}'],
      collapse: ['{leftArrow}'],
      navigate: ['{upArrow}', '{downArrow}']
    }
  }
};

/**
 * Accessibility testing helpers
 */
export const AccessibilityHelpers = {
  /**
   * Initialize axe-core for accessibility testing
   */
  initializeAxe: () => {
    cy.injectAxe();
  },
  
  /**
   * Run axe accessibility scan with custom configuration
   */
  checkAccessibility: (
    context?: string,
    options?: {
      rules?: Record<string, unknown>;
      runOnly?: string[];
      exclude?: string[][];
    }
  ) => {
    const defaultOptions = {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice']
      }
    };
    
    cy.checkA11y(context, {
      ...defaultOptions,
      ...options
    });
  },
  
  /**
   * Check specific WCAG criteria
   */
  checkWCAGCriteria: (criteria: string[]) => {
    cy.checkA11y(null, {
      runOnly: {
        type: 'rule',
        values: criteria
      }
    });
  },
  
  /**
   * Verify focus management
   */
  verifyFocusManagement: (testId: string) => {
    // * Check if element can receive focus
    cy.get(`[data-cy="${testId}"]`).focus();
    cy.get(`[data-cy="${testId}"]`).should("have.focus");
    
    // * Check focus visibility
    cy.focused().should('have.css', 'outline-style').and('not.eq', 'none');
  },
  
  /**
   * Test keyboard navigation flow
   */
  testKeyboardNavigation: (testIds: string[]) => {
    // * Start from first element
    cy.get(`[data-cy="${testIds[0]}"]`).focus();
    
    // * Tab through all elements
    testIds.slice(1).forEach(testId => {
      cy.realPress('Tab');
      cy.get(`[data-cy="${testId}"]`).should("have.focus");
    });
    
    // * Tab backwards
    testIds.slice(0, -1).reverse().forEach(testId => {
      cy.realPress(['Shift', 'Tab']);
      cy.get(`[data-cy="${testId}"]`).should("have.focus");
    });
  },
  
  /**
   * Verify ARIA attributes
   */
  verifyARIAAttributes: (testId: string, attributes: Record<string, unknown>) => {
    Object.entries(attributes).forEach(([attr, value]) => {
      if (value !== null && value !== undefined) {
        cy.get(`[data-cy="${testId}"]`).should('have.attr', attr, String(value));
      } else {
        cy.get(`[data-cy="${testId}"]`).should('have.attr', attr);
      }
    });
  },
  
  /**
   * Check color contrast ratio
   */
  checkColorContrast: (testId: string, minRatio: number = 4.5) => {
    cy.get(`[data-cy="${testId}"]`).then($el => {
      const styles = window.getComputedStyle($el[0]);
      const color = styles.color;
      const backgroundColor = styles.backgroundColor;
      
      // * Calculate contrast ratio (simplified - use axe for accurate testing)
      cy.log(`Color: ${color}, Background: ${backgroundColor}`);
      
      // * Use axe to check color contrast
      cy.checkA11y(`[data-cy="${testId}"]`, {
        runOnly: {
          type: 'rule',
          values: ['color-contrast']
        }
      });
    });
  },
  
  /**
   * Verify screen reader announcements
   */
  verifyScreenReaderAnnouncement: (text: string, testId?: string) => {
    if (testId) {
      cy.get(`[data-cy="${testId}"]`).should('contain', text);
    } else {
       
      cy.get('[role="status"], [role="alert"], [aria-live]').should('contain', text);
    }
  },
  
  /**
   * Test skip links functionality
   */
  testSkipLinks: () => {
    // * Focus on skip link
    cy.get('[data-cy="app-root"], body').type('{tab}');
    
    // * Check if skip link is visible
    cy.focused().should('contain', 'Skip to');
    
    // * Activate skip link
    cy.focused().type('{enter}');
    
    // * Verify focus moved to main content
    cy.focused().should('match', '[role="main"], main, #main-content');
  }
};

/**
 * Component-specific accessibility tests
 */
export const ComponentAccessibilityTests = {
  /**
   * Test button accessibility
   */
  testButton: (testId: string) => {
    cy.get(`[data-cy="${testId}"]`).should('have.attr', 'role', 'button')
      .or('match', 'button');

    // * Keyboard activation
    cy.get(`[data-cy="${testId}"]`).focus().type('{enter}');
    cy.get(`[data-cy="${testId}"]`).focus().type(' ');

    // * Check disabled state
    cy.get(`[data-cy="${testId}"]`).then($btn => {
      if ($btn.prop('disabled')) {
        cy.get(`[data-cy="${testId}"]`).should('have.attr', 'aria-disabled', 'true');
      }
    });
  },
  
  /**
   * Test form input accessibility
   */
  testFormInput: (inputTestId: string, labelText?: string) => {
    // * Check label association
    if (labelText) {
      cy.contains('label', labelText)
        .invoke('attr', 'for')
        .then(id => {
          cy.get(`[data-cy="${inputTestId}"]`).should('have.id', id);
        });
    } else {
      // * Check aria-label or aria-labelledby
      cy.get(`[data-cy="${inputTestId}"]`)
        .should('have.attr', 'aria-label')
        .or('have.attr', 'aria-labelledby');
    }
    
    // * Check required field
    cy.get(`[data-cy="${inputTestId}"]`).then($input => {
      if ($input.prop('required')) {
        cy.get(`[data-cy="${inputTestId}"]`).should('have.attr', 'aria-required', 'true');
      }
    });
    
    // * Check error state
    cy.get(`[data-cy="${inputTestId}"]`).then($input => {
      if ($input.attr('aria-invalid') === 'true') {
        cy.get(`[data-cy="${inputTestId}"]`).should('have.attr', 'aria-errormessage')
          .or('have.attr', 'aria-describedby');
      }
    });
  },
  
  /**
   * Test modal dialog accessibility
   */
  testModal: (modalTestId: string) => {
    // * Check role and aria-modal
    cy.get(`[data-cy="${modalTestId}"]`)
      .should('have.attr', 'role', 'dialog')
      .and('have.attr', 'aria-modal', 'true');
    
    // * Check aria-label or aria-labelledby
    cy.get(`[data-cy="${modalTestId}"]`)
      .should('have.attr', 'aria-label')
      .or('have.attr', 'aria-labelledby');
    
    // * Test focus trap
    cy.get(`[data-cy="${modalTestId}"]`).within(() => {
      // * Tab through all focusable elements
       
      cy.get('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
        .first()
        .focus();
      
      // TODO: * Tab should cycle within modal
      cy.realPress('Tab');
      cy.focused().should('exist');
    });
    
    // * Test escape key closes modal
    cy.realPress('Escape');
    cy.get(`[data-cy="${modalTestId}"]`).should('not.be.visible');
  },
  
  /**
   * Test dropdown/select accessibility
   */
  testDropdown: (triggerTestId: string, menuTestId: string) => {
    // * Check trigger attributes
    cy.get(`[data-cy="${triggerTestId}"]`)
      .should('have.attr', 'aria-haspopup', 'true')
      .and('have.attr', 'aria-expanded', 'false');
    
    // * Open dropdown
    cy.get(`[data-cy="${triggerTestId}"]`).click();
    cy.get(`[data-cy="${triggerTestId}"]`).should('have.attr', 'aria-expanded', 'true');
    
    // * Check menu role
    cy.get(`[data-cy="${menuTestId}"]`).should('have.attr', 'role').and('match', /menu|listbox/);
    
    // * Test keyboard navigation
    cy.realPress('ArrowDown');
    cy.focused().should('have.attr', 'role').and('match', /menuitem|option/);
    
    // * Select with Enter
    cy.realPress('Enter');
    cy.get(`[data-cy="${menuTestId}"]`).should('not.be.visible');
    cy.get(`[data-cy="${triggerTestId}"]`).should('have.attr', 'aria-expanded', 'false');
  },
  
  /**
   * Test navigation menu accessibility
   */
  testNavigation: (navTestId: string) => {
    // * Check navigation landmark
    cy.get(`[data-cy="${navTestId}"]`).should('have.attr', 'role', 'navigation')
      .or('match', 'nav');
    
    // * Check aria-label
    cy.get(`[data-cy="${navTestId}"]`).should('have.attr', 'aria-label');
    
    // * Test keyboard navigation through links
    cy.get(`[data-cy="${navTestId}"]`).within(() => {
       
      cy.get('a, [role="link"]').first().focus();
      cy.realPress('Tab');
      cy.focused().should('match', 'a, [role="link"]');
    });
  }
};

/**
 * WCAG compliance levels and criteria
 */
export const WCAGCriteria = {
  // Level A criteria
  levelA: [
    'area-alt', 'aria-allowed-attr', 'aria-required-attr', 'aria-required-children',
    'aria-required-parent', 'aria-roles', 'aria-valid-attr-value', 'aria-valid-attr',
    'audio-caption', 'button-name', 'bypass', 'color-contrast', 'definition-list',
    'dlitem', 'document-title', 'duplicate-id-active', 'duplicate-id-aria', 'duplicate-id',
    'frame-title', 'html-has-lang', 'html-lang-valid', 'html-xml-lang-mismatch',
    'image-alt', 'input-button-name', 'input-image-alt', 'label', 'link-name',
    'list', 'listitem', 'object-alt', 'role-img-alt', 'scrollable-region-focusable',
    'select-name', 'server-side-image-map', 'svg-img-alt', 'td-headers-attr',
    'th-has-data-cells', 'valid-lang', 'video-caption'
  ],
  
  // Level AA criteria  
  levelAA: [
    'autocomplete-valid', 'avoid-inline-spacing', 'color-contrast-enhanced',
    'css-orientation-lock', 'focus-order-semantics', 'hidden-content',
    'label-content-name-mismatch', 'landmark-banner-is-top-level',
    'landmark-complementary-is-top-level', 'landmark-contentinfo-is-top-level',
    'landmark-main-is-top-level', 'landmark-no-duplicate-banner',
    'landmark-no-duplicate-contentinfo', 'landmark-no-duplicate-main',
    'landmark-one-main', 'landmark-unique', 'link-in-text-block', 'meta-refresh',
    'meta-viewport', 'no-autoplay-audio', 'page-has-heading-one', 'presentation-role-conflict',
    'region', 'scope-attr-valid', 'skip-link', 'tabindex', 'table-duplicate-name',
    'table-fake-caption', 'td-has-header'
  ],
  
  // * Best practices
  bestPractices: [
    'accesskeys', 'aria-allowed-role', 'aria-dialog-name', 'aria-meter-name',
    'aria-progressbar-name', 'aria-text', 'aria-toggle-field-name', 'aria-tooltip-name',
    'aria-treeitem-name', 'empty-heading', 'empty-table-header', 'frame-tested',
    'heading-order', 'identical-links-same-purpose', 'image-redundant-alt',
    'label-title-only', 'landmark-banner-is-top-level', 'meta-viewport-large',
    'nested-interactive', 'no-autoplay-audio', 'presentation-role-conflict',
    'tabindex', 'table-layout'
  ]
};

/**
 * Screen reader testing utilities
 */
export const ScreenReaderUtils = {
  /**
   * Simulate screen reader navigation
   */
  simulateScreenReaderNav: () => {
    // * Navigate by headings
     
    cy.get('h1, h2, h3, h4, h5, h6').each(($heading) => {
      cy.wrap($heading).should('be.visible').and('not.be.empty');
    });

    // * Navigate by landmarks
     
    cy.get('[role="main"], [role="navigation"], [role="banner"], [role="contentinfo"]')
      .each(($landmark) => {
        cy.wrap($landmark).should('exist');
      });

    // * Check for screen reader only content
     
    cy.get('.sr-only, .visually-hidden, [aria-label]').should('exist');
  },
  
  /**
   * Verify live region announcements
   */
  verifyLiveRegion: (testId: string, expectedText: string) => {
    cy.get(`[data-cy="${testId}"]`)
      .should('have.attr', 'aria-live')
      .and('contain', expectedText);
  },
  
  /**
   * Check reading order
   */
  checkReadingOrder: (expectedOrder: string[]) => {
    let currentIndex = 0;
    
    cy.document().then(doc => {
      const walker = doc.createTreeWalker(
        doc.body,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: (node) => {
            const text = node.textContent?.trim();
            if (text && expectedOrder[currentIndex] && text.includes(expectedOrder[currentIndex])) {
              currentIndex++;
              return NodeFilter.FILTER_ACCEPT;
            }
            return NodeFilter.FILTER_SKIP;
          }
        }
      );
      
      while (walker.nextNode() && currentIndex < expectedOrder.length) {
        // * Walking through nodes
      }
      
      expect(currentIndex).to.equal(expectedOrder.length);
    });
  }
};

// * Register custom Cypress commands
Cypress.Commands.add('checkAccessibility', AccessibilityHelpers.checkAccessibility);
Cypress.Commands.add('testKeyboardNavigation', AccessibilityHelpers.testKeyboardNavigation);
Cypress.Commands.add('verifyARIAAttributes', AccessibilityHelpers.verifyARIAAttributes);
Cypress.Commands.add('testSkipLinks', AccessibilityHelpers.testSkipLinks);

// * Type declarations for Cypress custom commands
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      checkAccessibility(context?: string, options?: Record<string, unknown>): void;
      testKeyboardNavigation(elements: string[]): void;
      verifyARIAAttributes(selector: string, attributes: Record<string, unknown>): void;
      testSkipLinks(): void;
    }
  }
}

export default {
  ARIAReference,
  KeyboardPatterns,
  AccessibilityHelpers,
  ComponentAccessibilityTests,
  WCAGCriteria,
  ScreenReaderUtils
};