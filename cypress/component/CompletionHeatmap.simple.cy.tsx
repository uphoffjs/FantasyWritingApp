import React from 'react';
import { CompletionHeatmap } from '../../src/components/CompletionHeatmap';
import { Project, WorldElement } from '../../src/types/models';

describe('CompletionHeatmap Simple Test', () => {
  it('renders without error', () => {
    const element: WorldElement = {
      id: 'element-1',
      name: 'Test Element',
      category: 'character',
      completionPercentage: 50,
      projectId: 'project-1',
      type: 'character',
      answers: {},
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    const project: Project = {
      id: 'project-1',
      name: 'Test Project',
      description: 'Test description',
      elements: [element],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    cy.mount(<CompletionHeatmap project={project} />);
    
    cy.contains('Completion:').should('be.visible');
  });
});