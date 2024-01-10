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

  debug(`shouldUseSharedDBForAllJestWorkers: ${shouldUseSharedDBForAllJestWorkers()}`);

  // if we run one emulator instance for all tests
  if (shouldUseSharedDBForAllJestWorkers()) {
    const start = Date.now();
    const options = getFirestoreEmulatorOptions();
    debug(`Running Firestore Emulator`);

    const info = await startEmulator(options);

    debug(`Emulator started for ${Date.now() - start}ms`);

    runtimeConfig.emulatorHost = `${info.host}:${info.port}`;
    process.env['FIRESTORE_EMULATOR_HOST'] = runtimeConfig.emulatorHost;

    // it seems there some initialization logic in the emulator.
    // without this delay very first access to the emulator has 5+ secods delay
    // so this delay here is smaller than delay without it
    // await new Promise((res) => setTimeout(res, 1400));

    // this one is controversial, might override what user really wants, let's see
    process.env.GCLOUD_PROJECT = options.project_id;
  }

  // Write global config to disk because all tests run in different contexts.
  writeFileSync(globalConfigPath, JSON.stringify(runtimeConfig));
  debug('Config is written');
};
