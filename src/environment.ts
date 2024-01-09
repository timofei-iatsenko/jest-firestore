import { join as pathJoin } from 'node:path';
import { readFileSync } from 'node:fs';

import { TestEnvironment } from 'jest-environment-node';
import type { EnvironmentContext, JestEnvironmentConfig } from '@jest/environment';
import { getFirestoreEmulatorOptions, shouldUseSharedDBForAllJestWorkers } from './helpers';
import { startEmulator, stopEmulator, EmulatorInfo } from './emulator';
import { RuntimeConfig } from './types';

const options = getFirestoreEmulatorOptions();

const debug = require('debug')('jest-firestore:environment');

let runningEmulator: EmulatorInfo;
let i = 0;

module.exports = class FirestoreEnvironment extends TestEnvironment {
  globalConfigPath: string;
  constructor(config: JestEnvironmentConfig, context: EnvironmentContext) {
    super(config, context);
    this.globalConfigPath = pathJoin(config.globalConfig.rootDir, 'globalConfig.json');
  }

  async setup() {
    debug(`Setup Firestore Test Environment. PID: ${process.pid}`);

    const globalConfig = JSON.parse(readFileSync(this.globalConfigPath, 'utf-8')) as RuntimeConfig;

    if (globalConfig.emulatorHost) {
      this.global.process.env.FIRESTORE_EMULATOR_HOST = globalConfig.emulatorHost;
    } else {
      // environment might be created in reused worker, so we need to check if emulator is already running
      if (!runningEmulator) {
        runningEmulator = await startEmulator(options);
      }

      const emulatorHost = `${runningEmulator.host}:${runningEmulator.port}`;
      this.global.process.env.FIRESTORE_EMULATOR_HOST = emulatorHost;

      debug(`Running Firestore Emulator on ${emulatorHost}`);
    }

    const databaseName = shouldUseSharedDBForAllJestWorkers()
      ? `db-${process.pid}-${i++}`
      : '(default)';

    this.global.process.env.FIRESTORE_TESTING_DB = databaseName;

    debug(`Set testing database to ${databaseName}`);

    await super.setup();
  }

  async teardown() {
    debug('Teardown Firestore Test Environment');

    if (!shouldUseSharedDBForAllJestWorkers()) {
      await stopEmulator();
    }

    await super.teardown();
  }
};
