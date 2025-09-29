/**
 * Test file to verify it.only() functionality works without ESLint errors
 * This file is used to validate the Cypress/Mocha configuration fix
 */

describe('Test it.only() functionality', () => {
  it('should run when not focused', () => {
    expect(true).to.be.true;
  });

  it.only('should ONLY run this test when focused', () => {
    expect(true).to.be.true;
    cy.log('This test is focused with it.only()');
  });

  it('should NOT run when another test is focused', () => {
    expect(true).to.be.true;
  });

  it.skip('should skip this test', () => {
    expect(false).to.be.true; // This should not run
  });
});

describe.only('Test describe.only() functionality', () => {
  it('should run all tests in this describe block', () => {
    expect(true).to.be.true;
    cy.log('This test runs because the describe block is focused');
  });

  it('should also run this test', () => {
    expect(true).to.be.true;
    cy.log('This test also runs in the focused describe block');
  });
});

describe('Should not run when another describe is focused', () => {
  it('should NOT run', () => {
    expect(true).to.be.true;
  });

  it('should also NOT run', () => {
    expect(true).to.be.true;
  });
});

// Test that context.only() also works (context is an alias for describe in Mocha)
context.only('Test context.only() functionality', () => {
  it('should run in focused context', () => {
    expect(true).to.be.true;
    cy.log('Context.only() works too!');
  });
});