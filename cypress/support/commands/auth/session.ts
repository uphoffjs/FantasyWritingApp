/**
 * @fileoverview Session Management Commands for Test Data Caching
 * Implements cy.session() for performance optimization in component tests
 *
 * Purpose:
 * - Cache test data setup across tests for faster execution
 * - Reduce redundant store initialization
 * - Maintain test isolation while improving performance
 * - Support cross-spec session sharing for suite-wide optimization
 */

import React from 'react';
import { initializeStoresForTest } from '../component-wrapper';

// * Type definitions for session data
interface TestSessionData {
  worldbuilding?: {
    projects?: any[];
    elements?: any[];
    relationships?: any[];
    activeProjectId?: string;
  };
  auth?: {
    user?: any;
    isAuthenticated?: boolean;
    token?: string;
  };
  toast?: any;
  notification?: any;
}

// * Type for session options
interface SessionOptions {
  cacheAcrossSpecs?: boolean;
  validate?: () => void | Promise<void>;
}

/**
 * Setup test data with session caching
 * Uses cy.session() to cache complex test data setup
 */
Cypress.Commands.add('setupTestDataWithSession', (
  sessionId: string | string[],
  testData: TestSessionData,
  options: SessionOptions = {}
) => {
  const defaultOptions: SessionOptions = {
    cacheAcrossSpecs: true, // * Share sessions across test files for performance
    validate: () => {
      // * Default validation: check if stores have expected data
      cy.window().then((win: any) => {
        if (testData.worldbuilding?.projects) {
          // * Validate that projects exist in store
          const store = win.__zustand_worldbuilding_store?.getState();
          expect(store?.projects).to.exist;
        }

        if (testData.auth?.isAuthenticated) {
          // * Validate authentication state
          const authStore = win.__zustand_auth_store?.getState();
          expect(authStore?.isAuthenticated).to.be.true;
        }
      });
    },
  };

  const finalOptions = { ...defaultOptions, ...options };

  // * Use cy.session for caching
  cy.session(
    sessionId,
    () => {
      // * Setup function - runs once and is cached
      cy.window().then((win: any) => {
        // * Initialize stores with test data
        initializeStoresForTest(testData);

        // * Store reference in window for validation
        if (!win.__zustand_worldbuilding_store) {
          win.__zustand_worldbuilding_store = require('../../../src/store/rootStore').useWorldbuildingStore;
        }
        if (!win.__zustand_auth_store) {
          win.__zustand_auth_store = require('../../../src/store/authStore').useAuthStore;
        }
      });

      // * If test data includes auth, set up authentication
      if (testData.auth?.isAuthenticated) {
        cy.window().then((win) => {
          win.localStorage.setItem('auth-token', testData.auth.token || 'test-token');
          win.localStorage.setItem('user', JSON.stringify(testData.auth.user || {}));
        });
      }

      cy.log('📦 Test data cached in session', sessionId);
    },
    finalOptions
  );
});

/**
 * Cache component mounting with specific props
 * Useful for testing the same component with different states
 */
Cypress.Commands.add('mountWithSession', (
  sessionId: string | string[],
  Component: React.ComponentType<any>,
  props: any = {},
  testData?: TestSessionData
) => {
  // * Create session for this specific component and props combination
  cy.session(
    sessionId,
    () => {
      // * Setup test data if provided
      if (testData) {
        initializeStoresForTest(testData);
      }

      // * Cache component props
      cy.window().then((win: any) => {
        win.__cached_component_props = props;
      });
    },
    {
      validate: () => {
        // * Validate cached props exist
        cy.window().its('__cached_component_props').should('exist');
      },
      cacheAcrossSpecs: true,
    }
  );

  // * After session restore, mount component with cached props
  cy.window().then((win: any) => {
    const cachedProps = win.__cached_component_props || props;
    cy.mount(Component, cachedProps);
  });
});

/**
 * Create session for user authentication
 * Optimized for auth-related component tests
 */
Cypress.Commands.add('loginWithSession', (
  email: string = 'test@example.com',
  role: 'user' | 'admin' | 'editor' = 'user'
) => {
  const sessionId = ['auth', email, role];

  cy.session(
    sessionId,
    () => {
      // * Setup authentication state
      const userData = {
        id: `user_${Date.now()}`,
        email,
        name: email.split('@')[0],
        role,
        preferences: {},
        createdAt: new Date().toISOString(),
      };

      const authData: TestSessionData = {
        auth: {
          user: userData,
          isAuthenticated: true,
          token: `token_${role}_${Date.now()}`,
        },
      };

      // * Initialize auth store
      initializeStoresForTest(authData);

      // * Persist auth to localStorage
      cy.window().then((win) => {
        win.localStorage.setItem('auth-token', authData.auth!.token!);
        win.localStorage.setItem('user', JSON.stringify(userData));
        win.localStorage.setItem('user-role', role);
      });

      cy.log(`🔐 Authenticated as ${role}: ${email}`);
    },
    {
      validate: () => {
        // * Validate auth token exists and role matches
        cy.window().then((win) => {
          const token = win.localStorage.getItem('auth-token');
          expect(token).to.exist;

          const storedRole = win.localStorage.getItem('user-role');
          expect(storedRole).to.equal(role);
        });
      },
      cacheAcrossSpecs: true,
    }
  );
});

/**
 * Create session with pre-populated project data
 * Useful for element and relationship tests
 */
Cypress.Commands.add('setupProjectWithSession', (
  projectName: string = 'Test Project',
  includeElements: boolean = false,
  includeRelationships: boolean = false
) => {
  const sessionId = ['project', projectName, includeElements, includeRelationships];

  cy.session(
    sessionId,
    () => {
      const projectId = `project_${Date.now()}`;
      const testData: TestSessionData = {
        worldbuilding: {
          projects: [{
            id: projectId,
            name: projectName,
            description: 'Test project for component testing',
            createdAt: new Date().toISOString(),
          }],
          activeProjectId: projectId,
          elements: [],
          relationships: [],
        },
      };

      // * Add elements if requested
      if (includeElements) {
        testData.worldbuilding!.elements = [
          {
            id: `element_1_${Date.now()}`,
            projectId,
            name: 'Test Character',
            category: 'Characters',
            type: 'character',
          },
          {
            id: `element_2_${Date.now()}`,
            projectId,
            name: 'Test Location',
            category: 'Locations',
            type: 'location',
          },
        ];
      }

      // * Add relationships if requested
      if (includeRelationships && testData.worldbuilding!.elements!.length >= 2) {
        testData.worldbuilding!.relationships = [
          {
            id: `rel_${Date.now()}`,
            projectId,
            sourceId: testData.worldbuilding!.elements![0].id,
            targetId: testData.worldbuilding!.elements![1].id,
            type: 'located_in',
            description: 'Character is located in this place',
          },
        ];
      }

      // * Initialize stores with test data
      initializeStoresForTest(testData);

      cy.log(`📚 Project "${projectName}" cached with:
        - Elements: ${includeElements}
        - Relationships: ${includeRelationships}`);
    },
    {
      validate: () => {
        // * Validate project exists in store
        cy.window().then((win: any) => {
          const store = win.__zustand_worldbuilding_store?.getState();
          expect(store?.projects).to.have.length.at.least(1);
          expect(store?.activeProjectId).to.exist;
        });
      },
      cacheAcrossSpecs: true,
    }
  );
});

/**
 * Clear all sessions (useful for test cleanup)
 */
Cypress.Commands.add('clearTestSessions', () => {
  // * Note: cy.session() doesn't have a built-in clear method
  // * Sessions are automatically cleared when Cypress restarts
  // * This command is a placeholder for future session management
  cy.log('⚠️ Sessions will be cleared on next Cypress restart');

  // * Clear localStorage as alternative
  cy.window().then((win) => {
    win.localStorage.clear();
    win.sessionStorage.clear();
  });
});

// * Extend Cypress command types
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /**
       * Setup test data with session caching
       * @param sessionId - Unique identifier for the session
       * @param testData - Test data to cache
       * @param options - Session options
       */
      setupTestDataWithSession(
        sessionId: string | string[],
        testData: TestSessionData,
        options?: SessionOptions
      ): Chainable<void>;

      /**
       * Mount component with session caching
       * @param sessionId - Unique identifier for the session
       * @param Component - React component to mount
       * @param props - Component props
       * @param testData - Optional test data to setup
       */
      mountWithSession(
        sessionId: string | string[],
        Component: React.ComponentType<any>,
        props?: any,
        testData?: TestSessionData
      ): Chainable<void>;

      /**
       * Login with session caching
       * @param email - User email
       * @param role - User role
       */
      loginWithSession(
        email?: string,
        role?: 'user' | 'admin' | 'editor'
      ): Chainable<void>;

      /**
       * Setup project with session caching
       * @param projectName - Name of the project
       * @param includeElements - Include test elements
       * @param includeRelationships - Include test relationships
       */
      setupProjectWithSession(
        projectName?: string,
        includeElements?: boolean,
        includeRelationships?: boolean
      ): Chainable<void>;

      /**
       * Clear all test sessions
       */
      clearTestSessions(): Chainable<void>;
    }
  }
}