/**
 * Stub Helpers Index
 *
 * * Purpose: Central export for all stub helper functions
 * * Usage: Import stubs from this file in test files
 *
 * @example
 * import { stubSuccessfulLogin, stubGetProjects } from '../support/stubs';
 *
 * beforeEach(() => {
 *   stubSuccessfulLogin('user@test.com');
 *   stubGetProjects();
 * });
 */

// * Authentication stubs
export {
  // Successful auth
  stubSuccessfulLogin,
  stubSuccessfulSignup,
  stubValidSession,
  stubSuccessfulLogout,
  stubPasswordResetRequest,
  // Failed auth
  stubFailedLogin,
  stubFailedSignup,
  stubExpiredSession,
  // Network errors
  stubNetworkTimeout,
  stubServerError
} from './authStubs';

// * Project stubs
export {
  // Retrieval
  stubNoProjects,
  stubGetProjects,
  stubGetProject,
  // CRUD operations
  stubCreateProject,
  stubUpdateProject,
  stubDeleteProject,
  // Errors
  stubFailedProjectCreate,
  stubFailedProjectUpdate,
  stubProjectNotFound
} from './projectStubs';

// * Element stubs
export {
  // Retrieval
  stubNoElements,
  stubGetElements,
  stubGetElement,
  // CRUD operations
  stubCreateElement,
  stubUpdateElement,
  stubDeleteElement,
  // Filtering
  stubGetElementsByType,
  // Errors
  stubFailedElementCreate,
  stubFailedElementUpdate,
  stubElementNotFound
} from './elementStubs';
