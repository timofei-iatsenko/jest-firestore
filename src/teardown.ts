import {join} from 'node:path';
import {unlink} from 'node:fs';
import type {JestEnvironmentConfig} from '@jest/environment';

const debug = require('debug')('jest-firestore:teardown');

module.exports = async function (config: JestEnvironmentConfig['globalConfig']) {
  const globalConfigPath = join(config.rootDir, 'globalConfig.json');

  debug('Teardown emulator');
  if (global.__FIRESTORE_EMULATOR__) {
    await global.__FIRESTORE_EMULATOR__.stop();
  }
  unlink(globalConfigPath, err => {
    if (err) {
      debug('Config could not be deleted');

      return;
    }
    debug('Config is deleted');
  });
};
