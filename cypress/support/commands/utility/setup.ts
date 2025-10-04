/* eslint-disable @typescript-eslint/no-explicit-any */

// * Setup and teardown Cypress commands

/**
 * Reset factories to initial state
 */
Cypress.Commands.add('resetFactories', () => {
  cy.window().then((win) => {
    // * Reset any test data factories
    if ((win as any).testFactories) {
      (win as any).testFactories = {};
    }
    
    // * Clear storage
    win.localStorage.clear();
    win.sessionStorage.clear();
  });
  
  // * Reset fixture data
  // ! Fixed: Moved cy.wrap outside of .then() to avoid promise chain issues
  cy.fixture('testData.json', { timeout: 1000 })
    .then((data) => {
      // * Store the data for next command
      return data;
    })
    .then((data) => {
      // * Now wrap and alias outside the promise
      cy.wrap(data).as('defaultTestData');
    })
    .catch(() => {
      // * If fixture doesn't exist, create default
      // * Handle error case without nested cy command
      cy.wrap({}).as('defaultTestData');
    });
});

/**
 * Clean all state before tests
 */
Cypress.Commands.add('cleanState', () => {
  // ! Fixed: Moved cy commands outside of .then() callback
  // * Clear cookies and localStorage first
  cy.clearCookies();
  cy.clearLocalStorage();
  
  cy.window().then((win) => {
    // * Clear localStorage
    win.localStorage.clear();
    
    // * Clear sessionStorage
    win.sessionStorage.clear();
    
    // * Clear IndexedDB if it exists
    if (win.indexedDB) {
      // * Get all databases
      if (win.indexedDB.databases) {
        win.indexedDB.databases().then((databases) => {
          databases.forEach((db) => {
            win.indexedDB.deleteDatabase(db.name || '');
          });
        }).catch(() => {
          // * Older browsers don't support databases()
          // * Try to clear known database names
          const knownDbs = ['fantasy-writing-app', 'stories-db', 'characters-db'];
          knownDbs.forEach(dbName => {
            win.indexedDB.deleteDatabase(dbName);
          });
        });
      }
    }
  });
  
  // * Log cleanup completed
  cy.task('log', 'State cleaned - localStorage, sessionStorage, cookies, and IndexedDB cleared');
});

/**
 * Setup test data for React Native Web
 */
Cypress.Commands.add('setupTestData', () => {
  cy.task('log', 'Setting up test data...');
  
  // * Default test story
  const testStory = {
    id: 'test-story-1',
    title: 'Test Fantasy Story',
    genre: 'fantasy',
    content: 'Test content for E2E testing',
    wordCount: 5,
    chapters: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  // * Default test character
  const testCharacter = {
    id: 'test-char-1',
    name: 'Test Hero',
    role: 'protagonist',
    description: 'A brave test character',
    storyId: 'test-story-1',
    createdAt: new Date().toISOString()
  };
  
  // * Store in localStorage
  cy.window().then((win) => {
    // * Stories
    win.localStorage.setItem(
      'fantasy-writing-app-stories',
      JSON.stringify({ 
        stories: [testStory],
        currentStoryId: testStory.id
      })
    );
    
    // * Characters
    win.localStorage.setItem(
      'fantasy-writing-app-characters',
      JSON.stringify({ 
        characters: [testCharacter]
      })
    );
    
    // * User preferences
    win.localStorage.setItem(
      'fantasy-writing-app-preferences',
      JSON.stringify({
        theme: 'light',
        fontSize: 'medium',
        autoSave: true
      })
    );
    
    // ! Fixed: Removed cy.task from inside .then() callback
  });
  
  // * Log outside the promise chain
  cy.task('log', 'Test data setup complete');
});

/**
 * Setup authenticated user session
 * @param userData - User data to set up
 */
Cypress.Commands.add('setupAuthenticatedUser', (userData = {
  id: 'test-user-1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'writer'
}) => {
  cy.window().then((win) => {
    // * Set auth token
    win.localStorage.setItem('authToken', 'test-auth-token-123');
    
    // * Set user data
    win.localStorage.setItem('userData', JSON.stringify(userData));
    
    // * Set session expiry (1 hour from now)
    const expiryTime = new Date();
    expiryTime.setHours(expiryTime.getHours() + 1);
    win.localStorage.setItem('sessionExpiry', expiryTime.toISOString());
    
    // ! Fixed: Store email for logging outside the promise
    (win as any)._lastAuthEmail = userData.email;
  });
  
  // * Log outside the promise chain
  cy.window().then((win) => {
    const email = (win as any)._lastAuthEmail || 'unknown';
    cy.task('log', `Authenticated user setup: ${email}`);
  });
});

/**
 * Seed database with test data
 * @param options - Seeding options
 */
Cypress.Commands.add('seedDatabase', (options = {
  stories: 3,
  characters: 5,
  chapters: 2
}) => {
  cy.task('log', `Seeding database with: ${JSON.stringify(options)}`);
  
  const data: any = {
    stories: [],
    characters: [],
    chapters: []
  };
  
  // * Generate stories
  for (let i = 1; i <= options.stories; i++) {
    data.stories.push({
      id: `story-${i}`,
      title: `Test Story ${i}`,
      genre: ['fantasy', 'scifi', 'mystery'][i % 3],
      content: `Content for story ${i}`,
      wordCount: i * 100,
      createdAt: new Date().toISOString()
    });
  }
  
  // * Generate characters
  for (let i = 1; i <= options.characters; i++) {
    data.characters.push({
      id: `char-${i}`,
      name: `Character ${i}`,
      role: ['protagonist', 'antagonist', 'supporting'][i % 3],
      storyId: `story-${(i % options.stories) + 1}`,
      createdAt: new Date().toISOString()
    });
  }
  
  // * Generate chapters
  for (let i = 1; i <= options.chapters; i++) {
    data.chapters.push({
      id: `chapter-${i}`,
      title: `Chapter ${i}`,
      content: `Chapter ${i} content`,
      storyId: 'story-1',
      orderIndex: i,
      createdAt: new Date().toISOString()
    });
  }
  
  // * Store in localStorage
  cy.window().then((win) => {
    win.localStorage.setItem('fantasy-writing-app-test-data', JSON.stringify(data));
    // ! Fixed: Removed cy.task from inside .then() callback
  });
  
  // * Log outside the promise chain
  cy.task('log', 'Database seeded successfully');
  
  // * Return data for chaining
  cy.wrap(data).as('seededData');
});

// * Export empty object to prevent TS errors
export {};
