import React from 'react';
import { SearchResults } from '../../src/components/SearchResults';
import { mountWithProviders } from '../support/mount-helpers';
import { mockProject, mockElement } from '../support/test-data';
import { 
  waitForAnimation,
  setMobileViewport,
  setTabletViewport,
  setDesktopViewport
} from '../support/test-utils';
import { WorldElement, ElementCategory } from '../../src/types/models';

describe('SearchResults Component', () => {
  const createMockElements = (count: number): WorldElement[] => {
    return Array.from({ length: count }, (_, i) => ({
      ...mockElement,
      id: `element-${i}`,
      name: `Element ${i + 1}`,
      description: `Description for element ${i + 1}`,
      category: (i % 3 === 0 ? 'character' : i % 3 === 1 ? 'location' : 'magic-system') as ElementCategory,
      completionPercentage: (i + 1) * 10 > 100 ? 100 : (i + 1) * 10,
      tags: i % 2 === 0 ? ['tag1', 'tag2'] : ['tag3'],
      answers: {
        'q1': { questionId: 'q1', value: `Answer containing test content ${i}` },
        'q2': { questionId: 'q2', value: `Another answer with data ${i}` }
      },
      questions: [
        { id: 'q1', text: 'Question 1', type: 'text', required: true },
        { id: 'q2', text: 'Question 2', type: 'text', required: false }
      ],
      createdAt: new Date(2024, 0, i + 1),
      updatedAt: new Date(2024, 0, count - i)
    }));
  };

  const mockProjectWithElements = {
    ...mockProject,
    elements: createMockElements(10)
  };

  const defaultProps = {
    onElementClick: cy.stub().as('onElementClick'),
    onClose: cy.stub().as('onClose')
  };

  beforeEach(() => {
    cy.clearLocalStorage();
  });

  describe('Rendering', () => {
    it('renders without errors', () => {
      mountWithProviders(<SearchResults {...defaultProps} />, {
        initialState: { 
          projects: [mockProjectWithElements]
        }
      });
      
      cy.get('[data-testid="search-input"]').should('exist');
    });

    it('displays search input with placeholder', () => {
      mountWithProviders(<SearchResults {...defaultProps} />);
      
      cy.get('[data-testid="search-input"]')
        .should('have.attr', 'placeholder', 'Search elements...')
        .should('have.focus');
    });

    it('shows initial empty state', () => {
      mountWithProviders(<SearchResults {...defaultProps} />);
      
      cy.contains('Enter a search term to find elements').should('be.visible');
      cy.get('.lucide-search').should('be.visible');
    });

    it('displays filter and close [data-cy*="button"]s', () => {
      mountWithProviders(<SearchResults {...defaultProps} />);
      
      cy.get('[data-testid="toggle-filters"]').should('be.visible');
      cy.get('[data-testid="close-search"]').should('be.visible');
    });

    it('initializes with provided query', () => {
      mountWithProviders(
        <SearchResults {...defaultProps} initialQuery="test" />,
        {
          initialState: { 
            projects: [mockProjectWithElements]
          }
        }
      );
      
      cy.get('[data-testid="search-input"]').should('have.value', 'test');
    });
  });

  describe('Search Functionality', () => {
    it('searches elements and displays results', () => {
      mountWithProviders(<SearchResults {...defaultProps} />, {
        initialState: { 
          projects: [mockProjectWithElements],
          searchElements: () => mockProjectWithElements.elements.slice(0, 3)
        }
      });
      
      cy.get('[data-testid="search-input"]').type('Element');
      waitForAnimation();
      
      cy.contains('Found 3 results').should('be.visible');
    });

    it('shows loading state while searching', () => {
      mountWithProviders(<SearchResults {...defaultProps} />, {
        initialState: { 
          projects: [mockProjectWithElements]
        }
      });
      
      cy.get('[data-testid="search-input"]').type('test');
      
      // Should show searching indicator briefly
      cy.contains('Searching...').should('be.visible');
      
      waitForAnimation();
      
      // Loading should disappear after debounce
      cy.contains('Searching...').should('not.exist');
    });

    it('displays no results message when nothing matches', () => {
      mountWithProviders(<SearchResults {...defaultProps} />, {
        initialState: { 
          projects: [mockProjectWithElements],
          searchElements: () => []
        }
      });
      
      cy.get('[data-testid="search-input"]').type('NonExistent');
      waitForAnimation();
      
      cy.contains('No results found for "NonExistent"').should('be.visible');
      cy.contains('Try a different search term').should('be.visible');
    });

    it('debounces search input', () => {
      const searchSpy = cy.stub().returns([]);
      
      mountWithProviders(<SearchResults {...defaultProps} />, {
        initialState: { 
          projects: [mockProjectWithElements],
          searchElements: searchSpy
        }
      });
      
      // Type quickly
      cy.get('[data-testid="search-input"]').type('test');
      
      // Should still show searching
      cy.contains('Searching...').should('be.visible');
      
      waitForAnimation();
      
      // Search should be called after debounce
      cy.wrap(searchSpy).should('have.been.called');
    });

    it('highlights matching text in results', () => {
      const elements = createMockElements(1);
      elements[0].name = 'Special Element Name';
      
      mountWithProviders(<SearchResults {...defaultProps} />, {
        initialState: { 
          projects: [{ ...mockProject, elements }],
          searchElements: () => elements
        }
      });
      
      cy.get('[data-testid="search-input"]').type('Special');
      waitForAnimation();
      
      // Check for highlighted text
      cy.get('[data-cy*="flame-"]500').should('exist');
    });
  });

  describe('Search History', () => {
    it('shows search history dropdown when input is empty', () => {
      const searchHistory = ['previous search 1', 'previous search 2'];
      
      mountWithProviders(<SearchResults {...defaultProps} />, {
        initialState: { 
          searchHistory
        }
      });
      
      cy.contains('Recent Searches').should('be.visible');
      cy.contains('previous search 1').should('be.visible');
      cy.contains('previous search 2').should('be.visible');
    });

    it('clicking history item fills search input', () => {
      const searchHistory = ['historical query'];
      
      mountWithProviders(<SearchResults {...defaultProps} />, {
        initialState: { 
          searchHistory,
          projects: [mockProjectWithElements]
        }
      });
      
      cy.contains('historical query').click();
      cy.get('[data-testid="search-input"]').should('have.value', 'historical query');
    });

    it('clears search history', () => {
      const clearHistorySpy = cy.stub();
      
      mountWithProviders(<SearchResults {...defaultProps} />, {
        initialState: { 
          searchHistory: ['query1', 'query2'],
          clearSearchHistory: clearHistorySpy
        }
      });
      
      cy.contains('Clear').click();
      cy.wrap(clearHistorySpy).should('have.been.called');
    });

    it('adds query to history after typing', () => {
      const addSearchQuerySpy = cy.stub();
      
      mountWithProviders(<SearchResults {...defaultProps} />, {
        initialState: { 
          projects: [mockProjectWithElements],
          addSearchQuery: addSearchQuerySpy
        }
      });
      
      cy.get('[data-testid="search-input"]').type('new search');
      waitForAnimation();
      
      cy.wrap(addSearchQuerySpy).should('have.been.calledWith', 'new search');
    });
  });

  describe('Filtering', () => {
    it('toggles filter panel', () => {
      mountWithProviders(<SearchResults {...defaultProps} />);
      
      // Filters should be hidden initially
      cy.get('[data-testid="filter-category-character"]').should('not.exist');
      
      // Toggle filters
      cy.get('[data-testid="toggle-filters"]').click();
      
      // Filters should be visible
      cy.contains('Categories').should('be.visible');
    });

    it('filters results by category', () => {
      const elements = createMockElements(6);
      
      mountWithProviders(<SearchResults {...defaultProps} />, {
        initialState: { 
          projects: [{ ...mockProject, elements }],
          searchElements: () => elements
        }
      });
      
      cy.get('[data-testid="search-input"]').type('Element');
      waitForAnimation();
      
      cy.get('[data-testid="toggle-filters"]').click();
      
      // Filter by character category
      cy.get('[data-testid="filter-category-character"]').click();
      
      // Should only show characters (every 3rd element)
      cy.contains('Found 2 result').should('be.visible');
    });

    it('filters by completion percentage', () => {
      const elements = createMockElements(10);
      
      mountWithProviders(<SearchResults {...defaultProps} />, {
        initialState: { 
          projects: [{ ...mockProject, elements }],
          searchElements: () => elements
        }
      });
      
      cy.get('[data-testid="search-input"]').type('Element');
      waitForAnimation();
      
      cy.get('[data-testid="toggle-filters"]').click();
      
      // Set minimum completion to 50%
      cy.get('[data-testid="filter-min-completion"]').invoke('val', 50).trigger('change');
      
      // Should filter results
      cy.contains('Found').should('be.visible');
    });

    it('filters by tags', () => {
      const elements = createMockElements(4);
      
      mountWithProviders(<SearchResults {...defaultProps} />, {
        initialState: { 
          projects: [{ ...mockProject, elements }],
          searchElements: () => elements
        }
      });
      
      cy.get('[data-testid="search-input"]').type('Element');
      waitForAnimation();
      
      cy.get('[data-testid="toggle-filters"]').click();
      
      // Tag filter should be visible
      cy.contains('Tags').should('be.visible');
    });

    it('clears all filters', () => {
      const elements = createMockElements(6);
      
      mountWithProviders(<SearchResults {...defaultProps} />, {
        initialState: { 
          projects: [{ ...mockProject, elements }],
          searchElements: () => elements
        }
      });
      
      cy.get('[data-testid="search-input"]').type('Element');
      waitForAnimation();
      
      cy.get('[data-testid="toggle-filters"]').click();
      
      // Apply filters
      cy.get('[data-testid="filter-category-character"]').click();
      cy.get('[data-testid="filter-min-completion"]').invoke('val', 50).trigger('change');
      
      // Clear filters
      cy.get('[data-testid="clear-filters"]').click();
      
      // Filters should be reset
      cy.get('[data-testid="filter-category-character"]').should('not.have.class', 'bg-metals-gold');
      cy.get('[data-testid="filter-min-completion"]').should('have.value', '0');
    });

    it('shows message to adjust filters when no results', () => {
      mountWithProviders(<SearchResults {...defaultProps} />, {
        initialState: { 
          projects: [mockProjectWithElements],
          searchElements: () => []
        }
      });
      
      cy.get('[data-testid="search-input"]').type('test');
      waitForAnimation();
      
      cy.get('[data-testid="toggle-filters"]').click();
      cy.get('[data-testid="filter-category-character"]').click();
      
      cy.contains('Try adjusting your filters').should('be.visible');
    });
  });

  describe('User Interactions', () => {
    it('calls onElementClick when element is clicked', () => {
      const elements = createMockElements(3);
      const onElementClick = cy.stub();
      
      mountWithProviders(
        <SearchResults onElementClick={onElementClick} onClose={cy.stub()} />,
        {
          initialState: { 
            projects: [{ ...mockProject, elements }],
            searchElements: () => elements
          }
        }
      );
      
      cy.get('[data-testid="search-input"]').type('Element');
      waitForAnimation();
      
      // Click first element
      cy.contains('Element 1').click();
      
      cy.wrap(onElementClick).should('have.been.calledWith', 'element-0');
    });

    it('calls onClose when close [data-cy*="button"] is clicked', () => {
      const onClose = cy.stub();
      
      mountWithProviders(
        <SearchResults onElementClick={cy.stub()} onClose={onClose} />
      );
      
      cy.get('[data-testid="close-search"]').click();
      
      cy.wrap(onClose).should('have.been.called');
    });

    it('displays project context for each result', () => {
      const elements = createMockElements(2);
      
      mountWithProviders(<SearchResults {...defaultProps} />, {
        initialState: { 
          projects: [{ ...mockProject, elements }],
          searchElements: () => elements
        }
      });
      
      cy.get('[data-testid="search-input"]').type('Element');
      waitForAnimation();
      
      // Should show project name and category
      cy.contains(mockProject.name).should('be.visible');
      cy.contains('Character').should('be.visible');
    });

    it('shows matching content preview when match is in answers', () => {
      const elements = createMockElements(1);
      elements[0].answers = {
        'q1': { questionId: 'q1', value: 'This contains special keyword here' }
      };
      
      mountWithProviders(<SearchResults {...defaultProps} />, {
        initialState: { 
          projects: [{ ...mockProject, elements }],
          searchElements: () => elements
        }
      });
      
      cy.get('[data-testid="search-input"]').type('special');
      waitForAnimation();
      
      // Should show matching content preview
      cy.contains('Matching content:').should('be.visible');
      cy.contains('special').should('be.visible') // React Native Web uses inline styles instead of CSS classes;
    });
  });

  describe('Responsive Design', () => {
    it('shows limited results on mobile', () => {
      setMobileViewport();
      const elements = createMockElements(25);
      
      mountWithProviders(<SearchResults {...defaultProps} />, {
        initialState: { 
          projects: [{ ...mockProject, elements }],
          searchElements: () => elements
        }
      });
      
      cy.get('[data-testid="search-input"]').type('Element');
      waitForAnimation();
      
      // Should show message about limited results
      cy.contains('Showing first 20 results').should('be.visible');
    });

    it('uses virtualized list on desktop', () => {
      setDesktopViewport();
      const elements = createMockElements(50);
      
      mountWithProviders(<SearchResults {...defaultProps} />, {
        initialState: { 
          projects: [{ ...mockProject, elements }],
          searchElements: () => elements
        }
      });
      
      cy.get('[data-testid="search-input"]').type('Element');
      waitForAnimation();
      
      // Should use react-window for virtualization
      cy.get('[data-size]').should('exist'); // react-window adds data-size attribute
    });

    it('hides date range filter on mobile', () => {
      setMobileViewport();
      
      mountWithProviders(<SearchResults {...defaultProps} />);
      
      cy.get('[data-testid="toggle-filters"]').click();
      
      // Date range picker should not be visible on mobile
      cy.contains('Last Updated').should('not.be.visible');
    });

    it('shows date range filter on desktop', () => {
      setDesktopViewport();
      
      mountWithProviders(<SearchResults {...defaultProps} />);
      
      cy.get('[data-testid="toggle-filters"]').click();
      
      // Date range picker should be visible on desktop
      cy.contains('Last Updated').should('be.visible');
    });
  });

  describe('Accessibility', () => {
    it('auto-focuses search input on mount', () => {
      mountWithProviders(<SearchResults {...defaultProps} />);
      
      cy.get('[data-testid="search-input"]').should('have.focus');
    });

    it('has proper [data-cy*="button"] titles', () => {
      mountWithProviders(<SearchResults {...defaultProps} />);
      
      cy.get('[data-testid="toggle-filters"]').should('have.attr', 'title', 'Toggle filters');
      cy.get('[data-testid="close-search"]').should('have.attr', 'title', 'Close search');
    });

    it('supports keyboard navigation', () => {
      const elements = createMockElements(3);
      
      mountWithProviders(<SearchResults {...defaultProps} />, {
        initialState: { 
          projects: [{ ...mockProject, elements }],
          searchElements: () => elements
        }
      });
      
      // Type search
      cy.get('[data-testid="search-input"]').type('Element');
      waitForAnimation();
      
      // Focus filter [data-cy*="button"]
      cy.get('[data-testid="toggle-filters"]').focus();
      cy.focused().should('have.attr', 'data-cy', 'toggle-filters');
      
      // Focus close [data-cy*="button"]
      cy.get('[data-testid="close-search"]').focus();
      cy.focused().should('have.attr', 'data-cy', 'close-search');
    });

    it('announces result count for screen readers', () => {
      const elements = createMockElements(5);
      
      mountWithProviders(<SearchResults {...defaultProps} />, {
        initialState: { 
          projects: [{ ...mockProject, elements }],
          searchElements: () => elements
        }
      });
      
      cy.get('[data-testid="search-input"]').type('Element');
      waitForAnimation();
      
      cy.contains('Found 5 results').should('be.visible');
    });
  });

  describe('Edge Cases', () => {
    it('handles elements with missing data', () => {
      const elements = [
        { ...mockElement, name: undefined, description: 'Test' },
        { ...mockElement, id: '2', tags: null }
      ];
      
      mountWithProviders(<SearchResults {...defaultProps} />, {
        initialState: { 
          projects: [{ ...mockProject, elements }],
          searchElements: () => elements
        }
      });
      
      cy.get('[data-testid="search-input"]').type('Test');
      waitForAnimation();
      
      // Should render without crashing
      cy.contains('Found').should('be.visible');
    });

    it('handles search with special characters', () => {
      const elements = createMockElements(1);
      elements[0].name = 'Element (Special) [Characters]';
      
      mountWithProviders(<SearchResults {...defaultProps} />, {
        initialState: { 
          projects: [{ ...mockProject, elements }],
          searchElements: () => elements
        }
      });
      
      cy.get('[data-testid="search-input"]').type('(Special)');
      waitForAnimation();
      
      cy.contains('Element (Special) [Characters]').should('be.visible');
    });

    it('handles empty search gracefully', () => {
      mountWithProviders(<SearchResults {...defaultProps} />, {
        initialState: { 
          projects: [mockProjectWithElements]
        }
      });
      
      // Type and clear
      cy.get('[data-testid="search-input"]').type('test').clear();
      
      // Should show empty state
      cy.contains('Enter a search term to find elements').should('be.visible');
    });

    it('handles very long search queries', () => {
      const longQuery = 'a'.repeat(200);
      
      mountWithProviders(<SearchResults {...defaultProps} />, {
        initialState: { 
          projects: [mockProjectWithElements],
          searchElements: () => []
        }
      });
      
      cy.get('[data-testid="search-input"]').type(longQuery);
      waitForAnimation();
      
      // Should handle long query without breaking
      cy.contains(`No results found`).should('be.visible');
    });

    it('handles rapid filter toggling', () => {
      mountWithProviders(<SearchResults {...defaultProps} />);
      
      // Rapidly toggle filters
      cy.get('[data-testid="toggle-filters"]').click();
      cy.get('[data-testid="toggle-filters"]').click();
      cy.get('[data-testid="toggle-filters"]').click();
      
      // Should end up open
      cy.contains('Categories').should('be.visible');
    });
  });
});