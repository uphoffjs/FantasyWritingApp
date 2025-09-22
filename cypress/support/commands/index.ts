// * Index file for all custom Cypress commands
// * This file exports all command modules for easy import
// * Commands are organized by category for maintainability

// * Authentication & Session Management
import './auth';

// * Debug Utilities (root level as per TODO)
import './debug';

// * Navigation (cross-cutting concern, stays at root)
import './navigation';

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

// * Export for TypeScript reference
export * from './auth';
export * from './debug';
export * from './navigation';
export * from './elements';
export * from './projects';
export * from './responsive';
export * from './utility';
export * from './performance';