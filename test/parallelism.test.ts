import { type Firestore, getFirestore } from 'firebase-admin/firestore';
import { initializeApp } from 'firebase-admin/app';

describe('parallelism: first worker', () => {
  let firestore: Firestore;

  beforeAll(() => {
    const app = initializeApp();
    firestore = getFirestore(app, process.env.FIRESTORE_TESTING_DB!);
  });

  it('should have separate database', async () => {
    const collection = firestore.collection('parallelism-test');

    console.time('first worker: adding');

    await collection.add({ a: 1 });
    console.timeEnd('first worker: adding');

    const count = await collection.count().get();

    expect(count.data().count).toBe(1);
  });
});
