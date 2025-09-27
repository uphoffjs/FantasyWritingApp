/**
 * Database Tasks for Cypress
 *
 * Implements database seeding and cleanup following Cypress best practices
 * Uses cy.task() for Node.js operations outside the browser
 */

const { v4: uuidv4 } = require('uuid');

// * Mock database connection (replace with actual database client)
// In a real app, this would connect to your test database
class TestDatabase {
  constructor() {
    this.data = {
      users: [],
      projects: [],
      elements: [],
      stories: [],
      scenes: [],
      chapters: []
    };
  }

  clean() {
    // * Reset all data
    this.data = {
      users: [],
      projects: [],
      elements: [],
      stories: [],
      scenes: [],
      chapters: []
    };
    return Promise.resolve({ message: 'Database cleaned' });
  }

  seed(seedData) {
    // * Add seed data to collections
    Object.keys(seedData).forEach(collection => {
      if (this.data[collection]) {
        const items = Array.isArray(seedData[collection])
          ? seedData[collection]
          : [seedData[collection]];

        items.forEach(item => {
          this.data[collection].push({
            id: uuidv4(),
            ...item,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        });
      }
    });

    return Promise.resolve({
      message: 'Database seeded',
      counts: Object.keys(seedData).reduce((acc, key) => {
        acc[key] = Array.isArray(seedData[key])
          ? seedData[key].length
          : 1;
        return acc;
      }, {})
    });
  }

  createUser(userData) {
    const user = {
      id: uuidv4(),
      email: userData.email || 'test@example.com',
      password: userData.password || 'password123', // Would be hashed in real app
      name: userData.name || 'Test User',
      role: userData.role || 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.data.users.push(user);
    return Promise.resolve(user);
  }

  createProject(projectData) {
    const project = {
      id: uuidv4(),
      name: projectData.name || `Project ${Date.now()}`,
      description: projectData.description || '',
      genre: projectData.genre || 'Fantasy',
      status: projectData.status || 'active',
      userId: projectData.userId || this.data.users[0]?.id,
      elementCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.data.projects.push(project);
    return Promise.resolve(project);
  }

  createElements(elements) {
    const createdElements = elements.map(element => ({
      id: uuidv4(),
      projectId: element.projectId || this.data.projects[0]?.id,
      name: element.name,
      type: element.type || 'character',
      description: element.description || '',
      tags: element.tags || [],
      completionPercentage: element.completionPercentage || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));

    this.data.elements.push(...createdElements);
    return Promise.resolve(createdElements);
  }

  getStats() {
    return Promise.resolve({
      users: this.data.users.length,
      projects: this.data.projects.length,
      elements: this.data.elements.length,
      stories: this.data.stories.length,
      scenes: this.data.scenes.length
    });
  }
}

// * Initialize database instance
const db = new TestDatabase();

/**
 * Register database tasks with Cypress
 * These tasks run in Node.js context, not browser
 */
module.exports = (on, config) => {
  // * Database cleanup task
  on('task', {
    'db:clean': () => {
      return db.clean();
    },

    // * Database seeding task
    'db:seed': (seedData) => {
      return db.seed(seedData);
    },

    // * Create test user
    'db:createUser': (userData) => {
      return db.createUser(userData);
    },

    // * Create test project
    'db:createProject': (projectData) => {
      return db.createProject(projectData);
    },

    // * Create multiple elements
    'db:createElements': (elements) => {
      return db.createElements(elements);
    },

    // * Get database statistics
    'db:stats': () => {
      return db.getStats();
    },

    // * Reset specific collection
    'db:resetCollection': (collectionName) => {
      if (db.data[collectionName]) {
        db.data[collectionName] = [];
        return Promise.resolve({ message: `${collectionName} collection reset` });
      }
      return Promise.reject(new Error(`Collection ${collectionName} not found`));
    },

    // * Custom query (for complex operations)
    'db:query': ({ collection, filter }) => {
      if (!db.data[collection]) {
        return Promise.reject(new Error(`Collection ${collection} not found`));
      }

      let results = db.data[collection];

      // * Apply simple filters
      if (filter) {
        results = results.filter(item => {
          return Object.keys(filter).every(key => item[key] === filter[key]);
        });
      }

      return Promise.resolve(results);
    },

    // * Logging task for debugging
    log: (message) => {
      console.log(`[Cypress Task Log]: ${message}`);
      return null;
    }
  });

  return config;
};