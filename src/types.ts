/* eslint-disable */
import {FirestoreEmulatorInstance} from './emulator';

declare global {
  var __FIRESTORE_EMULATOR__: FirestoreEmulatorInstance;
  // var __MONGO_URI__: string;
  // var __MONGO_DB_NAME__: string;
}

export type RuntimeConfig = {
  emulatorHost?: string;
};
