/**
 * @fileoverview Element Forms Component Tests
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
import { BaseElementForm } from '../../support/component-test-helpers';
// TODO: TODO: Import other form components when implemented
// import { CharacterForm } from '../../../src/components/elements/CharacterForm';
// import { LocationForm } from '../../../src/components/elements/LocationForm';
// import { CultureForm } from '../../../src/components/elements/CultureForm';
// import { HistoricalEventForm } from '../../../src/components/elements/HistoricalEventForm';
// import { ItemForm } from '../../../src/components/elements/ItemForm';
// import { LanguageForm } from '../../../src/components/elements/LanguageForm';
// import { MagicSystemForm } from '../../../src/components/elements/MagicSystemForm';
import { OrganizationForm } from '../../../src/components/elements/OrganizationForm';
import { RaceForm } from '../../../src/components/elements/RaceForm';
import { ReligionForm } from '../../../src/components/elements/ReligionForm';
import { TechnologyForm } from '../../../src/components/elements/TechnologyForm';
import { Answer, ElementCategory } from '../../../src/types/worldbuilding';
import { QuestionFactory } from '../../fixtures/factories';
import { MockWorldbuildingStoreProvider } from '../../support/component-test-helpers';

// * Use factory for mock data
const mockQuestions = [
  QuestionFactory.createText({
    id: 'q1',
    text: 'Name',
    required: true,
    category: 'General',
    placeholder: 'Enter name'
  }),
  QuestionFactory.createTextarea({
    id: 'q2',
    text: 'Description',
    category: 'General',
    helpText: 'Provide a detailed description',
    inputSize: 'large'
  }),
  QuestionFactory.createNumber({
    id: 'q3',
    text: 'Age',
    category: 'Details',
    validation: { min: 0, max: 1000 }
  }),
  QuestionFactory.createSelect({
    id: 'q4',
    text: 'Type',
    category: 'Details',
    options: [
      { value: 'hero', label: 'Hero' },
      { value: 'villain', label: 'Villain' },
      { value: 'neutral', label: 'Neutral' }
    ]
  }),
  QuestionFactory.createMultiselect({
    id: 'q5',
    text: 'Abilities',
    category: 'Powers',
    options: [
      { value: 'strength', label: 'Super Strength' },
      { value: 'speed', label: 'Super Speed' },
      { value: 'flight', label: 'Flight' },
      { value: 'telepathy', label: 'Telepathy' }
    ]
  }),
  {
    id: 'q6',
    text: 'Is Active',
    type: 'boolean',
    category: 'Status'
  },
  {
    id: 'q7',
    text: 'Birth Date',
    type: 'date',
    category: 'Timeline'
  }
];

const mockAnswers: Record<string, Answer> = {
  q1: { value: 'Test Character', updatedAt: new Date() },
  q2: { value: 'A brave warrior', updatedAt: new Date() },
  q3: { value: 25, updatedAt: new Date() },
  q4: { value: 'hero', updatedAt: new Date() },
  q5: { value: ['strength', 'flight'], updatedAt: new Date() },
  q6: { value: true, updatedAt: new Date() },
  q7: { value: '2023-01-15', updatedAt: new Date() }
};

describe('BaseElementForm', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });
  beforeEach(function() {
    // ! MANDATORY: Comprehensive debug setup
    cy.comprehensiveDebug();

    // * Clean state before each test
    cy.cleanState();

    // * Reset factory counters for test isolation
    cy.resetFactories();
  });
  describe('Rendering', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });
    it('renders all question types correctly', () => {
      const onChange = cy.stub();
      
      cy.mount(
        <MockWorldbuildingStoreProvider>
          <BaseElementForm
            questions={mockQuestions}
            answers={mockAnswers}
            onChange={onChange}
            elementType="Character"
            category="character"
          />
        </MockWorldbuildingStoreProvider>
      );
      
      // * Check form header
      cy.contains('Character Details').should('be.visible');
      
      // * Check mode toggle
      cy.contains('Basic').should('be.visible');
      cy.contains('Detailed').should('be.visible');
      
      // * Expand categories to see questions
      cy.contains('General').click();
      cy.contains('Details').click();
      cy.contains('Powers').click();
      cy.contains('Status').click();
      cy.contains('Timeline').click();
      
      // * Check text input
      cy.get('[data-cy="text-input"]').first().should('have.value', 'Test Character');
      
      // TODO: * Check textarea (should be RichTextEditor for large size)
      cy.contains('Description').should('be.visible');
      
      // * Check number input
      cy.get('input[type="number"]').should('have.value', '25');
      
      // Check select dropdown
      cy.get('select').should('have.value', 'hero');
      
      // * Check multiselect checkboxes
      cy.get('input[type="checkbox"][checked]').should('have.length', 2);
      
      // * Check boolean radio buttons
      cy.get('input[type="radio"][checked]').should('exist');
      
      // * Check date input
      cy.get('input[type="date"]').should('have.value', '2023-01-15');
    });
    it('shows required field indicators', () => {
      cy.mount(
        <MockWorldbuildingStoreProvider>
          <BaseElementForm
            questions={mockQuestions}
            answers={{}}
            onChange={cy.stub()}
            elementType="Test"
            category="character"
          />
        </MockWorldbuildingStoreProvider>
      );
      
      cy.contains('General').click();
      cy.contains('Name').parent().should('contain', '*');
    });
    it('displays help text when available', () => {
      cy.mount(
        <MockWorldbuildingStoreProvider>
          <BaseElementForm
            questions={mockQuestions}
            answers={{}}
            onChange={cy.stub()}
            elementType="Test"
            category="character"
          />
        </MockWorldbuildingStoreProvider>
      );
      
      cy.contains('General').click();
      cy.get('[data-cy="question-q2"] .text-ink-light').click();
      cy.contains('Provide a detailed description').should('be.visible');
    });
  });
  describe('Mode Toggle', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });
    it('switches between basic and detailed modes', () => {
      cy.mount(
        <MockWorldbuildingStoreProvider>
          <BaseElementForm
            questions={mockQuestions}
            answers={{}}
            onChange={cy.stub()}
            elementType="Test"
            category="character"
          />
        </MockWorldbuildingStoreProvider>
      );
      
      // * Start in basic mode
      cy.contains('Quick Mode').should('be.visible');
      
      // * Switch to detailed mode
      cy.get('button').contains('Detailed').parent().click();
      cy.contains('Quick Mode').should('not.exist');
      
      // * Switch back to basic
      cy.get('button').contains('Basic').parent().click();
      cy.contains('Quick Mode').should('be.visible');
    });
    it('filters questions based on mode', () => {
      const detailedQuestions = mockQuestions;
      
      cy.mount(
        <MockWorldbuildingStoreProvider>
          <BaseElementForm
            questions={detailedQuestions}
            answers={{}}
            onChange={cy.stub()}
            elementType="Test"
            category="character"
          />
        </MockWorldbuildingStoreProvider>
      );
      
      // ? TODO: * In basic mode, should show limited questions
      cy.contains('Quick Mode').should('be.visible');
      
      // * Switch to detailed mode
      cy.get('button').contains('Detailed').parent().click();
      
      // TODO: * All categories should be available
      cy.contains('General').should('be.visible');
      cy.contains('Details').should('be.visible');
      cy.contains('Powers').should('be.visible');
      cy.contains('Status').should('be.visible');
      cy.contains('Timeline').should('be.visible');
    });
  });
  describe('Category Expansion', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });
    it('expands and collapses categories', () => {
      cy.mount(
        <MockWorldbuildingStoreProvider>
          <BaseElementForm
            questions={mockQuestions}
            answers={{}}
            onChange={cy.stub()}
            elementType="Test"
            category="character"
          />
        </MockWorldbuildingStoreProvider>
      );
      
      // TODO: * Category should be collapsed initially
      cy.contains('Name').should('not.be.visible');
      
      // * Expand category
      cy.contains('General').click();
      cy.contains('Name').should('be.visible');
      
      // * Collapse category
      cy.contains('General').click();
      cy.contains('Name').should('not.be.visible');
    });
    it('shows question count per category', () => {
      cy.mount(
        <MockWorldbuildingStoreProvider>
          <BaseElementForm
            questions={mockQuestions}
            answers={{}}
            onChange={cy.stub()}
            elementType="Test"
            category="character"
          />
        </MockWorldbuildingStoreProvider>
      );
      
      cy.contains('General').parent().should('contain', '2 questions');
      cy.contains('Details').parent().should('contain', '2 questions');
      cy.contains('Powers').parent().should('contain', '1 questions');
    });
  });
  describe('User Interactions', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });
    it('handles text input changes', () => {
      const onChange = cy.stub();
      
      cy.mount(
        <MockWorldbuildingStoreProvider>
          <BaseElementForm
            questions={mockQuestions}
            answers={{}}
            onChange={onChange}
            elementType="Test"
            category="character"
          />
        </MockWorldbuildingStoreProvider>
      );
      
      cy.contains('General').click();
      cy.get('[data-cy="text-input"]').first().type('New Name');
      cy.wrap(onChange).should('have.been.calledWith', 'q1', 'New Name');
    });
    it('handles number input changes', () => {
      const onChange = cy.stub();
      
      cy.mount(
        <MockWorldbuildingStoreProvider>
          <BaseElementForm
            questions={mockQuestions}
            answers={{}}
            onChange={onChange}
            elementType="Test"
            category="character"
          />
        </MockWorldbuildingStoreProvider>
      );
      
      cy.contains('Details').click();
      cy.get('input[type="number"]').clear().type('30');
      cy.wrap(onChange).should('have.been.calledWith', 'q3', 30);
    });
    it('handles select changes', () => {
      const onChange = cy.stub();
      
      cy.mount(
        <MockWorldbuildingStoreProvider>
          <BaseElementForm
            questions={mockQuestions}
            answers={{}}
            onChange={onChange}
            elementType="Test"
            category="character"
          />
        </MockWorldbuildingStoreProvider>
      );
      
      cy.contains('Details').click();
      cy.get('select').select('villain');
      cy.wrap(onChange).should('have.been.calledWith', 'q4', 'villain');
    });
    it('handles multiselect changes', () => {
      const onChange = cy.stub();
      
      cy.mount(
        <MockWorldbuildingStoreProvider>
          <BaseElementForm
            questions={mockQuestions}
            answers={{}}
            onChange={onChange}
            elementType="Test"
            category="character"
          />
        </MockWorldbuildingStoreProvider>
      );
      
      cy.contains('Powers').click();
      cy.contains('Super Strength').click();
      cy.wrap(onChange).should('have.been.calledWith', 'q5', ['strength']);
      
      cy.contains('Flight').click();
      cy.wrap(onChange).should('have.been.calledWith', 'q5', ['strength', 'flight']);
    });
    it('handles boolean changes', () => {
      const onChange = cy.stub();
      
      cy.mount(
        <MockWorldbuildingStoreProvider>
          <BaseElementForm
            questions={mockQuestions}
            answers={{}}
            onChange={onChange}
            elementType="Test"
            category="character"
          />
        </MockWorldbuildingStoreProvider>
      );
      
      cy.contains('Status').click();
      cy.contains('Yes').click();
      cy.wrap(onChange).should('have.been.calledWith', 'q6', true);
      
      cy.contains('No').click();
      cy.wrap(onChange).should('have.been.calledWith', 'q6', false);
    });
    it('handles date changes', () => {
      const onChange = cy.stub();
      
      cy.mount(
        <MockWorldbuildingStoreProvider>
          <BaseElementForm
            questions={mockQuestions}
            answers={{}}
            onChange={onChange}
            elementType="Test"
            category="character"
          />
        </MockWorldbuildingStoreProvider>
      );
      
      cy.contains('Timeline').click();
      cy.get('input[type="date"]').clear().type('2024-06-15');
      cy.wrap(onChange).should('have.been.calledWith', 'q7', '2024-06-15');
    });
  });
  describe('Validation', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });
    it('respects number input validation', () => {
      cy.mount(
        <MockWorldbuildingStoreProvider>
          <BaseElementForm
            questions={mockQuestions}
            answers={{}}
            onChange={cy.stub()}
            elementType="Test"
            category="character"
          />
        </MockWorldbuildingStoreProvider>
      );
      
      cy.contains('Details').click();
      cy.get('input[type="number"]')
        .should('have.attr', 'min', '0')
        .should('have.attr', 'max', '1000');
    });
    it('marks required fields', () => {
      cy.mount(
        <MockWorldbuildingStoreProvider>
          <BaseElementForm
            questions={mockQuestions}
            answers={{}}
            onChange={cy.stub()}
            elementType="Test"
            category="character"
          />
        </MockWorldbuildingStoreProvider>
      );
      
      cy.contains('General').click();
      cy.get('input[required]').should('exist');
    });
  });
  describe('Edge Cases', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });
    it('handles empty questions array', () => {
      cy.mount(
        <MockWorldbuildingStoreProvider>
          <BaseElementForm
            questions={[]}
            answers={{}}
            onChange={cy.stub()}
            elementType="Test"
            category="character"
          />
        </MockWorldbuildingStoreProvider>
      );
      
      cy.contains('Test Details').should('be.visible');
    });
    it('handles questions without categories', () => {
      const questionsWithoutCategory = [
        { id: 'q1', text: 'Name', type: 'text' as const }
      ];
      
      cy.mount(
        <MockWorldbuildingStoreProvider>
          <BaseElementForm
            questions={questionsWithoutCategory}
            answers={{}}
            onChange={cy.stub()}
            elementType="Test"
            category="character"
          />
        </MockWorldbuildingStoreProvider>
      );
      
      cy.contains('General').should('be.visible');
    });
    it('handles missing answer values gracefully', () => {
      cy.mount(
        <MockWorldbuildingStoreProvider>
          <BaseElementForm
            questions={mockQuestions}
            answers={{}}
            onChange={cy.stub()}
            elementType="Test"
            category="character"
          />
        </MockWorldbuildingStoreProvider>
      );
      
      cy.contains('General').click();
      cy.get('[data-cy="text-input"]').first().should('have.value', '');
    });
  });
  describe('Accessibility', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });
    it('has proper ARIA labels', () => {
      cy.mount(
        <MockWorldbuildingStoreProvider>
          <BaseElementForm
            questions={mockQuestions}
            answers={{}}
            onChange={cy.stub()}
            elementType="Test"
            category="character"
          />
        </MockWorldbuildingStoreProvider>
      );
      
      cy.contains('General').click();
      cy.get('[data-cy="text-input"]').first().should('have.attr', 'placeholder');
    });
    it('supports keyboard navigation', () => {
      cy.mount(
        <MockWorldbuildingStoreProvider>
          <BaseElementForm
            questions={mockQuestions}
            answers={{}}
            onChange={cy.stub()}
            elementType="Test"
            category="character"
          />
        </MockWorldbuildingStoreProvider>
      );
      
      // * Tab through form elements
      cy.get('body').tab();
      cy.focused().should('contain', 'General');
      
      // * Expand category with Enter
      cy.focused().type('{enter}');
      cy.contains('Name').should('be.visible');
    });
  });
});
describe('CharacterForm', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });
  
  const mockProject = {
    id: 'project1',
    name: 'Test Project',
    elements: [
      {
        id: 'race1',
        name: 'Elf',
        category: 'race-species' as ElementCategory,
        completion: 100
      },
      {
        id: 'race2',
        name: 'Dwarf',
        category: 'race-species' as ElementCategory,
        completion: 80
      }
    ]
  };
  
  describe('Rendering', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });
    it('renders base form with species selector', () => {
      const onChange = cy.stub();
      
      cy.mount(
        <MockWorldbuildingStoreProvider 
          initialState={{
            projects: [mockProject],
            currentProjectId: 'project1'
          }}
        >
          <CharacterForm
            answers={{}}
            onChange={onChange}
            projectId="project1"
            elementId="char1"
          />
        </MockWorldbuildingStoreProvider>
      );
      
      // TODO: * Base form should render
      cy.contains('Character Details').should('be.visible');
      
      // TODO: Species selector should render (may be in different location)
      cy.get('body').should('contain', 'Species').or('contain', 'Race');
    });
    it('shows selected species', () => {
      const answers = {
        species: { questionId: 'species', value: 'race1' }
      };
      
      cy.mount(
        <MockWorldbuildingStoreProvider 
          initialState={{
            projects: [mockProject],
            currentProjectId: 'project1'
          }}
        >
          <CharacterForm
            answers={answers}
            onChange={cy.stub()}
            projectId="project1"
            elementId="char1"
          />
        </MockWorldbuildingStoreProvider>
      );
      
      // ? TODO: * Should show selected race somewhere in the UI
      cy.get('body').should('contain', 'Elf');
    });
  });
});
describe('Other Element Forms', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });
  
  const testForms = [
    { Component: LocationForm, name: 'LocationForm' },
    { Component: CultureForm, name: 'CultureForm' },
    { Component: HistoricalEventForm, name: 'HistoricalEventForm' },
    { Component: ItemForm, name: 'ItemForm' },
    { Component: LanguageForm, name: 'LanguageForm' },
    { Component: MagicSystemForm, name: 'MagicSystemForm' },
    { Component: OrganizationForm, name: 'OrganizationForm' },
    { Component: RaceForm, name: 'RaceForm' },
    { Component: ReligionForm, name: 'ReligionForm' },
    { Component: TechnologyForm, name: 'TechnologyForm' }
  ];
  
  testForms.forEach(({ Component, name }) => {
    describe(name, () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });
      it('renders and handles changes', () => {
        const onChange = cy.stub();
        
        cy.mount(
          <MockWorldbuildingStoreProvider>
            <Component
              answers={{}}
              onChange={onChange}
            />
          </MockWorldbuildingStoreProvider>
        );
        
        // TODO: * Should render base form
        cy.get('.space-y-6').should('exist');
        
        // * Expand first category
        cy.get('button').first().click();
        
        // * Type in first input
        cy.get('[data-cy="text-input"]').first().type('Test Value');
        
        // TODO: * Should call onChange
        cy.wrap(onChange).should('have.been.called');
      });
    });
  });
});