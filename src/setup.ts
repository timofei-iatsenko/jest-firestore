/* eslint-disable multiline-ternary */
import {writeFileSync} from 'fs';
import {join} from 'path';
import type {JestEnvironmentConfig} from '@jest/environment';
import {getFirestoreEmulatorOptions, shouldUseSharedDBForAllJestWorkers} from './helpers';
import {FirestoreEmulator, FirestoreEmulatorInstance} from './emulator';

const debug = require('debug')('jest-firestore:setup');

const options = getFirestoreEmulatorOptions();
const emulator: FirestoreEmulatorInstance = new FirestoreEmulator(options);

module.exports = async (config: JestEnvironmentConfig['globalConfig']) => {
  const globalConfigPath = join(config.rootDir, 'globalConfig.json');

  // const options = getFirestoreEmulatorOptions();
  const mongoConfig: {emulatorHost?: string} = {};

  debug(`shouldUseSharedDBForAllJestWorkers: ${shouldUseSharedDBForAllJestWorkers()}`);

  // if we run one mongodb instance for all tests
  if (shouldUseSharedDBForAllJestWorkers()) {
    const info = emulator.getInfo();

    mongoConfig.emulatorHost = `${info.host}:${info.port}`;
    process.env['FIRESTORE_EMULATOR_HOST'] = mongoConfig.emulatorHost;

    if (info.pid === 0) {
      debug(`Running Firestore Emulator on ${process.env.FIRESTORE_EMULATOR_HOST}`);

      await emulator.start();
    }

    // Set reference to emulator in order to close the server during teardown.
    global.__FIRESTORE_EMULATOR__ = emulator;
  }

  // mongoConfig.mongoDBName = options.instance.dbName;

  // Write global config to disk because all tests run in different contexts.
  writeFileSync(globalConfigPath, JSON.stringify(mongoConfig));
  debug('Config is written');
};
