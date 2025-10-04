// * Test utility functions for Cypress component tests

export const waitForAnimation = (duration: number = 300) => {
  cy.wait(duration);
};

export const setMobileViewport = () => {
  cy.viewport(375, 667); // iPhone 8 size
};

export const setTabletViewport = () => {
  cy.viewport(768, 1024); // iPad size
};

export const setDesktopViewport = () => {
  cy.viewport(1280, 720); // Default desktop size
};

export const getByTestId = (testId: string) => {
  return cy.get(`[data-cy="${testId}"]`);
};

export const findByText = (text: string) => {
  return cy.contains(text);
};

export const typeInField = (fieldName: string, text: string) => {
  cy.get(`[data-cy="${fieldName}"]`).type(text);
};

export const clickButton = (buttonText: string) => {
  cy.contains('button', buttonText).click();
};

export const selectOption = (selectName: string, optionText: string) => {
  cy.get(`[data-cy="${selectName}"]`).select(optionText);
};

export const checkField = (fieldName: string) => {
  cy.get(`[data-cy="${fieldName}"]`).check();
};

export const uncheckField = (fieldName: string) => {
  cy.get(`[data-cy="${fieldName}"]`).uncheck();
};

export const uploadFile = (inputName: string, fileName: string) => {
  cy.get(`[data-cy="${inputName}"]`).selectFile(fileName);
};

export const clearField = (fieldName: string) => {
  cy.get(`[data-cy="${fieldName}"]`).clear();
};

export const shouldBeVisible = (element: string) => {
  cy.get(`[data-cy="${element}"]`).should('be.visible');
};

export const shouldNotExist = (element: string) => {
  cy.get(`[data-cy="${element}"]`).should('not.exist');
};

export const shouldContainText = (element: string, text: string) => {
  cy.get(`[data-cy="${element}"]`).should('contain', text);
};

export const shouldHaveValue = (element: string, value: string) => {
  cy.get(`[data-cy="${element}"]`).should('have.value', value);
};

export const shouldBeDisabled = (element: string) => {
  cy.get(`[data-cy="${element}"]`).should('be.disabled');
};

export const shouldBeEnabled = (element: string) => {
  cy.get(`[data-cy="${element}"]`).should('not.be.disabled');
};

// * Additional missing test utility functions
export const typeInInput = (testId: string, text: string) => {
  cy.get(`[data-cy="${testId}"]`).type(text);
};

export const checkElementVisible = (testId: string) => {
  cy.get(`[data-cy="${testId}"]`).should('be.visible');
};

export const checkElementNotVisible = (testId: string) => {
  cy.get(`[data-cy="${testId}"]`).should('not.be.visible');
};

export const checkElementExists = (testId: string) => {
  cy.get(`[data-cy="${testId}"]`).should('exist');
};

export const checkElementNotExists = (testId: string) => {
  cy.get(`[data-cy="${testId}"]`).should('not.exist');
};

export const checkButtonEnabled = (testId: string) => {
  cy.get(`[data-cy="${testId}"]`).should('not.be.disabled');
};

export const checkButtonDisabled = (testId: string) => {
  cy.get(`[data-cy="${testId}"]`).should('be.disabled');
};

export const checkAriaLabel = (testId: string, label: string) => {
  cy.get(`[data-cy="${testId}"]`).should('have.attr', 'aria-label', label);
};

export const checkAriaExpanded = (testId: string, expanded: boolean) => {
  cy.get(`[data-cy="${testId}"]`).should('have.attr', 'aria-expanded', String(expanded));
};

export const checkInputValue = (testId: string, value: string) => {
  cy.get(`[data-cy="${testId}"]`).should('have.value', value);
};

export const checkTextContent = (testId: string, text: string) => {
  cy.get(`[data-cy="${testId}"]`).should('have.text', text);
};

export const checkContainsText = (testId: string, text: string) => {
  cy.get(`[data-cy="${testId}"]`).should('contain', text);
};

export const clickElement = (testId: string) => {
  cy.get(`[data-cy="${testId}"]`).click();
};

export const clearInput = (testId: string) => {
  cy.get(`[data-cy="${testId}"]`).clear();
};

export const selectDropdownOption = (testId: string, value: string) => {
  cy.get(`[data-cy="${testId}"]`).select(value);
};

export const checkCheckbox = (testId: string) => {
  cy.get(`[data-cy="${testId}"]`).check();
};

export const uncheckCheckbox = (testId: string) => {
  cy.get(`[data-cy="${testId}"]`).uncheck();
};

export const waitFor = (milliseconds: number) => {
  cy.wait(milliseconds);
};

export const getElement = (testId: string) => {
  return cy.get(`[data-cy="${testId}"]`);
};

export const findElement = (text: string) => {
  return cy.contains(text);
};

// * Keyboard navigation helpers
export const pressKey = (key: string) => {
  cy.get('[data-cy="app-root"], body').type(key);
};

export const pressEnter = () => {
  cy.get('[data-cy="app-root"], body').type('{enter}');
};

export const pressEscape = () => {
  cy.get('[data-cy="app-root"], body').type('{esc}');
};

export const pressTab = () => {
  cy.get('[data-cy="app-root"], body').type('{tab}');
};

// * Focus management
export const checkFocused = (testId: string) => {
  cy.get(`[data-cy="${testId}"]`).should('have.focus');
};

export const focusElement = (testId: string) => {
  cy.get(`[data-cy="${testId}"]`).focus();
};

export const blurElement = (testId: string) => {
  cy.get(`[data-cy="${testId}"]`).blur();
};

// * Form helpers
export const submitForm = (testId: string) => {
  cy.get(`[data-cy="${testId}"]`).submit();
};

export const checkValidationMessage = (testId: string, message: string) => {
  cy.get(`[data-cy="${testId}"]`).then($el => {
    const validationMessage = ($el[0] as HTMLInputElement).validationMessage;
    expect(validationMessage).to.equal(message);
  });
};

// * Scroll helpers
export const scrollToElement = (testId: string) => {
  cy.get(`[data-cy="${testId}"]`).scrollIntoView();
};

export const scrollToTop = () => {
  cy.window().scrollTo('top');
};

export const scrollToBottom = () => {
  cy.window().scrollTo('bottom');
};

// * Class and attribute helpers
export const checkHasClass = (testId: string, className: string) => {
  cy.get(`[data-cy="${testId}"]`).should('have.class', className);
};

export const checkNotHasClass = (testId: string, className: string) => {
  cy.get(`[data-cy="${testId}"]`).should('not.have.class', className);
};

export const checkAttribute = (testId: string, attr: string, value: string) => {
  cy.get(`[data-cy="${testId}"]`).should('have.attr', attr, value);
};

export const checkNotAttribute = (testId: string, attr: string) => {
  cy.get(`[data-cy="${testId}"]`).should('not.have.attr', attr);
};