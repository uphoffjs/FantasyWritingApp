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
export const typeInInput = (selector: string, text: string) => {
  cy.get(selector).type(text);
};

export const checkElementVisible = (selector: string) => {
  cy.get(selector).should('be.visible');
};

export const checkElementNotVisible = (selector: string) => {
  cy.get(selector).should('not.be.visible');
};

export const checkElementExists = (selector: string) => {
  cy.get(selector).should('exist');
};

export const checkElementNotExists = (selector: string) => {
  cy.get(selector).should('not.exist');
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

export const checkAriaExpanded = (selector: string, expanded: boolean) => {
  cy.get(selector).should('have.attr', 'aria-expanded', String(expanded));
};

export const checkInputValue = (selector: string, value: string) => {
  cy.get(selector).should('have.value', value);
};

export const checkTextContent = (selector: string, text: string) => {
  cy.get(selector).should('have.text', text);
};

export const checkContainsText = (selector: string, text: string) => {
  cy.get(selector).should('contain', text);
};

export const clickElement = (selector: string) => {
  cy.get(selector).click();
};

export const clearInput = (selector: string) => {
  cy.get(selector).clear();
};

export const selectDropdownOption = (selector: string, value: string) => {
  cy.get(selector).select(value);
};

export const checkCheckbox = (selector: string) => {
  cy.get(selector).check();
};

export const uncheckCheckbox = (selector: string) => {
  cy.get(selector).uncheck();
};

export const waitFor = (milliseconds: number) => {
  cy.wait(milliseconds);
};

export const getElement = (selector: string) => {
  return cy.get(selector);
};

export const findElement = (text: string) => {
  return cy.contains(text);
};

// * Keyboard navigation helpers
export const pressKey = (key: string) => {
  cy.get('body').type(key);
};

export const pressEnter = () => {
  cy.get('body').type('{enter}');
};

export const pressEscape = () => {
  cy.get('body').type('{esc}');
};

export const pressTab = () => {
  cy.get('body').type('{tab}');
};

// * Focus management
export const checkFocused = (selector: string) => {
  cy.get(selector).should('have.focus');
};

export const focusElement = (selector: string) => {
  cy.get(selector).focus();
};

export const blurElement = (selector: string) => {
  cy.get(selector).blur();
};

// * Form helpers
export const submitForm = (selector: string) => {
  cy.get(selector).submit();
};

export const checkValidationMessage = (selector: string, message: string) => {
  cy.get(selector).then($el => {
    const validationMessage = ($el[0] as HTMLInputElement).validationMessage;
    expect(validationMessage).to.equal(message);
  });
};

// * Scroll helpers
export const scrollToElement = (selector: string) => {
  cy.get(selector).scrollIntoView();
};

export const scrollToTop = () => {
  cy.window().scrollTo('top');
};

export const scrollToBottom = () => {
  cy.window().scrollTo('bottom');
};

// * Class and attribute helpers
export const checkHasClass = (selector: string, className: string) => {
  cy.get(selector).should('have.class', className);
};

export const checkNotHasClass = (selector: string, className: string) => {
  cy.get(selector).should('not.have.class', className);
};

export const checkAttribute = (selector: string, attr: string, value: string) => {
  cy.get(selector).should('have.attr', attr, value);
};

export const checkNotAttribute = (selector: string, attr: string) => {
  cy.get(selector).should('not.have.attr', attr);
};