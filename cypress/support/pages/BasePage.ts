/**
 * Base Page Object
 * Common functionality shared across all page objects
 */

export class BasePage {
  // * Base URL configuration
  protected baseUrl = Cypress.config('baseUrl') || 'http://localhost:3002';

  // * Common selectors using data-cy attributes
  protected selectors = {
    loadingSpinner: '[data-cy="loading-spinner"]',
    errorMessage: '[data-cy="error-message"]',
    successMessage: '[data-cy="success-message"]',
    modal: '[data-cy="modal"]',
    modalClose: '[data-cy="modal-close"]',
    toast: '[data-cy="toast"]',
  };

  /**
   * Navigate to a specific path
   */
  visit(path: string = ''): void {
    cy.visit(`${this.baseUrl}${path}`);
  }

  /**
   * Wait for page to load completely
   */
  waitForPageLoad(): void {
    cy.get('body').should('be.visible');
    // * Ensure no loading spinners are visible
    cy.get(this.selectors.loadingSpinner).should('not.exist');
  }

  /**
   * Check if an element exists
   */
  elementExists(selector: string): Cypress.Chainable<boolean> {
    return cy.get('body').then(($body) => {
      return $body.find(selector).length > 0;
    });
  }

  /**
   * Get element by data-cy attribute
   */
  getByDataCy(value: string): Cypress.Chainable {
    return cy.get(`[data-cy="${value}"]`);
  }

  /**
   * Click element by data-cy attribute
   */
  clickByDataCy(value: string): void {
    this.getByDataCy(value).click();
  }

  /**
   * Type into input by data-cy attribute
   */
  typeByDataCy(dataCy: string, text: string): void {
    this.getByDataCy(dataCy).clear().type(text);
  }

  /**
   * Select option from dropdown by data-cy attribute
   */
  selectByDataCy(dataCy: string, value: string): void {
    this.getByDataCy(dataCy).select(value);
  }

  /**
   * Verify URL contains expected path
   */
  verifyUrl(expectedPath: string): void {
    cy.url().should('include', expectedPath);
  }

  /**
   * Verify page title
   */
  verifyPageTitle(expectedTitle: string): void {
    cy.title().should('eq', expectedTitle);
  }

  /**
   * Wait for API response
   */
  waitForApi(alias: string, timeout: number = 10000): void {
    cy.wait(alias, { timeout });
  }

  /**
   * Handle modal interactions
   */
  closeModal(): void {
    this.clickByDataCy('modal-close');
  }

  /**
   * Verify success message appears
   */
  verifySuccessMessage(message?: string): void {
    const successElement = cy.get(this.selectors.successMessage);
    successElement.should('be.visible');
    if (message) {
      successElement.should('contain', message);
    }
  }

  /**
   * Verify error message appears
   */
  verifyErrorMessage(message?: string): void {
    const errorElement = cy.get(this.selectors.errorMessage);
    errorElement.should('be.visible');
    if (message) {
      errorElement.should('contain', message);
    }
  }

  /**
   * Take screenshot for debugging
   */
  takeScreenshot(name: string): void {
    cy.screenshot(name, { capture: 'fullPage' });
  }

  /**
   * Verify element is visible
   */
  verifyElementVisible(selector: string): void {
    cy.get(selector).should('be.visible');
  }

  /**
   * Verify element is not visible
   */
  verifyElementNotVisible(selector: string): void {
    cy.get(selector).should('not.be.visible');
  }

  /**
   * Verify element contains text
   */
  verifyElementContainsText(selector: string, text: string): void {
    cy.get(selector).should('contain', text);
  }

  /**
   * Scroll to element
   */
  scrollToElement(selector: string): void {
    cy.get(selector).scrollIntoView();
  }

  /**
   * Wait for specific time (use sparingly)
   */
  wait(milliseconds: number): void {
    cy.wait(milliseconds);
  }

  /**
   * Get current timestamp
   */
  getTimestamp(): string {
    return new Date().getTime().toString();
  }

  /**
   * Generate random string
   */
  generateRandomString(length: number = 8): string {
    return Math.random().toString(36).substring(2, 2 + length);
  }

  /**
   * Clear all cookies and local storage
   */
  clearBrowserData(): void {
    cy.clearCookies();
    cy.clearLocalStorage();
  }

  /**
   * Reload the page
   */
  reload(): void {
    cy.reload();
  }
}