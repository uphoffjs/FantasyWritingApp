/**
 * React Native Web Test Helpers
 * 
 * Utilities for testing React Native Web components with Cypress
 * React Native Web converts testID props to data-testid attributes in the DOM
 */

/**
 * Get element by test ID
 * React Native Web converts testID to data-testid, so we look for that
 * Falls back to data-cy for legacy selectors
 */
export const getByTestId = (testId: string) => {
  // Primary: look for data-testid (React Native Web standard)
  // Fallback: look for data-cy (legacy)
  return cy.get(`[data-testid="${testId}"], [data-cy="${testId}"]`).first();
};

/**
 * Find element by test ID (allows multiple matches)
 */
export const findByTestId = (testId: string) => {
  return cy.get(`[data-testid="${testId}"], [data-cy="${testId}"]`);
};

/**
 * Check if element with test ID exists
 */
export const testIdExists = (testId: string) => {
  return cy.get('body').then(($body) => {
    return $body.find(`[data-testid="${testId}"], [data-cy="${testId}"]`).length > 0;
  });
};

/**
 * Wait for element with test ID to appear
 */
export const waitForTestId = (testId: string, timeout = 4000) => {
  return cy.get(`[data-testid="${testId}"], [data-cy="${testId}"]`, { timeout });
};

/**
 * Click element by test ID
 */
export const clickByTestId = (testId: string) => {
  return getByTestId(testId).click();
};

/**
 * Type into element by test ID
 */
export const typeByTestId = (testId: string, text: string) => {
  return getByTestId(testId).type(text);
};

/**
 * Clear and type into element by test ID
 */
export const clearAndTypeByTestId = (testId: string, text: string) => {
  return getByTestId(testId).clear().type(text);
};

/**
 * Get text content of element by test ID
 */
export const getTextByTestId = (testId: string) => {
  return getByTestId(testId).invoke('text');
};

/**
 * Assert element with test ID is visible
 */
export const assertVisible = (testId: string) => {
  return getByTestId(testId).should('be.visible');
};

/**
 * Assert element with test ID is not visible
 */
export const assertNotVisible = (testId: string) => {
  return cy.get(`[data-testid="${testId}"], [data-cy="${testId}"]`).should('not.exist');
};

/**
 * Assert element with test ID contains text
 */
export const assertContainsText = (testId: string, text: string) => {
  return getByTestId(testId).should('contain', text);
};

/**
 * Helper to handle React Native Web's attribute conversion
 * Use this when you need to check for specific attributes
 */
export const checkAttribute = (testId: string, attribute: string, value?: string) => {
  const element = getByTestId(testId);
  
  if (value !== undefined) {
    return element.should('have.attr', attribute, value);
  }
  
  return element.should('have.attr', attribute);
};

/**
 * Helper for accessibility testing
 * React Native Web should preserve accessibility attributes
 */
export const checkAccessibility = (testId: string) => {
  const element = getByTestId(testId);
  
  return {
    hasRole: (role: string) => element.should('have.attr', 'role', role),
    hasAriaLabel: (label: string) => element.should('have.attr', 'aria-label', label),
    hasAriaLive: (value: string) => element.should('have.attr', 'aria-live', value),
    isAccessible: () => element.should('have.attr', 'aria-label'),
  };
};

// Export as default object for easier importing
export default {
  getByTestId,
  findByTestId,
  testIdExists,
  waitForTestId,
  clickByTestId,
  typeByTestId,
  clearAndTypeByTestId,
  getTextByTestId,
  assertVisible,
  assertNotVisible,
  assertContainsText,
  checkAttribute,
  checkAccessibility,
};