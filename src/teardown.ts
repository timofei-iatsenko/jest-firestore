import { stopEmulator } from './emulator';

const debug = require('debug')('jest-firestore:teardown');

module.exports = async function () {
  if (global.__isEmulatorStarted) {
    debug('Teardown emulator');
    await stopEmulator();
  }
};
