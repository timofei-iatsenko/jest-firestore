import {type Firestore, getFirestore} from 'firebase-admin/firestore';
import {initializeApp} from 'firebase-admin/app';

describe('insert', () => {
  let firestore: Firestore;

  beforeAll(() => {
    const app = initializeApp();
    firestore = getFirestore(app);
  });

  it('should insert a doc into collection', async () => {
    const users = firestore.collection('users');

    const mockUser = {_id: 'some-user-id', name: 'John'};
    const {id} = await users.add(mockUser);

    const insertedUser = await users.doc(id).get();

    expect(insertedUser.data()).toEqual(mockUser);
  });
});
