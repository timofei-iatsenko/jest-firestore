import type { JestEnvironmentConfig } from '@jest/environment';
import { getFirestoreEmulatorOptions, shouldUseSharedDBForAllJestWorkers } from './helpers';
import { startEmulator } from './emulator';
const debug = require('debug')('jest-firestore:setup');

module.exports = async (config: JestEnvironmentConfig['globalConfig']) => {
  const options = getFirestoreEmulatorOptions(config.rootDir);
  const _shouldUseSharedDBForAllJestWorkers = shouldUseSharedDBForAllJestWorkers(config.rootDir);

  debug(`shouldUseSharedDBForAllJestWorkers: ${_shouldUseSharedDBForAllJestWorkers}`);

  // this one is controversial, might override what user really wants, let's see
  process.env.GCLOUD_PROJECT = options.project_id;

  // if we have FIRESTORE_EMULATOR_HOST already passed from env, bypass starting emulator
  if (process.env.FIRESTORE_EMULATOR_HOST) {
    debug(
      `FIRESTORE_EMULATOR_HOST is set to ${process.env.FIRESTORE_EMULATOR_HOST}, bypassing emulator start`,
    );
    return;
  }

  // if we run one emulator instance for all tests
  if (_shouldUseSharedDBForAllJestWorkers) {
    debug(`Starting Firestore Emulator`);
    process.env['FIRESTORE_EMULATOR_HOST'] = await startEmulator(options);

    global.__isEmulatorStarted = true;
  }
};
