// * Index file for all custom Cypress commands
// * This file exports all command modules organized by category

// * Authentication & Session Management (includes mock auth)
import './auth';

// * Database Commands (includes mock database)
import './database';

// * Debug & Testing Utilities
import './debug';

// * Error Mocking
import './mocking';

// * Navigation Commands
import './navigation';

// * Selector Commands (handles testID → data-testid conversion)
import './selectors';

// * Element Management
import './elements';

// * Project Management
import './projects';

// * Responsive & Mobile Testing
import './responsive';

// * Utility Commands (stub, spy)
import './utility/index';

// * Performance Monitoring
import './performance';

// * Data Seeding Commands
import './seeding';

// * Wait Helpers
import './wait';

// * Export for TypeScript reference
export * from './auth';
export * from './debug';
export * from './navigation';
export * from './selectors';
export * from './elements';
export * from './projects';
export * from './responsive';
export * from './utility';
export * from './performance';
