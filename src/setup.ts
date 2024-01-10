/* eslint-disable multiline-ternary */
import { writeFileSync } from 'fs';
import { join } from 'path';
import type { JestEnvironmentConfig } from '@jest/environment';
import { getFirestoreEmulatorOptions, shouldUseSharedDBForAllJestWorkers } from './helpers';
import { startEmulator } from './emulator';
import { RuntimeConfig } from './types';

const debug = require('debug')('jest-firestore:setup');

module.exports = async (config: JestEnvironmentConfig['globalConfig']) => {
  const globalConfigPath = join(config.rootDir, 'globalConfig.json');

  const runtimeConfig: RuntimeConfig = {};

  debug(
    `shouldUseSharedDBForAllJestWorkers: ${shouldUseSharedDBForAllJestWorkers(config.rootDir)}`,
  );

  // if we run one emulator instance for all tests
  if (shouldUseSharedDBForAllJestWorkers(config.rootDir)) {
    const start = Date.now();
    const options = getFirestoreEmulatorOptions(config.rootDir);
    debug(`Running Firestore Emulator`);

    const info = await startEmulator(options);

    debug(`Emulator started for ${Date.now() - start}ms`);

    runtimeConfig.emulatorHost = `${info.host}:${info.port}`;
    process.env['FIRESTORE_EMULATOR_HOST'] = runtimeConfig.emulatorHost;

    // this one is controversial, might override what user really wants, let's see
    process.env.GCLOUD_PROJECT = options.project_id;
  }

  // Write global config to disk because all tests run in different contexts.
  writeFileSync(globalConfigPath, JSON.stringify(runtimeConfig));
  debug('Config is written');
};
