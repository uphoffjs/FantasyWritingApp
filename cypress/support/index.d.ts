// * TypeScript declarations for custom Cypress commands
// * This file provides type definitions for all modular command files

declare namespace Cypress {
  interface Chainable {
    // * Authentication commands (commands/auth.ts)
    login(email?: string, password?: string): Chainable<void>;
    logout(): Chainable<void>;
    apiLogin(email?: string, password?: string): Chainable<void>;
    sessionLogin(email?: string, password?: string): Chainable<void>;
    
    // * Navigation commands (commands/navigation.ts)
    navigateToHome(): Chainable<void>;
    navigateToStories(): Chainable<void>;
    navigateToCharacters(): Chainable<void>;
    navigateToSettings(): Chainable<void>;
    navigateToEditor(): Chainable<void>;
    navigateToProfile(): Chainable<void>;
    navigateBack(): Chainable<void>;
    
    // * Story/Writing commands (commands/story.ts)
    createStory(title: string, genre?: string): Chainable<void>;
    openStory(title: string): Chainable<void>;
    saveStory(): Chainable<void>;
    deleteStory(title: string): Chainable<void>;
    addChapter(chapterTitle: string): Chainable<void>;
    
    // * Character commands (commands/character.ts)
    createCharacter(name: string, role?: string): Chainable<void>;
    editCharacter(name: string): Chainable<void>;
    deleteCharacter(name: string): Chainable<void>;
    addCharacterDescription(name: string, description: string): Chainable<void>;
    
    // * Utility commands (commands/utility.ts)
    waitForLoad(): Chainable<void>;
    checkAccessibility(): Chainable<void>;
    getByTestId(selector: string): Chainable<JQuery<HTMLElement>>;
    shouldHaveTestAttr(selector: string): Chainable<void>;
    takeScreenshot(name: string): Chainable<void>;
    verifyToast(message: string): Chainable<void>;
    uploadFile(fileName: string, selector?: string): Chainable<void>;
    clearForm(): Chainable<void>;
    
    // * Debug commands (commands/debug.ts)
    comprehensiveDebug(): Chainable<void>;
    captureFailureDebug(): Chainable<void>;
    logWithTimestamp(message: string): Chainable<void>;
    verifyNoConsoleErrors(): Chainable<void>;
    
    // * Setup and teardown commands (commands/setup.ts)
    resetFactories(): Chainable<void>;
    cleanState(): Chainable<void>;
    setupTestData(): Chainable<void>;
    setupAuthenticatedUser(userData?: {
      id: string;
      email: string;
      name: string;
      role: string;
    }): Chainable<void>;
    seedDatabase(options?: {
      stories?: number;
      characters?: number;
      chapters?: number;
    }): Chainable<void>;
  }
}