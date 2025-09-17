import { TagInput } from '../../src/components/ui/TagInput';

describe('TagInput Component', () => {
  const defaultTags = ['fantasy', 'magic', 'adventure'];
  let onChange: any;

  beforeEach(() => {
    onChange = cy.stub();
  });

  it('should render with initial tags', () => {
    cy.mount(<TagInput tags={defaultTags} onChange={onChange} />);
    
    cy.get('[data-cy="tag-input"]').should('exist');
    cy.get('[data-cy="tag"]').should('have.length', 3);
    cy.get('[data-cy="tag"]').eq(0).should('contain', 'fantasy');
    cy.get('[data-cy="tag"]').eq(1).should('contain', 'magic');
    cy.get('[data-cy="tag"]').eq(2).should('contain', 'adventure');
  });

  it('should add a tag on Enter key', () => {
    cy.mount(<TagInput tags={defaultTags} onChange={onChange} />);
    
    cy.get('[data-cy="tag-input-field"]').type('dragon{enter}');
    
    cy.wrap(onChange).should('have.been.calledWith', 
      ['fantasy', 'magic', 'adventure', 'dragon']
    );
  });

  it('should add a tag on comma key', () => {
    cy.mount(<TagInput tags={defaultTags} onChange={onChange} />);
    
    cy.get('[data-cy="tag-input-field"]').type('dragon,');
    
    cy.wrap(onChange).should('have.been.calledWith', 
      ['fantasy', 'magic', 'adventure', 'dragon']
    );
  });

  it('should add a tag on blur', () => {
    cy.mount(<TagInput tags={defaultTags} onChange={onChange} />);
    
    cy.get('[data-cy="tag-input-field"]').type('dragon');
    cy.get('[data-cy="tag-input-field"]').blur();
    
    cy.wrap(onChange).should('have.been.calledWith', 
      ['fantasy', 'magic', 'adventure', 'dragon']
    );
  });

  it('should not add empty tags', () => {
    cy.mount(<TagInput tags={defaultTags} onChange={onChange} />);
    
    cy.get('[data-cy="tag-input-field"]').type('{enter}');
    cy.wrap(onChange).should('not.have.been.called');
    
    cy.get('[data-cy="tag-input-field"]').type('   {enter}');
    cy.wrap(onChange).should('not.have.been.called');
  });

  it('should not add duplicate tags', () => {
    cy.mount(<TagInput tags={defaultTags} onChange={onChange} />);
    
    cy.get('[data-cy="tag-input-field"]').type('fantasy{enter}');
    cy.wrap(onChange).should('not.have.been.called');
    cy.get('[data-cy="tag"]').should('have.length', 3);
  });

  it('should remove a tag when clicking the remove button', () => {
    cy.mount(<TagInput tags={defaultTags} onChange={onChange} />);
    
    cy.get('[data-cy="tag-remove"]').eq(1).click(); // Remove "magic"
    
    cy.wrap(onChange).should('have.been.calledWith', 
      ['fantasy', 'adventure']
    );
  });

  it('should remove the last tag on backspace when input is empty', () => {
    cy.mount(<TagInput tags={defaultTags} onChange={onChange} />);
    
    cy.get('[data-cy="tag-input-field"]').type('{backspace}');
    
    cy.wrap(onChange).should('have.been.calledWith', 
      ['fantasy', 'magic']
    );
  });

  it('should show placeholder when no tags', () => {
    cy.mount(<TagInput tags={[]} onChange={onChange} placeholder="Add tags..." />);
    
    cy.get('[data-cy="tag-input-field"]').should('have.attr', 'placeholder', 'Add tags...');
  });

  it('should limit tags to maxTags', () => {
    cy.mount(<TagInput tags={defaultTags} onChange={onChange} maxTags={3} />);
    
    cy.get('[data-cy="tag-input-field"]').should('be.disabled');
    cy.get('[data-cy="tag-input-field"]').should('have.attr', 'placeholder', 'Maximum tags reached');
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
    
    cy.get('[data-cy="tag-input-field"]').type('hi{enter}');
    cy.get('[data-cy="tag-input-error"]').should('contain', 'Tag must be at least 3 characters');
    cy.wrap(onChange).should('not.have.been.called');
    
    cy.get('[data-cy="tag-input-field"]').clear().type('hello{enter}');
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
    
    cy.get('[data-cy="tag-input-field"]').type('d');
    cy.get('[data-cy="tag-suggestions"]').should('exist');
    cy.get('[data-cy="tag-suggestion"]').should('have.length', 2); // dragon, dwarf
    
    cy.get('[data-cy="tag-suggestion"]').first().click();
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
    
    cy.get('[data-cy="tag-input-field"]').type('d');
    cy.get('[data-cy="tag-suggestion"]').should('have.length', 2);
    
    // Navigate down
    cy.get('[data-cy="tag-input-field"]').type('{downArrow}');
    cy.get('[data-cy="tag-suggestion"]').first().should('have.class', 'highlighted');
    
    // Navigate down again
    cy.get('[data-cy="tag-input-field"]').type('{downArrow}');
    cy.get('[data-cy="tag-suggestion"]').last().should('have.class', 'highlighted');
    
    // Select with Enter
    cy.get('[data-cy="tag-input-field"]').type('{enter}');
    cy.wrap(onChange).should('have.been.calledWith', ['dwarf']);
  });

  it('should be disabled when disabled prop is true', () => {
    cy.mount(<TagInput tags={defaultTags} onChange={onChange} disabled />);
    
    cy.get('[data-cy="tag-input-field"]').should('be.disabled');
    cy.get('[data-cy="tag-remove"]').should('not.exist');
  });

  it('should apply custom className', () => {
    cy.mount(<TagInput tags={defaultTags} onChange={onChange} className="custom-class" />);
    
    cy.get('[data-cy="tag-input"]').should('have.class', 'custom-class');
  });

  it('should handle tag click event', () => {
    const onTagClick = cy.stub();
    cy.mount(<TagInput tags={defaultTags} onChange={onChange} onTagClick={onTagClick} />);
    
    cy.get('[data-cy="tag"]').first().click();
    cy.wrap(onTagClick).should('have.been.calledWith', 'fantasy');
  });

  it('should be accessible', () => {
    cy.mount(<TagInput tags={defaultTags} onChange={onChange} label="Story Tags" />);
    
    cy.get('label').should('contain', 'Story Tags');
    cy.get('[data-cy="tag-input-field"]').should('have.attr', 'aria-label', 'Add tag');
    cy.get('[data-cy="tag-remove"]').first().should('have.attr', 'aria-label', 'Remove tag: fantasy');
  });
});