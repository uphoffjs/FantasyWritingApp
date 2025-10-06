// * Global teardown for Jest test suite
// * Runs once after all test suites complete

module.exports = async () => {
  // * Clean up any test databases or services
  console.log('\n✅ Jest test suite completed');
  console.log(`📅 Finished: ${new Date().toISOString()}`);
  console.log('');

  // * Clear any remaining timers or intervals
  clearInterval();
  clearTimeout();

  // * Force exit if needed (useful for CI environments)
  if (process.env.CI) {
    process.exit(0);
  }
};