const { resolve } = require('path');

module.exports = {
  globalSetup: resolve(__dirname, './src/setup.ts'),
  globalTeardown: resolve(__dirname, './src/teardown.ts'),
  testEnvironment: resolve(__dirname, './src/environment.ts'),
};
