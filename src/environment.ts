import { join as pathJoin } from 'node:path';
import { readFileSync } from 'node:fs';

import { TestEnvironment } from 'jest-environment-node';
import type { EnvironmentContext } from '@jest/environment';
import type { JestEnvironmentConfig } from '@jest/environment';
import {
  getFirestoreEmulatorOptions,
  shouldUseSharedDBForAllJestWorkers,
  getFreePort,
} from './helpers';
import { FirestoreEmulator, FirestoreEmulatorInstance } from './emulator';
import { RuntimeConfig } from './types';

const options = getFirestoreEmulatorOptions();

const debug = require('debug')('jest-firestore:environment');

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
      const emulator: FirestoreEmulatorInstance = new FirestoreEmulator({
        ...options,
        port: await getFreePort(),
      });

      // environment might be created in reused worker, so we need to check if emulator is already running
      if (emulator.getInfo().pid === 0) {
        await emulator.start();
      }

      const info = emulator.getInfo();
      const emulatorHost = `${info.host}:${info.port}`;
      this.global.process.env.FIRESTORE_EMULATOR_HOST = emulatorHost;

      debug(`Running Firestore Emulator on ${emulatorHost}`);
    }

    const databaseName = shouldUseSharedDBForAllJestWorkers()
      ? `db-${process.pid}-${i++}`
      : '(default)';

    this.global.process.env.FIRESTORE_TESTING_DB = databaseName;

    // this one is controversial, might override what user really wants, let's see
    this.global.process.env.GCLOUD_PROJECT = options.project_id;

    debug(`Set testing database to ${databaseName}`);

    await super.setup();
  }

  async teardown() {
    debug('Teardown Firestore Test Environment');

    if (!shouldUseSharedDBForAllJestWorkers()) {
      const emulator: FirestoreEmulatorInstance = new FirestoreEmulator({});
      await emulator.stop();
    }

    await super.teardown();
  }
};
