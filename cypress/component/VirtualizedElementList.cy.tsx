import React from 'react';
import { VirtualizedElementList } from '../../src/components/VirtualizedElementList';
import { WorldElement } from '../../src/types/models';

// Mock react-window
const mockFixedSizeList = ({ children, itemData, itemCount, itemSize, height }: any) => {
  const items = [];
  for (let i = 0; i < Math.min(itemCount, 10); i++) { // Limit to 10 for testing
    items.push(
      <div key={i} style={{ height: itemSize }}>
        {children({ index: i, style: { height: itemSize }, data: itemData })}
      </div>
    );
  }
  return <div style={{ height }} className="scrollbar-thin scrollbar-thumb-dark-600 scrollbar-track-dark-800">{items}</div>;
};

jest.mock('react-window', () => ({
  FixedSizeList: mockFixedSizeList
}));

// Mock ElementCard component
jest.mock('../../src/components/ElementCard', () => ({
  ElementCard: ({ element, onClick }: any) => (
    <div 
      data-cy="element-card" 
      data-element-id={element.id}
      onClick={() => onClick()}
      className="element-card"
    >
      <div data-cy="element-name">{element.name}</div>
      <div data-cy="element-category">{element.category}</div>
      <div data-cy="element-completion">{element.completionPercentage}%</div>
    </div>
  )
}));

// Helper function to create mock elements
const createMockElement = (id: string, overrides?: Partial<WorldElement>): WorldElement => ({
  id,
  name: `Element ${id}`,
  category: 'character',
  type: 'character',
  projectId: 'project-1',
  questions: [],
  answers: {},
  completionPercentage: 50,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  tags: [],
  linkedElements: [],
  customFields: {},
  ...overrides
});

describe('VirtualizedElementList Component', () => {
  const onElementClickSpy = cy.spy().as('onElementClick');

  beforeEach(() => {
    onElementClickSpy.resetHistory();
    cy.viewport(1200, 800);
  });

  describe('Rendering', () => {
    it('renders elements in virtualized list', () => {
      const elements = Array.from({ length: 10 }, (_, i) => 
        createMockElement(`${i + 1}`)
      );
      
      cy.mount(
        <VirtualizedElementList
          elements={elements}
          onElementClick={onElementClickSpy}
        />
      );
      
      cy.get('[data-testid="element-card"]').should('exist');
      cy.get('[data-testid="element-name"]').first().should('contain', 'Element 1');
    });

    it('renders with custom height', () => {
      const elements = Array.from({ length: 5 }, (_, i) => 
        createMockElement(`${i + 1}`)
      );
      
      cy.mount(
        <VirtualizedElementList
          elements={elements}
          onElementClick={onElementClickSpy}
          height={400}
        />
      );
      
      cy.get('.scrollbar-thin').should('have.css', 'height', '400px');
    });

    it('applies correct CSS classes for scrollbar', () => {
      const elements = Array.from({ length: 5 }, (_, i) => 
        createMockElement(`${i + 1}`)
      );
      
      cy.mount(
        <VirtualizedElementList
          elements={elements}
          onElementClick={onElementClickSpy}
        />
      );
      
      cy.get('.scrollbar-thin').should('exist');
      cy.get('.scrollbar-thumb-dark-600').should('exist');
      cy.get('.scrollbar-track-dark-800').should('exist');
    });
  });

  describe('Empty States', () => {
    it('shows empty state when no elements', () => {
      cy.mount(
        <VirtualizedElementList
          elements={[]}
          onElementClick={onElementClickSpy}
        />
      );
      
      cy.contains('No elements yet').should('be.visible');
      cy.contains('Create your first element to get started').should('be.visible');
    });

    it('shows search empty state with query', () => {
      cy.mount(
        <VirtualizedElementList
          elements={[]}
          onElementClick={onElementClickSpy}
          searchQuery="dragon"
        />
      );
      
      cy.contains('No elements found matching "dragon"').should('be.visible');
      cy.contains('Try adjusting your search or filters').should('be.visible');
    });

    it('handles null elements array', () => {
      cy.mount(
        <VirtualizedElementList
          elements={null as any}
          onElementClick={onElementClickSpy}
        />
      );
      
      cy.contains('No elements yet').should('be.visible');
    });

    it('handles undefined elements array', () => {
      cy.mount(
        <VirtualizedElementList
          elements={undefined as any}
          onElementClick={onElementClickSpy}
        />
      );
      
      cy.contains('No elements yet').should('be.visible');
    });
  });

  describe('Element Interaction', () => {
    it('calls onElementClick when element is clicked', () => {
      const elements = [createMockElement('1')];
      
      cy.mount(
        <VirtualizedElementList
          elements={elements}
          onElementClick={onElementClickSpy}
        />
      );
      
      cy.get('[data-testid="element-card"]').first().click();
      cy.get('@onElementClick').should('have.been.calledWith', '1');
    });

    it('handles clicks on multiple elements', () => {
      const elements = Array.from({ length: 5 }, (_, i) => 
        createMockElement(`${i + 1}`)
      );
      
      cy.mount(
        <VirtualizedElementList
          elements={elements}
          onElementClick={onElementClickSpy}
        />
      );
      
      cy.get('[data-testid="element-card"]').eq(0).click();
      cy.get('@onElementClick').should('have.been.calledWith', '1');
      
      cy.get('[data-testid="element-card"]').eq(2).click();
      cy.get('@onElementClick').should('have.been.calledWith', '3');
    });
  });

  describe('Grid Layout', () => {
    it('calculates columns based on container width', () => {
      const elements = Array.from({ length: 9 }, (_, i) => 
        createMockElement(`${i + 1}`)
      );
      
      // Wide viewport should show multiple columns
      cy.viewport(1400, 800);
      cy.mount(
        <VirtualizedElementList
          elements={elements}
          onElementClick={onElementClickSpy}
        />
      );
      
      // Check that elements are arranged in rows
      cy.get('.flex.gap-4').should('exist');
    });

    it('adjusts columns on narrow viewport', () => {
      const elements = Array.from({ length: 6 }, (_, i) => 
        createMockElement(`${i + 1}`)
      );
      
      // Narrow viewport should show fewer columns
      cy.viewport(400, 800);
      cy.mount(
        <VirtualizedElementList
          elements={elements}
          onElementClick={onElementClickSpy}
        />
      );
      
      cy.get('[data-testid="element-card"]').should('exist');
    });

    it('fills empty slots in incomplete rows', () => {
      const elements = Array.from({ length: 7 }, (_, i) => 
        createMockElement(`${i + 1}`)
      );
      
      cy.viewport(1200, 800);
      cy.mount(
        <VirtualizedElementList
          elements={elements}
          onElementClick={onElementClickSpy}
        />
      );
      
      // Should have empty divs to maintain grid alignment
      cy.get('.flex.gap-4').should('exist');
    });
  });

  describe('Performance', () => {
    it('handles large number of elements', () => {
      const elements = Array.from({ length: 1000 }, (_, i) => 
        createMockElement(`${i + 1}`)
      );
      
      cy.mount(
        <VirtualizedElementList
          elements={elements}
          onElementClick={onElementClickSpy}
        />
      );
      
      // Should render without crashing
      cy.get('[data-testid="element-card"]').should('exist');
    });

    it('renders only visible rows', () => {
      const elements = Array.from({ length: 100 }, (_, i) => 
        createMockElement(`${i + 1}`)
      );
      
      cy.mount(
        <VirtualizedElementList
          elements={elements}
          onElementClick={onElementClickSpy}
          height={400}
        />
      );
      
      // Due to virtualization, not all 100 elements should be in DOM
      cy.get('[data-testid="element-card"]').should('have.length.lessThan', 100);
    });
  });

  describe('Window Resize', () => {
    it('recalculates columns on window resize', () => {
      const elements = Array.from({ length: 12 }, (_, i) => 
        createMockElement(`${i + 1}`)
      );
      
      cy.viewport(1200, 800);
      cy.mount(
        <VirtualizedElementList
          elements={elements}
          onElementClick={onElementClickSpy}
        />
      );
      
      // Initial render
      cy.get('[data-testid="element-card"]').should('exist');
      
      // Resize viewport
      cy.viewport(600, 800);
      cy.wait(100);
      
      // Should still render correctly
      cy.get('[data-testid="element-card"]').should('exist');
    });
  });

  describe('Error Handling', () => {
    it('falls back to non-virtualized rendering on error', () => {
      // Force an error by providing invalid data structure
      const elements = [createMockElement('1')];
      
      // This should trigger the try-catch fallback
      cy.mount(
        <VirtualizedElementList
          elements={elements}
          onElementClick={onElementClickSpy}
          height={-1} // Invalid height
        />
      );
      
      // Should still render elements (might use fallback)
      cy.get('[data-testid="element-card"]').should('exist');
    });

    it('handles elements with missing properties gracefully', () => {
      const elements = [
        createMockElement('1', { name: undefined as any }),
        createMockElement('2')
      ];
      
      cy.mount(
        <VirtualizedElementList
          elements={elements}
          onElementClick={onElementClickSpy}
        />
      );
      
      // Should render without crashing
      cy.get('[data-testid="element-card"]').should('have.length.at.least', 1);
    });
  });

  describe('Element Display', () => {
    it('displays element properties correctly', () => {
      const elements = [
        createMockElement('1', {
          name: 'Test Character',
          category: 'character',
          completionPercentage: 75
        })
      ];
      
      cy.mount(
        <VirtualizedElementList
          elements={elements}
          onElementClick={onElementClickSpy}
        />
      );
      
      cy.get('[data-testid="element-name"]').should('contain', 'Test Character');
      cy.get('[data-testid="element-category"]').should('contain', 'character');
      cy.get('[data-testid="element-completion"]').should('contain', '75%');
    });

    it('displays multiple element types', () => {
      const elements = [
        createMockElement('1', { category: 'character' }),
        createMockElement('2', { category: 'location' }),
        createMockElement('3', { category: 'item-object' })
      ];
      
      cy.mount(
        <VirtualizedElementList
          elements={elements}
          onElementClick={onElementClickSpy}
        />
      );
      
      cy.get('[data-testid="element-category"]').eq(0).should('contain', 'character');
      cy.get('[data-testid="element-category"]').eq(1).should('contain', 'location');
      cy.get('[data-testid="element-category"]').eq(2).should('contain', 'item-object');
    });
  });

  describe('Accessibility', () => {
    it('maintains focus on clicked elements', () => {
      const elements = Array.from({ length: 5 }, (_, i) => 
        createMockElement(`${i + 1}`)
      );
      
      cy.mount(
        <VirtualizedElementList
          elements={elements}
          onElementClick={onElementClickSpy}
        />
      );
      
      cy.get('[data-testid="element-card"]').first().click();
      // Focus should be manageable
      cy.focused().should('exist');
    });

    it('preserves element order for keyboard navigation', () => {
      const elements = Array.from({ length: 5 }, (_, i) => 
        createMockElement(`${i + 1}`)
      );
      
      cy.mount(
        <VirtualizedElementList
          elements={elements}
          onElementClick={onElementClickSpy}
        />
      );
      
      // Elements should be in correct order
      cy.get('[data-testid="element-name"]').eq(0).should('contain', 'Element 1');
      cy.get('[data-testid="element-name"]').eq(1).should('contain', 'Element 2');
      cy.get('[data-testid="element-name"]').eq(2).should('contain', 'Element 3');
    });
  });

  describe('Responsive Design', () => {
    it('works on mobile viewport', () => {
      cy.viewport(375, 667);
      const elements = Array.from({ length: 6 }, (_, i) => 
        createMockElement(`${i + 1}`)
      );
      
      cy.mount(
        <VirtualizedElementList
          elements={elements}
          onElementClick={onElementClickSpy}
        />
      );
      
      cy.get('[data-testid="element-card"]').should('exist');
      cy.get('[data-testid="element-card"]').first().click();
      cy.get('@onElementClick').should('have.been.called');
    });

    it('works on tablet viewport', () => {
      cy.viewport(768, 1024);
      const elements = Array.from({ length: 9 }, (_, i) => 
        createMockElement(`${i + 1}`)
      );
      
      cy.mount(
        <VirtualizedElementList
          elements={elements}
          onElementClick={onElementClickSpy}
        />
      );
      
      cy.get('[data-testid="element-card"]').should('exist');
      cy.get('.flex.gap-4').should('exist');
    });

    it('works on desktop viewport', () => {
      cy.viewport(1920, 1080);
      const elements = Array.from({ length: 12 }, (_, i) => 
        createMockElement(`${i + 1}`)
      );
      
      cy.mount(
        <VirtualizedElementList
          elements={elements}
          onElementClick={onElementClickSpy}
        />
      );
      
      cy.get('[data-testid="element-card"]').should('exist');
      cy.get('.flex.gap-4').should('exist');
    });
  });
});