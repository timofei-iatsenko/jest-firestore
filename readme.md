# jest-firestore

[![main-suite](https://github.com/thekip/jest-firestore/actions/workflows/ci.yml/badge.svg)](https://github.com//thekip/jest-firestore/actions/workflows/ci.yml)

> Jest preset to run Firestore emulator automatically within your Jest Tests

This package is created to help people who are using Firestore in their projects to write tests without mocking Firestore.

## Motivation

The firebase itself provides [emulators suite](https://firebase.google.com/docs/emulator-suite) with a `emulators:exec` command which helps to use emulator suite in testing scenarios. However, using `emulators:exec` command brings some drawbacks.

First, you are no longer able to run tests directly using Jest runner or from your IDE.
You need to run it using `firebase emulators:exec "npx jest" --only firestore` command.

The other way would be to always have emulators running in the background while development to be able to run tests from IDE or Jest CLI.
This is not a big deal, but it's inconvenient and might not be transparent for other team members.

The second and probably more important drawback is that `emulators:exec` doesn't work well in monorepo scenarios
when you have multiple functions codebases.

Firebase CLI allows you to run only one emulator per project and doesn't allow to set port dynamically.

This package is created to solve these problems. It is heavily inspired by [jest-mongodb](https://github.com/shelfio/jest-mongodb) and allows you to run Firestore emulator automatically within your Jest tests.

It uses native [`firebase-tools`](https://github.com/firebase/firebase-tools) under the hood, so it's exactly the same emulator as you would expect with Firebase CLI.

## Usage

### 0. Install

```bash
yarn add jest-firestore --dev
```

Make sure `firebase-tools` is installed in the project as well, as it's required as a peer dependency.

### 1. Create `jest.config.js`

```js
module.exports = {
  preset: 'jest-firestore',
};
```

If you have a custom `jest.config.js` make sure you remove `testEnvironment` property, otherwise it will conflict with the preset.

By default, one emulator instance would be created for all Jest workers. You can achieve parallelism by leveraging emulator's [multi database support](https://firebase.google.com/docs/emulator-suite/connect_firestore#multiple_db_ui).

### 2. Configure `firebase-admin`

Library sets the `process.env.FIRESTORE_EMULATOR_HOST` for your convenience so `firebase-admin` and other firebase tools will pick it up automatically.

```ts
import { type Firestore, getFirestore } from 'firebase-admin/firestore';
import { initializeApp } from 'firebase-admin/app';

describe('insert', () => {
  let firestore: Firestore;

  beforeAll(() => {
    // setup deffiernet database for each jest worker
    const databaseName = 'test-' + process.pid;

    // `firebase-admin` automatically discover FIRESTORE_EMULATOR_HOST.
    const app = initializeApp();
    firestore = getFirestore(app, databaseName);
  });
});
```

### 3. PROFIT! Write tests

```ts
it('should insert a doc into collection', async () => {
  const users = firestore.collection('users');

  const mockUser = { _id: 'some-user-id', name: 'John' };
  const { id } = await users.add(mockUser);

  const insertedUser = await users.doc(id).get();

  expect(insertedUser.data()).toEqual(mockUser);
});
```

### (optional) Configure Firestore emulator with `jest-firebase-config.js`

You can change some Firestore emulator options by creating `jest-firebase-config.js` file next to the `jest.config.js` file.

```js
module.exports = {
  // full list of available options available here src/types.ts#Options
  firestoreEmulatorOptions: {
    project_id: 'demo-test-project',
    // todo: didn't tested yet, need to figure out is it relative or absolute path
    rules: 'firestore.rules', // optional path to rules file
  },
};
```

If you want to have a separate emulator instance for each Jest worker, create the following configuration:

```js
module.exports = {
  firestoreEmulatorOptions: {
    // ...
  },
  useSharedDBForAllJestWorkers: false,
};
```

However, this is not recommended as it will slow down your tests.

### 5. Clean database before each test (optional)

See the [firebase docs](https://firebase.google.com/docs/emulator-suite/connect_firestore#clear_your_database_between_tests)

```js
beforeEach(async () => {
  await fetch(
    `http://${process.env.FIRESTORE_EMULATOR_HOST}/emulator/v1/projects/${process.env.GCLOUD_PROJECT}/databases/${databaseName}/documents`,
    { method: 'DELETE' },
  );
});
```

## Bypassing starting emulator

You may want to bypass starting emulator during tests and connect to the external running emulator instead.
Pass `FIRESTORE_EMULATOR_HOST` environment variable to your tests to achieve this.

```bash
FIRESTORE_EMULATOR_HOST=localhost:8080 jest
```

Firebase's `emulators:exec` command sets this variable automatically, so you can run tests using it as well:

```bash
firebase emulators:exec "jest"
```

## Misc

Cache Firebase Emulators binary in CI by putting this folder to the list of cached paths: `~/.cache/firebase/emulators.`

You can enable debug logs by setting environment variable `DEBUG=jest-firestore:*`

## See Also

- [jest-dynamodb](https://github.com/shelfio/jest-dynamodb)
- [jest-mongodb](https://github.com/shelfio/jest-mongodb)

## Publish

Run `release` workflow from GitHub Actions.

Or run manually:

```bash
npx release-it
```
