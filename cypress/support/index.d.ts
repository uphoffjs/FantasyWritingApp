// * TypeScript declarations for custom Cypress commands
// * This file provides type definitions for all modular command files

/* eslint-disable @typescript-eslint/no-explicit-any */

/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    // * Authentication commands (commands/auth.ts)
    login(email?: string, password?: string): Chainable<void>;
    logout(): Chainable<void>;
    apiLogin(email?: string, password?: string): Chainable<void>;
    sessionLogin(email?: string, password?: string): Chainable<void>;
    loginAs(userType: 'admin' | 'editor' | 'viewer' | 'user'): Chainable<void>;
    clearTestSessions(): Chainable<void>;
    
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
    getByTestId(selector: string): Chainable<any>;
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

    // * Data seeding commands (commands/seeding.ts)
    execSeed(script: string): Chainable<string>;
    taskSeed(seedType: string, data: any): Chainable<any>;
    apiSeed(endpoint: string, data: any): Chainable<any>;
    stubResponses(stubs: Record<string, string>): Chainable<void>;
    seedTestUser(userData?: {
      id?: string;
      name?: string;
      email?: string;
      role?: string;
      createdAt?: string;
      [key: string]: any;
    }): Chainable<any>;
    seedTestProject(projectData?: {
      id?: string;
      name?: string;
      description?: string;
      elements?: any[];
      createdAt?: string;
      updatedAt?: string;
      [key: string]: any;
    }): Chainable<any>;
    seedTestElements(elements?: Array<{
      id?: string;
      name?: string;
      type?: string;
      category?: string;
      description?: string;
      [key: string]: any;
    }>): Chainable<any[]>;
    clearTestData(): Chainable<void>;

    // * Supabase Admin API seeding commands (RECOMMENDED)
    seedSupabaseUser(userData: {
      email: string;
      password: string;
      metadata?: Record<string, any>;
    }): Chainable<any>;
    cleanupSupabaseUsers(): Chainable<void>;
    deleteSupabaseUser(email: string): Chainable<void>;
    getSupabaseUser(email: string): Chainable<any>;

    // * Responsive/viewport commands (commands/responsive.ts)
    testResponsive(callback: (viewport: {name: string; width: number; height: number}) => void): Chainable<void>;
    simulateTouch(selector: string, gesture: 'tap' | 'longPress' | 'swipeLeft' | 'swipeRight' | 'swipeUp' | 'swipeDown'): Chainable<void>;
    setMobileViewport(): Chainable<void>;
    setTabletViewport(): Chainable<void>;
    setDesktopViewport(): Chainable<void>;
    isMobileViewport(): Chainable<boolean>;
    isTabletViewport(): Chainable<boolean>;
    isDesktopViewport(): Chainable<boolean>;
    testVisibilityAcrossViewports(selector: string, expectations: { mobile: boolean; tablet: boolean; desktop: boolean }): Chainable<void>;
    pinch(selector: string, scale: number): Chainable<void>;
    rotate(selector: string, degrees: number): Chainable<void>;

    // * Element commands (commands/elements/core.ts)
    createElement(category: string, name: string, description?: string): Chainable<void>;
    openElement(name: string): Chainable<void>;
    deleteElement(name: string): Chainable<void>;
    editElement(name: string, updates: {
      name?: string;
      description?: string;
      category?: string;
      tags?: string[];
    }): Chainable<void>;
    addElementCustomField(elementName: string, fieldName: string, fieldValue: string): Chainable<void>;
    linkElements(sourceElement: string, targetElement: string, linkType?: string): Chainable<void>;
    filterElementsByCategory(category: string): Chainable<void>;
    searchElements(searchTerm: string): Chainable<void>;
    exportElement(elementName: string, format?: 'json' | 'markdown' | 'txt'): Chainable<void>;

    // * Element management commands (commands/elements/management.ts)
    createMultipleElements(elements: Array<{
      category: string;
      name: string;
      description?: string;
      tags?: string[];
    }>): Chainable<void>;
    clearElementCategory(category: string): Chainable<void>;
    importElementsFromFixture(fixtureName: string): Chainable<void>;
    exportAllElements(format?: 'json' | 'csv' | 'markdown'): Chainable<void>;
    bulkUpdateElements(elementNames: string[], updates: {
      category?: string;
      tags?: string[];
      customFields?: Record<string, string>;
    }): Chainable<void>;
    archiveElements(elementNames: string[]): Chainable<void>;
    restoreElements(elementNames: string[]): Chainable<void>;
    duplicateElement(elementName: string, newName: string): Chainable<void>;
    sortElements(sortBy: 'name' | 'created' | 'modified' | 'category', order?: 'asc' | 'desc'): Chainable<void>;

    // * Element validation commands (commands/elements/validation.ts)
    verifyElement(name: string, expectedProperties?: {
      category?: string;
      hasDescription?: boolean;
      tags?: string[];
      linkedElements?: string[];
    }): Chainable<void>;
    verifyElementCount(category: string | 'all', expectedCount: number): Chainable<void>;
    verifyElementDoesNotExist(name: string): Chainable<void>;
    verifyElementCustomField(elementName: string, fieldName: string, expectedValue: string): Chainable<void>;
    verifySearchResults(searchTerm: string, expectedResults: string[]): Chainable<void>;
    verifyElementArchived(elementName: string): Chainable<void>;
    verifyElementLink(sourceElement: string, targetElement: string, linkType?: string): Chainable<void>;
    verifyElementOrder(expectedOrder: string[]): Chainable<void>;
    verifyBulkOperation(operation: 'tag' | 'category' | 'delete' | 'archive', affectedElements: string[], verification: {
      tag?: string;
      category?: string;
      shouldExist?: boolean;
    }): Chainable<void>;

    // * Project commands (commands/projects/core.ts)
    createProject(name: string, description?: string, genre?: string): Chainable<void>;
    openProject(name: string): Chainable<void>;
    deleteProject(name: string): Chainable<void>;
    editProject(name: string, updates: {
      name?: string;
      description?: string;
      genre?: string;
      status?: 'draft' | 'in-progress' | 'review' | 'completed';
    }): Chainable<void>;
    addElementsToProject(projectName: string, elementNames: string[]): Chainable<void>;
    removeElementsFromProject(projectName: string, elementNames: string[]): Chainable<void>;
    setActiveProject(projectName: string): Chainable<void>;
    archiveProject(projectName: string): Chainable<void>;
    duplicateProject(projectName: string, newName: string): Chainable<void>;
    exportProject(projectName: string, format?: 'json' | 'markdown' | 'docx'): Chainable<void>;

    // * Project management commands (commands/projects/management.ts)
    createMultipleProjects(projects: Array<{
      name: string;
      description?: string;
      genre?: string;
      status?: 'draft' | 'in-progress' | 'review' | 'completed';
    }>): Chainable<void>;
    filterProjectsByStatus(status: 'all' | 'draft' | 'in-progress' | 'review' | 'completed' | 'archived'): Chainable<void>;
    searchProjects(searchTerm: string): Chainable<void>;
    sortProjects(sortBy: 'name' | 'created' | 'modified' | 'status', order?: 'asc' | 'desc'): Chainable<void>;
    bulkUpdateProjectStatus(projectNames: string[], newStatus: 'draft' | 'in-progress' | 'review' | 'completed'): Chainable<void>;
    archiveMultipleProjects(projectNames: string[]): Chainable<void>;
    restoreProjects(projectNames: string[]): Chainable<void>;
    importProjectsFromFixture(fixtureName: string): Chainable<void>;
    exportAllProjects(format?: 'json' | 'csv' | 'zip'): Chainable<void>;
    clearAllProjects(confirm: boolean): Chainable<void>;
    verifyProjectCount(expectedCount: number, status?: 'draft' | 'in-progress' | 'review' | 'completed' | 'archived'): Chainable<void>;
    getProjectStats(): Chainable<{
      total: number;
      draft: number;
      inProgress: number;
      review: number;
      completed: number;
      archived: number;
    }>;

    // * Enhanced debug commands (commands/debug.ts)
    captureNetworkFailures(options?: {
      logOnly?: number[];
      ignoreUrls?: string[];
    }): Chainable<void>;
    logPerformanceMetrics(label?: string): Chainable<void>;
    trackMemoryUsage(intervalMs?: number, duration?: number): Chainable<void>;
    exportDebugData(filename?: string): Chainable<void>;
    addCustomDebugData(key: string, value: any): Chainable<void>;
    startOperationTimer(label: string, warningThreshold?: number): Chainable<void>;
    stopOperationTimer(label: string): Chainable<void>;

    // * React Native Web commands (commands/react-native-commands.ts)
    getPlatform(): Chainable<'web' | 'ios' | 'android'>;
    setStorageItem(key: string, value: string): Chainable<void>;
    getStorageItem(key: string): Chainable<string | null>;
    clearStorage(): Chainable<void>;
    navigateToScreen(screenName: string, params?: any): Chainable<void>;
    getCurrentScreen(): Chainable<string>;
    checkForErrorBoundary(): Chainable<void>;
    waitForAnimations(duration?: number): Chainable<void>;
    typeInTextInput(selector: string, text: string): Chainable<void>;
    tapElement(selector: string): Chainable<void>;
    scrollInView(selector: string, direction: 'up' | 'down' | 'left' | 'right', amount?: number): Chainable<void>;
    scrollToListItem(selector: string, itemIndex: number): Chainable<void>;
    verifyComponentRendered(componentName: string): Chainable<void>;
    handleModal(action: 'open' | 'close' | 'verify', modalId: string): Chainable<void>;
    selectPickerValue(selector: string, value: string): Chainable<void>;
    toggleSwitch(selector: string, state: boolean): Chainable<void>;
    waitForReactNative(): Chainable<void>;

    // * Mock Supabase commands (commands/mock-supabase.ts)
    mockSupabaseAuth(user?: {
      id?: string;
      email?: string;
      username?: string;
      display_name?: string;
    }): Chainable<void>;
    cleanMockAuth(): Chainable<void>;
    mockSupabaseDatabase(fixtures?: {
      profiles?: any[];
      projects?: any[];
      elements?: any[];
    }): Chainable<void>;
    mockSupabaseError(
      endpoint: string,
      errorType: 'auth' | 'network' | 'validation' | 'notFound'
    ): Chainable<void>;
  }
}