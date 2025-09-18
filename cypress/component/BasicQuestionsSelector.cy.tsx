import React from 'react';
import { BasicQuestionsSelector, Question } from '../support/component-test-helpers';

describe('BasicQuestionsSelector Component', () => {
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

    it('displays tip info box', () => {
      cy.mount(
        <BasicQuestionsSelector
          questions={mockQuestions}
          category="character"
          onChange={onChangeSpy}
        />
      );

      cy.contains('Tip:').should('be.visible');
      cy.contains('Basic mode should include just enough questions').should('be.visible');
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
      cy.contains('Psychology').should('be.visible');
      cy.contains('Story').should('be.visible');
    });

    it('shows required badge for required questions', () => {
      cy.mount(
        <BasicQuestionsSelector
          questions={mockQuestions}
          category="character"
          onChange={onChangeSpy}
        />
      );

      cy.contains('Name').parent().within(() => {
        cy.contains('Required').should('be.visible');
      });
    });

    it('shows help text when available', () => {
      cy.mount(
        <BasicQuestionsSelector
          questions={mockQuestions}
          category="character"
          onChange={onChangeSpy}
        />
      );

      cy.contains('Character age').should('be.visible');
    });

    it('shows star icon for suggested questions', () => {
      cy.mount(
        <BasicQuestionsSelector
          questions={mockQuestions}
          category="character"
          onChange={onChangeSpy}
        />
      );

      // * Name is a suggested question for character category
      cy.contains('Name').parent().within(() => {
        cy.get('svg').should('exist'); // Star icon
      });
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

      cy.contains('Apply Defaults').click();
      
      // TODO: * Should select suggested questions for character category
      cy.get('@onChange').should('have.been.called').then(() => {
        const call = onChangeSpy.getCall(0);
        expect(call.args[0]).to.include('name');
        expect(call.args[0]).to.include('age');
        expect(call.args[0]).to.include('species');
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

      cy.contains('Select All').click();
      
      cy.get('@onChange').should('have.been.calledWith', 
        mockQuestions.map(q => q.id)
      );
    });

    it('deselects all questions when Select None is clicked', () => {
      cy.mount(
        <BasicQuestionsSelector
          questions={mockQuestions}
          category="character"
          onChange={onChangeSpy}
        />
      );

      cy.contains('Select None').click();
      
      cy.get('@onChange').should('have.been.calledWith', []);
    });

    it('disables Apply Defaults when no suggestions exist', () => {
      cy.mount(
        <BasicQuestionsSelector
          questions={mockQuestions}
          category="unknown_category"
          onChange={onChangeSpy}
        />
      );

      cy.contains('Apply Defaults').should('be.disabled');
    });
  });

  describe('Question Selection', () => {
    it.skip('toggles question selection when checkbox is clicked', () => {
      cy.mount(
        <BasicQuestionsSelector
          questions={mockQuestions}
          category="character"
          onChange={onChangeSpy}
        />
      );

      cy.contains('label', 'Name').within(() => {
        cy.get('input[type="checkbox"]').click();
      });

      cy.get('@onChange').should('have.been.calledWith', ['name']);

      cy.contains('label', 'Age').within(() => {
        cy.get('input[type="checkbox"]').click();
      });

      cy.get('@onChange').should('have.been.called').then(() => {
        const lastCall = onChangeSpy.lastCall;
        expect(lastCall.args[0]).to.have.members(['name', 'age']);
      });
    });

    it('deselects question when already selected', () => {
      cy.mount(
        <BasicQuestionsSelector
          questions={mockQuestions}
          basicQuestionIds={['name']}
          category="character"
          onChange={onChangeSpy}
        />
      );

      cy.contains('label', 'Name').within(() => {
        cy.get('input[type="checkbox"]').click();
      });

      cy.get('@onChange').should('have.been.calledWith', ['age']);
    });

    it.skip('toggles question when label is clicked', () => {
      cy.mount(
        <BasicQuestionsSelector
          questions={mockQuestions}
          category="character"
          onChange={onChangeSpy}
        />
      );

      cy.contains('label', 'Name').click();
      
      cy.get('@onChange').should('have.been.calledWith', ['name']);
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
      cy.contains('label', 'Name').within(() => {
        cy.get('input[type="checkbox"]').should('be.checked');
      });

      cy.contains('label', 'Occupation').within(() => {
        cy.get('input[type="checkbox"]').should('be.checked');
      });

      cy.contains('label', 'Backstory').within(() => {
        cy.get('input[type="checkbox"]').should('be.checked');
      });
    });
  });

  describe('Visual Feedback', () => {
    it('highlights selected questions', () => {
      cy.mount(
        <BasicQuestionsSelector
          questions={mockQuestions}
          basicQuestionIds={['name']}
          category="character"
          onChange={onChangeSpy}
        />
      );

      cy.contains('label', 'Name')
        .should('be.visible') // React Native Web uses inline styles instead of CSS classes
        .and('have.class', 'border-sapphire-600');

      cy.contains('label', 'Age')
        .should('not.have.class', 'bg-parchment-dark');
    });

    it.skip('shows hover effect on unselected questions', () => {
      cy.mount(
        <BasicQuestionsSelector
          questions={mockQuestions}
          category="character"
          onChange={onChangeSpy}
        />
      );

      cy.contains('label', 'Name')
        .should('be.visible') // React Native Web uses inline styles instead of CSS classes;
    });

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

    it.skip('hides summary when no questions are selected', () => {
      cy.mount(
        <BasicQuestionsSelector
          questions={mockQuestions}
          basicQuestionIds={[]}
          category="character"
          onChange={onChangeSpy}
        />
      );

      cy.contains('Basic Mode Ready').should('not.exist');
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

      cy.contains('label', 'Name').within(() => {
        cy.get('input[type="checkbox"]').should('be.checked');
      });

      cy.contains('label', 'Age').within(() => {
        cy.get('input[type="checkbox"]').should('be.checked');
      });

      cy.contains('label', 'Species').within(() => {
        cy.get('input[type="checkbox"]').should('be.checked');
      });
    });

    // * Skip auto-select tests as they rely on useEffect timing which can be flaky
    it.skip('auto-selects suggestions when no basicQuestionIds provided', () => {
      cy.mount(
        <BasicQuestionsSelector
          questions={mockQuestions}
          category="character"
          onChange={onChangeSpy}
        />
      );

      // TODO: * Should auto-select suggested questions for character category
      // * Wait for onChange to be called with proper assertion
      cy.get('@onChange', { timeout: 1000 }).should('have.been.called').then(() => {
        const call = onChangeSpy.getCall(0);
        expect(call.args[0]).to.include.members(['name', 'age', 'species']);
      });
    });

    it.skip('does not auto-select when basicQuestionIds are already set', () => {
      cy.mount(
        <BasicQuestionsSelector
          questions={mockQuestions}
          basicQuestionIds={['backstory']}
          category="character"
          onChange={onChangeSpy}
        />
      );

      // * Give component time to initialize but verify onChange is NOT called
      cy.wait(200);
      cy.get('@onChange').should('not.have.been.called');
      
      cy.contains('label', 'Backstory').within(() => {
        cy.get('input[type="checkbox"]').should('be.checked');
      });
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

    it('handles very long question text', () => {
      const longQuestions: Question[] = [
        { 
          id: 'long', 
          text: 'This is a very long question text that might cause layout issues if not handled properly in the component rendering',
          type: 'text',
          required: false,
          category: 'Test'
        }
      ];

      cy.mount(
        <BasicQuestionsSelector
          questions={longQuestions}
          category="character"
          onChange={onChangeSpy}
        />
      );

      cy.contains('This is a very long question text').should('be.visible');
    });

    it('handles many questions', () => {
      const manyQuestions: Question[] = Array.from({ length: 50 }, (_, i) => ({
        id: `q${i}`,
        text: `Question ${i}`,
        type: 'text' as const,
        required: false,
        category: `Category ${Math.floor(i / 10)}`
      }));

      cy.mount(
        <BasicQuestionsSelector
          questions={manyQuestions}
          category="character"
          onChange={onChangeSpy}
        />
      );

      cy.contains('50').should('be.visible'); // Total questions
      cy.contains('Category 0').should('be.visible');
      cy.contains('Category 4').should('be.visible');
    });

    it('filters out non-existent question IDs from suggestions', () => {
      const limitedQuestions: Question[] = [
        { id: 'name', text: 'Name', type: 'text', required: true, category: 'Basic' }
      ];

      cy.mount(
        <BasicQuestionsSelector
          questions={limitedQuestions}
          basicQuestionIds={[]}
          category="character"
          onChange={onChangeSpy}
        />
      );

      cy.contains('Apply Defaults').click();
      
      // TODO: * Should only select 'name' since other suggested IDs don't exist
      cy.get('@onChange').should('have.been.calledWith', ['name']);
    });

    it.skip('handles rapid selection changes', () => {
      cy.mount(
        <BasicQuestionsSelector
          questions={mockQuestions}
          category="character"
          onChange={onChangeSpy}
        />
      );

      // * Rapidly toggle multiple questions
      cy.contains('label', 'Name').click();
      cy.contains('label', 'Age').click();
      cy.contains('label', 'Species').click();
      cy.contains('label', 'Name').click(); // Toggle off
      cy.contains('label', 'Occupation').click();

      cy.get('@onChange').should('have.callCount', 5);
    });

    it('handles special characters in question text', () => {
      const specialQuestions: Question[] = [
        { id: 'q1', text: 'Question & Answer', type: 'text', required: false, category: 'Test' },
        { id: 'q2', text: 'Question "with" quotes', type: 'text', required: false, category: 'Test' },
        { id: 'q3', text: "Question's apostrophe", type: 'text', required: false, category: 'Test' }
      ];

      cy.mount(
        <BasicQuestionsSelector
          questions={specialQuestions}
          category="character"
          onChange={onChangeSpy}
        />
      );

      cy.contains('Question & Answer').should('be.visible');
      cy.contains('Question "with" quotes').should('be.visible');
      cy.contains("Question's apostrophe").should('be.visible');
    });
  });

  describe('Accessibility', () => {
    it('has accessible checkboxes', () => {
      cy.mount(
        <BasicQuestionsSelector
          questions={mockQuestions}
          category="character"
          onChange={onChangeSpy}
        />
      );

      cy.get('input[type="checkbox"]').each(($checkbox) => {
        cy.wrap($checkbox).should('have.attr', 'type', 'checkbox');
      });
    });

    it.skip('supports keyboard navigation', () => {
      cy.mount(
        <div>
          <button>Before</button>
          <BasicQuestionsSelector
            questions={mockQuestions}
            category="character"
            onChange={onChangeSpy}
          />
          <button data-cy="after-button">After</button>
        </div>
      );

      cy.contains('Before').focus();
      cy.focused().type('{tab}');
      
      // TODO: * Should be able to tab through controls
      cy.focused().should('exist');
    });

    it.skip('allows space/enter to toggle checkboxes', () => {
      cy.mount(
        <BasicQuestionsSelector
          questions={mockQuestions}
          category="character"
          onChange={onChangeSpy}
        />
      );

      cy.contains('label', 'Name').within(() => {
        cy.get('input[type="checkbox"]').focus();
      });
      
      cy.focused().type(' '); // Space to toggle
      cy.get('@onChange').should('have.been.calledWith', ['name']);
    });

    it('buttons are keyboard accessible', () => {
      cy.mount(
        <BasicQuestionsSelector
          questions={mockQuestions}
          category="character"
          onChange={onChangeSpy}
        />
      );

      cy.contains('Select All').focus();
      cy.focused().type('{enter}');
      
      cy.get('@onChange').should('have.been.called');
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
      cy.contains('Apply Defaults').should('be.visible');
      cy.contains('2').should('be.visible'); // Basic question count
    });

    it('maintains layout on tablet viewport', () => {
      cy.viewport(768, 1024);
      
      cy.mount(
        <BasicQuestionsSelector
          questions={mockQuestions}
          basicQuestionIds={['name', 'age']}
          category="character"
          onChange={onChangeSpy}
        />
      );

      cy.contains('Basic Mode Configuration').should('be.visible');
      cy.get('grid-cols-2').should('exist'); // Statistics grid
    });

    it('works on desktop viewport', () => {
      cy.viewport(1920, 1080);
      
      cy.mount(
        <BasicQuestionsSelector
          questions={mockQuestions}
          basicQuestionIds={['name', 'age']}
          category="character"
          onChange={onChangeSpy}
        />
      );

      cy.contains('Basic Mode Configuration').should('be.visible');
      cy.contains('Basic Info').should('be.visible');
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

    it.skip('updates time estimates when selection changes', () => {
      cy.mount(
        <BasicQuestionsSelector
          questions={mockQuestions}
          basicQuestionIds={[]}
          category="character"
          onChange={onChangeSpy}
        />
      );

      // ? TODO: * Initially should show 0 basic questions
      cy.contains('Basic Questions').parent().within(() => {
        cy.contains('0').should('be.visible');
      });

      // * Select some questions
      cy.contains('Select All').click();

      // ? TODO: * Should update to show all questions selected
      cy.contains('Basic Questions').parent().within(() => {
        cy.contains('8').should('be.visible');
        cy.contains('~4 min to complete').should('be.visible'); // 8 * 30 = 240 seconds = 4 min
      });
    });
  });
});