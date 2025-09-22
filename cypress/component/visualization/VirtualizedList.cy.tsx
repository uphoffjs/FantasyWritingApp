import React from 'react';
import { VirtualizedList, useVirtualizedList } from '../../support/component-test-helpersVirtualizedList';

// * Test component using the hook
function TestComponentWithHook({ items }: { items: string[] }) {
  const { containerRef, virtualizedListProps } = useVirtualizedList(items, 50);
  
  return (
    <div ref={containerRef} style={{ height: 400 }}>
      <VirtualizedList
        {...virtualizedListProps}
        renderItem={(item) => <div>{item}</div>}
      />
    </div>
  );
}

describe('VirtualizedList Component', () => {
  // * Helper to create test items
  const createItems = (count: number) => 
    Array.from({ length: count }, (_, i) => `Item ${i + 1}`);

  describe('Rendering', () => {
    it('renders visible items only', () => {
      const items = createItems(100);
      cy.mount(
        <VirtualizedList
          items={items}
          itemHeight={50}
          containerHeight={200}
          renderItem={(item) => <div data-testid="list-item">{item}</div>}
        />
      );
      
      // ? TODO: * With containerHeight=200 and itemHeight=50, should show ~4 items + overscan
      cy.get('[data-testid="list-item"]').should('have.length.lessThan', 15);
      cy.get('[data-testid="list-item"]').first().should('contain', 'Item 1');
    });

    it('renders with custom className', () => {
      const items = createItems(10);
      cy.mount(
        <VirtualizedList
          items={items}
          itemHeight={50}
          containerHeight={200}
          renderItem={(item) => <div>{item}</div>}
          className="custom-class"
        />
      );
      
      cy.get('.custom-class').should('exist');
      cy.get('.overflow-y-auto').should('be.visible') // React Native Web uses inline styles instead of CSS classes;
    });

    it('sets correct container height', () => {
      const items = createItems(10);
      cy.mount(
        <VirtualizedList
          items={items}
          itemHeight={50}
          containerHeight={300}
          renderItem={(item) => <div>{item}</div>}
        />
      );
      
      cy.get('.overflow-y-auto').should('have.css', 'height', '300px') // CSS properties work in React Native Web;
    });

    it('calculates total height correctly', () => {
      const items = createItems(50);
      const itemHeight = 40;
      cy.mount(
        <VirtualizedList
          items={items}
          itemHeight={itemHeight}
          containerHeight={200}
          renderItem={(item) => <div>{item}</div>}
        />
      );
      
      // TODO: * Total height should be items.length * itemHeight
      cy.get('.overflow-y-auto > div')
        .should('have.css', 'height', `${50 * itemHeight}px`);
    });
  });

  describe('Scrolling', () => {
    it('updates visible items on scroll', () => {
      const items = createItems(100);
      cy.mount(
        <VirtualizedList
          items={items}
          itemHeight={50}
          containerHeight={200}
          renderItem={(item) => <div data-testid="list-item">{item}</div>}
        />
      );
      
      // ? TODO: * Initially should show first items
      cy.get('[data-testid="list-item"]').first().should('contain', 'Item 1');
      
      // * Scroll down
      cy.get('.overflow-y-auto').scrollTo(0, 500);
      
      // ? TODO: * Should now show different items
      cy.get('[data-testid="list-item"]').first().should('not.contain', 'Item 1');
      cy.get('[data-testid="list-item"]').should('contain', 'Item 10');
    });

    it('maintains correct number of rendered items during scroll', () => {
      const items = createItems(100);
      cy.mount(
        <VirtualizedList
          items={items}
          itemHeight={50}
          containerHeight={200}
          overscan={2}
          renderItem={(item) => <div data-testid="list-item">{item}</div>}
        />
      );
      
      // * Check initial render count
      cy.get('[data-testid="list-item"]').then($items => {
        const initialCount = $items.length;
        
        // * Scroll and check count remains reasonable
        cy.get('.overflow-y-auto').scrollTo(0, 1000);
        cy.get('[data-testid="list-item"]').should('have.length.lessThan', initialCount + 5);
      });
    });

    it('handles scroll to bottom', () => {
      const items = createItems(50);
      cy.mount(
        <VirtualizedList
          items={items}
          itemHeight={50}
          containerHeight={200}
          renderItem={(item) => <div data-testid="list-item">{item}</div>}
        />
      );
      
      // * Scroll to bottom
      cy.get('.overflow-y-auto').scrollTo('bottom');
      
      // ? TODO: * Should show last items
      cy.get('[data-testid="list-item"]').last().should('contain', 'Item 50');
    });

    it('handles scroll to top after scrolling down', () => {
      const items = createItems(50);
      cy.mount(
        <VirtualizedList
          items={items}
          itemHeight={50}
          containerHeight={200}
          renderItem={(item) => <div data-testid="list-item">{item}</div>}
        />
      );
      
      // * Scroll down then back up
      cy.get('.overflow-y-auto').scrollTo(0, 1000);
      cy.get('.overflow-y-auto').scrollTo('top');
      
      // ? TODO: * Should show first items again
      cy.get('[data-testid="list-item"]').first().should('contain', 'Item 1');
    });
  });

  describe('Overscan', () => {
    it('renders extra items with default overscan', () => {
      const items = createItems(100);
      cy.mount(
        <VirtualizedList
          items={items}
          itemHeight={50}
          containerHeight={200}
          renderItem={(item) => <div data-testid="list-item">{item}</div>}
        />
      );
      
      // TODO: * Should render visible items (4) + overscan (3 above + 3 below)
      cy.get('[data-testid="list-item"]').should('have.length.at.least', 4);
      cy.get('[data-testid="list-item"]').should('have.length.at.most', 10);
    });

    it('respects custom overscan value', () => {
      const items = createItems(100);
      cy.mount(
        <VirtualizedList
          items={items}
          itemHeight={50}
          containerHeight={100} // Shows 2 items
          overscan={5}
          renderItem={(item) => <div data-testid="list-item">{item}</div>}
        />
      );
      
      // TODO: * Should render visible items (2) + overscan (5 above + 5 below, capped by bounds)
      cy.get('[data-testid="list-item"]').should('have.length.at.least', 2);
      cy.get('[data-testid="list-item"]').should('have.length.at.most', 12);
    });

    it('handles zero overscan', () => {
      const items = createItems(100);
      cy.mount(
        <VirtualizedList
          items={items}
          itemHeight={50}
          containerHeight={150} // Shows exactly 3 items
          overscan={0}
          renderItem={(item) => <div data-testid="list-item">{item}</div>}
        />
      );
      
      // TODO: * Should render exactly visible items with no overscan
      cy.get('[data-testid="list-item"]').should('have.length', 3);
    });
  });

  describe('Custom Key Function', () => {
    it('uses default index-based keys', () => {
      const items = createItems(5);
      cy.mount(
        <VirtualizedList
          items={items}
          itemHeight={50}
          containerHeight={200}
          renderItem={(item) => <div data-testid="list-item">{item}</div>}
        />
      );
      
      // TODO: * Items should render without key warnings (check console is clean)
      cy.get('[data-testid="list-item"]').should('have.length.at.least', 4);
    });

    it('uses custom key function', () => {
      interface TestItem {
        id: string;
        name: string;
      }
      
      const items: TestItem[] = Array.from({ length: 10 }, (_, i) => ({
        id: `id-${i}`,
        name: `Item ${i + 1}`
      }));
      
      cy.mount(
        <VirtualizedList
          items={items}
          itemHeight={50}
          containerHeight={200}
          getItemKey={(item) => item.id}
          renderItem={(item) => <div data-testid="list-item">{item.name}</div>}
        />
      );
      
      cy.get('[data-testid="list-item"]').should('exist');
      cy.get('[data-testid="list-item"]').first().should('contain', 'Item 1');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty items array', () => {
      cy.mount(
        <VirtualizedList
          items={[]}
          itemHeight={50}
          containerHeight={200}
          renderItem={(item) => <div>{item}</div>}
        />
      );
      
      cy.get('.overflow-y-auto').should('exist');
      cy.get('.overflow-y-auto > div').should('have.css', 'height', '0px') // CSS properties work in React Native Web;
    });

    it('handles single item', () => {
      const items = ['Single Item'];
      cy.mount(
        <VirtualizedList
          items={items}
          itemHeight={50}
          containerHeight={200}
          renderItem={(item) => <div data-testid="list-item">{item}</div>}
        />
      );
      
      cy.get('[data-testid="list-item"]').should('have.length', 1);
      cy.get('[data-testid="list-item"]').should('contain', 'Single Item');
    });

    it('handles items shorter than container', () => {
      const items = createItems(3);
      cy.mount(
        <VirtualizedList
          items={items}
          itemHeight={50}
          containerHeight={500} // Much taller than 3 items
          renderItem={(item) => <div data-testid="list-item">{item}</div>}
        />
      );
      
      // TODO: * Should render all items
      cy.get('[data-testid="list-item"]').should('have.length', 3);
    });

    it('handles very large item count', () => {
      const items = createItems(10000);
      cy.mount(
        <VirtualizedList
          items={items}
          itemHeight={50}
          containerHeight={400}
          renderItem={(item) => <div data-testid="list-item">{item}</div>}
        />
      );
      
      // TODO: * Should still only render visible items
      cy.get('[data-testid="list-item"]').should('have.length.lessThan', 20);
      
      // TODO: * Should be able to scroll to bottom
      cy.get('.overflow-y-auto').scrollTo('bottom');
      cy.get('[data-testid="list-item"]').last().should('contain', 'Item 10000');
    });

    it('handles rapid scrolling', () => {
      const items = createItems(100);
      cy.mount(
        <VirtualizedList
          items={items}
          itemHeight={50}
          containerHeight={200}
          renderItem={(item) => <div data-testid="list-item">{item}</div>}
        />
      );
      
      // * Rapidly scroll multiple times
      cy.get('.overflow-y-auto').scrollTo(0, 500);
      cy.get('.overflow-y-auto').scrollTo(0, 1000);
      cy.get('.overflow-y-auto').scrollTo(0, 200);
      cy.get('.overflow-y-auto').scrollTo(0, 1500);
      
      // TODO: * Should still render correctly
      cy.get('[data-testid="list-item"]').should('exist');
      cy.get('[data-testid="list-item"]').should('have.length.lessThan', 15);
    });
  });

  describe('useVirtualizedList Hook', () => {
    it('provides container ref and height', () => {
      const items = createItems(10);
      cy.mount(<TestComponentWithHook items={items} />);
      
      // TODO: * Component should render with hook
      cy.get('.overflow-y-auto').should('exist');
      cy.get('.overflow-y-auto').should('have.css', 'height') // CSS properties work in React Native Web;
    });

    it('updates height on window resize', () => {
      const items = createItems(10);
      cy.mount(<TestComponentWithHook items={items} />);
      
      // * Get initial height
      cy.get('.overflow-y-auto').then($el => {
        const initialHeight = $el.height();
        
        // * Trigger resize
        cy.viewport(800, 600);
        cy.wait(100);
        
        // * Height might change based on container
        cy.get('.overflow-y-auto').should('have.css', 'height') // CSS properties work in React Native Web;
      });
    });

    it('provides correct props to VirtualizedList', () => {
      const items = createItems(20);
      cy.mount(<TestComponentWithHook items={items} />);
      
      // TODO: * Should render items
      cy.get('.overflow-y-auto').should('exist');
      cy.contains('Item 1').should('be.visible');
    });
  });

  describe('Performance', () => {
    it('only re-renders visible items on scroll', () => {
      const items = createItems(1000);
      let renderCount = 0;
      
      cy.mount(
        <VirtualizedList
          items={items}
          itemHeight={50}
          containerHeight={200}
          renderItem={(item) => {
            renderCount++;
            return <div data-testid="list-item">{item}</div>;
          }}
        />
      );
      
      cy.then(() => {
        const initialRenderCount = renderCount;
        expect(initialRenderCount).to.be.lessThan(20);
        
        // * Scroll and check render count
        cy.get('.overflow-y-auto').scrollTo(0, 500);
        
        cy.then(() => {
          // TODO: * Should have rendered some new items but not all
          expect(renderCount).to.be.lessThan(initialRenderCount + 20);
        });
      });
    });

    it('maintains smooth scrolling with many items', () => {
      const items = createItems(5000);
      cy.mount(
        <VirtualizedList
          items={items}
          itemHeight={50}
          containerHeight={400}
          renderItem={(item) => <div data-testid="list-item">{item}</div>}
        />
      );
      
      // * Scroll through large list
      cy.get('.overflow-y-auto').scrollTo(0, 10000);
      cy.get('.overflow-y-auto').scrollTo(0, 50000);
      cy.get('.overflow-y-auto').scrollTo(0, 100000);
      
      // TODO: * Should maintain reasonable render count
      cy.get('[data-testid="list-item"]').should('have.length.lessThan', 20);
    });
  });

  describe('Accessibility', () => {
    it('maintains scroll position for keyboard navigation', () => {
      const items = createItems(50);
      cy.mount(
        <VirtualizedList
          items={items}
          itemHeight={50}
          containerHeight={200}
          renderItem={(item, index) => (
            <[data-cy*="button"] data-testid="list-item" tabIndex={0}>
              {item}
            </[data-cy*="button"]>
          )}
        />
      );
      
      // TODO: * Should be able to tab through visible items
      cy.get('[data-testid="list-item"]').first().focus();
      cy.get('[data-testid="list-item"]').first().should('have.focus');
    });

    it('preserves ARIA attributes in rendered items', () => {
      const items = createItems(10);
      cy.mount(
        <VirtualizedList
          items={items}
          itemHeight={50}
          containerHeight={200}
          renderItem={(item, index) => (
            <div 
              data-testid="list-item"
              role="listitem"
              aria-label={item}
              aria-posinset={index + 1}
              aria-setsize={items.length}
            >
              {item}
            </div>
          )}
        />
      );
      
      cy.get('[data-testid="list-item"]').first()
        .should('have.attr', 'role', 'listitem')
        .and('have.attr', 'aria-label', 'Item 1')
        .and('have.attr', 'aria-posinset', '1');
    });
  });

  describe('Responsive Design', () => {
    it('works on mobile viewport', () => {
      cy.viewport(375, 667);
      const items = createItems(50);
      
      cy.mount(
        <VirtualizedList
          items={items}
          itemHeight={50}
          containerHeight={400}
          renderItem={(item) => <div data-testid="list-item">{item}</div>}
        />
      );
      
      cy.get('[data-testid="list-item"]').should('exist');
      cy.get('.overflow-y-auto').scrollTo(0, 500);
      cy.get('[data-testid="list-item"]').should('contain', 'Item 10');
    });

    it('works on tablet viewport', () => {
      cy.viewport(768, 1024);
      const items = createItems(50);
      
      cy.mount(
        <VirtualizedList
          items={items}
          itemHeight={50}
          containerHeight={600}
          renderItem={(item) => <div data-testid="list-item">{item}</div>}
        />
      );
      
      cy.get('[data-testid="list-item"]').should('exist');
      cy.get('.overflow-y-auto').should('have.css', 'height', '600px') // CSS properties work in React Native Web;
    });
  });
});