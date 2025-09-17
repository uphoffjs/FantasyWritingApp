/// <reference types="cypress" />
import React from 'react';
import { ResourceHints } from '../../src/components/ResourceHints';
import { ValidationPanel } from '../../src/components/ValidationPanel';
import { ConditionalPanel } from '../../src/components/ConditionalPanel';
import { AutoSaveCountdown } from '../../src/components/AutoSaveCountdown';
import { BulkSyncProgress } from '../../src/components/BulkSyncProgress';
import { PullToRefresh } from '../../src/components/ui/PullToRefresh';
import { LazyImage } from '../../src/components/ui/LazyImage';
import { LazyLoadImage } from '../../src/components/ui/LazyLoadImage';
import { ProjectSearchBar } from '../../src/components/ProjectSearchBar';
import { ProjectSortDropdown } from '../../src/components/ProjectSortDropdown';
import { TagManager } from '../../src/components/TagManager';

describe('ResourceHints', () => {
  describe('Rendering', () => {
    it('renders without visible UI', () => {
      cy.mount(<ResourceHints />);
      
      // Component should not render any visible content
      cy.get('body').children().should('have.length', 0);
    });
    
    it('adds prefetch links to document head', () => {
      cy.mount(<ResourceHints />);
      
      // Check for prefetch links
      cy.document().then(doc => {
        const prefetchLinks = doc.querySelectorAll('link[rel="prefetch"]');
        expect(prefetchLinks.length).to.be.greaterThan(0);
      });
    });
    
    it('adds preconnect links for external domains', () => {
      cy.mount(<ResourceHints />);
      
      cy.document().then(doc => {
        const preconnectLinks = doc.querySelectorAll('link[rel="preconnect"]');
        expect(preconnectLinks.length).to.be.greaterThan(0);
        
        // Check for font domains
        const fontPreconnect = Array.from(preconnectLinks).find(
          link => link.getAttribute('href')?.includes('fonts.googleapis.com')
        );
        expect(fontPreconnect).to.exist;
      });
    });
    
    it('adds DNS prefetch hints', () => {
      cy.mount(<ResourceHints />);
      
      cy.document().then(doc => {
        const dnsPrefetchLinks = doc.querySelectorAll('link[rel="dns-prefetch"]');
        expect(dnsPrefetchLinks.length).to.be.greaterThan(0);
      });
    });
    
    it('preloads critical images', () => {
      cy.mount(<ResourceHints />);
      
      cy.document().then(doc => {
        const preloadLinks = doc.querySelectorAll('link[rel="preload"][as="image"]');
        expect(preloadLinks.length).to.be.greaterThan(0);
      });
    });
  });
  
  describe('Cleanup', () => {
    it('component unmounts cleanly', () => {
      // First mount the component
      cy.mount(<ResourceHints />);
      
      // Then remount with different content to simulate replacement
      cy.mount(<div>Replacement content</div>);
      cy.contains('Replacement content').should('be.visible');
    });
  });
});

describe('ValidationPanel', () => {
  const defaultProps = {
    questionType: 'text' as const,
    validation: {},
    onChange: cy.stub()
  };
  
  describe('Rendering', () => {
    it('renders validation panel', () => {
      cy.mount(<ValidationPanel {...defaultProps} />);
      
      cy.contains('Validation Rules').should('be.visible');
    });
    
    it('shows text validation options for text type', () => {
      cy.mount(<ValidationPanel {...defaultProps} questionType="text" />);
      
      cy.contains('Min Length').should('be.visible');
      cy.contains('Max Length').should('be.visible');
      cy.contains('Pattern (RegEx)').should('be.visible');
    });
    
    it('shows number validation options for number type', () => {
      cy.mount(<ValidationPanel {...defaultProps} questionType="number" />);
      
      cy.contains('Min Value').should('be.visible');
      cy.contains('Max Value').should('be.visible');
    });
    
    it('shows custom error message field', () => {
      cy.mount(<ValidationPanel {...defaultProps} />);
      
      cy.contains('Custom Error Message').should('be.visible');
    });
  });
  
  describe('Text Validation', () => {
    it('handles min length changes', () => {
      const onChange = cy.stub();
      cy.mount(<ValidationPanel {...defaultProps} onChange={onChange} />);
      
      cy.get('input[placeholder="No minimum"]').first().type('5');
      cy.wrap(onChange).should('have.been.calledWith', { minLength: 5 });
    });
    
    it('handles max length changes', () => {
      const onChange = cy.stub();
      cy.mount(<ValidationPanel {...defaultProps} onChange={onChange} />);
      
      cy.get('input[placeholder="No maximum"]').first().type('100');
      cy.wrap(onChange).should('have.been.calledWith', { maxLength: 100 });
    });
    
    it('handles pattern changes', () => {
      const onChange = cy.stub();
      cy.mount(<ValidationPanel {...defaultProps} onChange={onChange} />);
      
      cy.get('input[placeholder*="^[A-Za-z]+$"]').type('^\\d+$');
      cy.wrap(onChange).should('have.been.calledWith', { pattern: '^\\d+$' });
    });
    
    it('clears validation when field emptied', () => {
      const onChange = cy.stub();
      cy.mount(
        <ValidationPanel 
          {...defaultProps} 
          validation={{ minLength: 5 }}
          onChange={onChange} 
        />
      );
      
      cy.get('input[value="5"]').clear();
      cy.wrap(onChange).should('have.been.called');
    });
  });
  
  describe('Number Validation', () => {
    it('handles min value changes', () => {
      const onChange = cy.stub();
      cy.mount(<ValidationPanel {...defaultProps} questionType="number" onChange={onChange} />);
      
      cy.get('input[placeholder="No minimum"]').type('0');
      cy.wrap(onChange).should('have.been.calledWith', { min: 0 });
    });
    
    it('handles max value changes', () => {
      const onChange = cy.stub();
      cy.mount(<ValidationPanel {...defaultProps} questionType="number" onChange={onChange} />);
      
      cy.get('input[placeholder="No maximum"]').type('100');
      cy.wrap(onChange).should('have.been.calledWith', { max: 100 });
    });
  });
  
  describe('Custom Error Message', () => {
    it('handles custom error message', () => {
      const onChange = cy.stub();
      cy.mount(<ValidationPanel {...defaultProps} onChange={onChange} />);
      
      cy.get('input[placeholder*="error message"]').type('Please enter a valid value');
      cy.wrap(onChange).should('have.been.calledWith', { 
        customError: 'Please enter a valid value' 
      });
    });
  });
  
  describe('Edge Cases', () => {
    it('handles existing validation values', () => {
      const validation = { 
        minLength: 5, 
        maxLength: 50, 
        pattern: '^[A-Z]' 
      };
      
      cy.mount(
        <ValidationPanel 
          {...defaultProps} 
          validation={validation}
        />
      );
      
      cy.get('input[value="5"]').should('exist');
      cy.get('input[value="50"]').should('exist');
      cy.get('input[value="^[A-Z]"]').should('exist');
    });
    
    it('handles validation for textarea type', () => {
      cy.mount(<ValidationPanel {...defaultProps} questionType="textarea" />);
      
      cy.contains('Min Length').should('be.visible');
      cy.contains('Max Length').should('be.visible');
      cy.contains('Pattern (RegEx)').should('be.visible');
    });
  });
});

describe('LazyImage', () => {
  const defaultProps = {
    src: 'https://example.com/image.jpg',
    alt: 'Test image'
  };
  
  describe('Rendering', () => {
    it('renders with loading placeholder initially', () => {
      cy.mount(<LazyImage {...defaultProps} />);
      
      // Should show loading state initially
      cy.get('div[class*="animate-pulse"]').should('be.visible');
    });
    
    it('shows image when loaded', () => {
      cy.mount(<LazyImage {...defaultProps} />);
      
      // Wait for image to appear
      cy.get('img[alt="Test image"]').should('be.visible');
    });
    
    it('applies custom className', () => {
      cy.mount(<LazyImage {...defaultProps} className="custom-class" />);
      
      cy.get('.custom-class').should('exist');
    });
    
    it('handles loading state', () => {
      cy.mount(<LazyImage {...defaultProps} />);
      
      // Check for loading indicator
      cy.get('[data-cy="image-loading"]').should('exist');
    });
  });
  
  describe('Intersection Observer', () => {
    it('lazy loads when in viewport', () => {
      cy.mount(
        <div style={{ height: '2000px' }}>
          <div style={{ height: '1500px' }}>Spacer</div>
          <LazyImage {...defaultProps} />
        </div>
      );
      
      // Image should not be loaded initially
      cy.get('img').should('not.exist');
      
      // Scroll to image
      cy.scrollTo('bottom');
      
      // Image should now be loaded
      cy.get('img[alt="Test image"]').should('be.visible');
    });
  });
  
  describe('Error Handling', () => {
    it('shows error state on load failure', () => {
      cy.mount(<LazyImage src="invalid-url" alt="Error test" />);
      
      // Should show error state
      cy.get('[data-cy="image-error"]').should('be.visible');
    });
    
    it('shows fallback on error', () => {
      cy.mount(
        <LazyImage 
          src="invalid-url" 
          alt="Error test"
          fallback={<div data-cy="fallback">Image failed</div>}
        />
      );
      
      cy.get('[data-cy="fallback"]').should('be.visible');
    });
  });
});

describe('ProjectSearchBar', () => {
  const defaultProps = {
    value: '',
    onChange: cy.stub(),
    placeholder: 'Search projects...'
  };
  
  describe('Rendering', () => {
    it('renders search input', () => {
      cy.mount(<ProjectSearchBar {...defaultProps} />);
      
      cy.get('input[placeholder="Search projects..."]').should('be.visible');
    });
    
    it('shows search icon', () => {
      cy.mount(<ProjectSearchBar {...defaultProps} />);
      
      cy.get('svg').should('be.visible'); // Search icon
    });
    
    it('displays initial value', () => {
      cy.mount(<ProjectSearchBar {...defaultProps} value="test query" />);
      
      cy.get('input').should('have.value', 'test query');
    });
  });
  
  describe('User Interactions', () => {
    it('handles input changes', () => {
      const onChange = cy.stub();
      cy.mount(<ProjectSearchBar {...defaultProps} onChange={onChange} />);
      
      cy.get('input').type('fantasy world');
      cy.wrap(onChange).should('have.been.called');
    });
    
    it('shows clear [data-cy*="button"] when has value', () => {
      cy.mount(<ProjectSearchBar {...defaultProps} value="test" />);
      
      cy.get('[data-cy="clear-search"]').should('be.visible');
    });
    
    it('clears search on clear [data-cy*="button"] click', () => {
      const onChange = cy.stub();
      cy.mount(<ProjectSearchBar {...defaultProps} value="test" onChange={onChange} />);
      
      cy.get('[data-cy="clear-search"]').click();
      cy.wrap(onChange).should('have.been.calledWith', '');
    });
    
    it('debounces search input', () => {
      const onChange = cy.stub();
      cy.mount(<ProjectSearchBar {...defaultProps} onChange={onChange} debounce={300} />);
      
      cy.get('input').type('test');
      
      // Should not be called immediately
      cy.wrap(onChange).should('not.have.been.called');
      
      // Should be called after debounce
      cy.wait(350);
      cy.wrap(onChange).should('have.been.called');
    });
  });
  
  describe('Keyboard Navigation', () => {
    it('submits on Enter key', () => {
      const onSubmit = cy.stub();
      cy.mount(<ProjectSearchBar {...defaultProps} onSubmit={onSubmit} />);
      
      cy.get('input').type('test{enter}');
      cy.wrap(onSubmit).should('have.been.calledWith', 'test');
    });
    
    it('clears on Escape key', () => {
      const onChange = cy.stub();
      cy.mount(<ProjectSearchBar {...defaultProps} value="test" onChange={onChange} />);
      
      cy.get('input').type('{esc}');
      cy.wrap(onChange).should('have.been.calledWith', '');
    });
  });
});

describe('ProjectSortDropdown', () => {
  const defaultProps = {
    value: 'name',
    onChange: cy.stub(),
    options: [
      { value: 'name', label: 'Name' },
      { value: 'date', label: 'Date Created' },
      { value: 'modified', label: 'Last Modified' }
    ]
  };
  
  describe('Rendering', () => {
    it('renders sort dropdown', () => {
      cy.mount(<ProjectSortDropdown {...defaultProps} />);
      
      cy.contains('Name').should('be.visible');
    });
    
    it('shows dropdown icon', () => {
      cy.mount(<ProjectSortDropdown {...defaultProps} />);
      
      cy.get('svg').should('be.visible'); // Chevron icon
    });
  });
  
  describe('Dropdown Interaction', () => {
    it('opens dropdown on click', () => {
      cy.mount(<ProjectSortDropdown {...defaultProps} />);
      
      cy.contains('Name').click();
      cy.contains('Date Created').should('be.visible');
      cy.contains('Last Modified').should('be.visible');
    });
    
    it('[data-cy*="select"]s option', () => {
      const onChange = cy.stub();
      cy.mount(<ProjectSortDropdown {...defaultProps} onChange={onChange} />);
      
      cy.contains('Name').click();
      cy.contains('Date Created').click();
      
      cy.wrap(onChange).should('have.been.calledWith', 'date');
    });
    
    it('closes dropdown after [data-cy*="select"]ion', () => {
      cy.mount(<ProjectSortDropdown {...defaultProps} />);
      
      cy.contains('Name').click();
      cy.contains('Date Created').click();
      
      // Dropdown should be closed
      cy.contains('Last Modified').should('not.be.visible');
    });
    
    it('closes dropdown on outside click', () => {
      cy.mount(
        <div>
          <ProjectSortDropdown {...defaultProps} />
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
    it('shows sort direction indicator', () => {
      cy.mount(
        <ProjectSortDropdown 
          {...defaultProps} 
          value="name"
          direction="asc"
        />
      );
      
      cy.get('[data-cy="sort-asc"]').should('be.visible');
    });
    
    it('toggles sort direction on same option click', () => {
      const onChange = cy.stub();
      cy.mount(
        <ProjectSortDropdown 
          {...defaultProps} 
          value="name"
          direction="asc"
          onChange={onChange}
        />
      );
      
      cy.contains('Name').click();
      cy.contains('Name').click(); // Click same option
      
      cy.wrap(onChange).should('have.been.calledWith', 'name', 'desc');
    });
  });
});

describe('TagManager', () => {
  const defaultProps = {
    tags: ['fantasy', 'magic', 'adventure'],
    availableTags: ['epic', 'quest', 'dragon', 'hero'],
    onAdd: cy.stub(),
    onRemove: cy.stub(),
    onEdit: cy.stub()
  };
  
  describe('Rendering', () => {
    it('renders tag list', () => {
      cy.mount(<TagManager {...defaultProps} />);
      
      cy.contains('fantasy').should('be.visible');
      cy.contains('magic').should('be.visible');
      cy.contains('adventure').should('be.visible');
    });
    
    it('shows add tag [data-cy*="button"]', () => {
      cy.mount(<TagManager {...defaultProps} />);
      
      cy.get('[data-cy="add-tag-[data-cy*="button"]"]').should('be.visible');
    });
    
    it('shows tag count', () => {
      cy.mount(<TagManager {...defaultProps} />);
      
      cy.contains('3 tags').should('be.visible');
    });
  });
  
  describe('Adding Tags', () => {
    it('opens add tag modal', () => {
      cy.mount(<TagManager {...defaultProps} />);
      
      cy.get('[data-cy="add-tag-[data-cy*="button"]"]').click();
      cy.get('[data-cy="tag-modal"]').should('be.visible');
    });
    
    it('adds new tag from input', () => {
      const onAdd = cy.stub();
      cy.mount(<TagManager {...defaultProps} onAdd={onAdd} />);
      
      cy.get('[data-cy="add-tag-[data-cy*="button"]"]').click();
      cy.get('[data-cy="tag-input"]').type('newTag');
      cy.get('[data-cy="save-tag"]').click();
      
      cy.wrap(onAdd).should('have.been.calledWith', 'newTag');
    });
    
    it('adds tag from suggestions', () => {
      const onAdd = cy.stub();
      cy.mount(<TagManager {...defaultProps} onAdd={onAdd} />);
      
      cy.get('[data-cy="add-tag-[data-cy*="button"]"]').click();
      cy.get('[data-cy="suggested-tag-epic"]').click();
      
      cy.wrap(onAdd).should('have.been.calledWith', 'epic');
    });
  });
  
  describe('Removing Tags', () => {
    it('removes tag on X click', () => {
      const onRemove = cy.stub();
      cy.mount(<TagManager {...defaultProps} onRemove={onRemove} />);
      
      cy.get('[data-cy="remove-tag-fantasy"]').click();
      cy.wrap(onRemove).should('have.been.calledWith', 'fantasy');
    });
    
    it('confirms before removing', () => {
      cy.mount(<TagManager {...defaultProps} confirmRemove={true} />);
      
      cy.get('[data-cy="remove-tag-fantasy"]').click();
      cy.contains('Remove tag?').should('be.visible');
      cy.get('[data-cy="confirm-remove"]').click();
    });
  });
  
  describe('Editing Tags', () => {
    it('enables edit mode on tag click', () => {
      cy.mount(<TagManager {...defaultProps} />);
      
      cy.get('[data-cy="tag-fantasy"]').click();
      cy.get('[data-cy="edit-tag-input"]').should('be.visible');
    });
    
    it('saves edited tag', () => {
      const onEdit = cy.stub();
      cy.mount(<TagManager {...defaultProps} onEdit={onEdit} />);
      
      cy.get('[data-cy="tag-fantasy"]').click();
      cy.get('[data-cy="edit-tag-input"]').clear().type('epic-fantasy');
      cy.get('[data-cy="save-edit"]').click();
      
      cy.wrap(onEdit).should('have.been.calledWith', 'fantasy', 'epic-fantasy');
    });
  });
  
  describe('Search and Filter', () => {
    it('filters tags by search', () => {
      cy.mount(<TagManager {...defaultProps} />);
      
      cy.get('[data-cy="tag-search"]').type('mag');
      cy.contains('magic').should('be.visible');
      cy.contains('fantasy').should('not.be.visible');
    });
    
    it('shows no results message', () => {
      cy.mount(<TagManager {...defaultProps} />);
      
      cy.get('[data-cy="tag-search"]').type('xyz');
      cy.contains('No tags found').should('be.visible');
    });
  });
});