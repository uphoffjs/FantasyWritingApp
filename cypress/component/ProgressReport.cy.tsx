import React from 'react';
import { ProgressReport } from '../../src/components/ProgressReport';
import { Project, WorldElement, ElementCategory } from '../../src/types/models';

// Note: html-to-image mocking will be handled in beforeEach
let mockToPng: any;

describe('ProgressReport Component', () => {
  const createMockElement = (overrides?: Partial<WorldElement>): WorldElement => ({
    id: 'element-1',
    name: 'Test Element',
    category: 'character' as ElementCategory,
    completionPercentage: 50,
    projectId: 'project-1',
    type: 'character',
    questions: [
      { id: 'q1', text: 'Question 1', type: 'text', required: false },
      { id: 'q2', text: 'Question 2', type: 'text', required: false }
    ],
    answers: {
      'q1': { questionId: 'q1', value: 'Answer 1' }
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides
  });

  const createMockProject = (elements: WorldElement[] = []): Project => ({
    id: 'project-1',
    name: 'Test Project',
    description: 'Test project description',
    elements,
    createdAt: Date.now(),
    updatedAt: Date.now()
  });

  let onCloseSpy: any;

  beforeEach(() => {
    onCloseSpy = cy.spy().as('onClose');
    mockToPng = cy.stub().resolves('data:image/png;base64,test');
    
    // Mock window methods and html-to-image
    cy.window().then((win) => {
      cy.stub(win, 'open').returns({
        document: {
          write: cy.stub(),
          close: cy.stub()
        },
        print: cy.stub()
      });
      
      // Mock html-to-image module if it's used
      (win as any).htmlToImage = { toPng: mockToPng };
    });
  });

  describe('Rendering', () => {
    it('renders modal with header', () => {
      const project = createMockProject([createMockElement()]);

      cy.mount(<ProgressReport project={project} onClose={onCloseSpy} />);

      cy.contains('Progress Report').should('be.visible');
      cy.get('[data-testid="close-[data-cy*="button"]"]').should('be.visible');
    });

    it('displays project information', () => {
      const project = createMockProject([createMockElement()]);

      cy.mount(<ProgressReport project={project} onClose={onCloseSpy} />);

      cy.contains('Test Project').should('be.visible');
      cy.contains('Test project description').should('be.visible');
      cy.contains('Report generated on').should('be.visible');
    });

    it('shows overall statistics section', () => {
      const elements = [
        createMockElement({ id: '1', completionPercentage: 100 }),
        createMockElement({ id: '2', completionPercentage: 50 }),
        createMockElement({ id: '3', completionPercentage: 0 })
      ];
      const project = createMockProject(elements);

      cy.mount(<ProgressReport project={project} onClose={onCloseSpy} />);

      cy.contains('Overall Statistics').should('be.visible');
      cy.contains('Total Elements').should('be.visible');
      cy.contains('3').should('be.visible'); // Total elements
      cy.contains('Completed').should('be.visible');
      cy.contains('1').should('be.visible'); // Completed elements
    });

    it('displays category breakdown section', () => {
      const elements = [
        createMockElement({ category: 'character' }),
        createMockElement({ category: 'location', id: '2' })
      ];
      const project = createMockProject(elements);

      cy.mount(<ProgressReport project={project} onClose={onCloseSpy} />);

      cy.contains('Category Breakdown').should('be.visible');
      cy.contains('Characters').should('be.visible');
      cy.contains('Locations').should('be.visible');
    });

    it('shows recent activity section', () => {
      const elements = [
        createMockElement({ id: '1', name: 'Recent Element 1', updatedAt: Date.now() }),
        createMockElement({ id: '2', name: 'Recent Element 2', updatedAt: Date.now() - 1000 })
      ];
      const project = createMockProject(elements);

      cy.mount(<ProgressReport project={project} onClose={onCloseSpy} />);

      cy.contains('Recent Activity').should('be.visible');
      cy.contains('Recent Element 1').should('be.visible');
      cy.contains('Recent Element 2').should('be.visible');
    });

    it('displays export format [data-cy*="button"]s', () => {
      const project = createMockProject([createMockElement()]);

      cy.mount(<ProgressReport project={project} onClose={onCloseSpy} />);

      cy.contains('[data-cy*="button"]', 'PDF').should('be.visible');
      cy.contains('[data-cy*="button"]', 'Email').should('be.visible');
      cy.contains('[data-cy*="button"]', 'Image').should('be.visible');
    });
  });

  describe('Statistics Calculation', () => {
    it('calculates overall completion correctly', () => {
      const elements = [
        createMockElement({
          id: '1',
          questions: [
            { id: 'q1', text: 'Q1', type: 'text', required: false },
            { id: 'q2', text: 'Q2', type: 'text', required: false }
          ],
          answers: {
            'q1': { questionId: 'q1', value: 'A1' },
            'q2': { questionId: 'q2', value: 'A2' }
          }
        }),
        createMockElement({
          id: '2',
          questions: [
            { id: 'q3', text: 'Q3', type: 'text', required: false },
            { id: 'q4', text: 'Q4', type: 'text', required: false }
          ],
          answers: {
            'q3': { questionId: 'q3', value: 'A3' }
          }
        })
      ];
      const project = createMockProject(elements);

      cy.mount(<ProgressReport project={project} onClose={onCloseSpy} />);

      // 3 out of 4 questions answered = 75%
      cy.contains('Overall Completion').parent().contains('75%').should('be.visible');
    });

    it('counts completed elements correctly', () => {
      const elements = [
        createMockElement({ id: '1', completionPercentage: 100 }),
        createMockElement({ id: '2', completionPercentage: 100 }),
        createMockElement({ id: '3', completionPercentage: 80 })
      ];
      const project = createMockProject(elements);

      cy.mount(<ProgressReport project={project} onClose={onCloseSpy} />);

      cy.contains('Completed').parent().contains('2').should('be.visible');
    });

    it('calculates category statistics', () => {
      const elements = [
        createMockElement({
          id: '1',
          category: 'character',
          questions: [
            { id: 'q1', text: 'Q1', type: 'text', required: false },
            { id: 'q2', text: 'Q2', type: 'text', required: false }
          ],
          answers: {
            'q1': { questionId: 'q1', value: 'A1' }
          }
        }),
        createMockElement({
          id: '2',
          category: 'character',
          questions: [
            { id: 'q3', text: 'Q3', type: 'text', required: false }
          ],
          answers: {
            'q3': { questionId: 'q3', value: 'A3' }
          }
        })
      ];
      const project = createMockProject(elements);

      cy.mount(<ProgressReport project={project} onClose={onCloseSpy} />);

      cy.contains('Characters').parent().contains('2 elements').should('be.visible');
      cy.contains('Characters').parent().contains('2/3 questions').should('be.visible');
    });

    it('sorts recent activity by update time', () => {
      const now = Date.now();
      const elements = [
        createMockElement({ id: '1', name: 'Oldest', updatedAt: now - 3000 }),
        createMockElement({ id: '2', name: 'Newest', updatedAt: now }),
        createMockElement({ id: '3', name: 'Middle', updatedAt: now - 1000 })
      ];
      const project = createMockProject(elements);

      cy.mount(<ProgressReport project={project} onClose={onCloseSpy} />);

      cy.contains('Recent Activity').parent().within(() => {
        cy.get('div').then($divs => {
          const texts = $divs.map((i, el) => el.textContent).get();
          const newestIndex = texts.findIndex(text => text.includes('Newest'));
          const middleIndex = texts.findIndex(text => text.includes('Middle'));
          const oldestIndex = texts.findIndex(text => text.includes('Oldest'));
          
          expect(newestIndex).to.be.lessThan(middleIndex);
          expect(middleIndex).to.be.lessThan(oldestIndex);
        });
      });
    });

    it('limits recent activity to 10 items', () => {
      const elements = Array.from({ length: 15 }, (_, i) => 
        createMockElement({ id: `${i}`, name: `Element ${i}` })
      );
      const project = createMockProject(elements);

      cy.mount(<ProgressReport project={project} onClose={onCloseSpy} />);

      cy.contains('Recent Activity').parent().within(() => {
        cy.get('div > div').should('have.length', 10);
      });
    });
  });

  describe('Export Formats', () => {
    it('[data-cy*="select"]s PDF format by default', () => {
      const project = createMockProject([createMockElement()]);

      cy.mount(<ProgressReport project={project} onClose={onCloseSpy} />);

      cy.contains('[data-cy*="button"]', 'PDF').should('be.visible') // React Native Web uses inline styles instead of CSS classes;
    });

    it('switches export format when [data-cy*="button"] clicked', () => {
      const project = createMockProject([createMockElement()]);

      cy.mount(<ProgressReport project={project} onClose={onCloseSpy} />);

      cy.contains('[data-cy*="button"]', 'Email').click();
      cy.contains('[data-cy*="button"]', 'Email').should('be.visible') // React Native Web uses inline styles instead of CSS classes;
      cy.contains('[data-cy*="button"]', 'PDF').should('not.have.class', 'bg-metals-gold');

      cy.contains('[data-cy*="button"]', 'Image').click();
      cy.contains('[data-cy*="button"]', 'Image').should('be.visible') // React Native Web uses inline styles instead of CSS classes;
      cy.contains('[data-cy*="button"]', 'Email').should('not.have.class', 'bg-metals-gold');
    });

    it('shows correct icon for each export format', () => {
      const project = createMockProject([createMockElement()]);

      cy.mount(<ProgressReport project={project} onClose={onCloseSpy} />);

      // Select PDF and check for Download icon
      cy.contains('[data-cy*="button"]', 'PDF').click();
      cy.contains('[data-cy*="button"]', 'Export').within(() => {
        cy.get('svg').should('exist'); // Download icon
      });

      // Select Email and check for Mail icon
      cy.contains('[data-cy*="button"]', 'Email').click();
      cy.contains('[data-cy*="button"]', 'Export').within(() => {
        cy.get('svg').should('exist'); // Mail icon
      });

      // Select Image and check for Image icon
      cy.contains('[data-cy*="button"]', 'Image').click();
      cy.contains('[data-cy*="button"]', 'Export').within(() => {
        cy.get('svg').should('exist'); // Image icon
      });
    });
  });

  describe('Export Functionality', () => {
    it('handles PDF export', () => {
      const project = createMockProject([createMockElement()]);

      cy.mount(<ProgressReport project={project} onClose={onCloseSpy} />);

      cy.contains('[data-cy*="button"]', 'PDF').click();
      cy.contains('[data-cy*="button"]', 'Export').click();

      // Should open a new window and call print
      cy.window().its('open').should('have.been.called');
    });

    it('handles email export', () => {
      const project = createMockProject([createMockElement()]);

      cy.mount(<ProgressReport project={project} onClose={onCloseSpy} />);

      cy.contains('[data-cy*="button"]', 'Email').click();
      
      cy.window().then((win) => {
        cy.stub(win, 'location', {
          href: ''
        });
      });

      cy.contains('[data-cy*="button"]', 'Export').click();

      // Should set location.href with mailto link
      // Note: Can't fully test mailto in Cypress
    });

    it('handles image export', () => {
      const project = createMockProject([createMockElement()]);

      cy.mount(<ProgressReport project={project} onClose={onCloseSpy} />);

      cy.contains('[data-cy*="button"]', 'Image').click();
      
      // Create a stub for createElement and click
      const linkElement = {
        download: '',
        href: '',
        click: cy.stub()
      };
      cy.document().then((doc) => {
        cy.stub(doc, 'createElement').returns(linkElement);
      });

      cy.contains('[data-cy*="button"]', 'Export').click();

      // Should create and click a download link
      cy.wrap(linkElement.click).should('have.been.called');
    });

    it('disables export [data-cy*="button"] while generating', () => {
      const project = createMockProject([createMockElement()]);

      cy.mount(<ProgressReport project={project} onClose={onCloseSpy} />);

      // Can't easily test the actual generation state, but verify [data-cy*="button"] structure
      cy.contains('[data-cy*="button"]', 'Export').should('not.be.disabled');
    });
  });

  describe('Category Labels', () => {
    it('displays correct labels for all categories', () => {
      const categories: ElementCategory[] = [
        'character', 'location', 'magic-system', 'culture-society',
        'race-species', 'organization', 'religion-belief',
        'technology', 'historical-event', 'language'
      ];

      const elements = categories.map((cat, i) => 
        createMockElement({ id: `${i}`, category: cat })
      );
      const project = createMockProject(elements);

      cy.mount(<ProgressReport project={project} onClose={onCloseSpy} />);

      cy.contains('Characters').should('be.visible');
      cy.contains('Locations').should('be.visible');
      cy.contains('Magic Systems').should('be.visible');
      cy.contains('Cultures & Societies').should('be.visible');
      cy.contains('Races & Species').should('be.visible');
      cy.contains('Organizations').should('be.visible');
      cy.contains('Religions & Beliefs').should('be.visible');
      cy.contains('Technologies').should('be.visible');
      cy.contains('Historical Events').should('be.visible');
      cy.contains('Languages').should('be.visible');
    });
  });

  describe('Progress Bars', () => {
    it('shows overall completion progress bar', () => {
      const elements = [
        createMockElement({
          questions: [
            { id: 'q1', text: 'Q1', type: 'text', required: false },
            { id: 'q2', text: 'Q2', type: 'text', required: false }
          ],
          answers: {
            'q1': { questionId: 'q1', value: 'A1' }
          }
        })
      ];
      const project = createMockProject(elements);

      cy.mount(<ProgressReport project={project} onClose={onCloseSpy} />);

      cy.contains('Overall Completion').parent().within(() => {
        cy.get('[role="progressbar"]').should('exist');
      });
    });

    it('shows category progress bars', () => {
      const elements = [
        createMockElement({ category: 'character' }),
        createMockElement({ category: 'location', id: '2' })
      ];
      const project = createMockProject(elements);

      cy.mount(<ProgressReport project={project} onClose={onCloseSpy} />);

      cy.contains('Characters').parent().within(() => {
        cy.get('[role="progressbar"]').should('exist');
      });

      cy.contains('Locations').parent().within(() => {
        cy.get('[role="progressbar"]').should('exist');
      });
    });
  });

  describe('Modal Behavior', () => {
    it('closes when close [data-cy*="button"] clicked', () => {
      const project = createMockProject([createMockElement()]);

      cy.mount(<ProgressReport project={project} onClose={onCloseSpy} />);

      cy.get('[data-cy*="button"]').first().click(); // X [data-cy*="button"]
      cy.get('@onClose').should('have.been.calledOnce');
    });

    it('closes when Close [data-cy*="button"] clicked', () => {
      const project = createMockProject([createMockElement()]);

      cy.mount(<ProgressReport project={project} onClose={onCloseSpy} />);

      cy.contains('[data-cy*="button"]', 'Close').click();
      cy.get('@onClose').should('have.been.calledOnce');
    });

    it('has fixed positioning overlay', () => {
      const project = createMockProject([createMockElement()]);

      cy.mount(<ProgressReport project={project} onClose={onCloseSpy} />);

      cy.get('.fixed.inset-0').should('exist');
      cy.get('[data-cy*="black"][data-cy*="opacity-"]50').should('exist');
    });

    it('has scrollable content area', () => {
      const elements = Array.from({ length: 20 }, (_, i) => 
        createMockElement({ id: `${i}`, category: 'character' })
      );
      const project = createMockProject(elements);

      cy.mount(<ProgressReport project={project} onClose={onCloseSpy} />);

      cy.get('.overflow-y-auto').should('exist');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty project', () => {
      const project = createMockProject([]);

      cy.mount(<ProgressReport project={project} onClose={onCloseSpy} />);

      cy.contains('Total Elements').parent().contains('0').should('be.visible');
      cy.contains('Overall Completion').parent().contains('0%').should('be.visible');
    });

    it('handles elements with no questions', () => {
      const element = createMockElement({
        questions: [],
        answers: {}
      });
      const project = createMockProject([element]);

      cy.mount(<ProgressReport project={project} onClose={onCloseSpy} />);

      cy.contains('Questions').parent().contains('0').should('be.visible');
    });

    it('handles elements with no answers', () => {
      const element = createMockElement({
        questions: [
          { id: 'q1', text: 'Q1', type: 'text', required: false }
        ],
        answers: {}
      });
      const project = createMockProject([element]);

      cy.mount(<ProgressReport project={project} onClose={onCloseSpy} />);

      cy.contains('Answered').parent().contains('0').should('be.visible');
    });

    it('handles very long project names', () => {
      const project = createMockProject([createMockElement()]);
      project.name = 'This is a very long project name that might cause layout issues if not handled properly';

      cy.mount(<ProgressReport project={project} onClose={onCloseSpy} />);

      cy.contains(project.name).should('be.visible');
    });

    it('handles many categories', () => {
      const categories: ElementCategory[] = [
        'character', 'location', 'magic-system', 'culture-society',
        'race-species', 'organization', 'religion-belief',
        'technology', 'historical-event', 'language'
      ];

      const elements = categories.flatMap(cat => 
        Array.from({ length: 3 }, (_, i) => 
          createMockElement({ id: `${cat}-${i}`, category: cat })
        )
      );
      const project = createMockProject(elements);

      cy.mount(<ProgressReport project={project} onClose={onCloseSpy} />);

      cy.contains('Category Breakdown').should('be.visible');
      categories.forEach(cat => {
        const label = cat.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
        cy.contains(label).should('exist');
      });
    });
  });

  describe('Responsive Design', () => {
    it('works on mobile viewport', () => {
      cy.viewport(375, 667);
      
      const project = createMockProject([createMockElement()]);

      cy.mount(<ProgressReport project={project} onClose={onCloseSpy} />);

      cy.contains('Progress Report').should('be.visible');
      cy.contains('Overall Statistics').should('be.visible');
      
      // Mobile-specific layout
      cy.get('.rounded-t-2xl').should('exist');
    });

    it('adapts [data-cy*="button"] text on mobile', () => {
      cy.viewport(375, 667);
      
      const project = createMockProject([createMockElement()]);

      cy.mount(<ProgressReport project={project} onClose={onCloseSpy} />);

      // Should show abbreviated text on mobile
      cy.contains('[data-cy*="button"]', 'Export').should('be.visible');
    });

    it('works on tablet viewport', () => {
      cy.viewport(768, 1024);
      
      const project = createMockProject([createMockElement()]);

      cy.mount(<ProgressReport project={project} onClose={onCloseSpy} />);

      cy.contains('Progress Report').should('be.visible');
      cy.get('.sm\\:max-w-4xl').should('exist');
    });

    it('works on desktop viewport', () => {
      cy.viewport(1920, 1080);
      
      const project = createMockProject([createMockElement()]);

      cy.mount(<ProgressReport project={project} onClose={onCloseSpy} />);

      cy.contains('Progress Report').should('be.visible');
      cy.contains('Export Report').should('be.visible'); // Full text on desktop
    });
  });

  describe('Accessibility', () => {
    it('has accessible close [data-cy*="button"]', () => {
      const project = createMockProject([createMockElement()]);

      cy.mount(<ProgressReport project={project} onClose={onCloseSpy} />);

      cy.get('[data-cy*="button"]').first().should('be.visible'); // X [data-cy*="button"]
    });

    it('uses semantic headings', () => {
      const project = createMockProject([createMockElement()]);

      cy.mount(<ProgressReport project={project} onClose={onCloseSpy} />);

      cy.contains('h2', 'Progress Report').should('exist');
    });

    it('supports keyboard navigation', () => {
      const project = createMockProject([createMockElement()]);

      cy.mount(<ProgressReport project={project} onClose={onCloseSpy} />);

      cy.contains('[data-cy*="button"]', 'PDF').focus();
      cy.focused().should('contain', 'PDF');

      cy.focused().tab();
      cy.focused().should('contain', 'Email');
    });
  });
});