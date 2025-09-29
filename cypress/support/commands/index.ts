// * Index file for all custom Cypress commands
// * This file exports all command modules for easy import
// * Commands are organized by category for maintainability

// * Authentication & Session Management
import './auth';

// * Debug Utilities (root level as per TODO)
import './debug';
import './build-error-capture';

// * Navigation (cross-cutting concern, stays at root)
import './navigation';

// * Selectors (handles testID → data-testid conversion)
import './selectors';

// * Element Management
import './elements';

// * Project Management
import './projects';

// * Responsive & Mobile Testing
import './responsive';

// * Utility Commands
import './utility/index';
import './utility'; // Stub and spy commands

// * Performance Monitoring
import './performance';

// * Data Seeding Commands
import './seeding';

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