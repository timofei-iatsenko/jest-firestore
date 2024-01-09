import { join } from 'node:path';
import { unlink } from 'node:fs';
import type { JestEnvironmentConfig } from '@jest/environment';
import { stopEmulator } from './emulator';
import { shouldUseSharedDBForAllJestWorkers } from './helpers';

const debug = require('debug')('jest-firestore:teardown');

module.exports = async function (config: JestEnvironmentConfig['globalConfig']) {
  const globalConfigPath = join(config.rootDir, 'globalConfig.json');

  if (shouldUseSharedDBForAllJestWorkers()) {
    debug('Teardown emulator');
    await stopEmulator();
  }

  unlink(globalConfigPath, (err) => {
    if (err) {
      debug('Config could not be deleted');

      return;
    }
    debug('Config is deleted');
  });
};
