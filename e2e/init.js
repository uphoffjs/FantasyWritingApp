const detox = require('detox');
const config = require('../.detoxrc.js');

// * Set up Detox before all tests
beforeAll(async () => {
  await detox.init(config);

  // * Launch the app fresh for each test file
  await device.launchApp({
    newInstance: true,
    permissions: {
      notifications: 'YES',
      camera: 'YES',
      photos: 'YES',
    },
  });
});

// * Clean up after all tests
afterAll(async () => {
  await detox.cleanup();
});