import React from 'react';

// * Simple test component without React Native dependencies
const SimpleButton: React.FC<{ onClick: () => void; text: string }> = ({ onClick, text }) => {
  return (
    <button
      data-cy="simple-button"
      onClick={onClick}
      style={{ padding: '10px 20px', fontSize: '16px' }}
    >
      {text}
    </button>
  );
};

describe('Simple Component Test', () => {
  it('renders a button and handles clicks', () => {
    let clicked = false;

    cy.mount(
      <SimpleButton
        text="Click Me"
        onClick={() => { clicked = true; }}
      />
    );

    // * Check button renders with correct text
    cy.get('[data-cy="simple-button"]').should('exist').and('contain', 'Click Me');

    // * Click button
    cy.get('[data-cy="simple-button"]').click().then(() => {
      expect(clicked).to.be.true;
    });
  });

  it('updates button text', () => {
    const SimpleUpdatingButton: React.FC = () => {
      const [count, setCount] = React.useState(0);

      return (
        <button
          data-cy="counter-button"
          onClick={() => setCount(count + 1)}
        >
          Count: {count}
        </button>
      );
    };

    cy.mount(<SimpleUpdatingButton />);

    // * Initial state
    cy.get('[data-cy="counter-button"]').should('contain', 'Count: 0');

    // * Click and verify update
    cy.get('[data-cy="counter-button"]').click();
    cy.get('[data-cy="counter-button"]').should('contain', 'Count: 1');

    // * Click again
    cy.get('[data-cy="counter-button"]').click();
    cy.get('[data-cy="counter-button"]').should('contain', 'Count: 2');
  });
});