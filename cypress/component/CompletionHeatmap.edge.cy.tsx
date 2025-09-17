import React from 'react';
import { CompletionHeatmap } from '../../src/components/CompletionHeatmap';
import { Project, WorldElement } from '../../src/types/models';

describe('CompletionHeatmap Edge Cases & Accessibility', () => {
  const createMockElement = (overrides?: Partial<WorldElement>): WorldElement => ({
    id: 'element-1',
    name: 'Test Element',
    category: 'character',
    completionPercentage: 50,
    projectId: 'project-1',
    type: 'character',
    answers: {},
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides
  });

  const createMockProject = (elements: WorldElement[] = []): Project => ({
    id: 'project-1',
    name: 'Test Project',
    description: 'Test description',
    elements,
    createdAt: Date.now(),
    updatedAt: Date.now()
  });

  let onElementClickSpy: any;

  beforeEach(() => {
    onElementClickSpy = cy.spy().as('onElementClick');
  });

  describe('Edge Cases', () => {
    it('handles single element', () => {
      const element = createMockElement();
      const project = createMockProject([element]);

      cy.mount(<CompletionHeatmap project={project} onElementClick={onElementClickSpy} />);

      cy.get('.grid > div').should('have.length.at.least', 1);
    });

    it('handles elements with long names', () => {
      const element = createMockElement({ 
        name: 'This is a very long element name that might cause layout issues'
      });
      const project = createMockProject([element]);

      cy.mount(<CompletionHeatmap project={project} onElementClick={onElementClickSpy} />);

      cy.get('.grid > div').first().should('be.visible');
    });

    it('handles missing onElementClick callback', () => {
      const element = createMockElement();
      const project = createMockProject([element]);

      cy.mount(<CompletionHeatmap project={project} />);

      cy.get('.grid > div').first().click();
      // Should not throw error
    });

    it.skip('handles elements with same completion percentage', () => {
      const elements = [
        createMockElement({ id: '1', completionPercentage: 50 }),
        createMockElement({ id: '2', completionPercentage: 50 }),
        createMockElement({ id: '3', completionPercentage: 50 })
      ];
      const project = createMockProject(elements);

      cy.mount(<CompletionHeatmap project={project} onElementClick={onElementClickSpy} />);

      cy.get('.bg-orange-500').should('have.length', 3);
    });
  });

  describe('Accessibility', () => {
    it('provides title attributes for screen readers', () => {
      const element = createMockElement({ 
        name: 'Character Name',
        completionPercentage: 65
      });
      const project = createMockProject([element]);

      cy.mount(<CompletionHeatmap project={project} onElementClick={onElementClickSpy} />);

      cy.get('[title="Character Name - 65% complete"]').should('exist');
    });

    it('has clickable elements with cursor pointer', () => {
      const element = createMockElement();
      const project = createMockProject([element]);

      cy.mount(<CompletionHeatmap project={project} onElementClick={onElementClickSpy} />);

      cy.get('.cursor-pointer').should('exist');
    });

    it('provides legend for color meaning', () => {
      const project = createMockProject([createMockElement()]);

      cy.mount(<CompletionHeatmap project={project} />);

      cy.contains('Completion:').should('be.visible');
      cy.contains('0% → 100%').should('be.visible');
    });
  });

  describe('Responsive Design', () => {
    it.skip('works on mobile viewport', () => {
      cy.viewport(375, 667);
      
      const elements = [
        createMockElement({ id: '1' }),
        createMockElement({ id: '2' }),
        createMockElement({ id: '3' })
      ];
      const project = createMockProject(elements);

      cy.mount(<CompletionHeatmap project={project} onElementClick={onElementClickSpy} />);

      cy.get('.grid').should('be.visible');
      cy.contains('Completion:').should('be.visible');
      
      // Mobile-specific sizing
      cy.get('.min-w-[2.5rem]').should('exist');
    });

    it('hides tooltips on mobile', () => {
      cy.viewport(375, 667);
      
      const element = createMockElement({ name: 'Test' });
      const project = createMockProject([element]);

      cy.mount(<CompletionHeatmap project={project} onElementClick={onElementClickSpy} />);

      // Tooltip should be hidden on mobile
      cy.get('.hidden.sm\\:block').should('exist');
    });

    it('works on tablet viewport', () => {
      cy.viewport(768, 1024);
      
      const elements = [
        createMockElement({ id: '1' }),
        createMockElement({ id: '2' })
      ];
      const project = createMockProject(elements);

      cy.mount(<CompletionHeatmap project={project} onElementClick={onElementClickSpy} />);

      cy.get('.grid').should('be.visible');
      cy.get('.sm\\:min-w-\\[3rem\\]').should('exist');
    });

    it('works on desktop viewport', () => {
      cy.viewport(1920, 1080);
      
      const elements = Array.from({ length: 10 }, (_, i) => 
        createMockElement({ id: `${i}` })
      );
      const project = createMockProject(elements);

      cy.mount(<CompletionHeatmap project={project} onElementClick={onElementClickSpy} />);

      cy.get('.grid').should('be.visible');
      cy.get('.sm\\:hover\\:scale-105').should('exist');
    });
  });
});