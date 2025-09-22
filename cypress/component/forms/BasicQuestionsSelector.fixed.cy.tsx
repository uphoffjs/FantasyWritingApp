import React from 'react';
import { BasicQuestionsSelector, Question } from '../../support/component-test-helpers';

describe('BasicQuestionsSelector Component - Fixed', () => {
  const mockQuestions: Question[] = [
    { id: 'name', text: 'Name', type: 'text', required: true, category: 'Basic Info' },
    { id: 'age', text: 'Age', type: 'number', required: false, category: 'Basic Info', helpText: 'Character age' },
    { id: 'species', text: 'Species', type: 'text', required: false, category: 'Basic Info' },
    { id: 'occupation', text: 'Occupation', type: 'text', required: false, category: 'Details' },
    { id: 'motivations', text: 'Motivations', type: 'textarea', required: false, category: 'Details' },
    { id: 'backstory', text: 'Backstory', type: 'textarea', required: false, category: 'History' },
    { id: 'personality_type', text: 'Personality Type', type: 'select', required: false, category: 'Psychology' },
    { id: 'story_role', text: 'Story Role', type: 'select', required: false, category: 'Story' }
  ];

  let onChangeSpy: any;

  beforeEach(() => {
    onChangeSpy = cy.spy().as('onChange');
  });

  describe('Rendering', () => {
    it('renders with title and description', () => {
      cy.mount(
        <BasicQuestionsSelector
          questions={mockQuestions}
          category="character"
          onChange={onChangeSpy}
        />
      );

      cy.contains('Basic Mode Configuration').should('be.visible');
      cy.contains('Select which questions should appear in Basic mode').should('be.visible');
    });

    it('displays question statistics', () => {
      cy.mount(
        <BasicQuestionsSelector
          questions={mockQuestions}
          basicQuestionIds={['name', 'age']}
          category="character"
          onChange={onChangeSpy}
        />
      );

      cy.contains('Basic Questions').should('be.visible');
      cy.contains('2').should('be.visible'); // Basic question count
      cy.contains('Detailed Questions').should('be.visible');
      cy.contains('8').should('be.visible'); // Total question count
    });

    it('shows estimated completion times', () => {
      cy.mount(
        <BasicQuestionsSelector
          questions={mockQuestions}
          basicQuestionIds={['name', 'age']}
          category="character"
          onChange={onChangeSpy}
        />
      );

      cy.contains('~1 min to complete').should('be.visible'); // Basic mode
      cy.contains('~6 min to complete').should('be.visible'); // Detailed mode
    });

    it('groups questions by category', () => {
      cy.mount(
        <BasicQuestionsSelector
          questions={mockQuestions}
          category="character"
          onChange={onChangeSpy}
        />
      );

      cy.contains('Basic Info').should('be.visible');
      cy.contains('Details').should('be.visible');
      cy.contains('History').should('be.visible');
    });
  });

  describe('Quick Actions', () => {
    it('applies default suggestions when clicked', () => {
      cy.mount(
        <BasicQuestionsSelector
          questions={mockQuestions}
          category="character"
          onChange={onChangeSpy}
        />
      );

      // * Use our custom React Native command
      cy.getRN('Apply Defaults').rnClick();
      cy.waitForRN();
      
      // TODO: * Should select suggested questions for character category
      cy.get('@onChange').should('have.been.called').then(() => {
        const call = onChangeSpy.getCall(0);
        expect(call.args[0]).to.include('name');
      });
    });

    it('selects all questions when Select All is clicked', () => {
      cy.mount(
        <BasicQuestionsSelector
          questions={mockQuestions}
          category="character"
          onChange={onChangeSpy}
        />
      );

      cy.getRN('Select All').rnClick();
      cy.waitForRN();
      
      cy.get('@onChange').should('have.been.calledWith', 
        mockQuestions.map(q => q.id)
      );
    });

    it('deselects all questions when Select None is clicked', () => {
      cy.mount(
        <BasicQuestionsSelector
          questions={mockQuestions}
          basicQuestionIds={['name', 'age']}
          category="character"
          onChange={onChangeSpy}
        />
      );

      cy.getRN('Select None').rnClick();
      cy.waitForRN();
      
      cy.get('@onChange').should('have.been.calledWith', []);
    });
  });

  describe('Question Selection', () => {
    it('toggles question selection when checkbox is clicked', () => {
      cy.mount(
        <BasicQuestionsSelector
          questions={mockQuestions}
          basicQuestionIds={[]}
          category="character"
          onChange={onChangeSpy}
        />
      );

      // * Use getRN to find checkboxes by their question ID
      cy.getRN('question-checkbox-name').rnClick();
      cy.waitForRN();

      cy.get('@onChange').should('have.been.calledWith', ['name']);

      cy.getRN('question-checkbox-age').rnClick();
      cy.waitForRN();

      cy.get('@onChange').should('have.been.called').then(() => {
        const lastCall = onChangeSpy.lastCall;
        expect(lastCall.args[0]).to.have.members(['name', 'age']);
      });
    });

    it('maintains selection state across categories', () => {
      cy.mount(
        <BasicQuestionsSelector
          questions={mockQuestions}
          basicQuestionIds={['name', 'occupation', 'backstory']}
          category="character"
          onChange={onChangeSpy}
        />
      );

      // * Check that selections in different categories are maintained
      cy.getRN('question-checkbox-name').should('be.checked');
      cy.getRN('question-checkbox-occupation').should('be.checked');
      cy.getRN('question-checkbox-backstory').should('be.checked');
    });
  });

  describe('Visual Feedback', () => {
    it('shows summary when questions are selected', () => {
      cy.mount(
        <BasicQuestionsSelector
          questions={mockQuestions}
          basicQuestionIds={['name', 'age']}
          category="character"
          onChange={onChangeSpy}
        />
      );

      cy.contains('Basic Mode Ready').should('be.visible');
      cy.contains('2 essential questions selected').should('be.visible');
    });
  });

  describe('Initialization', () => {
    it('uses provided basicQuestionIds on mount', () => {
      cy.mount(
        <BasicQuestionsSelector
          questions={mockQuestions}
          basicQuestionIds={['name', 'age', 'species']}
          category="character"
          onChange={onChangeSpy}
        />
      );

      cy.getRN('question-checkbox-name').should('be.checked');
      cy.getRN('question-checkbox-age').should('be.checked');
      cy.getRN('question-checkbox-species').should('be.checked');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty questions array', () => {
      cy.mount(
        <BasicQuestionsSelector
          questions={[]}
          category="character"
          onChange={onChangeSpy}
        />
      );

      cy.contains('Basic Mode Configuration').should('be.visible');
      cy.contains('0').should('be.visible'); // Zero questions
    });

    it('handles questions without categories', () => {
      const questionsWithoutCategory: Question[] = [
        { id: 'q1', text: 'Question 1', type: 'text', required: false },
        { id: 'q2', text: 'Question 2', type: 'text', required: false }
      ];

      cy.mount(
        <BasicQuestionsSelector
          questions={questionsWithoutCategory}
          category="character"
          onChange={onChangeSpy}
        />
      );

      cy.contains('General').should('be.visible'); // Default category
      cy.contains('Question 1').should('be.visible');
      cy.contains('Question 2').should('be.visible');
    });
  });

  describe('Responsive Design', () => {
    it('works on mobile viewport', () => {
      cy.viewport(375, 667);
      
      cy.mount(
        <BasicQuestionsSelector
          questions={mockQuestions}
          basicQuestionIds={['name', 'age']}
          category="character"
          onChange={onChangeSpy}
        />
      );

      cy.contains('Basic Mode Configuration').should('be.visible');
      cy.getRN('Apply Defaults').should('be.visible');
      cy.contains('2').should('be.visible'); // Basic question count
    });

    it('maintains layout on tablet viewport', () => {
      cy.viewport(768, 1024);
      
      cy.mount(
        <BasicQuestionsSelector
          questions={mockQuestions}
          category="character"
          onChange={onChangeSpy}
        />
      );

      cy.contains('Basic Mode Configuration').should('be.visible');
    });
  });

  describe('Time Calculations', () => {
    it('calculates basic mode time correctly', () => {
      cy.mount(
        <BasicQuestionsSelector
          questions={mockQuestions}
          basicQuestionIds={['name', 'age']} // 2 questions * 30 seconds = 60 seconds = 1 min
          category="character"
          onChange={onChangeSpy}
        />
      );

      cy.contains('Basic Questions').parent().within(() => {
        cy.contains('~1 min to complete').should('be.visible');
      });
    });

    it('calculates detailed mode time correctly', () => {
      cy.mount(
        <BasicQuestionsSelector
          questions={mockQuestions} // 8 questions * 45 seconds = 360 seconds = 6 min
          category="character"
          onChange={onChangeSpy}
        />
      );

      cy.contains('Detailed Questions').parent().within(() => {
        cy.contains('~6 min to complete').should('be.visible');
      });
    });
  });
});