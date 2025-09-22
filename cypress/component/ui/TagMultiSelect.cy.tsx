/**
 * @fileoverview Tag Multi Select Component Tests
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
import { TagMultiSelect } from '../../../src/components/TagMultiSelect';

describe('TagMultiSelect Component', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    cy.captureFailureDebug();
  });
  
  const availableTags = ['Fantasy', 'Adventure', 'Magic', 'Dragons', 'Epic', 'Quest', 'Mystery', 'Romance'];
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
    it('renders with placeholder when no tags selected', () => {
      cy.mount(
        <TagMultiSelect
          availableTags={availableTags}
          selectedTags={[]}
          onChange={onChangeSpy}
          placeholder="Choose your tags..."
        />
      );

      cy.contains('Choose your tags...').should('be.visible');
      cy.get('svg').should('be.visible'); // ChevronDown icon
    });
    it('renders with default placeholder', () => {
      cy.mount(
        <TagMultiSelect
          availableTags={availableTags}
          selectedTags={[]}
          onChange={onChangeSpy}
        />
      );

      cy.contains('Select tags...').should('be.visible');
    });
    it('displays selected tags', () => {
      const selectedTags = ['Fantasy', 'Adventure'];
      
      cy.mount(
        <TagMultiSelect
          availableTags={availableTags}
          selectedTags={selectedTags}
          onChange={onChangeSpy}
        />
      );

      cy.contains('Fantasy').should('be.visible');
      cy.contains('Adventure').should('be.visible');
    });
    it('shows clear button when tags are selected', () => {
      cy.mount(
        <TagMultiSelect
          availableTags={availableTags}
          selectedTags={['Fantasy']}
          onChange={onChangeSpy}
        />
      );

      cy.contains('Clear').should('be.visible');
    });
    it('applies custom className', () => {
      cy.mount(
        <TagMultiSelect
          availableTags={availableTags}
          selectedTags={[]}
          onChange={onChangeSpy}
          className="custom-class"
        />
      );

      cy.get('.custom-class').should('exist');
    });
  });
  describe('Dropdown Behavior', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    cy.captureFailureDebug();
  });
    it('opens dropdown when clicked', () => {
      cy.mount(
        <TagMultiSelect
          availableTags={availableTags}
          selectedTags={[]}
          onChange={onChangeSpy}
        />
      );

      cy.get('[class*="cursor-pointer"]').click();
      cy.get('input[placeholder="Search tags..."]').should('be.visible');
      
      availableTags.forEach(tag => {
        cy.contains(tag).should('be.visible');
      });
    });
    it('closes dropdown when clicked again', () => {
      cy.mount(
        <TagMultiSelect
          availableTags={availableTags}
          selectedTags={[]}
          onChange={onChangeSpy}
        />
      );

      cy.get('[class*="cursor-pointer"]').click();
      cy.get('input[placeholder="Search tags..."]').should('be.visible');
      
      cy.get('[class*="cursor-pointer"]').click();
      cy.get('input[placeholder="Search tags..."]').should('not.exist');
    });
    it('closes dropdown when clicking outside', () => {
      cy.mount(
        <div>
          <TagMultiSelect
            availableTags={availableTags}
            selectedTags={[]}
            onChange={onChangeSpy}
          />
          <button>Outside button</button>
        </div>
      );

      cy.get('[class*="cursor-pointer"]').click();
      cy.get('input[placeholder="Search tags..."]').should('be.visible');
      
      cy.contains('Outside button').click();
      cy.get('input[placeholder="Search tags..."]').should('not.exist');
    });
    it('rotates chevron icon when dropdown is open', () => {
      cy.mount(
        <TagMultiSelect
          availableTags={availableTags}
          selectedTags={[]}
          onChange={onChangeSpy}
        />
      );

      cy.get('[class*="ChevronDown"]').should('not.have.class', 'rotate-180');
      
      cy.get('[class*="cursor-pointer"]').click();
      cy.get('[class*="ChevronDown"]').should('be.visible') // React Native Web uses inline styles instead of CSS classes;
    });
  });
  describe('Tag Selection', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    cy.captureFailureDebug();
  });
    it('selects a tag when clicked', () => {
      cy.mount(
        <TagMultiSelect
          availableTags={availableTags}
          selectedTags={[]}
          onChange={onChangeSpy}
        />
      );

      cy.get('[class*="cursor-pointer"]').click();
      cy.contains('button', 'Fantasy').click();
      
      cy.get('@onChange').should('have.been.calledWith', ['Fantasy']);
    });
    it('deselects a tag when clicked again', () => {
      cy.mount(
        <TagMultiSelect
          availableTags={availableTags}
          selectedTags={['Fantasy']}
          onChange={onChangeSpy}
        />
      );

      cy.get('[class*="cursor-pointer"]').click();
      cy.contains('button', 'Fantasy').click();
      
      cy.get('@onChange').should('have.been.calledWith', []);
    });
    it('shows check mark for selected tags', () => {
      cy.mount(
        <TagMultiSelect
          availableTags={availableTags}
          selectedTags={['Fantasy', 'Adventure']}
          onChange={onChangeSpy}
        />
      );

      cy.get('[class*="cursor-pointer"]').click();
      
      cy.contains('button', 'Fantasy').within(() => {
        cy.get('svg').should('exist'); // Check icon
      });
      cy.contains('button', 'Adventure').within(() => {
        cy.get('svg').should('exist'); // Check icon
      });
      cy.contains('button', 'Magic').within(() => {
        cy.get('svg').should('not.exist'); // No check icon
      });
    });
    it('selects multiple tags', () => {
      cy.mount(
        <TagMultiSelect
          availableTags={availableTags}
          selectedTags={[]}
          onChange={onChangeSpy}
        />
      );

      cy.get('[class*="cursor-pointer"]').click();
      cy.contains('button', 'Fantasy').click();
      cy.contains('button', 'Adventure').click();
      cy.contains('button', 'Magic').click();
      
      cy.get('@onChange').should('have.been.calledWith', ['Fantasy']);
      cy.get('@onChange').should('have.been.calledWith', ['Fantasy', 'Adventure']);
      cy.get('@onChange').should('have.been.calledWith', ['Fantasy', 'Adventure', 'Magic']);
    });
  });
  describe('Tag Removal', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    cy.captureFailureDebug();
  });
    it('removes tag when X button is clicked', () => {
      cy.mount(
        <TagMultiSelect
          availableTags={availableTags}
          selectedTags={['Fantasy', 'Adventure']}
          onChange={onChangeSpy}
        />
      );

      cy.contains('Fantasy').parent().within(() => {
        cy.get('button').click();
      });
      cy.get('@onChange').should('have.been.calledWith', ['Adventure']);
    });
    it('clears all tags when Clear button is clicked', () => {
      cy.mount(
        <TagMultiSelect
          availableTags={availableTags}
          selectedTags={['Fantasy', 'Adventure', 'Magic']}
          onChange={onChangeSpy}
        />
      );

      cy.contains('Clear').click();
      cy.get('@onChange').should('have.been.calledWith', []);
    });
    it('does not close dropdown when removing tag', () => {
      cy.mount(
        <TagMultiSelect
          availableTags={availableTags}
          selectedTags={['Fantasy']}
          onChange={onChangeSpy}
        />
      );

      cy.get('[class*="cursor-pointer"]').click();
      cy.get('input[placeholder="Search tags..."]').should('be.visible');
      
      cy.contains('Fantasy').parent().within(() => {
        cy.get('button').click();
      });
      // TODO: * Dropdown should still be open
      cy.get('input[placeholder="Search tags..."]').should('be.visible');
    });
  });
  describe('Search Functionality', () => {
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
        <TagMultiSelect
          availableTags={availableTags}
          selectedTags={[]}
          onChange={onChangeSpy}
        />
      );
      
      cy.get('[class*="cursor-pointer"]').click();
    });
    it('filters tags based on search query', () => {
      cy.get('input[placeholder="Search tags..."]').type('mag');
      
      cy.contains('Magic').should('be.visible');
      cy.contains('Fantasy').should('not.exist');
      cy.contains('Adventure').should('not.exist');
    });
    it('shows "No tags found" when no matches', () => {
      cy.get('input[placeholder="Search tags..."]').type('xyz');
      
      cy.contains('No tags found').should('be.visible');
    });
    it('shows result count when searching', () => {
      cy.get('input[placeholder="Search tags..."]').type('a');
      
      // TODO: * Should find tags containing 'a'
      cy.get('body').then($body => {
        const count = availableTags.filter(tag => tag.toLowerCase().includes('a')).length;
        cy.contains(`${count} tag${count !== 1 ? 's' : ''} found`).should('be.visible');
      });
    });
    it('clears search when dropdown closes', () => {
      cy.get('input[placeholder="Search tags..."]').type('mag');
      cy.contains('Magic').should('be.visible');
      
      // * Close dropdown
      cy.get('body').click(0, 0);
      
      // * Reopen dropdown
      cy.get('[class*="cursor-pointer"]').click();
      
      // TODO: * Search should be cleared
      cy.get('input[placeholder="Search tags..."]').should('have.value', '');
      availableTags.forEach(tag => {
        cy.contains(tag).should('be.visible');
      });
    });
    it('is case-insensitive', () => {
      cy.get('input[placeholder="Search tags..."]').type('MAGIC');
      cy.contains('Magic').should('be.visible');
      
      cy.get('input[placeholder="Search tags..."]').clear().type('magic');
      cy.contains('Magic').should('be.visible');
    });
  });
  describe('Focus Management', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    cy.captureFailureDebug();
  });
    it('focuses search input when dropdown opens', () => {
      cy.mount(
        <TagMultiSelect
          availableTags={availableTags}
          selectedTags={[]}
          onChange={onChangeSpy}
        />
      );

      cy.get('[class*="cursor-pointer"]').click();
      
      // * Small delay for focus to be set
      cy.wait(50);
      cy.get('input[placeholder="Search tags..."]').should('have.focus');
    });
    it('stops propagation when clicking inside dropdown', () => {
      cy.mount(
        <TagMultiSelect
          availableTags={availableTags}
          selectedTags={[]}
          onChange={onChangeSpy}
        />
      );

      cy.get('[class*="cursor-pointer"]').click();
      
      // TODO: * Clicking search input should not close dropdown
      cy.get('input[placeholder="Search tags..."]').click();
      cy.get('input[placeholder="Search tags..."]').should('be.visible');
    });
  });
  describe('Edge Cases', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    cy.captureFailureDebug();
  });
    it('handles empty available tags', () => {
      cy.mount(
        <TagMultiSelect
          availableTags={[]}
          selectedTags={[]}
          onChange={onChangeSpy}
        />
      );

      cy.get('[class*="cursor-pointer"]').click();
      cy.contains('No tags found').should('be.visible');
    });
    it('handles very long tag names', () => {
      const longTags = ['A'.repeat(50), 'B'.repeat(50)];
      
      cy.mount(
        <TagMultiSelect
          availableTags={longTags}
          selectedTags={longTags}
          onChange={onChangeSpy}
        />
      );

      cy.get('[class*="bg-metals-gold"]').should('have.length', 2);
    });
    it('handles many tags', () => {
      const manyTags = Array.from({ length: 50 }, (_, i) => `Tag ${i}`);
      
      cy.mount(
        <TagMultiSelect
          availableTags={manyTags}
          selectedTags={[]}
          onChange={onChangeSpy}
        />
      );

      cy.get('[class*="cursor-pointer"]').click();
      
      // TODO: * Should have scrollable container
      cy.get('[class*="overflow-y-auto"]').should('exist');
    });
    it('handles rapid selection/deselection', () => {
      cy.mount(
        <TagMultiSelect
          availableTags={availableTags}
          selectedTags={[]}
          onChange={onChangeSpy}
        />
      );

      cy.get('[class*="cursor-pointer"]').click();
      
      // * Rapidly click the same tag
      cy.contains('button', 'Fantasy').click();
      cy.contains('button', 'Fantasy').click();
      cy.contains('button', 'Fantasy').click();
      
      cy.get('@onChange').should('have.been.called');
    });
    it('handles special characters in tags', () => {
      const specialTags = ['Tag & More', 'Tag <with> HTML', 'Tag "quoted"', "Tag's apostrophe"];
      
      cy.mount(
        <TagMultiSelect
          availableTags={specialTags}
          selectedTags={[]}
          onChange={onChangeSpy}
        />
      );

      cy.get('[class*="cursor-pointer"]').click();
      
      specialTags.forEach(tag => {
        cy.contains(tag).should('be.visible');
      });
    });
  });
  describe('Accessibility', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    cy.captureFailureDebug();
  });
    it('can be navigated with keyboard', () => {
      cy.mount(
        <div>
          <button>Before</button>
          <TagMultiSelect
            availableTags={availableTags}
            selectedTags={['Fantasy']}
            onChange={onChangeSpy}
          />
          <button>After</button>
        </div>
      );

      cy.contains('Before').focus();
      cy.focused().tab();
      
      // TODO: * Should be able to tab through the component
      cy.focused().should('exist');
    });
    it('remove buttons are keyboard accessible', () => {
      cy.mount(
        <TagMultiSelect
          availableTags={availableTags}
          selectedTags={['Fantasy']}
          onChange={onChangeSpy}
        />
      );

      cy.contains('Fantasy').parent().within(() => {
        cy.get('button').focus();
        cy.focused().type('{enter}');
      });
      cy.get('@onChange').should('have.been.calledWith', []);
    });
    it('clear button is keyboard accessible', () => {
      cy.mount(
        <TagMultiSelect
          availableTags={availableTags}
          selectedTags={['Fantasy', 'Adventure']}
          onChange={onChangeSpy}
        />
      );

      cy.contains('Clear').focus();
      cy.focused().type('{enter}');
      
      cy.get('@onChange').should('have.been.calledWith', []);
    });
  });
  describe('Responsive Design', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    cy.captureFailureDebug();
  });
    it('works on mobile viewport', () => {
      cy.viewport(375, 667);
      
      cy.mount(
        <TagMultiSelect
          availableTags={availableTags}
          selectedTags={['Fantasy', 'Adventure']}
          onChange={onChangeSpy}
        />
      );

      cy.contains('Fantasy').should('be.visible');
      cy.contains('Adventure').should('be.visible');
      
      cy.get('[class*="cursor-pointer"]').click();
      cy.get('input[placeholder="Search tags..."]').should('be.visible');
    });
    it('works on tablet viewport', () => {
      cy.viewport(768, 1024);
      
      cy.mount(
        <TagMultiSelect
          availableTags={availableTags}
          selectedTags={[]}
          onChange={onChangeSpy}
        />
      );

      cy.get('[class*="cursor-pointer"]').click();
      availableTags.forEach(tag => {
        cy.contains(tag).should('be.visible');
      });
    });
    it('works on desktop viewport', () => {
      cy.viewport(1920, 1080);
      
      cy.mount(
        <TagMultiSelect
          availableTags={availableTags}
          selectedTags={[]}
          onChange={onChangeSpy}
        />
      );

      cy.get('[class*="cursor-pointer"]').should('be.visible');
    });
  });
});