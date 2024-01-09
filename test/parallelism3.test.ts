import {type Firestore, getFirestore} from 'firebase-admin/firestore';
import {initializeApp} from 'firebase-admin/app';

describe('parallelism: third worker', () => {
  let firestore: Firestore;

  beforeAll(() => {
    console.log(process.pid, process.env.JEST_WORKER_ID);

    const app = initializeApp();
    firestore = getFirestore(app, process.env.FIRESTORE_TESTING_DB!);
  });

  afterAll(async () => {
    await firestore.terminate();
  });

  it('should have separate database', async () => {
    const collection = firestore.collection('parallelism-test');

    await Promise.all([collection.add({a: 1}), collection.add({b: 2}), collection.add({c: 3})]);

    const snapshot = await collection.count().get();

    expect(snapshot.data().count).toBe(3);
  });
});
