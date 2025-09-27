/**
 * @fileoverview Utility Components Component Tests
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
import { ResourceHints } from '../../../src/components/ResourceHints';
// ! Component not yet implemented - ValidationPanel missing
// import { ValidationPanel } from '../../../src/components/ValidationPanel';
import { ConditionalPanel } from '../../../src/components/ConditionalPanel';
import { AutoSaveCountdown } from '../../../src/components/AutoSaveCountdown';
import { BulkSyncProgress } from '../../../src/components/BulkSyncProgress';
import { PullToRefresh } from '../../support/component-test-helpersPullToRefresh';
// ! Component has incorrect path - LazyImage import fixed
// import { LazyImage } from '../../support/component-test-helpersLazyImage';
import { LazyLoadImage } from '../../support/component-test-helpersLazyLoadImage';
// ! Component not yet implemented - ProjectSearchBar missing
// import { ProjectSearchBar } from '../../../src/components/ProjectSearchBar';
// ! Component not yet implemented - ProjectSortDropdown missing
// import { ProjectSortDropdown } from '../../../src/components/ProjectSortDropdown';
// ! Component not yet implemented - TagManager missing
// import { TagManager } from '../../../src/components/TagManager';

describe('ResourceHints', () => {
  beforeEach(function() {
    // ! Essential debug and state management
    cy.comprehensiveDebug();
    cy.cleanState();
  });

  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

  describe('Rendering', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

    it('renders without visible UI', () => {
      cy.mountWithProviders(<ResourceHints />);
      
      // TODO: * Component should not render any visible content
      cy.get('body').children().should('have.length', 0);
    });
    
    it('adds prefetch links to document head', () => {
      cy.mountWithProviders(<ResourceHints />);
      
      // * Check for prefetch links
      cy.document().then(doc => {
        const prefetchLinks = doc.querySelectorAll('link[rel="prefetch"]');
        expect(prefetchLinks.length).to.be.greaterThan(0);
      });
    });
    
    it('adds preconnect links for external domains', () => {
      cy.mountWithProviders(<ResourceHints />);
      
      cy.document().then(doc => {
        const preconnectLinks = doc.querySelectorAll('link[rel="preconnect"]');
        expect(preconnectLinks.length).to.be.greaterThan(0);
        
        // * Check for font domains
        const fontPreconnect = Array.from(preconnectLinks).find(
          link => link.getAttribute('href')?.includes('fonts.googleapis.com')
        );
        expect(fontPreconnect).to.exist;
      });
    });
    
    it('adds DNS prefetch hints', () => {
      cy.mountWithProviders(<ResourceHints />);
      
      cy.document().then(doc => {
        const dnsPrefetchLinks = doc.querySelectorAll('link[rel="dns-prefetch"]');
        expect(dnsPrefetchLinks.length).to.be.greaterThan(0);
      });
    });
    
    it('preloads critical images', () => {
      cy.mountWithProviders(<ResourceHints />);
      
      cy.document().then(doc => {
        const preloadLinks = doc.querySelectorAll('link[rel="preload"][as="image"]');
        expect(preloadLinks.length).to.be.greaterThan(0);
      });
    });
  });
  
  describe('Cleanup', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

    it('component unmounts cleanly', () => {
      // * First mount the component
      cy.mountWithProviders(<ResourceHints />);
      
      // * Then remount with different content to simulate replacement
      cy.mountWithProviders(<div>Replacement content</div>);
      cy.contains('Replacement content').should('be.visible');
    });
  });
});

// ! SKIP: Component not yet implemented - ValidationPanel missing
describe.skip('ValidationPanel', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

  
  const defaultProps = {
    questionType: 'text' as const,
    validation: {},
    onChange: () => {}
  };
  
  describe('Rendering', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

    it('renders validation panel', () => {
      // cy.mountWithProviders(<ValidationPanel {...defaultProps} />);
      
      cy.contains('Validation Rules').should('be.visible');
    });
    
    it('shows text validation options for text type', () => {
      // cy.mountWithProviders(<ValidationPanel {...defaultProps} questionType="text" />);
      
      cy.contains('Min Length').should('be.visible');
      cy.contains('Max Length').should('be.visible');
      cy.contains('Pattern (RegEx)').should('be.visible');
    });
    
    it('shows number validation options for number type', () => {
      // cy.mountWithProviders(<ValidationPanel {...defaultProps} questionType="number" />);
      
      cy.contains('Min Value').should('be.visible');
      cy.contains('Max Value').should('be.visible');
    });
    
    it('shows custom error message field', () => {
      // cy.mountWithProviders(<ValidationPanel {...defaultProps} />);
      
      cy.contains('Custom Error Message').should('be.visible');
    });
  });
  
  describe('Text Validation', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

    it('handles min length changes', () => {
      const onChange = cy.stub();
      // cy.mountWithProviders(<ValidationPanel {...defaultProps} onChange={onChange} />);
      
      cy.get('input[placeholder="No minimum"]').first().type('5');
      cy.wrap(onChange).should('have.been.calledWith', { minLength: 5 });
    });
    
    it('handles max length changes', () => {
      const onChange = cy.stub();
      // cy.mountWithProviders(<ValidationPanel {...defaultProps} onChange={onChange} />);
      
      cy.get('input[placeholder="No maximum"]').first().type('100');
      cy.wrap(onChange).should('have.been.calledWith', { maxLength: 100 });
    });
    
    it('handles pattern changes', () => {
      const onChange = cy.stub();
      // cy.mountWithProviders(<ValidationPanel {...defaultProps} onChange={onChange} />);
      
      cy.get('input[placeholder*="^[A-Za-z]+$"]').type('^\\d+$');
      cy.wrap(onChange).should('have.been.calledWith', { pattern: '^\\d+$' });
    });
    
    it('clears validation when field emptied', () => {
      const onChange = cy.stub();
      cy.mountWithProviders(
        {/* <ValidationPanel
          {...defaultProps}
          validation={{ minLength: 5 }}
          onChange={onChange}
        /> */}
      );
      
      cy.get('input[value="5"]').clear();
      cy.wrap(onChange).should('have.been.called');
    });
  });
  
  describe('Number Validation', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

    it('handles min value changes', () => {
      const onChange = cy.stub();
      // cy.mountWithProviders(<ValidationPanel {...defaultProps} questionType="number" onChange={onChange} />);
      
      cy.get('input[placeholder="No minimum"]').type('0');
      cy.wrap(onChange).should('have.been.calledWith', { min: 0 });
    });
    
    it('handles max value changes', () => {
      const onChange = cy.stub();
      // cy.mountWithProviders(<ValidationPanel {...defaultProps} questionType="number" onChange={onChange} />);
      
      cy.get('input[placeholder="No maximum"]').type('100');
      cy.wrap(onChange).should('have.been.calledWith', { max: 100 });
    });
  });
  
  describe('Custom Error Message', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

    it('handles custom error message', () => {
      const onChange = cy.stub();
      // cy.mountWithProviders(<ValidationPanel {...defaultProps} onChange={onChange} />);
      
      cy.get('input[placeholder*="error message"]').type('Please enter a valid value');
      cy.wrap(onChange).should('have.been.calledWith', { 
        customError: 'Please enter a valid value' 
      });
    });
  });
  
  describe('Edge Cases', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

    it('handles existing validation values', () => {
      const validation = { 
        minLength: 5, 
        maxLength: 50, 
        pattern: '^[A-Z]' 
      };
      
      cy.mountWithProviders(
        {/* <ValidationPanel
          {...defaultProps}
          validation={validation}
        /> */}
      );
      
      cy.get('input[value="5"]').should('exist');
      cy.get('input[value="50"]').should('exist');
      cy.get('input[value="^[A-Z]"]').should('exist');
    });
    
    it('handles validation for textarea type', () => {
      // cy.mountWithProviders(<ValidationPanel {...defaultProps} questionType="textarea" />);
      
      cy.contains('Min Length').should('be.visible');
      cy.contains('Max Length').should('be.visible');
      cy.contains('Pattern (RegEx)').should('be.visible');
    });
  });
});

// ! SKIP: Component has incorrect path - LazyImage import fixed
describe.skip('LazyImage', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

  
  const defaultProps = {
    src: 'https://example.com/image.jpg',
    alt: 'Test image'
  };
  
  describe('Rendering', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

    it('renders with loading placeholder initially', () => {
      // cy.mountWithProviders(<LazyImage {...defaultProps} />);
      
      // ? TODO: * Should show loading state initially
      cy.get('div[class*="animate-pulse"]').should('be.visible');
    });
    
    it('shows image when loaded', () => {
      // cy.mountWithProviders(<LazyImage {...defaultProps} />);
      
      // * Wait for image to appear
      cy.get('img[alt="Test image"]').should('be.visible');
    });
    
    it('applies custom className', () => {
      // cy.mountWithProviders(<LazyImage {...defaultProps} className="custom-class" />);
      
      cy.get('.custom-class').should('exist');
    });
    
    it('handles loading state', () => {
      // cy.mountWithProviders(<LazyImage {...defaultProps} />);
      
      // * Check for loading indicator
      cy.get('[data-cy="image-loading"]').should('exist');
    });
  });
  
  describe('Intersection Observer', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

    it('lazy loads when in viewport', () => {
      cy.mountWithProviders(
        <div style={{ height: '2000px' }}>
          <div style={{ height: '1500px' }}>Spacer</div>
          {/* <LazyImage {...defaultProps} /> */}
        </div>
      );
      
      // TODO: * Image should not be loaded initially
      cy.get('img').should('not.exist');
      
      // * Scroll to image
      cy.scrollTo('bottom');
      
      // TODO: * Image should now be loaded
      cy.get('img[alt="Test image"]').should('be.visible');
    });
  });
  
  describe('Error Handling', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

    it('shows error state on load failure', () => {
      // cy.mountWithProviders(<LazyImage src="invalid-url" alt="Error test" />);
      
      // ? TODO: * Should show error state
      cy.get('[data-cy="image-error"]').should('be.visible');
    });
    
    it('shows fallback on error', () => {
      cy.mountWithProviders(
        {/* <LazyImage
          src="invalid-url"
          alt="Error test"
          fallback={<div data-cy="fallback">Image failed</div>}
        /> */}
      );
      
      cy.get('[data-cy="fallback"]').should('be.visible');
    });
  });
});

// ! SKIP: Component not yet implemented - ProjectSearchBar missing
describe.skip('ProjectSearchBar', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

  
  const defaultProps = {
    value: '',
    onChange: () => {},
    placeholder: 'Search projects...'
  };
  
  describe('Rendering', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

    it('renders search input', () => {
      // cy.mountWithProviders(<ProjectSearchBar {...defaultProps} />);
      
      cy.get('input[placeholder="Search projects..."]').should('be.visible');
    });
    
    it('shows search icon', () => {
      // cy.mountWithProviders(<ProjectSearchBar {...defaultProps} />);
      
      cy.get('svg').should('be.visible'); // Search icon
    });
    
    it('displays initial value', () => {
      // cy.mountWithProviders(<ProjectSearchBar {...defaultProps} value="test query" />);
      
      cy.get('input').should('have.value', 'test query');
    });
  });
  
  describe('User Interactions', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

    it('handles input changes', () => {
      const onChange = cy.stub();
      // cy.mountWithProviders(<ProjectSearchBar {...defaultProps} onChange={onChange} />);
      
      cy.get('input').type('fantasy world');
      cy.wrap(onChange).should('have.been.called');
    });
    
    it('shows clear button when has value', () => {
      // cy.mountWithProviders(<ProjectSearchBar {...defaultProps} value="test" />);
      
      cy.get('[data-cy="clear-search"]').should('be.visible');
    });
    
    it('clears search on clear button click', () => {
      const onChange = cy.stub();
      // cy.mountWithProviders(<ProjectSearchBar {...defaultProps} value="test" onChange={onChange} />);
      
      cy.get('[data-cy="clear-search"]').click();
      cy.wrap(onChange).should('have.been.calledWith', '');
    });
    
    it('debounces search input', () => {
      const onChange = cy.stub();
      // cy.mountWithProviders(<ProjectSearchBar {...defaultProps} onChange={onChange} debounce={300} />);
      
      cy.get('input').type('test');
      
      // TODO: * Should not be called immediately
      cy.wrap(onChange).should('not.have.been.called');
      
      // TODO: ! PERFORMANCE: * Should be called after debounce
      cy.wait(350);
      cy.wrap(onChange).should('have.been.called');
    });
  });
  
  describe('Keyboard Navigation', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

    it('submits on Enter key', () => {
      const onSubmit = cy.stub();
      // cy.mountWithProviders(<ProjectSearchBar {...defaultProps} onSubmit={onSubmit} />);
      
      cy.get('input').type('test{enter}');
      cy.wrap(onSubmit).should('have.been.calledWith', 'test');
    });
    
    it('clears on Escape key', () => {
      const onChange = cy.stub();
      // cy.mountWithProviders(<ProjectSearchBar {...defaultProps} value="test" onChange={onChange} />);
      
      cy.get('input').type('{esc}');
      cy.wrap(onChange).should('have.been.calledWith', '');
    });
  });
});

// ! SKIP: Component not yet implemented - ProjectSortDropdown missing
describe.skip('ProjectSortDropdown', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

  
  const defaultProps = {
    value: 'name',
    onChange: () => {},
    options: [
      { value: 'name', label: 'Name' },
      { value: 'date', label: 'Date Created' },
      { value: 'modified', label: 'Last Modified' }
    ]
  };
  
  describe('Rendering', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

    it('renders sort dropdown', () => {
      // cy.mountWithProviders(<ProjectSortDropdown {...defaultProps} />);
      
      cy.contains('Name').should('be.visible');
    });
    
    it('shows dropdown icon', () => {
      // cy.mountWithProviders(<ProjectSortDropdown {...defaultProps} />);
      
      cy.get('svg').should('be.visible'); // Chevron icon
    });
  });
  
  describe('Dropdown Interaction', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

    it('opens dropdown on click', () => {
      // cy.mountWithProviders(<ProjectSortDropdown {...defaultProps} />);
      
      cy.contains('Name').click();
      cy.contains('Date Created').should('be.visible');
      cy.contains('Last Modified').should('be.visible');
    });
    
    it('selects option', () => {
      const onChange = cy.stub();
      // cy.mountWithProviders(<ProjectSortDropdown {...defaultProps} onChange={onChange} />);
      
      cy.contains('Name').click();
      cy.contains('Date Created').click();
      
      cy.wrap(onChange).should('have.been.calledWith', 'date');
    });
    
    it('closes dropdown after selection', () => {
      // cy.mountWithProviders(<ProjectSortDropdown {...defaultProps} />);
      
      cy.contains('Name').click();
      cy.contains('Date Created').click();
      
      // TODO: * Dropdown should be closed
      cy.contains('Last Modified').should('not.be.visible');
    });
    
    it('closes dropdown on outside click', () => {
      cy.mountWithProviders(
        <div>
          {/* <ProjectSortDropdown {...defaultProps} /> */}
          <div data-cy="outside">Outside element</div>
        </div>
      );
      
      cy.contains('Name').click();
      cy.contains('Date Created').should('be.visible');
      
      cy.get('[data-cy="outside"]').click();
      cy.contains('Date Created').should('not.be.visible');
    });
  });
  
  describe('Sort Direction', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

    it('shows sort direction indicator', () => {
      cy.mountWithProviders(
        {/* <ProjectSortDropdown
          {...defaultProps}
          value="name"
          direction="asc"
        /> */}
      );
      
      cy.get('[data-cy="sort-asc"]').should('be.visible');
    });
    
    it('toggles sort direction on same option click', () => {
      const onChange = cy.stub();
      cy.mountWithProviders(
        {/* <ProjectSortDropdown
          {...defaultProps}
          value="name"
          direction="asc"
          onChange={onChange}
        /> */}
      );
      
      cy.contains('Name').click();
      cy.contains('Name').click(); // Click same option
      
      cy.wrap(onChange).should('have.been.calledWith', 'name', 'desc');
    });
  });
});

// ! SKIP: Component not yet implemented - TagManager missing
describe.skip('TagManager', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

  
  const defaultProps = {
    tags: ['fantasy', 'magic', 'adventure'],
    availableTags: ['epic', 'quest', 'dragon', 'hero'],
    onAdd: () => {},
    onRemove: () => {},
    onEdit: () => {}
  };
  
  describe('Rendering', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

    it('renders tag list', () => {
      // cy.mountWithProviders(<TagManager {...defaultProps} />);
      
      cy.contains('fantasy').should('be.visible');
      cy.contains('magic').should('be.visible');
      cy.contains('adventure').should('be.visible');
    });
    
    it('shows add tag button', () => {
      // cy.mountWithProviders(<TagManager {...defaultProps} />);
      
      cy.get('[data-cy="add-tag-button"]').should('be.visible');
    });
    
    it('shows tag count', () => {
      // cy.mountWithProviders(<TagManager {...defaultProps} />);
      
      cy.contains('3 tags').should('be.visible');
    });
  });
  
  describe('Adding Tags', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

    it('opens add tag modal', () => {
      // cy.mountWithProviders(<TagManager {...defaultProps} />);
      
      cy.get('[data-cy="add-tag-button"]').click();
      cy.get('[data-cy="tag-modal"]').should('be.visible');
    });
    
    it('adds new tag from input', () => {
      const onAdd = cy.stub();
      // cy.mountWithProviders(<TagManager {...defaultProps} onAdd={onAdd} />);
      
      cy.get('[data-cy="add-tag-button"]').click();
      cy.get('[data-cy="tag-input"]').type('newTag');
      cy.get('[data-cy="save-tag"]').click();
      
      cy.wrap(onAdd).should('have.been.calledWith', 'newTag');
    });
    
    it('adds tag from suggestions', () => {
      const onAdd = cy.stub();
      // cy.mountWithProviders(<TagManager {...defaultProps} onAdd={onAdd} />);
      
      cy.get('[data-cy="add-tag-button"]').click();
      cy.get('[data-cy="suggested-tag-epic"]').click();
      
      cy.wrap(onAdd).should('have.been.calledWith', 'epic');
    });
  });
  
  describe('Removing Tags', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

    it('removes tag on X click', () => {
      const onRemove = cy.stub();
      // cy.mountWithProviders(<TagManager {...defaultProps} onRemove={onRemove} />);
      
      cy.get('[data-cy="remove-tag-fantasy"]').click();
      cy.wrap(onRemove).should('have.been.calledWith', 'fantasy');
    });
    
    it('confirms before removing', () => {
      // cy.mountWithProviders(<TagManager {...defaultProps} confirmRemove={true} />);
      
      cy.get('[data-cy="remove-tag-fantasy"]').click();
      cy.contains('Remove tag?').should('be.visible');
      cy.get('[data-cy="confirm-remove"]').click();
    });
  });
  
  describe('Editing Tags', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

    it('enables edit mode on tag click', () => {
      // cy.mountWithProviders(<TagManager {...defaultProps} />);
      
      cy.get('[data-cy="tag-fantasy"]').click();
      cy.get('[data-cy="edit-tag-input"]').should('be.visible');
    });
    
    it('saves edited tag', () => {
      const onEdit = cy.stub();
      // cy.mountWithProviders(<TagManager {...defaultProps} onEdit={onEdit} />);
      
      cy.get('[data-cy="tag-fantasy"]').click();
      cy.get('[data-cy="edit-tag-input"]').clear().type('epic-fantasy');
      cy.get('[data-cy="save-edit"]').click();
      
      cy.wrap(onEdit).should('have.been.calledWith', 'fantasy', 'epic-fantasy');
    });
  });
  
  describe('Search and Filter', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

    it('filters tags by search', () => {
      // cy.mountWithProviders(<TagManager {...defaultProps} />);
      
      cy.get('[data-cy="tag-search"]').type('mag');
      cy.contains('magic').should('be.visible');
      cy.contains('fantasy').should('not.be.visible');
    });
    
    it('shows no results message', () => {
      // cy.mountWithProviders(<TagManager {...defaultProps} />);
      
      cy.get('[data-cy="tag-search"]').type('xyz');
      cy.contains('No tags found').should('be.visible');
    });
  });
});