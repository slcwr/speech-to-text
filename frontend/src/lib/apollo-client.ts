import { ApolloClient, InMemoryCache, createHttpLink, split } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';
import Cookies from 'js-cookie';

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/graphql',
});

const authLink = setContext((_, { headers }) => {
  // Get token from cookies instead of localStorage
  const token = Cookies.get('token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
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
  authLink.concat(httpLink)
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
});

// Helper function to clear all Apollo cache
export const clearApolloCache = () => {
  return apolloClient.clearStore();
};

// Helper function to reset Apollo cache completely
export const resetApolloCache = () => {
  return apolloClient.resetStore();
};