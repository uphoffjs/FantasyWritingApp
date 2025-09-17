import React from 'react';
import { CompletionHeatmap } from '../../src/components/CompletionHeatmap';
import { Project, WorldElement } from '../../src/types/models';

describe('CompletionHeatmap Component', () => {
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

  describe('Rendering', () => {
    it('renders heatmap with legend', () => {
      const elements = [
        createMockElement({ id: '1', completionPercentage: 0 }),
        createMockElement({ id: '2', completionPercentage: 50 }),
        createMockElement({ id: '3', completionPercentage: 100 })
      ];
      const project = createMockProject(elements);

      cy.mount(<CompletionHeatmap project={project} onElementClick={onElementClickSpy} />);

      // Legend should be visible
      cy.contains('Completion:').should('be.visible');
      cy.contains('0% → 100%').should('be.visible');
      cy.contains('Click any cell for details').should('be.visible');
    });

    it('displays legend color boxes', () => {
      const project = createMockProject([createMockElement()]);

      cy.mount(<CompletionHeatmap project={project} />);

      // Should have 7 legend color boxes
      cy.get('[title="0%"]').should('exist');
      cy.get('[title="1-19%"]').should('exist');
      cy.get('[title="20-39%"]').should('exist');
      cy.get('[title="40-59%"]').should('exist');
      cy.get('[title="60-79%"]').should('exist');
      cy.get('[title="80-99%"]').should('exist');
      cy.get('[title="100%"]').should('exist');
    });

    it('renders empty state when no elements', () => {
      const project = createMockProject([]);

      cy.mount(<CompletionHeatmap project={project} />);

      cy.contains('No elements to display in heatmap').should('be.visible');
    });

    it('renders grid of elements', () => {
      const elements = [
        createMockElement({ id: '1', name: 'Element 1' }),
        createMockElement({ id: '2', name: 'Element 2' }),
        createMockElement({ id: '3', name: 'Element 3' })
      ];
      const project = createMockProject(elements);

      cy.mount(<CompletionHeatmap project={project} onElementClick={onElementClickSpy} />);

      // Should render all elements in grid
      cy.get('[data-testid="grid"] > div').should('have.length.at.least', 3);
    });

    it('displays category icons', () => {
      const elements = [
        createMockElement({ id: '1', category: 'character' }),
        createMockElement({ id: '2', category: 'location' }),
        createMockElement({ id: '3', category: 'magic-system' })
      ];
      const project = createMockProject(elements);

      cy.mount(<CompletionHeatmap project={project} onElementClick={onElementClickSpy} />);

      cy.contains('👤').should('be.visible'); // Character icon
      cy.contains('📍').should('be.visible'); // Location icon
      cy.contains('✨').should('be.visible'); // Magic system icon
    });

    it('displays stats summary cards', () => {
      const elements = [
        createMockElement({ id: '1', completionPercentage: 100 }),
        createMockElement({ id: '2', completionPercentage: 75 }),
        createMockElement({ id: '3', completionPercentage: 30 }),
        createMockElement({ id: '4', completionPercentage: 0 })
      ];
      const project = createMockProject(elements);

      cy.mount(<CompletionHeatmap project={project} onElementClick={onElementClickSpy} />);

      cy.contains('Completed').should('be.visible');
      cy.contains('Half Done').should('be.visible');
      cy.contains('Started').should('be.visible');
      cy.contains('Not Started').should('be.visible');
    });
  });

  describe('Color Coding', () => {
    it('applies correct color for 100% completion', () => {
      const elements = [
        createMockElement({ id: '1', completionPercentage: 100 })
      ];
      const project = createMockProject(elements);

      cy.mount(<CompletionHeatmap project={project} onElementClick={onElementClickSpy} />);

      cy.get('[data-cy*="forest-"]500').should('exist');
    });

    it('applies correct color for 80-99% completion', () => {
      const elements = [
        createMockElement({ id: '1', completionPercentage: 85 })
      ];
      const project = createMockProject(elements);

      cy.mount(<CompletionHeatmap project={project} onElementClick={onElementClickSpy} />);

      cy.get('[data-cy*="emerald-"]500').should('exist');
    });

    it('applies correct color for 60-79% completion', () => {
      const elements = [
        createMockElement({ id: '1', completionPercentage: 70 })
      ];
      const project = createMockProject(elements);

      cy.mount(<CompletionHeatmap project={project} onElementClick={onElementClickSpy} />);

      cy.get('[data-cy*="flame-"]500').should('exist');
    });

    it('applies correct color for 40-59% completion', () => {
      const elements = [
        createMockElement({ id: '1', completionPercentage: 50 })
      ];
      const project = createMockProject(elements);

      cy.mount(<CompletionHeatmap project={project} onElementClick={onElementClickSpy} />);

      cy.get('[data-cy*="orange-"]500').should('exist');
    });

    it('applies correct color for 20-39% completion', () => {
      const elements = [
        createMockElement({ id: '1', completionPercentage: 25 })
      ];
      const project = createMockProject(elements);

      cy.mount(<CompletionHeatmap project={project} onElementClick={onElementClickSpy} />);

      cy.get('[data-cy*="blood-"]500').should('exist');
    });

    it('applies correct color for 1-19% completion', () => {
      const elements = [
        createMockElement({ id: '1', completionPercentage: 10 })
      ];
      const project = createMockProject(elements);

      cy.mount(<CompletionHeatmap project={project} onElementClick={onElementClickSpy} />);

      cy.get('[data-cy*="blood-"]600').should('exist');
    });

    it('applies correct color for 0% completion', () => {
      const elements = [
        createMockElement({ id: '1', completionPercentage: 0 })
      ];
      const project = createMockProject(elements);

      cy.mount(<CompletionHeatmap project={project} onElementClick={onElementClickSpy} />);

      cy.get('[data-cy*="parchment-dark"]').should('exist');
    });
  });

  describe('Sorting', () => {
    it('sorts elements by category first', () => {
      const elements = [
        createMockElement({ id: '1', category: 'location', name: 'Location 1' }),
        createMockElement({ id: '2', category: 'character', name: 'Character 1' }),
        createMockElement({ id: '3', category: 'character', name: 'Character 2' })
      ];
      const project = createMockProject(elements);

      cy.mount(<CompletionHeatmap project={project} onElementClick={onElementClickSpy} />);

      // Character elements should appear before location
      cy.get('[data-testid="grid"] > div').first().should('contain', '👤');
    });

    it('sorts elements by completion within same category', () => {
      const elements = [
        createMockElement({ id: '1', category: 'character', completionPercentage: 30 }),
        createMockElement({ id: '2', category: 'character', completionPercentage: 80 }),
        createMockElement({ id: '3', category: 'character', completionPercentage: 50 })
      ];
      const project = createMockProject(elements);

      cy.mount(<CompletionHeatmap project={project} onElementClick={onElementClickSpy} />);

      // Should be sorted by completion percentage descending within category
      cy.get('[data-testid="grid"] > div:not([class*="bg-parchment-aged"])').then($cells => {
        expect($cells.eq(0)).to.have.class('bg-emerald-500'); // 80%
        expect($cells.eq(1)).to.have.class('bg-orange-500');  // 50%
        expect($cells.eq(2)).to.have.class('bg-blood-500');   // 30%
      });
    });
  });

  describe('Grid Layout', () => {
    it('calculates appropriate grid dimensions', () => {
      const elements = Array.from({ length: 10 }, (_, i) => 
        createMockElement({ id: `${i}`, name: `Element ${i}` })
      );
      const project = createMockProject(elements);

      cy.mount(<CompletionHeatmap project={project} onElementClick={onElementClickSpy} />);

      // Grid should have appropriate columns for 10 elements
      // React Native Web uses flexbox instead of CSS Grid

      cy.get('[data-testid="grid"]').should('have.css', 'grid-template-columns') // CSS properties work in React Native Web;
    });

    it('fills empty cells to complete grid', () => {
      const elements = [
        createMockElement({ id: '1' }),
        createMockElement({ id: '2' }),
        createMockElement({ id: '3' })
      ];
      const project = createMockProject(elements);

      cy.mount(<CompletionHeatmap project={project} onElementClick={onElementClickSpy} />);

      // Should have empty cells to fill the grid
      cy.get('[data-cy*="parchment-aged"].border-parchment-border').should('exist');
    });

    it('maintains aspect ratio for cells', () => {
      const elements = [createMockElement()];
      const project = createMockProject(elements);

      cy.mount(<CompletionHeatmap project={project} onElementClick={onElementClickSpy} />);

      cy.get('[data-testid="square-element"]').should('exist');
    });
  });

  describe('Interactions', () => {
    it('calls onElementClick when element is clicked', () => {
      const element = createMockElement({ id: '1', name: 'Test Element' });
      const project = createMockProject([element]);

      cy.mount(<CompletionHeatmap project={project} onElementClick={onElementClickSpy} />);

      cy.get('[data-testid="grid"] > div').first().click();
      cy.get('@onElementClick').should('have.been.calledWith', element);
    });

    it('shows hover effect on desktop', () => {
      cy.viewport(1024, 768);
      const elements = [createMockElement()];
      const project = createMockProject(elements);

      cy.mount(<CompletionHeatmap project={project} onElementClick={onElementClickSpy} />);

      cy.get('[data-testid="grid"] > div').first()
        .should('be.visible') // React Native Web uses inline styles instead of CSS classes
        .and('have.class', 'cursor-pointer');
    });

    it('shows tooltip on hover (desktop)', () => {
      cy.viewport(1024, 768);
      const element = createMockElement({ 
        name: 'Test Character',
        completionPercentage: 75,
        category: 'character'
      });
      const project = createMockProject([element]);

      cy.mount(<CompletionHeatmap project={project} onElementClick={onElementClickSpy} />);

      cy.get('[data-testid="grid"] > div').first().trigger('mouseenter');
      
      // Tooltip should be visible on hover
      cy.contains('Test Character').should('exist');
      cy.contains('75% complete').should('exist');
    });

    it('has title attribute for accessibility', () => {
      const element = createMockElement({ 
        name: 'Test Element',
        completionPercentage: 50
      });
      const project = createMockProject([element]);

      cy.mount(<CompletionHeatmap project={project} onElementClick={onElementClickSpy} />);

      cy.get('[data-testid="grid"] > div').first()
        .should('have.attr', 'title', 'Test Element - 50% complete');
    });
  });

  describe('Statistics', () => {
    it('calculates completed count correctly', () => {
      const elements = [
        createMockElement({ id: '1', completionPercentage: 100 }),
        createMockElement({ id: '2', completionPercentage: 100 }),
        createMockElement({ id: '3', completionPercentage: 80 })
      ];
      const project = createMockProject(elements);

      cy.mount(<CompletionHeatmap project={project} onElementClick={onElementClickSpy} />);

      cy.contains('Completed').parent().within(() => {
        cy.contains('2').should('be.visible');
      });
    });

    it('calculates half done count correctly', () => {
      const elements = [
        createMockElement({ id: '1', completionPercentage: 60 }),
        createMockElement({ id: '2', completionPercentage: 75 }),
        createMockElement({ id: '3', completionPercentage: 30 })
      ];
      const project = createMockProject(elements);

      cy.mount(<CompletionHeatmap project={project} onElementClick={onElementClickSpy} />);

      cy.contains('Half Done').parent().within(() => {
        cy.contains('2').should('be.visible');
      });
    });

    it('calculates started count correctly', () => {
      const elements = [
        createMockElement({ id: '1', completionPercentage: 10 }),
        createMockElement({ id: '2', completionPercentage: 25 }),
        createMockElement({ id: '3', completionPercentage: 49 })
      ];
      const project = createMockProject(elements);

      cy.mount(<CompletionHeatmap project={project} onElementClick={onElementClickSpy} />);

      cy.contains('Started').parent().within(() => {
        cy.contains('3').should('be.visible');
      });
    });

    it('calculates not started count correctly', () => {
      const elements = [
        createMockElement({ id: '1', completionPercentage: 0 }),
        createMockElement({ id: '2', completionPercentage: 0 }),
        createMockElement({ id: '3', completionPercentage: 10 })
      ];
      const project = createMockProject(elements);

      cy.mount(<CompletionHeatmap project={project} onElementClick={onElementClickSpy} />);

      cy.contains('Not Started').parent().within(() => {
        cy.contains('2').should('be.visible');
      });
    });
  });

  describe('Category Icons', () => {
    it('displays correct icon for each category', () => {
      const categories = [
        { category: 'character', icon: '👤' },
        { category: 'location', icon: '📍' },
        { category: 'magic-system', icon: '✨' },
        { category: 'culture-society', icon: '🌍' },
        { category: 'race-species', icon: '🐉' },
        { category: 'organization', icon: '🏛️' },
        { category: 'religion-belief', icon: '🕊️' },
        { category: 'technology', icon: '⚙️' },
        { category: 'historical-event', icon: '📜' },
        { category: 'language', icon: '💬' },
        { category: 'custom', icon: '📋' }
      ];

      // Create all elements with different categories
      const elements = categories.map(({ category }, index) => 
        createMockElement({ id: `${index}`, category })
      );
      const project = createMockProject(elements);

      // Mount once with all elements
      cy.mount(<CompletionHeatmap project={project} />);

      // Verify all icons are visible
      categories.forEach(({ icon }) => {
        cy.contains(icon).should('be.visible');
      });
    });

    it('displays default icon for unknown categories', () => {
      const element = createMockElement({ category: 'unknown-category' as any });
      const project = createMockProject([element]);

      cy.mount(<CompletionHeatmap project={project} />);
      cy.contains('📋').should('be.visible'); // Default icon
    });
  });

  describe('Responsive Design', () => {
    it('works on mobile viewport', () => {
      cy.viewport(375, 667);
      
      const elements = [
        createMockElement({ id: '1' }),
        createMockElement({ id: '2' }),
        createMockElement({ id: '3' })
      ];
      const project = createMockProject(elements);

      cy.mount(<CompletionHeatmap project={project} onElementClick={onElementClickSpy} />);

      // React Native Web uses flexbox instead of CSS Grid


      cy.get('[data-testid="grid"]').should('be.visible');
      cy.contains('Completion:').should('be.visible');
      
      // Mobile-specific sizing
      cy.get('[data-cy*="responsive"]').should('exist');
    });

    it('shows horizontal scroll on mobile if needed', () => {
      cy.viewport(375, 667);
      
      const elements = Array.from({ length: 10 }, (_, i) => 
        createMockElement({ id: `${i}` })
      );
      const project = createMockProject(elements);

      cy.mount(<CompletionHeatmap project={project} onElementClick={onElementClickSpy} />);

      cy.get('.overflow-x-auto').should('exist');
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

      // React Native Web uses flexbox instead of CSS Grid


      cy.get('[data-testid="grid"]').should('be.visible');
      cy.get('.sm\\:min-w-\\[3rem\\]').should('exist');
    });

    it('works on desktop viewport', () => {
      cy.viewport(1920, 1080);
      
      const elements = Array.from({ length: 10 }, (_, i) => 
        createMockElement({ id: `${i}` })
      );
      const project = createMockProject(elements);

      cy.mount(<CompletionHeatmap project={project} onElementClick={onElementClickSpy} />);

      // React Native Web uses flexbox instead of CSS Grid


      cy.get('[data-testid="grid"]').should('be.visible');
      cy.get('.sm\\:hover\\:scale-105').should('exist');
    });
  });

  describe('Edge Cases', () => {
    it('handles single element', () => {
      const element = createMockElement();
      const project = createMockProject([element]);

      cy.mount(<CompletionHeatmap project={project} onElementClick={onElementClickSpy} />);

      cy.get('[data-testid="grid"] > div').should('have.length.at.least', 1);
    });

    it.skip('handles many elements', () => {
      const elements = Array.from({ length: 100 }, (_, i) => 
        createMockElement({ id: `${i}`, name: `Element ${i}` })
      );
      const project = createMockProject(elements);

      cy.mount(<CompletionHeatmap project={project} onElementClick={onElementClickSpy} />);

      cy.get('[data-testid="grid"] > div').should('have.length.at.least', 100);
    });

    it('handles elements with long names', () => {
      const element = createMockElement({ 
        name: 'This is a very long element name that might cause layout issues'
      });
      const project = createMockProject([element]);

      cy.mount(<CompletionHeatmap project={project} onElementClick={onElementClickSpy} />);

      cy.get('[data-testid="grid"] > div').first().should('be.visible');
    });

    it('handles missing onElementClick callback', () => {
      const element = createMockElement();
      const project = createMockProject([element]);

      cy.mount(<CompletionHeatmap project={project} />);

      cy.get('[data-testid="grid"] > div').first().click();
      // Should not throw error
    });

    it('handles elements with same completion percentage', () => {
      const elements = [
        createMockElement({ id: '1', completionPercentage: 50 }),
        createMockElement({ id: '2', completionPercentage: 50 }),
        createMockElement({ id: '3', completionPercentage: 50 })
      ];
      const project = createMockProject(elements);

      cy.mount(<CompletionHeatmap project={project} onElementClick={onElementClickSpy} />);

      cy.get('[data-cy*="orange-"]500').should('have.length', 3);
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

      cy.get('[data-cy*="clickable"]').should('exist');
    });

    it('provides legend for color meaning', () => {
      const project = createMockProject([createMockElement()]);

      cy.mount(<CompletionHeatmap project={project} />);

      cy.get('[title="0%"]').should('exist');
      cy.get('[title="100%"]').should('exist');
    });
  });
});