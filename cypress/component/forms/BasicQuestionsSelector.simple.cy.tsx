/**
 * @fileoverview Basic Questions Selector.simple Component Tests
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
import { BasicQuestionsSelector } from '../../../src/components/BasicQuestionsSelector';
import { Question } from '../../../src/types/models';

describe('BasicQuestionsSelector Simplified Tests', () => {
  beforeEach(function() {
    // ! Essential debug and state management
    cy.comprehensiveDebug();
    cy.cleanState();
  });

  afterEach(function() {
    // ! Capture debug info if test failed
    cy.captureFailureDebug();
  });

  
  const mockQuestions: Question[] = [
    { id: 'name', text: 'Name', type: 'text', required: true, category: 'Basic Info' },
    { id: 'age', text: 'Age', type: 'number', required: false, category: 'Basic Info' },
    { id: 'species', text: 'Species', type: 'text', required: false, category: 'Basic Info' }
  ];

  describe('Core Functionality', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    cy.captureFailureDebug();
  });

    it('renders without crashing', () => {
      const onChange = cy.spy();
      
      cy.mount(
        <BasicQuestionsSelector
          questions={mockQuestions}
          category="character"
          onChange={onChange}
        />
      );
      
      cy.contains('Basic Mode Configuration').should('be.visible');
    });

    it('displays question count', () => {
      const onChange = cy.spy();
      
      cy.mount(
        <BasicQuestionsSelector
          questions={mockQuestions}
          basicQuestionIds={['name']}
          category="character"
          onChange={onChange}
        />
      );
      
      cy.contains('1').should('be.visible'); // 1 basic question selected
      cy.contains('3').should('be.visible'); // 3 total questions
    });

    it('toggles question selection', () => {
      const onChange = cy.spy().as('onChange');
      
      cy.mount(
        <BasicQuestionsSelector
          questions={mockQuestions}
          basicQuestionIds={[]}
          category="character"
          onChange={onChange}
        />
      );
      
      // * Click on Name checkbox
      cy.contains('label', 'Name').click();
      
      // * Check onChange was called
      cy.get('@onChange').should('have.been.called');
    });

    it('selects all questions', () => {
      const onChange = cy.spy().as('onChange');
      
      cy.mount(
        <BasicQuestionsSelector
          questions={mockQuestions}
          basicQuestionIds={[]}
          category="character"
          onChange={onChange}
        />
      );
      
      cy.contains('Select All').click();
      
      cy.get('@onChange').should('have.been.calledWith', ['name', 'age', 'species']);
    });

    it('clears all selections', () => {
      const onChange = cy.spy().as('onChange');
      
      cy.mount(
        <BasicQuestionsSelector
          questions={mockQuestions}
          basicQuestionIds={['name', 'age']}
          category="character"
          onChange={onChange}
        />
      );
      
      cy.contains('Select None').click();
      
      cy.get('@onChange').should('have.been.calledWith', []);
    });

    it('maintains selected state', () => {
      const onChange = cy.spy();
      
      cy.mount(
        <BasicQuestionsSelector
          questions={mockQuestions}
          basicQuestionIds={['name', 'species']}
          category="character"
          onChange={onChange}
        />
      );
      
      // * Check that the correct checkboxes are checked
      cy.contains('label', 'Name').within(() => {
        cy.get('input[type="checkbox"]').should('be.checked');
      });
      
      cy.contains('label', 'Age').within(() => {
        cy.get('input[type="checkbox"]').should('not.be.checked');
      });
      
      cy.contains('label', 'Species').within(() => {
        cy.get('input[type="checkbox"]').should('be.checked');
      });
    });
  });
});