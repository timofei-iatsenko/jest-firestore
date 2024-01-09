# jest-firestore

[![main-suite](https://github.com/thekip/jest-firestore/actions/workflows/ci.yml/badge.svg)](https://github.com//thekip/jest-firestore/actions/workflows/ci.yml)

> Jest preset to run Firestore emulator automatically within your Jest Tests

// todo: motivation and comparison to emulators:exec

//credits to jest-mongodb

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

### 2. Create `jest-firebase-config.js`

```js
module.exports = {
  firestoreEmulatorOptions: {
    project_id: 'demo-test-project',
    // todo: didn't tested yet, need to figure out is it relative or absolute path
    rules: 'firestore.rules', // optional path to rules file
  },
};
```

By default, one emulator instance would be created for all Jest workers. You can achieve parallelism by leveraging emulator's [multi database support](https://firebase.google.com/docs/emulator-suite/connect_firestore#multiple_db_ui).

Library provides `FIRESTORE_TESTING_DB` environment variable which is unique for each Jest worker,
you can use it when initializing `firebase-admin` in your tests.

If you still want to have a separate emulator instance for each Jest worker, create the following configuration:

```js
module.exports = {
  firestoreEmulatorOptions: {
    // ...
  },
  useSharedDBForAllJestWorkers: false,
};
```

However, this is not recommended as it will slow down your tests.

### 3. Configure `firebase-admin`

Library sets the `process.env.FIRESTORE_EMULATOR_HOST` for your convenience so `firebase-admin` and other firebase tools will pick it up automatically.

```ts
import { type Firestore, getFirestore } from 'firebase-admin/firestore';
import { initializeApp } from 'firebase-admin/app';

describe('insert', () => {
  let firestore: Firestore;

  beforeAll(() => {
    const app = initializeApp();
    // `firebase-admin` automatically discover FIRESTORE_EMULATOR_HOST env and connect to emulator.
    // Pass process.env.FIRESTORE_TESTING_DB to enable parallelism. Each jest worker would use separate database
    firestore = getFirestore(app, process.env.FIRESTORE_TESTING_DB);
  });
});
```

### 4. PROFIT! Write tests

```ts
it('should insert a doc into collection', async () => {
  const users = firestore.collection('users');

  const mockUser = { _id: 'some-user-id', name: 'John' };
  const { id } = await users.add(mockUser);

  const insertedUser = await users.doc(id).get();

  expect(insertedUser.data()).toEqual(mockUser);
});
```

Cache Firebase Emulators binary in CI by putting this folder to the list of cached paths: `~/.cache/firebase/emulators.`

You can enable debug logs by setting environment variable `DEBUG=jest-firestore:*`

#### 5. Clean database before each test (optional)

See the [firebase docs](https://firebase.google.com/docs/emulator-suite/connect_firestore#clear_your_database_between_tests)

```js
beforeEach(async () => {
  await fetch(
    `http://${process.env.FIRESTORE_EMULATOR_HOST}/emulator/v1/projects/${project}/databases/${FIREBASE_TEST_DATABASE_ID}/documents`,
    { method: 'DELETE' },
  );
});
```

#### 6. Jest watch mode gotcha

This package creates the file `globalConfig.json` in the project root, when using jest `--watch` flag, changes to `globalConfig.json` can cause an infinite loop

In order to avoid this unwanted behaviour, add `globalConfig` to ignored files in watch mode in the Jest configuation

```js
// jest.config.js
module.exports = {
  watchPathIgnorePatterns: ['globalConfig'],
};
```

## See Also

- [jest-dynamodb](https://github.com/shelfio/jest-dynamodb)
- [jest-mongodb](https://github.com/shelfio/jest-mongodb)

## Publish

```bash
git checkout main
yarn version
yarn publish
git push origin main --tags
```
