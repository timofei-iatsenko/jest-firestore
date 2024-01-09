import { getFreePort } from './helpers';
// @ts-expect-error - no types
import { FirestoreEmulator } from 'firebase-tools/lib/emulator/firestoreEmulator';
// @ts-expect-error - no types
import { waitForPortUsed } from 'firebase-tools/lib/emulator/portUtils';

const debug = require('debug')('jest-firestore:emulator');

export interface FirestoreEmulatorArgs {
  port?: number;
  host?: string;
  websocket_port?: number;
  project_id?: string;
  rules?: string;
  functions_emulator?: string;
  auto_download?: boolean;
  seed_from_export?: string;
  single_project_mode?: boolean;
  single_project_mode_error?: boolean;
}

export async function startEmulator(args: FirestoreEmulatorArgs) {
  const emulator: FirestoreEmulatorInstance = new FirestoreEmulator({
    ...args,
    port: await getFreePort(),
  });

  const info = emulator.getInfo();
  await emulator.start();
  debug('Emulator info', { info });
  await waitForPortUsed(info.port, connectableHostname(info.host));
  debug(`Port ${info.port} used`);

  return info;
}

export async function stopEmulator() {
  const emulator: FirestoreEmulatorInstance = new FirestoreEmulator({});
  await emulator.stop();
}

/**
 * Return a connectable hostname, replacing wildcard 0.0.0.0 or :: with loopback
 * addresses 127.0.0.1 / ::1 correspondingly. See below for why this is needed:
 * https://github.com/firebase/firebase-tools-ui/issues/286
 *
 * This assumes that the consumer (i.e. client SDK, etc.) is located on the same
 * device as the Emulator hub (i.e. CLI), which may not be true on multi-device
 * setups, etc. In that case, the customer can work around this by specifying a
 * non-wildcard IP address (like the IP address on LAN, if accessing via LAN).
 */
export function connectableHostname(hostname: string): string {
  if (hostname === '0.0.0.0') {
    hostname = '127.0.0.1';
  } else if (hostname === '::' /* unquoted IPv6 wildcard */) {
    hostname = '::1';
  } else if (hostname === '[::]' /* quoted IPv6 wildcard */) {
    hostname = '[::1]';
  }
  return hostname;
}

export interface FirestoreEmulatorInstance {
  /**
   * Called to begin the emulator process.
   *
   * Note: you should almost always call EmulatorRegistry.start() instead of this method.
   */
  start(): Promise<void>;

  /**
   * Called to tell the emulator to connect to other running emulators.
   * This must be called after start().
   */
  connect(): Promise<void>;

  /**
   * Called to stop the emulator process.
   *
   * Note: you should almost always call EmulatorRegistry.stop() instead of this method.
   */
  stop(): Promise<void>;

  /**
   * Get the information about the running instance needed by the registry;
   */
  getInfo(): EmulatorInfo;

  /**
   * Get the name of the corresponding service.
   */
  getName(): 'firestore';
}

export interface EmulatorInfo {
  name: 'firestore';
  pid?: number;
  reservedPorts?: number[];

  /** All addresses that an emulator listens on. */
  listen?: ListenSpec[];

  /** The primary IP address that the emulator listens on. */
  host: string;
  port: number;
}

export interface ListenSpec {
  address: string;
  port: number;
  family: 'IPv4' | 'IPv6';
}
