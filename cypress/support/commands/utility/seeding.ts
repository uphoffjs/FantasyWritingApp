// * Data seeding strategies for test data management
// ! All commands follow Cypress best practices documentation

/**
 * Method 1: Seed data using cy.exec() - Run system commands
 * @param script - The npm script to run for seeding
 * @example cy.execSeed('db:reset')
 */
Cypress.Commands.add('execSeed', (script: string) => {
  // * Execute npm script with timeout
  cy.exec(`npm run ${script}`, {
    timeout: 60000,
    failOnNonZeroExit: false // * Allow handling of errors
  }).then((result) => {
    // * Log the output for debugging
    cy.task('log', `Seed script '${script}' completed`);

    if (result.code !== 0) {
      cy.task('log', `Warning: Script exited with code ${result.code}`);
      cy.task('log', result.stderr);
    }

    return result.stdout;
  });
});

/**
 * Method 2: Seed data using cy.task() - Run Node.js code
 * @param seedType - The type of seed operation
 * @param data - The data to seed
 * @example cy.taskSeed('users', { name: 'Test User' })
 */
Cypress.Commands.add('taskSeed', (seedType: string, data: any) => {
  // * Execute task-based seeding
  cy.task(`seed:${seedType}`, data, { timeout: 30000 }).then((result) => {
    cy.task('log', `Task seeding '${seedType}' completed`);
    return result;
  });
});

/**
 * Method 3: Seed data using cy.request() - API seeding
 * @param endpoint - The seeding endpoint (without /test/seed/ prefix)
 * @param data - The data to seed
 * @example cy.apiSeed('project', { name: 'Test Project' })
 */
Cypress.Commands.add('apiSeed', (endpoint: string, data: any) => {
  // * Make API request to seed endpoint
  cy.request({
    method: 'POST',
    url: `/test/seed/${endpoint}`,
    body: data,
    headers: {
      'Content-Type': 'application/json',
      'X-Test-Seed': 'true' // * Mark as test data for cleanup
    },
    failOnStatusCode: false // * Handle errors gracefully
  }).then((response) => {
    if (response.status !== 201 && response.status !== 200) {
      cy.task('log', `Warning: API seed returned status ${response.status}`);
    }

    expect(response.status).to.be.oneOf([200, 201]);
    return response.body;
  });
});

/**
 * Method 4: Stub responses with fixtures
 * @param stubs - Object mapping routes to fixture files
 * @example cy.stubResponses({ '/api/users': 'users.json', '/api/projects': 'projects.json' })
 */
Cypress.Commands.add('stubResponses', (stubs: Record<string, string>) => {
  // * Set up interceptors for each stubbed route
  Object.entries(stubs).forEach(([route, fixture]) => {
    // * Remove .json extension for alias
    const aliasName = fixture.replace('.json', '');

    cy.intercept('GET', route, {
      fixture,
      statusCode: 200
    }).as(aliasName);

    cy.task('log', `Stubbed ${route} with fixture ${fixture}`);
  });
});

/**
 * Seed a test user with specific properties
 * @param userData - User data to seed
 * @example cy.seedTestUser({ name: 'John Doe', role: 'admin' })
 */
Cypress.Commands.add('seedTestUser', (userData: any = {}) => {
  const defaultUser = {
    id: `user_${Date.now()}`,
    name: 'Test User',
    email: `test_${Date.now()}@example.com`,
    role: 'user',
    createdAt: new Date().toISOString()
  };

  const user = { ...defaultUser, ...userData };

  // * Store user data in localStorage for React Native Web
  cy.window().then((win) => {
    const existingUsers = JSON.parse(win.localStorage.getItem('testUsers') || '[]');
    existingUsers.push(user);
    win.localStorage.setItem('testUsers', JSON.stringify(existingUsers));
    win.localStorage.setItem('currentTestUser', JSON.stringify(user));
  });

  return cy.wrap(user);
});

/**
 * Seed a test project with specific properties
 * @param projectData - Project data to seed
 * @example cy.seedTestProject({ name: 'Fantasy Novel', genre: 'Epic Fantasy' })
 */
Cypress.Commands.add('seedTestProject', (projectData: any = {}) => {
  const defaultProject = {
    id: `project_${Date.now()}`,
    name: 'Test Project',
    description: 'A test project for E2E testing',
    elements: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const project = { ...defaultProject, ...projectData };

  // * Store project data in localStorage for React Native Web
  cy.window().then((win) => {
    const existingProjects = JSON.parse(win.localStorage.getItem('testProjects') || '[]');
    existingProjects.push(project);
    win.localStorage.setItem('testProjects', JSON.stringify(existingProjects));
    win.localStorage.setItem('currentTestProject', JSON.stringify(project));
  });

  return cy.wrap(project);
});

/**
 * Seed test elements (characters, locations, etc.)
 * @param elements - Array of element data to seed
 * @example cy.seedTestElements([{ name: 'Hero', type: 'character' }])
 */
Cypress.Commands.add('seedTestElements', (elements: any[] = []) => {
  const seededElements = elements.map((element, index) => ({
    id: `element_${Date.now()}_${index}`,
    name: element.name || `Test Element ${index}`,
    type: element.type || 'character',
    category: element.category || 'Characters',
    description: element.description || 'Test element for E2E testing',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...element
  }));

  // * Store elements in localStorage for React Native Web
  cy.window().then((win) => {
    const existingElements = JSON.parse(win.localStorage.getItem('testElements') || '[]');
    existingElements.push(...seededElements);
    win.localStorage.setItem('testElements', JSON.stringify(existingElements));
  });

  return cy.wrap(seededElements);
});

/**
 * Clear all test data from storage
 * @example cy.clearTestData()
 */
Cypress.Commands.add('clearTestData', () => {
  cy.window().then((win) => {
    // * Clear all test-related data
    const keysToRemove = [
      'testUsers',
      'currentTestUser',
      'testProjects',
      'currentTestProject',
      'testElements'
    ];

    keysToRemove.forEach(key => {
      win.localStorage.removeItem(key);
    });

    cy.task('log', 'Test data cleared');
  });
});

// * Export empty object to prevent TS errors
export {};