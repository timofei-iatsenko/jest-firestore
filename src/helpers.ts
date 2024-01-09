import {resolve} from 'path';
import type {FirestoreEmulatorArgs} from './emulator';
import {AddressInfo, createServer} from 'net';

const cwd = process.cwd();
const configFile = process.env.MONGO_MEMORY_SERVER_FILE || 'jest-firestore-config.js';

export function getFirestoreEmulatorOptions(): FirestoreEmulatorArgs {
  try {
    const {mongodbMemoryServerOptions: options} = require(resolve(cwd, configFile));

    return options;
  } catch (e) {
    return {
      port: 8080,
      host: '127.0.0.1',
      websocket_port: 8081,
      project_id: 'demo-e2e-test',
    };
  }
}

export function shouldUseSharedDBForAllJestWorkers() {
  try {
    const {useSharedDBForAllJestWorkers} = require(resolve(cwd, configFile));

    if (typeof useSharedDBForAllJestWorkers === 'undefined') {
      return true;
    }

    return useSharedDBForAllJestWorkers;
  } catch (e) {
    return true;
  }
}

export function getFreePort(): Promise<number> {
  return new Promise(res => {
    const srv = createServer();
    srv.listen(0, () => {
      const port = (srv.address() as AddressInfo).port;
      srv.close(_ => res(port));
    });
  });
}
