import { NextPage } from 'next';
import { trpc } from '../utils/trpc';
import { useState } from 'react';

const Home: NextPage = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  // tRPCクエリとミューテーション
  const createUser = trpc.user.create.useMutation();
  const getUser = trpc.user.getByEmail.useQuery(
    { email },
    { enabled: false }
  );

  const handleCreateUser = async () => {
    try {
      const user = await createUser.mutateAsync({ email, name });
      console.log('User created:', user);
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const handleGetUser = async () => {
    try {
      const user = await getUser.refetch();
      console.log('User found:', user.data);
    } catch (error) {
      console.error('Error getting user:', error);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Web Engineer Interview System</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Create User</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ marginRight: '10px', padding: '5px' }}
        />
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ marginRight: '10px', padding: '5px' }}
        />
        <button onClick={handleCreateUser} disabled={createUser.isLoading}>
          {createUser.isLoading ? 'Creating...' : 'Create User'}
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Get User</h2>
        <button onClick={handleGetUser} disabled={getUser.isLoading}>
          {getUser.isLoading ? 'Loading...' : 'Get User by Email'}
        </button>
      </div>

      {createUser.data && (
        <div style={{ marginTop: '20px' }}>
          <h3>Created User:</h3>
          <pre>{JSON.stringify(createUser.data, null, 2)}</pre>
        </div>
      )}

      {getUser.data && (
        <div style={{ marginTop: '20px' }}>
          <h3>Found User:</h3>
          <pre>{JSON.stringify(getUser.data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default Home;