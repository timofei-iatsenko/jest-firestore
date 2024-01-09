/* eslint-disable */
// @ts-ignore
export { FirestoreEmulator } from 'firebase-tools/lib/emulator/firestoreEmulator';

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

export type FirestoreEmulator = new (args: FirestoreEmulatorArgs) => FirestoreEmulatorInstance;

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
