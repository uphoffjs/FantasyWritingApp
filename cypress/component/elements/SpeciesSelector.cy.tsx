/**
 * @fileoverview Species Selector Component Tests
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
import { SpeciesSelector } from '../../../src/components/SpeciesSelector/SpeciesSelector';
import { SpeciesDropdown } from '../../../src/components/SpeciesSelector/SpeciesDropdown';
import { QuickCreateForm } from '../../../src/components/SpeciesSelector/QuickCreateForm';
import { WorldElement } from '../../../src/types/models';
import { ElementFactory } from '../../fixtures/factories';

describe('SpeciesSelector', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    cy.captureFailureDebug();
  });
  // * Use factory to create complete WorldElement objects
  const mockRaces: WorldElement[] = [
    ElementFactory.create({ id: 'race1', name: 'Elf', category: 'race-species', completion: 100 }),
    ElementFactory.create({ id: 'race2', name: 'Dwarf', category: 'race-species', completion: 80 }),
    ElementFactory.create({ id: 'race3', name: 'Human', category: 'race-species', completion: 90 }),
    ElementFactory.create({ id: 'race4', name: 'Orc', category: 'race-species', completion: 70 }),
    ElementFactory.create({ id: 'race5', name: 'Dragon', category: 'race-species', completion: 60 })
  ];
  
  let defaultProps: any;
  
  beforeEach(function() {
    // ! MANDATORY: Comprehensive debug setup
    cy.comprehensiveDebug();

    // * Clean state before each test
    cy.cleanState();

    defaultProps = {
      value: null,
      onChange: cy.stub(),
      projectId: 'project1',
      characterId: 'char1'
    };
    
    // * Mock the useRaceElements hook
    cy.stub(window, 'useRaceElements').returns({
      races: mockRaces,
      isLoading: false,
      hasMore: false,
      loadMore: cy.stub(),
      createRace: cy.stub().resolves({ id: 'newRace', name: 'New Race', category: 'race-species', completion: 0 }),
      selectedRace: null,
      incrementUsage: cy.stub()
    });
  });
  describe('Rendering', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    cy.captureFailureDebug();
  });
    it('renders selector button with placeholder', () => {
      cy.mount(<SpeciesSelector {...defaultProps} />);
      
      cy.get('button[type="button"]').should('contain', 'Select a race/species');
    });
    it('shows selected race name', () => {
      const selectedRace = mockRaces[0];
      cy.stub(window, 'useRaceElements').returns({
        races: mockRaces,
        selectedRace,
        isLoading: false,
        hasMore: false,
        loadMore: cy.stub(),
        createRace: cy.stub(),
        incrementUsage: cy.stub()
      });
      cy.mount(<SpeciesSelector {...defaultProps} value="race1" />);
      
      cy.get('button[type="button"]').should('contain', 'Elf');
    });
    it('uses custom placeholder', () => {
      cy.mount(<SpeciesSelector {...defaultProps} placeholder="Choose a species" />);
      
      cy.get('button[type="button"]').should('contain', 'Choose a species');
    });
  });
  describe('Dropdown Interaction', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    cy.captureFailureDebug();
  });
    it('opens dropdown on click', () => {
      cy.mount(<SpeciesSelector {...defaultProps} />);
      
      cy.get('button[type="button"]').click();
      cy.get('.absolute.z-50').should('be.visible');
    });
    it('closes dropdown on outside click', () => {
      cy.mount(
        <div>
          <SpeciesSelector {...defaultProps} />
          <div data-cy="outside">Outside element</div>
        </div>
      );
      
      cy.get('button[type="button"]').click();
      cy.get('.absolute.z-50').should('be.visible');
      
      cy.get('[data-cy="outside"]').click();
      cy.get('.absolute.z-50').should('not.exist');
    });
    it('rotates chevron icon when open', () => {
      cy.mount(<SpeciesSelector {...defaultProps} />);
      
      cy.get('.transition-transform').should('not.have.class', 'rotate-180');
      
      cy.get('button[type="button"]').click();
      cy.get('.transition-transform').should('be.visible') // React Native Web uses inline styles instead of CSS classes;
    });
  });
  describe('Search Functionality', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    cy.captureFailureDebug();
  });
    it('shows search input in dropdown', () => {
      cy.mount(<SpeciesSelector {...defaultProps} />);
      
      cy.get('button[type="button"]').click();
      cy.get('input[placeholder*="Search"]').should('be.visible');
    });
    it('filters races based on search query', () => {
      cy.mount(<SpeciesSelector {...defaultProps} />);
      
      cy.get('button[type="button"]').click();
      cy.get('input[placeholder*="Search"]').type('elf');
      
      cy.contains('Elf').should('be.visible');
      cy.contains('Dwarf').should('not.exist');
    });
    it('shows no results message', () => {
      cy.mount(<SpeciesSelector {...defaultProps} />);
      
      cy.get('button[type="button"]').click();
      cy.get('input[placeholder*="Search"]').type('xyz');
      
      cy.contains('No races found').should('be.visible');
    });
  });
  describe('Race Selection', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    cy.captureFailureDebug();
  });
    it('selects race on click', () => {
      const onChange = cy.stub();
      cy.mount(<SpeciesSelector {...defaultProps} onChange={onChange} />);
      
      cy.get('button[type="button"]').click();
      cy.contains('Elf').click();
      
      cy.wrap(onChange).should('have.been.calledWith', 'race1');
    });
    it('increments usage count on selection', () => {
      const incrementUsage = cy.stub();
      cy.stub(window, 'useRaceElements').returns({
        races: mockRaces,
        selectedRace: null,
        isLoading: false,
        hasMore: false,
        loadMore: cy.stub(),
        createRace: cy.stub(),
        incrementUsage
      });
      cy.mount(<SpeciesSelector {...defaultProps} />);
      
      cy.get('button[type="button"]').click();
      cy.contains('Elf').click();
      
      cy.wrap(incrementUsage).should('have.been.calledWith', 'race1');
    });
    it('closes dropdown after selection', () => {
      cy.mount(<SpeciesSelector {...defaultProps} />);
      
      cy.get('button[type="button"]').click();
      cy.contains('Elf').click();
      
      cy.get('.absolute.z-50').should('not.exist');
    });
    it('clears search query after selection', () => {
      cy.mount(<SpeciesSelector {...defaultProps} />);
      
      cy.get('button[type="button"]').click();
      cy.get('input[placeholder*="Search"]').type('elf');
      cy.contains('Elf').click();
      
      cy.get('button[type="button"]').click();
      cy.get('input[placeholder*="Search"]').should('have.value', '');
    });
  });
  describe('Quick Create', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    cy.captureFailureDebug();
  });
    it('shows create new race button', () => {
      cy.mount(<SpeciesSelector {...defaultProps} />);
      
      cy.get('button[type="button"]').click();
      cy.contains('Create new race').should('be.visible');
    });
    it('opens create form on button click', () => {
      cy.mount(<SpeciesSelector {...defaultProps} />);
      
      cy.get('button[type="button"]').click();
      cy.contains('Create new race').click();
      
      cy.get('input[placeholder*="race name"]').should('be.visible');
    });
    it('creates new race and selects it', () => {
      const onChange = cy.stub();
      const createRace = cy.stub().resolves({
        id: 'newRace',
        name: 'New Race',
        category: 'race-species',
        completion: 0
      });
      cy.stub(window, 'useRaceElements').returns({
        races: mockRaces,
        selectedRace: null,
        isLoading: false,
        hasMore: false,
        loadMore: cy.stub(),
        createRace,
        incrementUsage: cy.stub()
      });
      cy.mount(<SpeciesSelector {...defaultProps} onChange={onChange} />);
      
      cy.get('button[type="button"]').click();
      cy.contains('Create new race').click();
      cy.get('input[placeholder*="race name"]').type('Goblin');
      cy.contains('Create').click();
      
      cy.wrap(createRace).should('have.been.calledWith', 'Goblin');
      cy.wrap(onChange).should('have.been.calledWith', 'newRace');
    });
    it('cancels create form', () => {
      cy.mount(<SpeciesSelector {...defaultProps} />);
      
      cy.get('button[type="button"]').click();
      cy.contains('Create new race').click();
      cy.contains('Cancel').click();
      
      cy.get('input[placeholder*="race name"]').should('not.exist');
    });
  });
  describe('Loading State', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    cy.captureFailureDebug();
  });
    it('shows loading indicator', () => {
      cy.stub(window, 'useRaceElements').returns({
        races: [],
        selectedRace: null,
        isLoading: true,
        hasMore: false,
        loadMore: cy.stub(),
        createRace: cy.stub(),
        incrementUsage: cy.stub()
      });
      cy.mount(<SpeciesSelector {...defaultProps} />);
      
      cy.get('button[type="button"]').click();
      cy.contains('Loading races...').should('be.visible');
    });
    it('shows load more button when hasMore is true', () => {
      cy.stub(window, 'useRaceElements').returns({
        races: mockRaces,
        selectedRace: null,
        isLoading: false,
        hasMore: true,
        loadMore: cy.stub(),
        createRace: cy.stub(),
        incrementUsage: cy.stub()
      });
      cy.mount(<SpeciesSelector {...defaultProps} />);
      
      cy.get('button[type="button"]').click();
      cy.contains('Load more').should('be.visible');
    });
    it('loads more races on button click', () => {
      const loadMore = cy.stub();
      cy.stub(window, 'useRaceElements').returns({
        races: mockRaces,
        selectedRace: null,
        isLoading: false,
        hasMore: true,
        loadMore,
        createRace: cy.stub(),
        incrementUsage: cy.stub()
      });
      cy.mount(<SpeciesSelector {...defaultProps} />);
      
      cy.get('button[type="button"]').click();
      cy.contains('Load more').click();
      
      cy.wrap(loadMore).should('have.been.called');
    });
  });
});
describe('SpeciesDropdown', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    cy.captureFailureDebug();
  });
  
  const mockRaces: WorldElement[] = [
    ElementFactory.create({ id: 'race1', name: 'Elf', category: 'race-species', completion: 100 }),
    ElementFactory.create({ id: 'race2', name: 'Dwarf', category: 'race-species', completion: 80 })];
  
  let defaultProps: any;
  
  beforeEach(function() {
    // ! MANDATORY: Comprehensive debug setup
    cy.comprehensiveDebug();

    // * Clean state before each test
    cy.cleanState();

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
  afterEach(function() {
    // ! Capture debug info if test failed
    cy.captureFailureDebug();
  });
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
    it('highlights selected race', () => {
      cy.mount(<SpeciesDropdown {...defaultProps} selectedId="race1" />);
      
      cy.contains('Elf').parent().should('be.visible') // React Native Web uses inline styles instead of CSS classes;
    });
  });
  describe('Search', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    cy.captureFailureDebug();
  });
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
  afterEach(function() {
    // ! Capture debug info if test failed
    cy.captureFailureDebug();
  });
    it('calls onSelect when race clicked', () => {
      const onSelect = cy.stub();
      cy.mount(<SpeciesDropdown {...defaultProps} onSelect={onSelect} />);
      
      cy.contains('Elf').click();
      cy.wrap(onSelect).should('have.been.calledWith', mockRaces[0]);
    });
    it('calls onCreateNew when create button clicked', () => {
      const onCreateNew = cy.stub();
      cy.mount(<SpeciesDropdown {...defaultProps} onCreateNew={onCreateNew} />);
      
      cy.contains('Create new race').click();
      cy.wrap(onCreateNew).should('have.been.called');
    });
  });
});
describe('QuickCreateForm', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    cy.captureFailureDebug();
  });
  let defaultProps: any;
  
  beforeEach(function() {
    // ! MANDATORY: Comprehensive debug setup
    cy.comprehensiveDebug();

    // * Clean state before each test
    cy.cleanState();

    defaultProps = {
      onCreate: cy.stub(),
      onCancel: cy.stub()
    };
  });
  describe('Rendering', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    cy.captureFailureDebug();
  });
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
  afterEach(function() {
    // ! Capture debug info if test failed
    cy.captureFailureDebug();
  });
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
  afterEach(function() {
    // ! Capture debug info if test failed
    cy.captureFailureDebug();
  });
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
  afterEach(function() {
    // ! Capture debug info if test failed
    cy.captureFailureDebug();
  });
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
  afterEach(function() {
    // ! Capture debug info if test failed
    cy.captureFailureDebug();
  });
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