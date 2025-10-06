// * Global setup for Jest test suite
// * Runs once before all test suites

module.exports = async () => {
  // * Set timezone to UTC for consistent date testing
  process.env.TZ = 'UTC';

  // * Set NODE_ENV to test
  process.env.NODE_ENV = 'test';

  // * Set up test environment variables if needed
  process.env.REACT_APP_API_URL = 'http://localhost:3000';
  process.env.REACT_APP_ENV = 'test';

  // * Initialize any test databases or services if needed
  console.log('\n🧪 Starting Jest test suite...');
  console.log('📋 Test environment: React Native');
  console.log(`📅 Date: ${new Date().toISOString()}`);
  console.log('');
};