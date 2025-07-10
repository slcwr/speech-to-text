import { gql } from '@apollo/client';

export const USER_FRAGMENT = gql`
  fragment UserFields on User {
    id
    email
    name
    role
    isActive
    lastLoginAt
    createdAt
    updatedAt
  }
`;

export const USER_BASIC_FRAGMENT = gql`
  fragment UserBasicFields on User {
    id
    email
    name
    role
  }
`;