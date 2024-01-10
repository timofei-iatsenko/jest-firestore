import { resolve } from 'path';
import type { FirestoreEmulatorArgs } from './emulator';
import { AddressInfo, createServer } from 'net';

const configFile = process.env.JEST_FIRESTORE_CONFIG_FILE || 'jest-firestore-config.js';

const defaultEmulatorOptions: FirestoreEmulatorArgs = {
  auto_download: true,
  project_id: 'demo-e2e-test',
  /**
   * By default `localhost` is used. But NodeJS sometimes resolves it
   * to IPv6 address where firestore emulator not listen for it.
   */
  host: '127.0.0.1',
};

export function getFirestoreEmulatorOptions(rootDir: string): FirestoreEmulatorArgs {
  try {
    const { firestoreEmulatorOptions: options } = require(resolve(rootDir, configFile));

    return { ...defaultEmulatorOptions, ...options };
  } catch (e) {
    return defaultEmulatorOptions;
  }
}

export function shouldUseSharedDBForAllJestWorkers(rootDir: string) {
  try {
    const { useSharedDBForAllJestWorkers } = require(resolve(rootDir, configFile));

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
