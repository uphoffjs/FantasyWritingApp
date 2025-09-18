import React from 'react';
import { TextInput } from '../../src/components/TextInput';

describe('TextInput Component', () => {
  let mockOnChangeText;

  beforeEach(() => {
    mockOnChangeText = cy.stub().as('onChangeText');
  });

  it('should render basic text input', () => {
    cy.mount(
      <TextInput 
        placeholder="Enter text..." 
        testID="text-input"
        onChangeText={mockOnChangeText}
      />
    );

    // * Check that input is visible
    cy.get('[data-testid="text-input"]').should('be.visible');
    
    // // DEPRECATED: * Check placeholder text
    cy.get('[data-testid="text-input"]').should('have.attr', 'placeholder', 'Enter text...');
  });

  it('should render with label', () => {
    cy.mount(
      <TextInput 
        label="Character Name"
        placeholder="Enter character name"
        testID="text-input"
        onChangeText={mockOnChangeText}
      />
    );

    // * Check that label is displayed
    cy.contains('Character Name').should('be.visible');
    
    // * Check that input is visible
    cy.get('[data-testid="text-input"]').should('be.visible');
  });

  it('should handle text input and change events', () => {
    cy.mount(
      <TextInput 
        placeholder="Enter text..."
        testID="text-input"
        onChangeText={mockOnChangeText}
      />
    );

    // * Type in the input
    const testText = 'Aragorn the Ranger';
    cy.get('[data-testid="text-input"]').type(testText);
    
    // * Check that the value appears in the input
    cy.get('[data-testid="text-input"]').should('have.value', testText);
    
    // TODO: onChangeText should have been called
    cy.get('@onChangeText').should('have.been.called');
  });

  it('should display placeholder correctly', () => {
    const placeholderText = 'Enter your character backstory...';
    
    cy.mount(
      <TextInput 
        placeholder={placeholderText}
        testID="text-input"
        onChangeText={mockOnChangeText}
      />
    );

    cy.get('[data-testid="text-input"]').should('have.attr', 'placeholder', placeholderText);
  });

  it('should display error state and message', () => {
    const errorMessage = 'Character name is required';
    
    cy.mount(
      <TextInput 
        label="Character Name"
        placeholder="Enter name"
        error={errorMessage}
        testID="text-input"
        onChangeText={mockOnChangeText}
      />
    );

    // * Check that error message is displayed
    cy.contains(errorMessage).should('be.visible');
    
    // * Check that input has error styling (border color change)
    cy.get('[data-testid="text-input"]').should('have.css', 'border-color', 'rgb(220, 38, 38)'); // #DC2626
  });

  it('should handle multiline text input', () => {
    cy.mount(
      <TextInput 
        label="Character Description"
        placeholder="Enter detailed description..."
        multiline={true}
        numberOfLines={4}
        testID="text-input"
        onChangeText={mockOnChangeText}
      />
    );

    // TODO: * Multiline input should be visible
    cy.get('[data-testid="text-input"]').should('be.visible');
    
    // TODO: * Should have larger minimum height for multiline
    cy.get('[data-testid="text-input"]').should('have.css', 'min-height', '100px');
    
    // * Type multiline text
    const multilineText = 'A tall warrior\nwith piercing blue eyes\nand a noble bearing';
    cy.get('[data-testid="text-input"]').type(multilineText);
    
    cy.get('[data-testid="text-input"]').should('contain.value', multilineText);
  });

  it('should have proper accessibility labels', () => {
    cy.mount(
      <TextInput 
        label="Email Address"
        placeholder="Enter your email"
        testID="text-input"
        onChangeText={mockOnChangeText}
      />
    );

    // * Check accessibility
    cy.get('[data-testid="text-input"]')
      .should('be.visible')
      .and('have.attr', 'placeholder', 'Enter your email');
    
    // TODO: * Label should be associated with input
    cy.contains('Email Address').should('be.visible');
  });

  it('should handle default value', () => {
    const defaultValue = 'Gandalf the Grey';
    
    cy.mount(
      <TextInput 
        defaultValue={defaultValue}
        placeholder="Enter name"
        testID="text-input"
        onChangeText={mockOnChangeText}
      />
    );

    cy.get('[data-testid="text-input"]').should('have.value', defaultValue);
  });

  it('should handle controlled value', () => {
    const TestWrapper = () => {
      const [value, setValue] = React.useState('Initial value');
      
      return (
        <TextInput 
          value={value}
          onChangeText={setValue}
          placeholder="Enter text"
          testID="text-input"
        />
      );
    };

    cy.mount(<TestWrapper />);

    // * Check initial value
    cy.get('[data-testid="text-input"]').should('have.value', 'Initial value');
    
    // * Clear and type new value
    cy.get('[data-testid="text-input"]').clear().type('New value');
    cy.get('[data-testid="text-input"]').should('have.value', 'New value');
  });

  it('should apply custom container styling', () => {
    cy.mount(
      <TextInput 
        placeholder="Enter text"
        containerStyle={{ marginBottom: 32 }}
        testID="text-input"
        onChangeText={mockOnChangeText}
      />
    );

    // * Check that custom styling is applied to container
    cy.get('[data-testid="text-input"]').parent().should('have.css', 'margin-bottom', '32px');
  });

  it('should apply custom input styling', () => {
    cy.mount(
      <TextInput 
        placeholder="Enter text"
        inputStyle={{ backgroundColor: 'rgb(55, 65, 81)' }} // #374151
        testID="text-input"
        onChangeText={mockOnChangeText}
      />
    );

    // * Check that custom input styling is applied
    cy.get('[data-testid="text-input"]').should('have.css', 'background-color', 'rgb(55, 65, 81)');
  });

  it('should handle focus and blur events', () => {
    let mockOnFocus;
    let mockOnBlur;
    
    // * Create additional stubs within the test
    mockOnFocus = cy.stub().as('onFocus');
    mockOnBlur = cy.stub().as('onBlur');
    
    cy.mount(
      <TextInput 
        placeholder="Enter text"
        testID="text-input"
        onChangeText={mockOnChangeText}
        onFocus={mockOnFocus}
        onBlur={mockOnBlur}
      />
    );

    // * Focus the input
    cy.get('[data-testid="text-input"]').focus();
    cy.get('@onFocus').should('have.been.called');
    
    // * Blur the input
    cy.get('[data-testid="text-input"]').blur();
    cy.get('@onBlur').should('have.been.called');
  });

  it('should handle different input types', () => {
    cy.mount(
      <TextInput 
        placeholder="Enter email"
        keyboardType="email-address"
        testID="text-input"
        onChangeText={mockOnChangeText}
      />
    );

    // In React Native Web, keyboardType may translate to input type
    cy.get('[data-testid="text-input"]').should('be.visible');
  });

  it('should handle secure text entry', () => {
    cy.mount(
      <TextInput 
        placeholder="Enter password"
        secureTextEntry={true}
        testID="text-input"
        onChangeText={mockOnChangeText}
      />
    );

    // TODO: ! SECURITY: * Should render as password type in web
    cy.get('[data-testid="text-input"]').should('have.attr', 'type', 'password');
  });

  it('should handle max length', () => {
    cy.mount(
      <TextInput 
        placeholder="Enter name"
        maxLength={10}
        testID="text-input"
        onChangeText={mockOnChangeText}
      />
    );

    // * Type more than max length
    cy.get('[data-testid="text-input"]').type('This is a very long name');
    
    // TODO: * Should be truncated to max length
    cy.get('[data-testid="text-input"]').should(($input) => {
      expect($input.val().length).to.be.at.most(10);
    });
  });

  it('should handle disabled state', () => {
    cy.mount(
      <TextInput 
        placeholder="Enter text"
        editable={false}
        testID="text-input"
        onChangeText={mockOnChangeText}
      />
    );

    // TODO: * Should be disabled
    cy.get('[data-testid="text-input"]').should('be.disabled');
  });

  it('should have consistent styling across platforms', () => {
    cy.mount(
      <TextInput 
        label="Test Input"
        placeholder="Enter text"
        testID="text-input"
        onChangeText={mockOnChangeText}
      />
    );

    // * Check core styling
    cy.get('[data-testid="text-input"]')
      .should('have.css', 'background-color', 'rgb(31, 41, 55)') // #1F2937
      .and('have.css', 'border-width', '1px')
      .and('have.css', 'border-radius', '8px')
      .and('have.css', 'color', 'rgb(249, 250, 251)'); // #F9FAFB
  });

  it('should handle rapid typing without issues', () => {
    cy.mount(
      <TextInput 
        placeholder="Enter text"
        testID="text-input"
        onChangeText={mockOnChangeText}
      />
    );

    // * Type rapidly
    cy.get('[data-testid="text-input"]').type('QuickTypingTest', { delay: 0 });
    cy.get('[data-testid="text-input"]').should('have.value', 'QuickTypingTest');
  });

  it('should handle special characters', () => {
    cy.mount(
      <TextInput 
        placeholder="Enter text"
        testID="text-input"
        onChangeText={mockOnChangeText}
      />
    );

    const specialText = '🏰 Château d\'Élégance & "Royal" Palace! @#$%^&*()';
    cy.get('[data-testid="text-input"]').type(specialText);
    cy.get('[data-testid="text-input"]').should('have.value', specialText);
  });

  it('should handle copy and paste operations', () => {
    cy.mount(
      <TextInput 
        placeholder="Enter text"
        testID="text-input"
        onChangeText={mockOnChangeText}
      />
    );

    const textToPaste = 'Pasted content from clipboard';
    
    // * Simulate paste operation
    cy.get('[data-testid="text-input"]').invoke('val', textToPaste).trigger('input');
    cy.get('[data-testid="text-input"]').should('have.value', textToPaste);
  });
});