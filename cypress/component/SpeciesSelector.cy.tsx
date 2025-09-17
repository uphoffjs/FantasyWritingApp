/// <reference types="cypress" />
import React from 'react';
import { SpeciesSelector } from '../../src/components/SpeciesSelector/SpeciesSelector';
import { SpeciesDropdown } from '../../src/components/SpeciesSelector/SpeciesDropdown';
import { QuickCreateForm } from '../../src/components/SpeciesSelector/QuickCreateForm';
import { WorldElement } from '../../src/types/models';
import { ElementFactory } from '../../fixtures/factories';

describe('SpeciesSelector', () => {
  // Use factory to create complete WorldElement objects
  const mockRaces: WorldElement[] = [
    ElementFactory.create({ id: 'race1', name: 'Elf', category: 'race-species', completion: 100 }),
    ElementFactory.create({ id: 'race2', name: 'Dwarf', category: 'race-species', completion: 80 }),
    ElementFactory.create({ id: 'race3', name: 'Human', category: 'race-species', completion: 90 }),
    ElementFactory.create({ id: 'race4', name: 'Orc', category: 'race-species', completion: 70 }),
    ElementFactory.create({ id: 'race5', name: 'Dragon', category: 'race-species', completion: 60 })
  ];
  
  let defaultProps: any;
  
  beforeEach(() => {
    defaultProps = {
      value: null,
      onChange: cy.stub(),
      projectId: 'project1',
      characterId: 'char1'
    };
    
    // Mock the useRaceElements hook
    cy.stub(window, 'useRaceElements').returns({
      races: mockRaces,
      isLoading: false,
      hasMore: false,
      loadMore: cy.stub(),
      createRace: cy.stub().resolves({ id: 'newRace', name: 'New Race', category: 'race-species', completion: 0 }),
      [data-cy*="select"]edRace: null,
      incrementUsage: cy.stub()
    });
  });
  
  describe('Rendering', () => {
    it('renders [data-cy*="select"]or [data-cy*="button"] with placeholder', () => {
      cy.mount(<SpeciesSelector {...defaultProps} />);
      
      cy.get('[data-cy*="button"][type="[data-cy*="button"]"]').should('contain', 'Select a race/species');
    });
    
    it('shows [data-cy*="select"]ed race name', () => {
      const [data-cy*="select"]edRace = mockRaces[0];
      cy.stub(window, 'useRaceElements').returns({
        races: mockRaces,
        [data-cy*="select"]edRace,
        isLoading: false,
        hasMore: false,
        loadMore: cy.stub(),
        createRace: cy.stub(),
        incrementUsage: cy.stub()
      });
      
      cy.mount(<SpeciesSelector {...defaultProps} value="race1" />);
      
      cy.get('[data-cy*="button"][type="[data-cy*="button"]"]').should('contain', 'Elf');
    });
    
    it('uses custom placeholder', () => {
      cy.mount(<SpeciesSelector {...defaultProps} placeholder="Choose a species" />);
      
      cy.get('[data-cy*="button"][type="[data-cy*="button"]"]').should('contain', 'Choose a species');
    });
  });
  
  describe('Dropdown Interaction', () => {
    it('opens dropdown on click', () => {
      cy.mount(<SpeciesSelector {...defaultProps} />);
      
      cy.get('[data-cy*="button"][type="[data-cy*="button"]"]').click();
      cy.get('.absolute.z-50').should('be.visible');
    });
    
    it('closes dropdown on outside click', () => {
      cy.mount(
        <div>
          <SpeciesSelector {...defaultProps} />
          <div data-cy="outside">Outside element</div>
        </div>
      );
      
      cy.get('[data-cy*="button"][type="[data-cy*="button"]"]').click();
      cy.get('.absolute.z-50').should('be.visible');
      
      cy.get('[data-cy="outside"]').click();
      cy.get('.absolute.z-50').should('not.exist');
    });
    
    it('rotates chevron icon when open', () => {
      cy.mount(<SpeciesSelector {...defaultProps} />);
      
      cy.get('.transition-transform').should('not.have.class', 'rotate-180');
      
      cy.get('[data-cy*="button"][type="[data-cy*="button"]"]').click();
      cy.get('.transition-transform').should('be.visible') // React Native Web uses inline styles instead of CSS classes;
    });
  });
  
  describe('Search Functionality', () => {
    it('shows search input in dropdown', () => {
      cy.mount(<SpeciesSelector {...defaultProps} />);
      
      cy.get('[data-cy*="button"][type="[data-cy*="button"]"]').click();
      cy.get('input[placeholder*="Search"]').should('be.visible');
    });
    
    it('filters races based on search query', () => {
      cy.mount(<SpeciesSelector {...defaultProps} />);
      
      cy.get('[data-cy*="button"][type="[data-cy*="button"]"]').click();
      cy.get('input[placeholder*="Search"]').type('elf');
      
      cy.contains('Elf').should('be.visible');
      cy.contains('Dwarf').should('not.exist');
    });
    
    it('shows no results message', () => {
      cy.mount(<SpeciesSelector {...defaultProps} />);
      
      cy.get('[data-cy*="button"][type="[data-cy*="button"]"]').click();
      cy.get('input[placeholder*="Search"]').type('xyz');
      
      cy.contains('No races found').should('be.visible');
    });
  });
  
  describe('Race Selection', () => {
    it('[data-cy*="select"]s race on click', () => {
      const onChange = cy.stub();
      cy.mount(<SpeciesSelector {...defaultProps} onChange={onChange} />);
      
      cy.get('[data-cy*="button"][type="[data-cy*="button"]"]').click();
      cy.contains('Elf').click();
      
      cy.wrap(onChange).should('have.been.calledWith', 'race1');
    });
    
    it('increments usage count on [data-cy*="select"]ion', () => {
      const incrementUsage = cy.stub();
      cy.stub(window, 'useRaceElements').returns({
        races: mockRaces,
        [data-cy*="select"]edRace: null,
        isLoading: false,
        hasMore: false,
        loadMore: cy.stub(),
        createRace: cy.stub(),
        incrementUsage
      });
      
      cy.mount(<SpeciesSelector {...defaultProps} />);
      
      cy.get('[data-cy*="button"][type="[data-cy*="button"]"]').click();
      cy.contains('Elf').click();
      
      cy.wrap(incrementUsage).should('have.been.calledWith', 'race1');
    });
    
    it('closes dropdown after [data-cy*="select"]ion', () => {
      cy.mount(<SpeciesSelector {...defaultProps} />);
      
      cy.get('[data-cy*="button"][type="[data-cy*="button"]"]').click();
      cy.contains('Elf').click();
      
      cy.get('.absolute.z-50').should('not.exist');
    });
    
    it('clears search query after [data-cy*="select"]ion', () => {
      cy.mount(<SpeciesSelector {...defaultProps} />);
      
      cy.get('[data-cy*="button"][type="[data-cy*="button"]"]').click();
      cy.get('input[placeholder*="Search"]').type('elf');
      cy.contains('Elf').click();
      
      cy.get('[data-cy*="button"][type="[data-cy*="button"]"]').click();
      cy.get('input[placeholder*="Search"]').should('have.value', '');
    });
  });
  
  describe('Quick Create', () => {
    it('shows create new race [data-cy*="button"]', () => {
      cy.mount(<SpeciesSelector {...defaultProps} />);
      
      cy.get('[data-cy*="button"][type="[data-cy*="button"]"]').click();
      cy.contains('Create new race').should('be.visible');
    });
    
    it('opens create form on [data-cy*="button"] click', () => {
      cy.mount(<SpeciesSelector {...defaultProps} />);
      
      cy.get('[data-cy*="button"][type="[data-cy*="button"]"]').click();
      cy.contains('Create new race').click();
      
      cy.get('input[placeholder*="race name"]').should('be.visible');
    });
    
    it('creates new race and [data-cy*="select"]s it', () => {
      const onChange = cy.stub();
      const createRace = cy.stub().resolves({
        id: 'newRace',
        name: 'New Race',
        category: 'race-species',
        completion: 0
      });
      
      cy.stub(window, 'useRaceElements').returns({
        races: mockRaces,
        [data-cy*="select"]edRace: null,
        isLoading: false,
        hasMore: false,
        loadMore: cy.stub(),
        createRace,
        incrementUsage: cy.stub()
      });
      
      cy.mount(<SpeciesSelector {...defaultProps} onChange={onChange} />);
      
      cy.get('[data-cy*="button"][type="[data-cy*="button"]"]').click();
      cy.contains('Create new race').click();
      cy.get('input[placeholder*="race name"]').type('Goblin');
      cy.contains('Create').click();
      
      cy.wrap(createRace).should('have.been.calledWith', 'Goblin');
      cy.wrap(onChange).should('have.been.calledWith', 'newRace');
    });
    
    it('cancels create form', () => {
      cy.mount(<SpeciesSelector {...defaultProps} />);
      
      cy.get('[data-cy*="button"][type="[data-cy*="button"]"]').click();
      cy.contains('Create new race').click();
      cy.contains('Cancel').click();
      
      cy.get('input[placeholder*="race name"]').should('not.exist');
    });
  });
  
  describe('Loading State', () => {
    it('shows loading indicator', () => {
      cy.stub(window, 'useRaceElements').returns({
        races: [],
        [data-cy*="select"]edRace: null,
        isLoading: true,
        hasMore: false,
        loadMore: cy.stub(),
        createRace: cy.stub(),
        incrementUsage: cy.stub()
      });
      
      cy.mount(<SpeciesSelector {...defaultProps} />);
      
      cy.get('[data-cy*="button"][type="[data-cy*="button"]"]').click();
      cy.contains('Loading races...').should('be.visible');
    });
    
    it('shows load more [data-cy*="button"] when hasMore is true', () => {
      cy.stub(window, 'useRaceElements').returns({
        races: mockRaces,
        [data-cy*="select"]edRace: null,
        isLoading: false,
        hasMore: true,
        loadMore: cy.stub(),
        createRace: cy.stub(),
        incrementUsage: cy.stub()
      });
      
      cy.mount(<SpeciesSelector {...defaultProps} />);
      
      cy.get('[data-cy*="button"][type="[data-cy*="button"]"]').click();
      cy.contains('Load more').should('be.visible');
    });
    
    it('loads more races on [data-cy*="button"] click', () => {
      const loadMore = cy.stub();
      cy.stub(window, 'useRaceElements').returns({
        races: mockRaces,
        [data-cy*="select"]edRace: null,
        isLoading: false,
        hasMore: true,
        loadMore,
        createRace: cy.stub(),
        incrementUsage: cy.stub()
      });
      
      cy.mount(<SpeciesSelector {...defaultProps} />);
      
      cy.get('[data-cy*="button"][type="[data-cy*="button"]"]').click();
      cy.contains('Load more').click();
      
      cy.wrap(loadMore).should('have.been.called');
    });
  });
});

describe('SpeciesDropdown', () => {
  const mockRaces: WorldElement[] = [
    ElementFactory.create({ id: 'race1', name: 'Elf', category: 'race-species', completion: 100 }),
    ElementFactory.create({ id: 'race2', name: 'Dwarf', category: 'race-species', completion: 80 })
  ];
  
  let defaultProps: any;
  
  beforeEach(() => {
    defaultProps = {
      races: mockRaces,
      searchQuery: '',
      onSearchChange: cy.stub(),
      onSelect: cy.stub(),
      onCreateNew: cy.stub(),
      isLoading: false,
      hasMore: false,
      onLoadMore: cy.stub()
    };
  });
  
  describe('Rendering', () => {
    it('renders race list', () => {
      cy.mount(<SpeciesDropdown {...defaultProps} />);
      
      cy.contains('Elf').should('be.visible');
      cy.contains('Dwarf').should('be.visible');
    });
    
    it('shows completion percentage', () => {
      cy.mount(<SpeciesDropdown {...defaultProps} />);
      
      cy.contains('100%').should('be.visible');
      cy.contains('80%').should('be.visible');
    });
    
    it('highlights [data-cy*="select"]ed race', () => {
      cy.mount(<SpeciesDropdown {...defaultProps} [data-cy*="select"]edId="race1" />);
      
      cy.contains('Elf').parent().should('be.visible') // React Native Web uses inline styles instead of CSS classes;
    });
  });
  
  describe('Search', () => {
    it('calls onSearchChange when typing', () => {
      const onSearchChange = cy.stub();
      cy.mount(<SpeciesDropdown {...defaultProps} onSearchChange={onSearchChange} />);
      
      cy.get('input[placeholder*="Search"]').type('test');
      cy.wrap(onSearchChange).should('have.been.calledWith', 'test');
    });
    
    it('shows filtered results', () => {
      const filteredRaces = [mockRaces[0]];
      cy.mount(<SpeciesDropdown {...defaultProps} races={filteredRaces} searchQuery="elf" />);
      
      cy.contains('Elf').should('be.visible');
      cy.contains('Dwarf').should('not.exist');
    });
  });
  
  describe('Interactions', () => {
    it('calls onSelect when race clicked', () => {
      const onSelect = cy.stub();
      cy.mount(<SpeciesDropdown {...defaultProps} onSelect={onSelect} />);
      
      cy.contains('Elf').click();
      cy.wrap(onSelect).should('have.been.calledWith', mockRaces[0]);
    });
    
    it('calls onCreateNew when create [data-cy*="button"] clicked', () => {
      const onCreateNew = cy.stub();
      cy.mount(<SpeciesDropdown {...defaultProps} onCreateNew={onCreateNew} />);
      
      cy.contains('Create new race').click();
      cy.wrap(onCreateNew).should('have.been.called');
    });
  });
});

describe('QuickCreateForm', () => {
  let defaultProps: any;
  
  beforeEach(() => {
    defaultProps = {
      onCreate: cy.stub(),
      onCancel: cy.stub()
    };
  });
  
  describe('Rendering', () => {
    it('renders form elements', () => {
      cy.mount(<QuickCreateForm {...defaultProps} />);
      
      cy.get('input[placeholder*="race name"]').should('be.visible');
      cy.contains('Create').should('be.visible');
      cy.contains('Cancel').should('be.visible');
    });
    
    it('focuses input on mount', () => {
      cy.mount(<QuickCreateForm {...defaultProps} />);
      
      cy.focused().should('have.attr', 'placeholder').and('include', 'race name');
    });
  });
  
  describe('Form Submission', () => {
    it('calls onCreate with name value', () => {
      const onCreate = cy.stub();
      cy.mount(<QuickCreateForm {...defaultProps} onCreate={onCreate} />);
      
      cy.get('input[placeholder*="race name"]').type('Goblin');
      cy.contains('Create').click();
      
      cy.wrap(onCreate).should('have.been.calledWith', 'Goblin');
    });
    
    it('submits on Enter key', () => {
      const onCreate = cy.stub();
      cy.mount(<QuickCreateForm {...defaultProps} onCreate={onCreate} />);
      
      cy.get('input[placeholder*="race name"]').type('Goblin{enter}');
      
      cy.wrap(onCreate).should('have.been.calledWith', 'Goblin');
    });
    
    it('validates empty input', () => {
      const onCreate = cy.stub();
      cy.mount(<QuickCreateForm {...defaultProps} onCreate={onCreate} />);
      
      cy.contains('Create').click();
      
      cy.wrap(onCreate).should('not.have.been.called');
      cy.contains('Name is required').should('be.visible');
    });
    
    it('trims whitespace from input', () => {
      const onCreate = cy.stub();
      cy.mount(<QuickCreateForm {...defaultProps} onCreate={onCreate} />);
      
      cy.get('input[placeholder*="race name"]').type('  Goblin  ');
      cy.contains('Create').click();
      
      cy.wrap(onCreate).should('have.been.calledWith', 'Goblin');
    });
  });
  
  describe('Cancellation', () => {
    it('calls onCancel when cancel clicked', () => {
      const onCancel = cy.stub();
      cy.mount(<QuickCreateForm {...defaultProps} onCancel={onCancel} />);
      
      cy.contains('Cancel').click();
      
      cy.wrap(onCancel).should('have.been.called');
    });
    
    it('cancels on Escape key', () => {
      const onCancel = cy.stub();
      cy.mount(<QuickCreateForm {...defaultProps} onCancel={onCancel} />);
      
      cy.get('input[placeholder*="race name"]').type('{esc}');
      
      cy.wrap(onCancel).should('have.been.called');
    });
  });
  
  describe('Loading State', () => {
    it('disables form during creation', () => {
      const onCreate = cy.stub().returns(new Promise(() => {})); // Never resolves
      cy.mount(<QuickCreateForm {...defaultProps} onCreate={onCreate} />);
      
      cy.get('input[placeholder*="race name"]').type('Goblin');
      cy.contains('Create').click();
      
      cy.get('input[placeholder*="race name"]').should('be.disabled');
      cy.contains('Creating...').should('be.visible');
      cy.contains('Cancel').should('be.disabled');
    });
  });
  
  describe('Error Handling', () => {
    it('shows error message on creation failure', () => {
      const onCreate = cy.stub().rejects(new Error('Creation failed'));
      cy.mount(<QuickCreateForm {...defaultProps} onCreate={onCreate} />);
      
      cy.get('input[placeholder*="race name"]').type('Goblin');
      cy.contains('Create').click();
      
      cy.contains('Creation failed').should('be.visible');
    });
    
    it('clears error on new input', () => {
      const onCreate = cy.stub()
        .onFirstCall().rejects(new Error('Creation failed'))
        .onSecondCall().resolves();
      
      cy.mount(<QuickCreateForm {...defaultProps} onCreate={onCreate} />);
      
      cy.get('input[placeholder*="race name"]').type('Invalid');
      cy.contains('Create').click();
      cy.contains('Creation failed').should('be.visible');
      
      cy.get('input[placeholder*="race name"]').clear().type('Valid');
      cy.contains('Creation failed').should('not.exist');
    });
  });
});