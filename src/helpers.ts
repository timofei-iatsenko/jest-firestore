import { resolve } from 'path';
import type { FirestoreEmulatorArgs } from './emulator';
import { AddressInfo, createServer } from 'net';

const cwd = process.cwd();
const configFile = process.env.JEST_FIREBASE_CONFIG_FILE || 'jest-firestore-config.js';

const defaultEmulatorOptions: FirestoreEmulatorArgs = {
  auto_download: true,
  project_id: 'demo-e2e-test',
};

export function getFirestoreEmulatorOptions(): FirestoreEmulatorArgs {
  try {
    const { firestoreEmulatorOptions: options } = require(resolve(cwd, configFile));

    return { ...defaultEmulatorOptions, ...options };
  } catch (e) {
    return defaultEmulatorOptions;
  }
}

export function shouldUseSharedDBForAllJestWorkers() {
  try {
    const { useSharedDBForAllJestWorkers } = require(resolve(cwd, configFile));

    if (typeof useSharedDBForAllJestWorkers === 'undefined') {
      return true;
    }

    return useSharedDBForAllJestWorkers;
  } catch (e) {
    return true;
  }
}

export function getFreePort(): Promise<number> {
  return new Promise((res) => {
    const srv = createServer();
    srv.listen(0, () => {
      const port = (srv.address() as AddressInfo).port;
      srv.close(() => res(port));
    });
  });
}
