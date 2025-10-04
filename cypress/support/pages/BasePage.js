/**
 * BasePage - Base class for all page objects
 * Provides common functionality and utilities for page objects
 */

class BasePage {
  constructor() {
    this.baseUrl = Cypress.config('baseUrl') || 'http://localhost:3002';
  }

  // * Navigation methods
  visit(path = '') {
    cy.visit(`${this.baseUrl}${path}`);
    return this;
  }

  reload() {
    cy.reload();
    return this;
  }

  goBack() {
    cy.go('back');
    return this;
  }

  // * Element selectors using data-cy attributes (best practice)
  getByDataCy(selector) {
    return cy.get(`[data-cy="${selector}"]`);
  }

  getByTestId(selector) {
    return cy.get(`[testID="${selector}"]`);
  }

  findByDataCy(parentSelector, childSelector) {
    return this.getByDataCy(parentSelector).find(`[data-cy="${childSelector}"]`);
  }

  // * Common actions
  clickButton(buttonDataCy) {
    this.getByDataCy(buttonDataCy).click();
    return this;
  }

  typeIntoField(fieldDataCy, text) {
    this.getByDataCy(fieldDataCy).clear().type(text);
    return this;
  }

  selectFromDropdown(dropdownDataCy, value) {
    this.getByDataCy(dropdownDataCy).select(value);
    return this;
  }

  // * Assertions
  shouldBeVisible(selector) {
    this.getByDataCy(selector).should('be.visible');
    return this;
  }

  shouldNotExist(selector) {
    cy.get(`[data-cy="${selector}"]`).should('not.exist');
    return this;
  }

  shouldContainText(selector, text) {
    this.getByDataCy(selector).should('contain', text);
    return this;
  }

  shouldHaveValue(selector, value) {
    this.getByDataCy(selector).should('have.value', value);
    return this;
  }

  // * Wait utilities (avoid arbitrary waits)
  waitForElement(selector, timeout = 10000) {
    this.getByDataCy(selector).should('be.visible', { timeout });
    return this;
  }

  waitForElementToDisappear(selector, timeout = 10000) {
    cy.get(`[data-cy="${selector}"]`, { timeout }).should('not.exist');
    return this;
  }

  // * Form utilities
  fillForm(formData) {
    Object.keys(formData).forEach(key => {
      if (formData[key]) {
        this.typeIntoField(key, formData[key]);
      }
    });
    return this;
  }

  submitForm(submitButtonDataCy = 'submit-button') {
    this.clickButton(submitButtonDataCy);
    return this;
  }

  // * Error handling
  getErrorMessage() {
    return this.getByDataCy('error-message').invoke('text');
  }

  dismissError() {
    this.getByDataCy('error-dismiss').click();
    return this;
  }

  // * Loading states
  waitForLoadingToComplete() {
    cy.get('[data-cy="loading-indicator"]').should('not.exist');
    return this;
  }

  // * Modal utilities
  isModalVisible(modalDataCy) {
    this.getByDataCy(modalDataCy).should('be.visible');
    return this;
  }

  closeModal(closeButtonDataCy = 'modal-close') {
    this.clickButton(closeButtonDataCy);
    return this;
  }

  // * Screenshot utilities for debugging
  takeScreenshot(name) {
    cy.screenshot(name);
    return this;
  }

  // * Local storage utilities
  clearLocalStorage() {
    cy.clearLocalStorage();
    return this;
  }

  getLocalStorageItem(key) {
    return cy.window().then(window => {
      return window.localStorage.getItem(key);
    });
  }

  setLocalStorageItem(key, value) {
    cy.window().then(window => {
      window.localStorage.setItem(key, value);
    });
    return this;
  }

  // * Cookie utilities
  clearCookies() {
    cy.clearCookies();
    return this;
  }

  // * Network utilities
  waitForRequest(alias, timeout = 10000) {
    cy.wait(alias, { timeout });
    return this;
  }

  // * Viewport utilities
  setMobileViewport() {
    cy.viewport('iphone-x');
    return this;
  }

  setTabletViewport() {
    cy.viewport('ipad-2');
    return this;
  }

  setDesktopViewport() {
    cy.viewport(1920, 1080);
    return this;
  }

  // * Accessibility checks
  checkA11y() {
    cy.injectAxe();
    cy.checkA11y();
    return this;
  }

  // * Performance marks
  markPerformanceStart(markName) {
    cy.window().then(win => {
      win.performance.mark(`${markName}-start`);
    });
    return this;
  }

  markPerformanceEnd(markName) {
    cy.window().then(win => {
      win.performance.mark(`${markName}-end`);
      win.performance.measure(markName, `${markName}-start`, `${markName}-end`);
    });
    return this;
  }

  getPerformanceMeasure(measureName) {
    return cy.window().then(win => {
      const entries = win.performance.getEntriesByName(measureName);
      return entries.length > 0 ? entries[0].duration : null;
    });
  }
}

export default BasePage;