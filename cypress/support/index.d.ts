// TypeScript declarations for custom Cypress commands

declare namespace Cypress {
  interface Chainable {
    // Authentication commands
    login(email?: string, password?: string): Chainable<void>;
    logout(): Chainable<void>;
    
    // Story/Writing commands
    createStory(title: string, genre?: string): Chainable<void>;
    openStory(title: string): Chainable<void>;
    saveStory(): Chainable<void>;
    
    // Character commands
    createCharacter(name: string, role?: string): Chainable<void>;
    editCharacter(name: string): Chainable<void>;
    
    // Navigation commands
    navigateToHome(): Chainable<void>;
    navigateToStories(): Chainable<void>;
    navigateToCharacters(): Chainable<void>;
    navigateToSettings(): Chainable<void>;
    
    // Utility commands
    waitForLoad(): Chainable<void>;
    checkAccessibility(): Chainable<void>;
    
    // React Native Web compatibility commands
    getByDataCy(selector: string): Chainable<JQuery<HTMLElement>>;
    shouldHaveTestAttr(selector: string): Chainable<void>;
    
    // Factory reset command
    resetFactories(): Chainable<void>;
  }
}