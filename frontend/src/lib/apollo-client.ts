import { ApolloClient, InMemoryCache, createHttpLink, split } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';
import Cookies from 'js-cookie';

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/graphql',
});

const authLink = setContext((operation, { headers }) => {
  // Get token from cookies instead of localStorage
  const token = Cookies.get('token');
  
  // Debug logging for specific operations
  if (operation.operationName === 'CompleteAnswer') {
    console.log('🔍 Apollo authLink - operation:', operation.operationName);
    console.log('🔍 Apollo authLink - variables:', operation.variables);
    console.log('🔍 Apollo authLink - token:', token ? 'present' : 'missing');
  }
  
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// Error link for debugging
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (operation.operationName === 'CompleteAnswer') {
    console.log('🚨 Apollo errorLink - operation:', operation.operationName);
    console.log('🚨 Apollo errorLink - variables:', operation.variables);
    if (graphQLErrors) {
      graphQLErrors.forEach(({ message, locations, path }) => {
        console.log('🚨 GraphQL error:', { message, locations, path });
      });
    }
    if (networkError) {
      console.log('🚨 Network error:', networkError);
    }
  }
});

const wsLink = new GraphQLWsLink(
  createClient({
    url: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000/graphql',
    connectionParams: () => {
      // Get token from cookies for WebSocket connection
      const token = Cookies.get('token');
      return {
        authToken: token,
      };
    },
  })
);

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  errorLink.concat(authLink).concat(httpLink)
);

export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache({
    // Disable cache for authentication mutations to prevent stale data
    typePolicies: {
      Mutation: {
        fields: {
          login: {
            merge: false,
          },
          register: {
            merge: false,
          },
        },
      },
    },
  }),
  // Apollo DevTools を有効にする（開発環境のみ）
  connectToDevTools: process.env.NODE_ENV === 'development',
  // デフォルトでもtrueだが、明示的に設定
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
    query: {
      fetchPolicy: 'network-only',
    },
  },
});

// Helper function to clear all Apollo cache
export const clearApolloCache = () => {
  return apolloClient.clearStore();
};

// Helper function to reset Apollo cache completely
export const resetApolloCache = () => {
  return apolloClient.resetStore();
};