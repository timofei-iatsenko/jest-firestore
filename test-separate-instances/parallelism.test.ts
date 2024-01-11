import { type Firestore, getFirestore } from 'firebase-admin/firestore';
import { initializeApp } from 'firebase-admin/app';

describe('parallelism: first worker', () => {
  let firestore: Firestore;

  beforeAll(() => {
    const app = initializeApp();
    firestore = getFirestore(app);
  });

  it('should have separate database', async () => {
    const collection = firestore.collection('parallelism-test');

    await collection.add({ a: 1 });

    const count = await collection.count().get();

    expect(count.data().count).toBe(1);
  });
});
