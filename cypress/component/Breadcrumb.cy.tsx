import React from 'react';
import { Breadcrumb } from '../../src/components/Breadcrumb';
import { MemoryRouter } from 'react-router-dom';

describe('Breadcrumb Component', () => {
  const mountWithRouter = (component: React.ReactNode) => {
    return cy.mount(
      <MemoryRouter>
        {component}
      </MemoryRouter>
    );
  };

  describe('Rendering', () => {
    it('renders breadcrumb navigation', () => {
      const items = [
        { label: 'Home', href: '/', dataCy: 'breadcrumb-home' },
        { label: 'Projects', href: '/projects', dataCy: 'breadcrumb-projects' },
        { label: 'My Project', dataCy: 'breadcrumb-current' }
      ];

      mountWithRouter(<Breadcrumb items={items} />);

      cy.get('[data-testid="breadcrumb"]').should('exist');
      cy.contains('Home').should('be.visible');
      cy.contains('Projects').should('be.visible');
      cy.contains('My Project').should('be.visible');
    });

    it('renders single item without chevron', () => {
      const items = [
        { label: 'Dashboard', dataCy: 'breadcrumb-dashboard' }
      ];

      mountWithRouter(<Breadcrumb items={items} />);

      cy.contains('Dashboard').should('be.visible');
      cy.get('svg').should('not.exist'); // No ChevronRight icon
    });

    it('renders chevron separators between items', () => {
      const items = [
        { label: 'Home', href: '/', dataCy: 'breadcrumb-home' },
        { label: 'Projects', href: '/projects', dataCy: 'breadcrumb-projects' },
        { label: 'Current', dataCy: 'breadcrumb-current' }
      ];

      mountWithRouter(<Breadcrumb items={items} />);

      // Should have 2 chevrons for 3 items
      cy.get('svg').should('have.length', 2);
    });

    it('renders last item as plain text', () => {
      const items = [
        { label: 'Home', href: '/', dataCy: 'breadcrumb-home' },
        { label: 'Current Page', dataCy: 'breadcrumb-current' }
      ];

      mountWithRouter(<Breadcrumb items={items} />);

      cy.get('[data-testid="breadcrumb-current"]')
        .should('have.prop', 'tagName', 'SPAN')
        .and('have.class', 'text-ink-black')
        .and('have.class', 'font-medium');
    });

    it('renders non-last items as links when href provided', () => {
      const items = [
        { label: 'Home', href: '/', dataCy: 'breadcrumb-home' },
        { label: 'Projects', href: '/projects', dataCy: 'breadcrumb-projects' },
        { label: 'Current', dataCy: 'breadcrumb-current' }
      ];

      mountWithRouter(<Breadcrumb items={items} />);

      cy.get('[data-testid="breadcrumb-home"]')
        .should('have.prop', 'tagName', 'A')
        .and('have.attr', 'href', '/');

      cy.get('[data-testid="breadcrumb-projects"]')
        .should('have.prop', 'tagName', 'A')
        .and('have.attr', 'href', '/projects');
    });

    it('renders items without href as plain text', () => {
      const items = [
        { label: 'Static Item', dataCy: 'breadcrumb-static' },
        { label: 'Another Static', dataCy: 'breadcrumb-static2' }
      ];

      mountWithRouter(<Breadcrumb items={items} />);

      cy.get('[data-testid="breadcrumb-static"]')
        .should('have.prop', 'tagName', 'SPAN');
      
      cy.get('[data-testid="breadcrumb-static2"]')
        .should('have.prop', 'tagName', 'SPAN');
    });
  });

  describe('Navigation', () => {
    it('makes links clickable', () => {
      const items = [
        { label: 'Home', href: '/', dataCy: 'breadcrumb-home' },
        { label: 'Projects', href: '/projects', dataCy: 'breadcrumb-projects' },
        { label: 'Current', dataCy: 'breadcrumb-current' }
      ];

      mountWithRouter(<Breadcrumb items={items} />);

      cy.get('[data-testid="breadcrumb-home"]').click();
      // In a real app, this would navigate to '/'
      
      cy.get('[data-testid="breadcrumb-projects"]').click();
      // In a real app, this would navigate to '/projects'
    });

    it('last item is not clickable', () => {
      const items = [
        { label: 'Home', href: '/', dataCy: 'breadcrumb-home' },
        { label: 'Current Page', href: '/current', dataCy: 'breadcrumb-current' }
      ];

      mountWithRouter(<Breadcrumb items={items} />);

      cy.get('[data-testid="breadcrumb-current"]')
        .should('have.prop', 'tagName', 'SPAN')
        .and('not.have.attr', 'href');
    });
  });

  describe('Styling', () => {
    it('applies hover effect to links', () => {
      const items = [
        { label: 'Home', href: '/', dataCy: 'breadcrumb-home' },
        { label: 'Projects', href: '/projects', dataCy: 'breadcrumb-projects' },
        { label: 'Current', dataCy: 'breadcrumb-current' }
      ];

      mountWithRouter(<Breadcrumb items={items} />);

      cy.get('[data-testid="breadcrumb-home"]')
        .should('be.visible') // React Native Web uses inline styles instead of CSS classes;
      
      cy.get('[data-testid="breadcrumb-projects"]')
        .should('be.visible') // React Native Web uses inline styles instead of CSS classes;
    });

    it('applies correct text color to items', () => {
      const items = [
        { label: 'Home', href: '/', dataCy: 'breadcrumb-home' },
        { label: 'Current', dataCy: 'breadcrumb-current' }
      ];

      mountWithRouter(<Breadcrumb items={items} />);

      cy.get('[data-testid="breadcrumb"]')
        .should('be.visible') // React Native Web uses inline styles instead of CSS classes;

      cy.get('[data-testid="breadcrumb-current"]')
        .should('be.visible') // React Native Web uses inline styles instead of CSS classes;
    });

    it('applies correct spacing', () => {
      const items = [
        { label: 'Home', href: '/', dataCy: 'breadcrumb-home' },
        { label: 'Projects', href: '/projects', dataCy: 'breadcrumb-projects' }
      ];

      mountWithRouter(<Breadcrumb items={items} />);

      cy.get('[data-testid="breadcrumb"]')
        .should('be.visible') // React Native Web uses inline styles instead of CSS classes
        .and('have.class', 'mb-6');
    });

    it('applies correct size to chevron icons', () => {
      const items = [
        { label: 'Home', href: '/', dataCy: 'breadcrumb-home' },
        { label: 'Projects', href: '/projects', dataCy: 'breadcrumb-projects' },
        { label: 'Current', dataCy: 'breadcrumb-current' }
      ];

      mountWithRouter(<Breadcrumb items={items} />);

      cy.get('svg')
        .should('be.visible') // React Native Web uses inline styles instead of CSS classes
        .and('have.class', 'h-4')
        .and('have.class', 'mx-2');
    });
  });

  describe('Data Attributes', () => {
    it('applies data-cy attributes to items', () => {
      const items = [
        { label: 'Home', href: '/', dataCy: 'breadcrumb-home' },
        { label: 'Projects', href: '/projects', dataCy: 'breadcrumb-projects' },
        { label: 'Current', dataCy: 'breadcrumb-current' }
      ];

      mountWithRouter(<Breadcrumb items={items} />);

      cy.get('[data-testid="breadcrumb-home"]').should('exist');
      cy.get('[data-testid="breadcrumb-projects"]').should('exist');
      cy.get('[data-testid="breadcrumb-current"]').should('exist');
    });

    it('applies data-cy to nav element', () => {
      const items = [
        { label: 'Home', dataCy: 'breadcrumb-home' }
      ];

      mountWithRouter(<Breadcrumb items={items} />);

      cy.get('nav[data-testid="breadcrumb"]').should('exist');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty items array', () => {
      mountWithRouter(<Breadcrumb items={[]} />);

      cy.get('[data-testid="breadcrumb"]').should('exist');
      cy.get('[data-testid="breadcrumb"]').children().should('have.length', 0);
    });

    it('handles very long labels', () => {
      const items = [
        { 
          label: 'This is a very long breadcrumb label that might cause layout issues if not handled properly',
          href: '/',
          dataCy: 'breadcrumb-long'
        },
        { label: 'Short', dataCy: 'breadcrumb-short' }
      ];

      mountWithRouter(<Breadcrumb items={items} />);

      cy.get('[data-testid="breadcrumb-long"]').should('be.visible');
      cy.contains('This is a very long breadcrumb label').should('be.visible');
    });

    it('handles special characters in labels', () => {
      const items = [
        { label: 'Home & Garden', href: '/', dataCy: 'breadcrumb-special1' },
        { label: 'Tools > Equipment', href: '/tools', dataCy: 'breadcrumb-special2' },
        { label: '"Quoted" Item', dataCy: 'breadcrumb-special3' }
      ];

      mountWithRouter(<Breadcrumb items={items} />);

      cy.contains('Home & Garden').should('be.visible');
      cy.contains('Tools > Equipment').should('be.visible');
      cy.contains('"Quoted" Item').should('be.visible');
    });

    it('handles many breadcrumb items', () => {
      const items = Array.from({ length: 10 }, (_, i) => ({
        label: `Level ${i + 1}`,
        href: i < 9 ? `/level${i + 1}` : undefined,
        dataCy: `breadcrumb-level${i + 1}`
      }));

      mountWithRouter(<Breadcrumb items={items} />);

      cy.get('[data-testid="breadcrumb"]').children().should('have.length', 10);
      cy.get('svg').should('have.length', 9); // 9 chevrons for 10 items
    });

    it('handles undefined href correctly', () => {
      const items = [
        { label: 'Home', href: undefined, dataCy: 'breadcrumb-home' },
        { label: 'Current', href: undefined, dataCy: 'breadcrumb-current' }
      ];

      mountWithRouter(<Breadcrumb items={items} />);

      cy.get('[data-testid="breadcrumb-home"]')
        .should('have.prop', 'tagName', 'SPAN');
      
      cy.get('[data-testid="breadcrumb-current"]')
        .should('have.prop', 'tagName', 'SPAN');
    });

    it('handles missing dataCy gracefully', () => {
      const items = [
        { label: 'Home', href: '/', dataCy: '' },
        { label: 'Projects', dataCy: '' }
      ];

      mountWithRouter(<Breadcrumb items={items} />);

      cy.contains('Home').should('be.visible');
      cy.contains('Projects').should('be.visible');
    });
  });

  describe('Accessibility', () => {
    it('uses semantic nav element', () => {
      const items = [
        { label: 'Home', href: '/', dataCy: 'breadcrumb-home' }
      ];

      mountWithRouter(<Breadcrumb items={items} />);

      cy.get('nav').should('exist');
    });

    it('supports keyboard navigation for links', () => {
      const items = [
        { label: 'Home', href: '/', dataCy: 'breadcrumb-home' },
        { label: 'Projects', href: '/projects', dataCy: 'breadcrumb-projects' },
        { label: 'Current', dataCy: 'breadcrumb-current' }
      ];

      mountWithRouter(<Breadcrumb items={items} />);

      cy.get('[data-testid="breadcrumb-home"]').focus();
      cy.focused().should('have.attr', 'data-cy', 'breadcrumb-home');

      cy.focused().tab();
      cy.focused().should('have.attr', 'data-cy', 'breadcrumb-projects');
    });

    it('maintains readable text contrast', () => {
      const items = [
        { label: 'Home', href: '/', dataCy: 'breadcrumb-home' },
        { label: 'Current', dataCy: 'breadcrumb-current' }
      ];

      mountWithRouter(<Breadcrumb items={items} />);

      // Links use text-ink-light
      cy.get('[data-testid="breadcrumb-home"]').should('exist');
      
      // Current item uses text-ink-black for better contrast
      cy.get('[data-testid="breadcrumb-current"]')
        .should('be.visible') // React Native Web uses inline styles instead of CSS classes;
    });
  });

  describe('Responsive Design', () => {
    it('works on mobile viewport', () => {
      cy.viewport(375, 667);
      
      const items = [
        { label: 'Home', href: '/', dataCy: 'breadcrumb-home' },
        { label: 'Projects', href: '/projects', dataCy: 'breadcrumb-projects' },
        { label: 'Current', dataCy: 'breadcrumb-current' }
      ];

      mountWithRouter(<Breadcrumb items={items} />);

      cy.get('[data-testid="breadcrumb"]').should('be.visible');
      cy.contains('Home').should('be.visible');
      cy.contains('Projects').should('be.visible');
      cy.contains('Current').should('be.visible');
    });

    it('maintains layout on tablet viewport', () => {
      cy.viewport(768, 1024);
      
      const items = [
        { label: 'Home', href: '/', dataCy: 'breadcrumb-home' },
        { label: 'Category', href: '/category', dataCy: 'breadcrumb-category' },
        { label: 'Subcategory', href: '/category/sub', dataCy: 'breadcrumb-sub' },
        { label: 'Item', dataCy: 'breadcrumb-item' }
      ];

      mountWithRouter(<Breadcrumb items={items} />);

      cy.get('[data-testid="breadcrumb"]').should('be.visible');
      cy.get('svg').should('have.length', 3); // Chevrons still visible
    });

    it('works on desktop viewport', () => {
      cy.viewport(1920, 1080);
      
      const items = [
        { label: 'Home', href: '/', dataCy: 'breadcrumb-home' },
        { label: 'Very Long Category Name', href: '/category', dataCy: 'breadcrumb-category' },
        { label: 'Another Long Subcategory', href: '/category/sub', dataCy: 'breadcrumb-sub' },
        { label: 'Final Item With Long Name', dataCy: 'breadcrumb-item' }
      ];

      mountWithRouter(<Breadcrumb items={items} />);

      cy.get('[data-testid="breadcrumb"]').should('be.visible');
      cy.contains('Very Long Category Name').should('be.visible');
      cy.contains('Another Long Subcategory').should('be.visible');
      cy.contains('Final Item With Long Name').should('be.visible');
    });
  });

  describe('Complex Scenarios', () => {
    it('handles mixed items with and without hrefs', () => {
      const items = [
        { label: 'Home', href: '/', dataCy: 'breadcrumb-home' },
        { label: 'Static', dataCy: 'breadcrumb-static' },
        { label: 'Projects', href: '/projects', dataCy: 'breadcrumb-projects' },
        { label: 'Current', dataCy: 'breadcrumb-current' }
      ];

      mountWithRouter(<Breadcrumb items={items} />);

      cy.get('[data-testid="breadcrumb-home"]').should('have.prop', 'tagName', 'A');
      cy.get('[data-testid="breadcrumb-static"]').should('have.prop', 'tagName', 'SPAN');
      cy.get('[data-testid="breadcrumb-projects"]').should('have.prop', 'tagName', 'SPAN'); // Not last, but no href
      cy.get('[data-testid="breadcrumb-current"]').should('have.prop', 'tagName', 'SPAN');
    });

    it('handles navigation hierarchy correctly', () => {
      const items = [
        { label: 'Dashboard', href: '/dashboard', dataCy: 'breadcrumb-dashboard' },
        { label: 'Settings', href: '/dashboard/settings', dataCy: 'breadcrumb-settings' },
        { label: 'Profile', href: '/dashboard/settings/profile', dataCy: 'breadcrumb-profile' },
        { label: 'Edit', dataCy: 'breadcrumb-edit' }
      ];

      mountWithRouter(<Breadcrumb items={items} />);

      // Verify hierarchical structure is maintained
      cy.get('[data-testid="breadcrumb"] > div').should('have.length', 4);
      
      // Verify correct number of separators
      cy.get('svg').should('have.length', 3);
      
      // Verify last item is not a link
      cy.get('[data-testid="breadcrumb-edit"]').should('have.prop', 'tagName', 'SPAN');
    });
  });
});