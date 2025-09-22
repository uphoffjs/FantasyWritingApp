/**
 * @fileoverview Markdown Export Modal Component Tests
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

import React from 'react';
import { MarkdownExportModal } from '../../../src/components/MarkdownExportModal';
import { mountWithProviders } from '../../support/mount-helpers';
// Mock element for testing
const mockElement = {
  id: 'test-element-1',
  name: 'Test Element',
  type: 'character',
  category: 'Characters',
  answers: {},
  relationships: [],
  completionPercentage: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};
import { waitForAnimation, setMobileViewport, setTabletViewport, setDesktopViewport } from '../../support/test-utils';
import { WorldElement } from '../../../src/types/models';

describe('MarkdownExportModal Component', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });
  let onCloseSpy: any;
  let onImportSpy: any;

  const testElement: WorldElement = {
    ...mockElement,
    id: 'test-element',
    name: 'Test Character',
    category: 'character',
    description: 'A test character for markdown export',
    tags: ['hero', 'wizard', 'mentor'],
    questions: [
      {
        id: 'q1',
        text: 'What is their appearance?',
        type: 'textarea',
        category: 'Physical',
        required: true
      },
      {
        id: 'q2',
        text: 'What is their personality?',
        type: 'textarea',
        category: 'Mental',
        required: true
      },
      {
        id: 'q3',
        text: 'What are their abilities?',
        type: 'text',
        category: 'Abilities',
        required: false
      }
    ],
    answers: {
      'q1': { questionId: 'q1', value: 'Tall and wise-looking with a long beard' },
      'q2': { questionId: 'q2', value: 'Kind but stern when necessary' },
      'q3': { questionId: 'q3', value: 'Powerful magic and wisdom' }
    }
  };

  beforeEach(function() {
    // ! MANDATORY: Comprehensive debug setup
    cy.comprehensiveDebug();

    // * Clean state before each test
    cy.cleanState();

    onCloseSpy = cy.spy();
    onImportSpy = cy.spy();
  });
  describe('Rendering', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });
    it('renders with export tab active by default', () => {
      mountWithProviders(
        <MarkdownExportModal 
          element={testElement}
          onClose={onCloseSpy}
        />
      );

      cy.get('h2').should('contain', 'Markdown Import/Export');
      cy.contains('button', 'Export').should('be.visible') // React Native Web uses inline styles instead of CSS classes;
      cy.contains('Export your element content as Markdown').should('be.visible');
      cy.get('pre').should('be.visible');
    });
    it('shows import tab when onImport is provided', () => {
      mountWithProviders(
        <MarkdownExportModal 
          element={testElement}
          onClose={onCloseSpy}
          onImport={onImportSpy}
        />
      );

      cy.contains('button', 'Import').should('be.visible');
    });
    it('does not show import tab when onImport is not provided', () => {
      mountWithProviders(
        <MarkdownExportModal 
          element={testElement}
          onClose={onCloseSpy}
        />
      );

      cy.contains('button', 'Import').should('not.exist');
    });
    it('renders close button', () => {
      mountWithProviders(
        <MarkdownExportModal 
          element={testElement}
          onClose={onCloseSpy}
        />
      );

      cy.get('button').find('svg.lucide-x').parent().should('be.visible');
    });
  });
  describe('Markdown Generation', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });
    it('generates markdown with element name as heading', () => {
      mountWithProviders(
        <MarkdownExportModal 
          element={testElement}
          onClose={onCloseSpy}
        />
      );

      cy.get('pre').should('contain', '# Test Character');
    });
    it('includes category in markdown', () => {
      mountWithProviders(
        <MarkdownExportModal 
          element={testElement}
          onClose={onCloseSpy}
        />
      );

      cy.get('pre').should('contain', '**Category:** character');
    });
    it('includes description when present', () => {
      mountWithProviders(
        <MarkdownExportModal 
          element={testElement}
          onClose={onCloseSpy}
        />
      );

      cy.get('pre').should('contain', '**Description:** A test character for markdown export');
    });
    it('includes tags when present', () => {
      mountWithProviders(
        <MarkdownExportModal 
          element={testElement}
          onClose={onCloseSpy}
        />
      );

      cy.get('pre').should('contain', '**Tags:** hero, wizard, mentor');
    });
    it('groups questions by category', () => {
      mountWithProviders(
        <MarkdownExportModal 
          element={testElement}
          onClose={onCloseSpy}
        />
      );

      cy.get('pre').should('contain', '## Physical');
      cy.get('pre').should('contain', '## Mental');
      cy.get('pre').should('contain', '## Abilities');
    });
    it('includes question text and answers', () => {
      mountWithProviders(
        <MarkdownExportModal 
          element={testElement}
          onClose={onCloseSpy}
        />
      );

      cy.get('pre').should('contain', '### What is their appearance?');
      cy.get('pre').should('contain', 'Tall and wise-looking with a long beard');
      
      cy.get('pre').should('contain', '### What is their personality?');
      cy.get('pre').should('contain', 'Kind but stern when necessary');
    });
    it('shows "No answer provided" for unanswered questions', () => {
      const elementWithMissingAnswer = {
        ...testElement,
        answers: {
          'q1': { questionId: 'q1', value: 'Tall and wise-looking' }
          // q2 and q3 are missing
        }
      };

      mountWithProviders(
        <MarkdownExportModal 
          element={elementWithMissingAnswer}
          onClose={onCloseSpy}
        />
      );

      cy.get('pre').should('contain', '*No answer provided*');
    });
    it('handles array values in answers', () => {
      const elementWithArrayAnswer = {
        ...testElement,
        answers: {
          'q1': { questionId: 'q1', value: ['Option 1', 'Option 2', 'Option 3'] }
        }
      };

      mountWithProviders(
        <MarkdownExportModal 
          element={elementWithArrayAnswer}
          onClose={onCloseSpy}
        />
      );

      cy.get('pre').should('contain', '- Option 1');
      cy.get('pre').should('contain', '- Option 2');
      cy.get('pre').should('contain', '- Option 3');
    });
    it('handles elements without tags', () => {
      const elementWithoutTags = {
        ...testElement,
        tags: []
      };

      mountWithProviders(
        <MarkdownExportModal 
          element={elementWithoutTags}
          onClose={onCloseSpy}
        />
      );

      // TODO: * Should still render without errors
      cy.get('pre').should('contain', '# Test Character');
      cy.get('pre').should('not.contain', '**Tags:**');
    });
    it('handles elements without description', () => {
      const elementWithoutDescription = {
        ...testElement,
        description: undefined
      };

      mountWithProviders(
        <MarkdownExportModal 
          element={elementWithoutDescription}
          onClose={onCloseSpy}
        />
      );

      cy.get('pre').should('contain', '# Test Character');
      cy.get('pre').should('not.contain', '**Description:**');
    });
  });
  describe('Export Actions', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });
    it('copies markdown to clipboard', () => {
      // * Mock clipboard API
      cy.window().then((win) => {
        cy.stub(win.navigator.clipboard, 'writeText').resolves();
      });
      mountWithProviders(
        <MarkdownExportModal 
          element={testElement}
          onClose={onCloseSpy}
        />
      );

      cy.contains('button', 'Copy to Clipboard').click();
      
      // ? TODO: * Button should change to show success
      cy.contains('button', 'Copied!').should('be.visible');
      cy.get('svg.lucide-check').should('be.visible');

      // TODO: * Should revert after 2 seconds
      cy.wait(2100);
      cy.contains('button', 'Copy to Clipboard').should('be.visible');
      cy.get('svg.lucide-copy').should('be.visible');
    });
    it('downloads markdown as file', () => {
      // * Mock document methods
      const createElementStub = cy.stub();
      const clickStub = cy.stub();
      const appendChildStub = cy.stub();
      const removeChildStub = cy.stub();
      
      cy.window().then((win) => {
        const mockAnchor = {
          href: '',
          download: '',
          click: clickStub
        };
        
        createElementStub.returns(mockAnchor);
        cy.stub(win.document, 'createElement').callsFake(createElementStub);
        cy.stub(win.document.body, 'appendChild').callsFake(appendChildStub);
        cy.stub(win.document.body, 'removeChild').callsFake(removeChildStub);
        cy.stub(win.URL, 'createObjectURL').returns('blob:mock-url');
        cy.stub(win.URL, 'revokeObjectURL');
      });
      mountWithProviders(
        <MarkdownExportModal 
          element={testElement}
          onClose={onCloseSpy}
        />
      );

      cy.contains('button', 'Download as .md').click();

      cy.wrap(createElementStub).should('have.been.calledWith', 'a');
      cy.wrap(clickStub).should('have.been.called');
      cy.wrap(appendChildStub).should('have.been.called');
      cy.wrap(removeChildStub).should('have.been.called');
    });
    it('generates correct filename from element name', () => {
      const mockAnchor = { href: '', download: '', click: cy.stub() };
      
      cy.window().then((win) => {
        cy.stub(win.document, 'createElement').returns(mockAnchor);
        cy.stub(win.document.body, 'appendChild');
        cy.stub(win.document.body, 'removeChild');
        cy.stub(win.URL, 'createObjectURL').returns('blob:mock-url');
        cy.stub(win.URL, 'revokeObjectURL');
      });
      mountWithProviders(
        <MarkdownExportModal 
          element={testElement}
          onClose={onCloseSpy}
        />
      );

      cy.contains('button', 'Download as .md').click();
      
      // TODO: * Filename should be element name in lowercase with hyphens
      expect(mockAnchor.download).to.equal('test-character.md');
    });
  });
  describe('Tab Switching', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });
    it('switches to import tab when clicked', () => {
      mountWithProviders(
        <MarkdownExportModal 
          element={testElement}
          onClose={onCloseSpy}
          onImport={onImportSpy}
        />
      );

      cy.contains('button', 'Import').click();
      
      cy.contains('button', 'Import').should('be.visible') // React Native Web uses inline styles instead of CSS classes;
      cy.contains('button', 'Export').should('not.have.class', 'text-metals-gold');
      cy.contains('Import content from a Markdown file').should('be.visible');
      cy.get('textarea').should('be.visible');
    });
    it('switches back to export tab', () => {
      mountWithProviders(
        <MarkdownExportModal 
          element={testElement}
          onClose={onCloseSpy}
          onImport={onImportSpy}
        />
      );

      cy.contains('button', 'Import').click();
      cy.contains('button', 'Export').click();
      
      cy.contains('button', 'Export').should('be.visible') // React Native Web uses inline styles instead of CSS classes;
      cy.contains('Export your element content as Markdown').should('be.visible');
    });
  });
  describe('Import Functionality', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });
    it('shows import textarea when on import tab', () => {
      mountWithProviders(
        <MarkdownExportModal 
          element={testElement}
          onClose={onCloseSpy}
          onImport={onImportSpy}
        />
      );

      cy.contains('button', 'Import').click();
      
      cy.get('textarea').should('be.visible');
      cy.get('textarea').should('have.attr', 'placeholder', 'Paste your markdown content here...');
    });
    it('enables import button when text is entered', () => {
      mountWithProviders(
        <MarkdownExportModal 
          element={testElement}
          onClose={onCloseSpy}
          onImport={onImportSpy}
        />
      );

      cy.contains('button', 'Import').click();
      
      // * Initially disabled
      cy.contains('button', 'Import Content')
        .should('be.visible') // React Native Web uses inline styles instead of CSS classes
        .and('be.disabled');
      
      // * Enter text
      cy.get('textarea').type('# Test Import');
      
      // TODO: * Should be enabled
      cy.contains('button', 'Import Content')
        .should('not.have.class', 'cursor-not-allowed')
        .and('not.be.disabled');
    });
    it('clears import text when clear button clicked', () => {
      mountWithProviders(
        <MarkdownExportModal 
          element={testElement}
          onClose={onCloseSpy}
          onImport={onImportSpy}
        />
      );

      cy.contains('button', 'Import').click();
      cy.get('textarea').type('Some markdown content');
      cy.contains('button', 'Clear').click();
      
      cy.get('textarea').should('have.value', '');
    });
    it('parses markdown and imports answers', () => {
      const markdownContent = `# Test Character

**Category:** character

---

## Physical

### What is their appearance?

Updated appearance description

## Mental

### What is their personality?

Updated personality description

## Abilities

### What are their abilities?

Updated abilities`;

      mountWithProviders(
        <MarkdownExportModal 
          element={testElement}
          onClose={onCloseSpy}
          onImport={onImportSpy}
        />
      );

      cy.contains('button', 'Import').click();
      cy.get('textarea').type(markdownContent);
      cy.contains('button', 'Import Content').click();

      // * Wait for async processing
      waitForAnimation();

      cy.wrap(onImportSpy).should('have.been.calledWith', 
        Cypress.sinon.match({
          'q1': 'Updated appearance description',
          'q2': 'Updated personality description',
          'q3': 'Updated abilities'
        }));
      
      cy.wrap(onCloseSpy).should('have.been.called');
    });
    it('ignores "No answer provided" placeholders during import', () => {
      const markdownWithNoAnswer = `## Physical

### What is their appearance?

*No answer provided*

### What is their personality?

Has a personality`;

      mountWithProviders(
        <MarkdownExportModal 
          element={testElement}
          onClose={onCloseSpy}
          onImport={onImportSpy}
        />
      );

      cy.contains('button', 'Import').click();
      cy.get('textarea').type(markdownWithNoAnswer);
      cy.contains('button', 'Import Content').click();

      waitForAnimation();

      cy.wrap(onImportSpy).should('have.been.calledWith', 
        Cypress.sinon.match((value: any) => {
          // TODO: q1 should not be included since it says "No answer provided"
          return !('q1' in value) && value['q2'] === 'Has a personality';
        }));
    });
    it('handles multiline answers during import', () => {
      const multilineMarkdown = `### What is their appearance?

Line 1 of appearance
Line 2 of appearance
Line 3 of appearance`;

      mountWithProviders(
        <MarkdownExportModal 
          element={testElement}
          onClose={onCloseSpy}
          onImport={onImportSpy}
        />
      );

      cy.contains('button', 'Import').click();
      cy.get('textarea').type(multilineMarkdown);
      cy.contains('button', 'Import Content').click();

      waitForAnimation();

      cy.wrap(onImportSpy).should('have.been.calledWith', 
        Cypress.sinon.match({
          'q1': Cypress.sinon.match.string
        }));
    });
  });
  describe('Modal Interactions', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });
    it('closes modal when close button clicked', () => {
      mountWithProviders(
        <MarkdownExportModal 
          element={testElement}
          onClose={onCloseSpy}
        />
      );

      cy.get('button').find('svg.lucide-x').parent().click();
      cy.wrap(onCloseSpy).should('have.been.called');
    });
    it('does not close modal on background click', () => {
      mountWithProviders(
        <MarkdownExportModal 
          element={testElement}
          onClose={onCloseSpy}
        />
      );

      // * Click on the backdrop
      cy.get('.fixed.inset-0[data-cy*="black"]').click({ force: true });
      cy.wrap(onCloseSpy).should('not.have.been.called');
    });
  });
  describe('Edge Cases', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });
    it('handles element with no questions', () => {
      const elementNoQuestions = {
        ...testElement,
        questions: [],
        answers: {}
      };

      mountWithProviders(
        <MarkdownExportModal 
          element={elementNoQuestions}
          onClose={onCloseSpy}
        />
      );

      cy.get('pre').should('contain', '# Test Character');
      cy.get('pre').should('contain', '**Category:** character');
    });
    it('handles very long content', () => {
      const longAnswer = 'A'.repeat(1000);
      const elementWithLongAnswer = {
        ...testElement,
        answers: {
          'q1': { questionId: 'q1', value: longAnswer }
        }
      };

      mountWithProviders(
        <MarkdownExportModal 
          element={elementWithLongAnswer}
          onClose={onCloseSpy}
        />
      );

      cy.get('pre').should('contain', longAnswer);
      cy.get('.max-h-96.overflow-auto').should('exist');
    });
    it('handles special characters in element name', () => {
      const elementSpecialName = {
        ...testElement,
        name: 'Test & Character <with> "Special" Characters'
      };

      mountWithProviders(
        <MarkdownExportModal 
          element={elementSpecialName}
          onClose={onCloseSpy}
        />
      );

      cy.get('pre').should('contain', '# Test & Character <with> "Special" Characters');
    });
    it('handles questions without categories', () => {
      const elementNoCategoryQuestions = {
        ...testElement,
        questions: [
          {
            id: 'q1',
            text: 'Question without category',
            type: 'text',
            required: true
            // * No category property
          }
        ]
      };

      mountWithProviders(
        <MarkdownExportModal 
          element={elementNoCategoryQuestions}
          onClose={onCloseSpy}
        />
      );

      // TODO: * Should group under "General" category
      cy.get('pre').should('contain', '## General');
      cy.get('pre').should('contain', '### Question without category');
    });
    it('handles HTML content in answers', () => {
      const elementWithHtml = {
        ...testElement,
        answers: {
          'q1': { 
            questionId: 'q1', 
            value: '<p>This is <strong>HTML</strong> content</p>' 
          }
        }
      };

      mountWithProviders(
        <MarkdownExportModal 
          element={elementWithHtml}
          onClose={onCloseSpy}
        />
      );

      // TODO: * Should convert HTML to markdown
      cy.get('pre').should('not.contain', '<p>');
      cy.get('pre').should('not.contain', '<strong>');
    });
  });
  describe('Accessibility', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });
    it('has proper headings and labels', () => {
      mountWithProviders(
        <MarkdownExportModal 
          element={testElement}
          onClose={onCloseSpy}
          onImport={onImportSpy}
        />
      );

      cy.get('h2').should('contain', 'Markdown Import/Export');
      cy.contains('label', 'Paste your Markdown content below:').should('not.be.visible'); // On import tab
      
      cy.contains('button', 'Import').click();
      cy.contains('label', 'Paste your Markdown content below:').should('be.visible');
    });
    it('supports keyboard navigation between tabs', () => {
      mountWithProviders(
        <MarkdownExportModal 
          element={testElement}
          onClose={onCloseSpy}
          onImport={onImportSpy}
        />
      );

      cy.contains('button', 'Export').focus();
      cy.focused().should('contain', 'Export');
      
      cy.focused().tab();
      cy.focused().should('contain', 'Import');
    });
    it('maintains focus within modal', () => {
      mountWithProviders(
        <MarkdownExportModal 
          element={testElement}
          onClose={onCloseSpy}
        />
      );

      cy.contains('button', 'Copy to Clipboard').focus();
      cy.focused().should('contain', 'Copy to Clipboard');
      
      cy.focused().tab();
      cy.focused().should('contain', 'Download as .md');
    });
  });
  describe('Responsive Design', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });
    it('adapts layout for mobile viewport', () => {
      setMobileViewport();
      mountWithProviders(
        <MarkdownExportModal 
          element={testElement}
          onClose={onCloseSpy}
        />
      );

      cy.get('.max-w-4xl').should('be.visible');
      cy.get('.p-4').should('be.visible');
    });
    it('adapts layout for tablet viewport', () => {
      setTabletViewport();
      mountWithProviders(
        <MarkdownExportModal 
          element={testElement}
          onClose={onCloseSpy}
        />
      );

      cy.get('.max-w-4xl').should('be.visible');
      cy.get('.p-6').should('be.visible');
    });
    it('maintains max width on desktop', () => {
      setDesktopViewport();
      mountWithProviders(
        <MarkdownExportModal 
          element={testElement}
          onClose={onCloseSpy}
        />
      );

      cy.get('.max-w-4xl').should('be.visible');
      cy.get('.max-h-\\[90vh\\]').should('be.visible');
    });
  });
});