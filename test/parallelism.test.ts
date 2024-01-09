import {type Firestore, getFirestore} from 'firebase-admin/firestore';
import {initializeApp} from 'firebase-admin/app';

describe('parallelism: first worker', () => {
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

    await collection.add({a: 1});
    const count = await collection.count().get();

    expect(count.data().count).toBe(1);
  });
});
