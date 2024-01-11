declare global {
  // eslint-disable-next-line no-var
  var __isEmulatorStarted: boolean;
}

export type Options = {
  /**
   * Firestore project id. For tests purposes it doesn't have to be the same as for real project.
   * However, this projectId should be used in all places where Firestore is used.
   *
   * jest-firestore automatically populates process.env.GCLOUD_PROJECT with this value.
   * @default demo-e2e-test
   */
  project_id?: string;
  /**
   * Path to the firestore.rules file.
   */
  rules?: string;
  /**
   * Host for the emulator.
   *
   * Change it only if you know what you are doing.
   * @default 127.0.0.1
   */
  host?: string;
};
