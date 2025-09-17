// Common test utilities for Cypress component tests

export const waitForAnimation = () => cy.wait(300);

export const closeModal = () => {
  cy.get('[data-cy="modal-close"]').click();
  waitForAnimation();
};

export const submitForm = () => {
  cy.get('[data-cy="submit-button"]').click();
};

export const cancelForm = () => {
  cy.get('[data-cy="cancel-button"]').click();
};

export const selectOption = (selector: string, value: string) => {
  cy.get(selector).select(value);
};

export const typeInInput = (selector: string, text: string) => {
  cy.get(selector).clear().type(text);
};

export const checkElementVisible = (selector: string) => {
  cy.get(selector).should('be.visible');
};

export const checkElementNotVisible = (selector: string) => {
  cy.get(selector).should('not.exist');
};

export const checkElementContainsText = (selector: string, text: string) => {
  cy.get(selector).should('contain', text);
};

export const checkInputValue = (selector: string, value: string) => {
  cy.get(selector).should('have.value', value);
};

export const checkSelectValue = (selector: string, value: string) => {
  cy.get(selector).should('have.value', value);
};

export const clickButton = (buttonText: string) => {
  cy.contains('button', buttonText).click();
};

export const checkButtonEnabled = (selector: string) => {
  cy.get(selector).should('not.be.disabled');
};

export const checkButtonDisabled = (selector: string) => {
  cy.get(selector).should('be.disabled');
};

export const checkAriaLabel = (selector: string, label: string) => {
  cy.get(selector).should('have.attr', 'aria-label', label);
};

export const checkAriaDescribedBy = (selector: string, id: string) => {
  cy.get(selector).should('have.attr', 'aria-describedby', id);
};

export const checkRole = (selector: string, role: string) => {
  cy.get(selector).should('have.attr', 'role', role);
};

export const tabToElement = (selector: string) => {
  cy.get('body').tab();
  cy.focused().should('match', selector);
};

export const pressEscape = () => {
  cy.get('body').type('{esc}');
};

export const pressEnter = () => {
  cy.focused().type('{enter}');
};

// Mobile viewport helpers
export const setMobileViewport = () => {
  cy.viewport('iphone-x');
};

export const setTabletViewport = () => {
  cy.viewport('ipad-2');
};

export const setDesktopViewport = () => {
  cy.viewport(1280, 720);
};

// Error state helpers
export const checkErrorMessage = (message: string) => {
  cy.get('[data-cy="error-message"]').should('contain', message);
};

export const checkNoErrorMessage = () => {
  cy.get('[data-cy="error-message"]').should('not.exist');
};

// Loading state helpers
export const checkLoadingState = () => {
  cy.get('[data-cy="loading-spinner"]').should('be.visible');
};

export const checkNotLoading = () => {
  cy.get('[data-cy="loading-spinner"]').should('not.exist');
};

// Toast/notification helpers
export const checkToastMessage = (message: string) => {
  cy.get('[data-cy="toast-message"]').should('contain', message);
};

export const dismissToast = () => {
  cy.get('[data-cy="toast-dismiss"]').click();
};