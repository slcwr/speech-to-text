import { gql } from '@apollo/client';
import { USER_FRAGMENT, USER_BASIC_FRAGMENT } from '../fragments/user';

export const GET_USER_BY_ID = gql`
  query GetUserById($id: ID!) {
    user(id: $id) {
      ...UserFields
    }
  }
  ${USER_FRAGMENT}
`;

export const GET_USERS = gql`
  query GetUsers($limit: Int, $offset: Int) {
    users(limit: $limit, offset: $offset) {
      users {
        ...UserBasicFields
      }
      total
      hasMore
    }
  }
  ${USER_BASIC_FRAGMENT}
`;

export const GET_USER_PROFILE = gql`
  query GetUserProfile {
    me {
      ...UserFields
    }
  }
  ${USER_FRAGMENT}
`;