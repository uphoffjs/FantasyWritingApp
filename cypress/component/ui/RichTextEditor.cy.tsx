/**
 * @fileoverview Rich Text Editor Component Tests
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
import { RichTextEditor } from '../../../src/components/RichTextEditor';

describe('RichTextEditor Component', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    cy.captureFailureDebug();
  });
  let onChangeSpy: any;

  beforeEach(function() {
    // ! MANDATORY: Comprehensive debug setup
    cy.comprehensiveDebug();

    // * Clean state before each test
    cy.cleanState();

    onChangeSpy = cy.spy().as('onChange');
  });
  describe('Rendering', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    cy.captureFailureDebug();
  });
    it('renders the editor with toolbar', () => {
      cy.mount(
        <RichTextEditor 
          content="" 
          onChange={onChangeSpy} 
        />
      );

      // * Check toolbar is visible
      cy.get('[role="toolbar"]').should('be.visible');
      
      // * Check all toolbar buttons are present
      cy.get('[aria-label="Bold (Ctrl+B)"]').should('be.visible');
      cy.get('[aria-label="Italic (Ctrl+I)"]').should('be.visible');
      cy.get('[aria-label="Add Link (Ctrl+K)"]').should('be.visible');
      cy.get('[aria-label="Heading 1"]').should('be.visible');
      cy.get('[aria-label="Heading 2"]').should('be.visible');
      cy.get('[aria-label="Heading 3"]').should('be.visible');
      cy.get('[aria-label="Bullet List"]').should('be.visible');
      cy.get('[aria-label="Numbered List"]').should('be.visible');
      cy.get('[aria-label="Quote"]').should('be.visible');
      cy.get('[aria-label="Undo (Ctrl+Z)"]').should('be.visible');
      cy.get('[aria-label="Redo (Ctrl+Y)"]').should('be.visible');
    });
    it('renders with initial content', () => {
      const initialContent = '<p>Hello World!</p>';
      
      cy.mount(
        <RichTextEditor 
          content={initialContent} 
          onChange={onChangeSpy} 
        />
      );

      cy.get('.ProseMirror').should('contain', 'Hello World!');
    });
    it('renders with custom placeholder', () => {
      cy.mount(
        <RichTextEditor 
          content="" 
          onChange={onChangeSpy}
          placeholder="Enter your story here..."
        />
      );

      cy.get('.ProseMirror').should('have.attr', 'data-placeholder', 'Enter your story here...');
    });
    it('renders with custom minHeight', () => {
      cy.mount(
        <RichTextEditor 
          content="" 
          onChange={onChangeSpy}
          minHeight="300px"
        />
      );

      cy.get('.ProseMirror').should('have.attr', 'style').and('include', 'min-height: 300px');
    });
    it('renders with label for accessibility', () => {
      cy.mount(
        <RichTextEditor 
          content="" 
          onChange={onChangeSpy}
          label="Description"
          id="description-editor"
        />
      );

      cy.get('.ProseMirror').should('have.attr', 'aria-label', 'Description');
      cy.get('[role="toolbar"]').should('have.attr', 'id', 'description-editor-toolbar');
    });
    it('applies custom className', () => {
      cy.mount(
        <RichTextEditor 
          content="" 
          onChange={onChangeSpy}
          className="custom-editor-class"
        />
      );

      cy.get('.custom-editor-class').should('exist');
    });
  });
  describe('Text Formatting', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    cy.captureFailureDebug();
  });
    beforeEach(function() {
    // ! MANDATORY: Comprehensive debug setup
    cy.comprehensiveDebug();

    // * Clean state before each test
    cy.cleanState();

      cy.mount(
        <RichTextEditor 
          content="<p>Test content for formatting</p>" 
          onChange={onChangeSpy} 
        />
      );
      
      // * Select all text for formatting
      cy.get('.ProseMirror').click().type('{selectall}');
    });
    it('applies bold formatting', () => {
      cy.get('[aria-label="Bold (Ctrl+B)"]').click();
      
      cy.get('.ProseMirror strong').should('exist');
      cy.get('[aria-label="Bold (Ctrl+B)"]').should('have.attr', 'aria-pressed', 'true');
      cy.get('@onChange').should('have.been.called');
    });
    it('applies italic formatting', () => {
      cy.get('[aria-label="Italic (Ctrl+I)"]').click();
      
      cy.get('.ProseMirror em').should('exist');
      cy.get('[aria-label="Italic (Ctrl+I)"]').should('have.attr', 'aria-pressed', 'true');
      cy.get('@onChange').should('have.been.called');
    });
    it('toggles bold formatting on and off', () => {
      cy.get('[aria-label="Bold (Ctrl+B)"]').click();
      cy.get('.ProseMirror strong').should('exist');
      
      cy.get('[aria-label="Bold (Ctrl+B)"]').click();
      cy.get('.ProseMirror strong').should('not.exist');
    });
    it('supports keyboard shortcut for bold', () => {
      cy.get('.ProseMirror').type('{ctrl+b}');
      cy.get('.ProseMirror strong').should('exist');
    });
    it('supports keyboard shortcut for italic', () => {
      cy.get('.ProseMirror').type('{ctrl+i}');
      cy.get('.ProseMirror em').should('exist');
    });
  });
  describe('Heading Formatting', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    cy.captureFailureDebug();
  });
    beforeEach(function() {
    // ! MANDATORY: Comprehensive debug setup
    cy.comprehensiveDebug();

    // * Clean state before each test
    cy.cleanState();

      cy.mount(
        <RichTextEditor 
          content="<p>Test heading</p>" 
          onChange={onChangeSpy} 
        />
      );
      
      cy.get('.ProseMirror').click().type('{selectall}');
    });
    it('applies heading 1 formatting', () => {
      cy.get('[aria-label="Heading 1"]').click();
      
      cy.get('.ProseMirror h1').should('exist').and('contain', 'Test heading');
      cy.get('[aria-label="Heading 1"]').should('have.attr', 'aria-pressed', 'true');
    });
    it('applies heading 2 formatting', () => {
      cy.get('[aria-label="Heading 2"]').click();
      
      cy.get('.ProseMirror h2').should('exist').and('contain', 'Test heading');
      cy.get('[aria-label="Heading 2"]').should('have.attr', 'aria-pressed', 'true');
    });
    it('applies heading 3 formatting', () => {
      cy.get('[aria-label="Heading 3"]').click();
      
      cy.get('.ProseMirror h3').should('exist').and('contain', 'Test heading');
      cy.get('[aria-label="Heading 3"]').should('have.attr', 'aria-pressed', 'true');
    });
    it('toggles heading formatting', () => {
      cy.get('[aria-label="Heading 1"]').click();
      cy.get('.ProseMirror h1').should('exist');
      
      cy.get('[aria-label="Heading 1"]').click();
      cy.get('.ProseMirror h1').should('not.exist');
      cy.get('.ProseMirror p').should('exist');
    });
  });
  describe('List Formatting', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    cy.captureFailureDebug();
  });
    beforeEach(function() {
    // ! MANDATORY: Comprehensive debug setup
    cy.comprehensiveDebug();

    // * Clean state before each test
    cy.cleanState();

      cy.mount(
        <RichTextEditor 
          content="<p>Item 1</p><p>Item 2</p><p>Item 3</p>" 
          onChange={onChangeSpy} 
        />
      );
      
      cy.get('.ProseMirror').click().type('{selectall}');
    });
    it('creates bullet list', () => {
      cy.get('[aria-label="Bullet List"]').click();
      
      cy.get('.ProseMirror ul').should('exist');
      cy.get('.ProseMirror ul li').should('have.length', 3);
      cy.get('[aria-label="Bullet List"]').should('have.attr', 'aria-pressed', 'true');
    });
    it('creates numbered list', () => {
      cy.get('[aria-label="Numbered List"]').click();
      
      cy.get('.ProseMirror ol').should('exist');
      cy.get('.ProseMirror ol li').should('have.length', 3);
      cy.get('[aria-label="Numbered List"]').should('have.attr', 'aria-pressed', 'true');
    });
    it('creates blockquote', () => {
      cy.get('[aria-label="Quote"]').click();
      
      cy.get('.ProseMirror blockquote').should('exist');
      cy.get('[aria-label="Quote"]').should('have.attr', 'aria-pressed', 'true');
    });
    it('toggles list formatting', () => {
      cy.get('[aria-label="Bullet List"]').click();
      cy.get('.ProseMirror ul').should('exist');
      
      cy.get('[aria-label="Bullet List"]').click();
      cy.get('.ProseMirror ul').should('not.exist');
    });
  });
  describe('Link Functionality', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    cy.captureFailureDebug();
  });
    it('opens link modal when link button is clicked', () => {
      cy.mount(
        <RichTextEditor 
          content="<p>Click here</p>" 
          onChange={onChangeSpy} 
        />
      );
      
      cy.get('.ProseMirror').click().type('{selectall}');
      cy.get('[aria-label="Add Link (Ctrl+K)"]').click();
      
      // TODO: LinkModal should be visible
      cy.get('[data-cy="link-modal"]').should('be.visible');
    });
    it('adds a link to selected text', () => {
      cy.mount(
        <RichTextEditor 
          content="<p>Click here</p>" 
          onChange={onChangeSpy} 
        />
      );
      
      cy.get('.ProseMirror').click().type('{selectall}');
      cy.get('[aria-label="Add Link (Ctrl+K)"]').click();
      
      cy.get('#link-url').type('https://example.com');
      cy.get('[data-cy="confirm-link"]').click();
      
      cy.get('.ProseMirror a').should('exist')
        .and('have.attr', 'href', 'https://example.com');
    });
    it('removes a link', () => {
      cy.mount(
        <RichTextEditor 
          content='<p><a href="https://example.com">Link text</a></p>' 
          onChange={onChangeSpy} 
        />
      );
      
      // * Click on the link text to position cursor
      cy.get('.ProseMirror a').click();
      cy.get('[aria-label="Add Link (Ctrl+K)"]').click();
      
      cy.get('[data-cy="remove-link"]').click();
      
      cy.get('.ProseMirror a').should('not.exist');
    });
  });
  describe('History (Undo/Redo)', () => {
    it('undoes the last action', () => {
      cy.mount(
        <RichTextEditor 
          content="" 
          onChange={onChangeSpy} 
        />
      );
      
      // * Type some text
      cy.get('.ProseMirror').type('First text');
      cy.get('.ProseMirror').should('contain', 'First text');
      
      // Undo
      cy.get('[aria-label="Undo (Ctrl+Z)"]').click();
      cy.get('.ProseMirror').should('not.contain', 'First text');
    });
    it('redoes the undone action', () => {
      cy.mount(
        <RichTextEditor 
          content="" 
          onChange={onChangeSpy} 
        />
      );
      
      cy.get('.ProseMirror').type('Some text');
      cy.get('[aria-label="Undo (Ctrl+Z)"]').click();
      cy.get('.ProseMirror').should('not.contain', 'Some text');
      
      cy.get('[aria-label="Redo (Ctrl+Y)"]').click();
      cy.get('.ProseMirror').should('contain', 'Some text');
    });
    it('disables undo when nothing to undo', () => {
      cy.mount(
        <RichTextEditor 
          content="" 
          onChange={onChangeSpy} 
        />
      );
      
      cy.get('[aria-label="Undo (Ctrl+Z)"]').should('be.disabled');
    });
    it('disables redo when nothing to redo', () => {
      cy.mount(
        <RichTextEditor 
          content="" 
          onChange={onChangeSpy} 
        />
      );
      
      cy.get('[aria-label="Redo (Ctrl+Y)"]').should('be.disabled');
    });
    it('supports keyboard shortcuts for undo/redo', () => {
      cy.mount(
        <RichTextEditor 
          content="" 
          onChange={onChangeSpy} 
        />
      );
      
      cy.get('.ProseMirror').type('Test text');
      cy.get('.ProseMirror').type('{ctrl+z}');
      cy.get('.ProseMirror').should('not.contain', 'Test text');
      
      cy.get('.ProseMirror').type('{ctrl+y}');
      cy.get('.ProseMirror').should('contain', 'Test text');
    });
  });
  describe('Content Updates', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    cy.captureFailureDebug();
  });
    it('calls onChange when content is modified', () => {
      cy.mount(
        <RichTextEditor 
          content="" 
          onChange={onChangeSpy} 
        />
      );
      
      cy.get('.ProseMirror').type('New content');
      
      cy.get('@onChange').should('have.been.called');
      cy.get('@onChange').should('have.been.calledWith', Cypress.sinon.match.string);
    });
    it('updates editor when content prop changes', () => {
      const TestComponent = () => {
        const [content, setContent] = React.useState('<p>Initial content</p>');
        
        return (
          <div>
            <RichTextEditor content={content} onChange={setContent} />
            <button onClick={() => setContent('<p>Updated content</p>')}>
              Update Content
            </button>
          </div>
        );
      };
      
      cy.mount(<TestComponent />);
      
      cy.get('.ProseMirror').should('contain', 'Initial content');
      
      cy.get('button').contains('Update Content').click();
      cy.get('.ProseMirror').should('contain', 'Updated content');
    });
  });
  describe('Accessibility', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    cy.captureFailureDebug();
  });
    it('has proper ARIA attributes', () => {
      cy.mount(
        <RichTextEditor 
          content="" 
          onChange={onChangeSpy}
          label="Rich text input"
          id="test-editor"
        />
      );
      
      cy.get('.ProseMirror')
        .should('have.attr', 'role', 'textbox')
        .and('have.attr', 'aria-multiline', 'true')
        .and('have.attr', 'aria-label', 'Rich text input')
        .and('have.attr', 'aria-describedby', 'test-editor-toolbar');
      
      cy.get('[role="toolbar"]')
        .should('have.attr', 'aria-label', 'Text formatting toolbar');
    });
    it('toolbar buttons have aria-pressed state', () => {
      cy.mount(
        <RichTextEditor 
          content="<p>Test</p>" 
          onChange={onChangeSpy} 
        />
      );
      
      cy.get('.ProseMirror').click().type('{selectall}');
      cy.get('[aria-label="Bold (Ctrl+B)"]').click();
      
      cy.get('[aria-label="Bold (Ctrl+B)"]')
        .should('have.attr', 'aria-pressed', 'true');
    });
    it('provides screen reader announcements', () => {
      cy.mount(
        <RichTextEditor 
          content="" 
          onChange={onChangeSpy} 
        />
      );
      
      cy.get('[role="status"]').should('contain', 'Rich text editor ready');
    });
    it('supports keyboard navigation in toolbar', () => {
      cy.mount(
        <RichTextEditor 
          content="" 
          onChange={onChangeSpy} 
        />
      );
      
      cy.get('[aria-label="Bold (Ctrl+B)"]').focus();
      cy.focused().should('have.attr', 'aria-label', 'Bold (Ctrl+B)');
      
      cy.focused().tab();
      cy.focused().should('have.attr', 'aria-label', 'Italic (Ctrl+I)');
    });
  });
  describe('Edge Cases', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    cy.captureFailureDebug();
  });
    it('handles empty content gracefully', () => {
      cy.mount(
        <RichTextEditor 
          content="" 
          onChange={onChangeSpy} 
        />
      );
      
      cy.get('.ProseMirror').should('exist');
    });
    it('handles null content', () => {
      cy.mount(
        <RichTextEditor 
          content={null as any} 
          onChange={onChangeSpy} 
        />
      );
      
      cy.get('.ProseMirror').should('exist');
    });
    it('handles very long content', () => {
      const longContent = '<p>' + 'A'.repeat(10000) + '</p>';
      
      cy.mount(
        <RichTextEditor 
          content={longContent} 
          onChange={onChangeSpy} 
        />
      );
      
      cy.get('.ProseMirror').should('contain', 'A'.repeat(100));
    });
    it('handles special characters in content', () => {
      const specialContent = '<p>&lt;script&gt;alert("XSS")&lt;/script&gt;</p>';
      
      cy.mount(
        <RichTextEditor 
          content={specialContent} 
          onChange={onChangeSpy} 
        />
      );
      
      cy.get('.ProseMirror').should('contain', '<script>alert("XSS")</script>');
    });
    it('maintains content when toolbar buttons are clicked without selection', () => {
      cy.mount(
        <RichTextEditor 
          content="<p>Test content</p>" 
          onChange={onChangeSpy} 
        />
      );
      
      // // DEPRECATED: * Click bold without selecting text
      cy.get('[aria-label="Bold (Ctrl+B)"]').click();
      
      // TODO: * Content should still be there
      cy.get('.ProseMirror').should('contain', 'Test content');
    });
  });
  describe('Responsive Design', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    cy.captureFailureDebug();
  });
    it('adapts toolbar for mobile viewport', () => {
      cy.viewport(375, 667);
      
      cy.mount(
        <RichTextEditor 
          content="" 
          onChange={onChangeSpy} 
        />
      );
      
      // TODO: * Toolbar should still be functional
      cy.get('[role="toolbar"]').should('be.visible');
      cy.get('[aria-label="Bold (Ctrl+B)"]').should('be.visible');
      
      // * Check that buttons have minimum touch target size
      cy.get('[aria-label="Bold (Ctrl+B)"]')
        .should('have.css', 'min-width', '32px')
        .and('have.css', 'min-height', '32px');
    });
    it('works on tablet viewport', () => {
      cy.viewport(768, 1024);
      
      cy.mount(
        <RichTextEditor 
          content="" 
          onChange={onChangeSpy} 
        />
      );
      
      cy.get('[role="toolbar"]').should('be.visible');
      cy.get('.ProseMirror').should('be.visible');
    });
    it('works on desktop viewport', () => {
      cy.viewport(1920, 1080);
      
      cy.mount(
        <RichTextEditor 
          content="" 
          onChange={onChangeSpy} 
        />
      );
      
      cy.get('[role="toolbar"]').should('be.visible');
      cy.get('.ProseMirror').should('be.visible');
    });
  });
});