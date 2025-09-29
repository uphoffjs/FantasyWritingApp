/**
 * Verification test for React Native component test attributes
 * Ensures that the getTestProps helper properly renders data-cy attributes on web
 */

describe('Test Attributes Verification', () => {
  beforeEach(() => {
    // * Visit the homepage
    cy.visit('/');
  });

  it('should render data-cy attributes on React Native components', () => {
    // * Check that various components have data-cy attributes

    // Check for app root (common in most apps)
    cy.get('[data-cy]').should('exist');

    // Log all data-cy attributes found on the page for verification
    cy.get('[data-cy]').then(($elements) => {
      const dataCyValues = [];
      $elements.each((index, element) => {
        const dataCyValue = element.getAttribute('data-cy');
        if (dataCyValue) {
          dataCyValues.push(dataCyValue);
        }
      });

      cy.log(`Found ${dataCyValues.length} elements with data-cy attributes`);
      cy.log(`Data-cy values: ${dataCyValues.slice(0, 10).join(', ')}...`);

      // * Verify we have a reasonable number of data-cy attributes
      expect(dataCyValues.length).to.be.greaterThan(0);
    });
  });

  it('should NOT have data-testid attributes (only data-cy)', () => {
    // * Verify that we're not rendering both data-testid and data-cy
    cy.get('[data-testid]').should('not.exist');
  });
});