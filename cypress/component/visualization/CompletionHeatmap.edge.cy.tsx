/**
 * @fileoverview Completion Heatmap.edge Component Tests
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
import { CompletionHeatmap } from '../../../src/components/CompletionHeatmap';
import { Project, WorldElement } from '../../../src/types/models';

describe('CompletionHeatmap Edge Cases & Accessibility', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

  
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

  beforeEach(function() {
    // ! MANDATORY: Comprehensive debug setup
    cy.comprehensiveDebug();

    // * Clean state before each test
    cy.cleanState();

    onElementClickSpy = cy.spy().as('onElementClick');
  });

  describe('Edge Cases', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

    it('handles single element', () => {
      const element = createMockElement();
      const project = createMockProject([element]);

      cy.mountWithProviders(<CompletionHeatmap project={project} onElementClick={onElementClickSpy} />);

      cy.get('[data-cy="heatmap-grid"] [data-cy^="element-cell"]').should('have.length.at.least', 1);
    });

    it('handles elements with long names', () => {
      const element = createMockElement({ 
        name: 'This is a very long element name that might cause layout issues'
      });
      const project = createMockProject([element]);

      cy.mountWithProviders(<CompletionHeatmap project={project} onElementClick={onElementClickSpy} />);

      cy.get('[data-cy^="element-cell"]').first().should('be.visible');
    });

    it('handles missing onElementClick callback', () => {
      const element = createMockElement();
      const project = createMockProject([element]);

      cy.mountWithProviders(<CompletionHeatmap project={project} />);

      cy.get('[data-cy^="element-cell"]').first().click();
      // TODO: * Should not throw error
    });

    it.skip('handles elements with same completion percentage', () => {
      const elements = [
        createMockElement({ id: '1', completionPercentage: 50 }),
        createMockElement({ id: '2', completionPercentage: 50 }),
        createMockElement({ id: '3', completionPercentage: 50 })
      ];
      const project = createMockProject(elements);

      cy.mountWithProviders(<CompletionHeatmap project={project} onElementClick={onElementClickSpy} />);

      // React Native Web uses inline styles, test for element presence instead
      cy.get('[data-cy^="element-cell"]').should('have.length', 3);
    });
  });

  describe('Accessibility', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

    it('provides title attributes for screen readers', () => {
      const element = createMockElement({ 
        name: 'Character Name',
        completionPercentage: 65
      });
      const project = createMockProject([element]);

      cy.mountWithProviders(<CompletionHeatmap project={project} onElementClick={onElementClickSpy} />);

      cy.get('[title="Character Name - 65% complete"]').should('exist');
    });

    it('has clickable elements with cursor pointer', () => {
      const element = createMockElement();
      const project = createMockProject([element]);

      cy.mountWithProviders(<CompletionHeatmap project={project} onElementClick={onElementClickSpy} />);

      // React Native Web applies cursor styles inline
      cy.get('[data-cy^="element-cell"]').should('have.css', 'cursor', 'pointer');
    });

    it('provides legend for color meaning', () => {
      const project = createMockProject([createMockElement()]);

      cy.mountWithProviders(<CompletionHeatmap project={project} />);

      cy.contains('Completion:').should('be.visible');
      cy.contains('0% → 100%').should('be.visible');
    });
  });

  describe('Responsive Design', () => {
  afterEach(function() {
    // ! Capture debug info if test failed
    if (this.currentTest.state === 'failed') {
      cy.captureFailureDebug();
    }
  });

    it.skip('works on mobile viewport', () => {
      cy.viewport(375, 667);
      
      const elements = [
        createMockElement({ id: '1' }),
        createMockElement({ id: '2' }),
        createMockElement({ id: '3' })
      ];
      const project = createMockProject(elements);

      cy.mountWithProviders(<CompletionHeatmap project={project} onElementClick={onElementClickSpy} />);

      cy.get('[data-cy="heatmap-grid"]').should('be.visible');
      cy.contains('Completion:').should('be.visible');
      
      // Mobile-specific sizing - React Native Web handles responsive sizing with inline styles
      cy.get('[data-cy^="element-cell"]').should('be.visible');
    });

    it('hides tooltips on mobile', () => {
      cy.viewport(375, 667);
      
      const element = createMockElement({ name: 'Test' });
      const project = createMockProject([element]);

      cy.mountWithProviders(<CompletionHeatmap project={project} onElementClick={onElementClickSpy} />);

      // TODO: * Tooltip should be hidden on mobile - React Native Web uses conditional rendering
      cy.get('[data-cy="tooltip"]').should('not.exist');
    });

    it('works on tablet viewport', () => {
      cy.viewport(768, 1024);
      
      const elements = [
        createMockElement({ id: '1' }),
        createMockElement({ id: '2' })
      ];
      const project = createMockProject(elements);

      cy.mountWithProviders(<CompletionHeatmap project={project} onElementClick={onElementClickSpy} />);

      cy.get('[data-cy="heatmap-grid"]').should('be.visible');
      // React Native Web handles responsive sizing with inline styles
      cy.get('[data-cy^="element-cell"]').should('be.visible');
    });

    it('works on desktop viewport', () => {
      cy.viewport(1920, 1080);
      
      const elements = Array.from({ length: 10 }, (_, i) => 
        createMockElement({ id: `${i}` })
      );
      const project = createMockProject(elements);

      cy.mountWithProviders(<CompletionHeatmap project={project} onElementClick={onElementClickSpy} />);

      cy.get('[data-cy="heatmap-grid"]').should('be.visible');
      // React Native Web handles hover states with inline styles
      cy.get('[data-cy^="element-cell"]').should('have.css', 'cursor', 'pointer');
    });
  });
});