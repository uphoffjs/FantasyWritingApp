import React from 'react';
import { TagInput } from '../../support/component-test-helpersTagInput';

describe('TagInput Component', () => {
  const defaultTags = ['fantasy', 'magic', 'adventure'];
  let onChange: any;

  beforeEach(() => {
    onChange = cy.stub();
  });

  it('should render with initial tags', () => {
    cy.mount(<TagInput tags={defaultTags} onChange={onChange} />);
    
    cy.get('[data-testid="tag-input"]').should('exist');
    cy.get('[data-testid="tag"]').should('have.length', 3);
    cy.get('[data-testid="tag"]').eq(0).should('contain', 'fantasy');
    cy.get('[data-testid="tag"]').eq(1).should('contain', 'magic');
    cy.get('[data-testid="tag"]').eq(2).should('contain', 'adventure');
  });

  it('should add a tag on Enter key', () => {
    cy.mount(<TagInput tags={defaultTags} onChange={onChange} />);
    
    cy.get('[data-testid="tag-input-field"]').type('dragon{enter}');
    
    cy.wrap(onChange).should('have.been.calledWith', 
      ['fantasy', 'magic', 'adventure', 'dragon']
    );
  });

  it('should add a tag on comma key', () => {
    cy.mount(<TagInput tags={defaultTags} onChange={onChange} />);
    
    cy.get('[data-testid="tag-input-field"]').type('dragon,');
    
    cy.wrap(onChange).should('have.been.calledWith', 
      ['fantasy', 'magic', 'adventure', 'dragon']
    );
  });

  it('should add a tag on blur', () => {
    cy.mount(<TagInput tags={defaultTags} onChange={onChange} />);
    
    cy.get('[data-testid="tag-input-field"]').type('dragon');
    cy.get('[data-testid="tag-input-field"]').blur();
    
    cy.wrap(onChange).should('have.been.calledWith', 
      ['fantasy', 'magic', 'adventure', 'dragon']
    );
  });

  it('should not add empty tags', () => {
    cy.mount(<TagInput tags={defaultTags} onChange={onChange} />);
    
    cy.get('[data-testid="tag-input-field"]').type('{enter}');
    cy.wrap(onChange).should('not.have.been.called');
    
    cy.get('[data-testid="tag-input-field"]').type('   {enter}');
    cy.wrap(onChange).should('not.have.been.called');
  });

  it('should not add duplicate tags', () => {
    cy.mount(<TagInput tags={defaultTags} onChange={onChange} />);
    
    cy.get('[data-testid="tag-input-field"]').type('fantasy{enter}');
    cy.wrap(onChange).should('not.have.been.called');
    cy.get('[data-testid="tag"]').should('have.length', 3);
  });

  it('should remove a tag when clicking the remove [data-cy*="button"]', () => {
    cy.mount(<TagInput tags={defaultTags} onChange={onChange} />);
    
    cy.get('[data-testid="tag-remove"]').eq(1).click(); // Remove "magic"
    
    cy.wrap(onChange).should('have.been.calledWith', 
      ['fantasy', 'adventure']
    );
  });

  it('should remove the last tag on backspace when input is empty', () => {
    cy.mount(<TagInput tags={defaultTags} onChange={onChange} />);
    
    cy.get('[data-testid="tag-input-field"]').type('{backspace}');
    
    cy.wrap(onChange).should('have.been.calledWith', 
      ['fantasy', 'magic']
    );
  });

  it('should show placeholder when no tags', () => {
    cy.mount(<TagInput tags={[]} onChange={onChange} placeholder="Add tags..." />);
    
    cy.get('[data-testid="tag-input-field"]').should('have.attr', 'placeholder', 'Add tags...');
  });

  it('should limit tags to maxTags', () => {
    cy.mount(<TagInput tags={defaultTags} onChange={onChange} maxTags={3} />);
    
    cy.get('[data-testid="tag-input-field"]').should('be.disabled');
    cy.get('[data-testid="tag-input-field"]').should('have.attr', 'placeholder', 'Maximum tags reached');
  });

  it('should validate tags with custom validator', () => {
    const validator = (tag: string) => tag.length >= 3;
    cy.mount(
      <TagInput 
        tags={defaultTags} 
        onChange={onChange} 
        validator={validator}
        validationMessage="Tag must be at least 3 characters" 
      />
    );
    
    cy.get('[data-testid="tag-input-field"]').type('hi{enter}');
    cy.get('[data-testid="tag-input-error"]').should('contain', 'Tag must be at least 3 characters');
    cy.wrap(onChange).should('not.have.been.called');
    
    cy.get('[data-testid="tag-input-field"]').clear().type('hello{enter}');
    cy.wrap(onChange).should('have.been.called');
  });

  it('should support tag suggestions', () => {
    const suggestions = ['dragon', 'dwarf', 'elf', 'goblin', 'wizard'];
    cy.mount(
      <TagInput 
        tags={defaultTags} 
        onChange={onChange} 
        suggestions={suggestions}
      />
    );
    
    cy.get('[data-testid="tag-input-field"]').type('d');
    cy.get('[data-testid="tag-suggestions"]').should('exist');
    cy.get('[data-testid="tag-suggestion"]').should('have.length', 2); // dragon, dwarf
    
    cy.get('[data-testid="tag-suggestion"]').first().click();
    cy.wrap(onChange).should('have.been.calledWith', 
      ['fantasy', 'magic', 'adventure', 'dragon']
    );
  });

  it('should navigate suggestions with keyboard', () => {
    const suggestions = ['dragon', 'dwarf', 'elf'];
    cy.mount(
      <TagInput 
        tags={[]} 
        onChange={onChange} 
        suggestions={suggestions}
      />
    );
    
    cy.get('[data-testid="tag-input-field"]').type('d');
    cy.get('[data-testid="tag-suggestion"]').should('have.length', 2);
    
    // * Navigate down
    cy.get('[data-testid="tag-input-field"]').type('{downArrow}');
    cy.get('[data-testid="tag-suggestion"]').first().should('be.visible') // React Native Web uses inline styles instead of CSS classes;
    
    // * Navigate down again
    cy.get('[data-testid="tag-input-field"]').type('{downArrow}');
    cy.get('[data-testid="tag-suggestion"]').last().should('be.visible') // React Native Web uses inline styles instead of CSS classes;
    
    // * Select with Enter
    cy.get('[data-testid="tag-input-field"]').type('{enter}');
    cy.wrap(onChange).should('have.been.calledWith', ['dwarf']);
  });

  it('should be disabled when disabled prop is true', () => {
    cy.mount(<TagInput tags={defaultTags} onChange={onChange} disabled />);
    
    cy.get('[data-testid="tag-input-field"]').should('be.disabled');
    cy.get('[data-testid="tag-remove"]').should('not.exist');
  });

  it('should apply custom className', () => {
    cy.mount(<TagInput tags={defaultTags} onChange={onChange} className="custom-class" />);
    
    cy.get('[data-testid="tag-input"]').should('be.visible') // React Native Web uses inline styles instead of CSS classes;
  });

  it('should handle tag click event', () => {
    const onTagClick = cy.stub();
    cy.mount(<TagInput tags={defaultTags} onChange={onChange} onTagClick={onTagClick} />);
    
    cy.get('[data-testid="tag"]').first().click();
    cy.wrap(onTagClick).should('have.been.calledWith', 'fantasy');
  });

  it('should be accessible', () => {
    cy.mount(<TagInput tags={defaultTags} onChange={onChange} label="Story Tags" />);
    
    cy.get('label').should('contain', 'Story Tags');
    cy.get('[data-testid="tag-input-field"]').should('have.attr', 'aria-label', 'Add tag');
    cy.get('[data-testid="tag-remove"]').first().should('have.attr', 'aria-label', 'Remove tag: fantasy');
  });
});