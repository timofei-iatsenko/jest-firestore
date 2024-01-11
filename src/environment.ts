import { TestEnvironment } from 'jest-environment-node';
import type { EnvironmentContext, JestEnvironmentConfig } from '@jest/environment';
import { getFirestoreEmulatorOptions, shouldUseSharedDBForAllJestWorkers } from './helpers';
import { startEmulator, stopEmulator } from './emulator';

const debug = require('debug')('jest-firestore:environment');

let runningEmulator: string;
let refCount = 0;
let i = 0;

module.exports = class FirestoreEnvironment extends TestEnvironment {
  private shouldUseSharedDBForAllJestWorkers: boolean;

  constructor(private config: JestEnvironmentConfig, context: EnvironmentContext) {
    super(config, context);
    this.shouldUseSharedDBForAllJestWorkers = shouldUseSharedDBForAllJestWorkers(
      config.globalConfig.rootDir,
    );
  }

  async setup() {
    debug(`Setup Firestore Test Environment. PID: ${process.pid}`);
    refCount++;

    if (process.env.FIRESTORE_EMULATOR_HOST) {
      // environment can receive ENV variables declared in the globalSetup script.
      // So, here we could have FIRESTORE_EMULATOR_HOST set either by the globalSetup script
      // or passed from parent environment
      debug(
        `FIRESTORE_EMULATOR_HOST is set to ${process.env.FIRESTORE_EMULATOR_HOST}, bypassing emulator start`,
      );
    } else if (!this.shouldUseSharedDBForAllJestWorkers) {
      // environment might be created in reused worker, so we need to check if emulator is already running
      if (!runningEmulator) {
        const options = getFirestoreEmulatorOptions(this.config.globalConfig.rootDir);
        debug(`Starting Firestore Emulator`);
        runningEmulator = await startEmulator(options);
      }

      this.global.process.env.FIRESTORE_EMULATOR_HOST = runningEmulator;
    }

    const databaseName = this.shouldUseSharedDBForAllJestWorkers
      ? `db-${process.pid}-${i++}`
      : '(default)';

    // non stable api, considering to delete it
    this.global.process.env.FIRESTORE_TESTING_DB = databaseName;

    debug(`Set testing database to ${databaseName}`);

    await super.setup();
  }

  async teardown() {
    const debug = require('debug')('jest-firestore:environment:teardown');

    refCount--;

    if (runningEmulator) {
      debug(`Found running emulator on ${runningEmulator} jest worker PID: ${process.pid}`);

      if (refCount === 0) {
        debug(`Stopping Firestore Emulator on ${runningEmulator}`);
        await stopEmulator();
      } else {
        debug(
          `There is more environments still running (${refCount}) on a jest worker PID: ${process.pid}, skipping emulator stop`,
        );
      }
    }

    await super.teardown();
  }
};
