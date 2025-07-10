import { gql } from '@apollo/client';
import { USER_BASIC_FRAGMENT } from '../fragments/user';

export const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    me {
      ...UserBasicFields
    }
  }
  ${USER_BASIC_FRAGMENT}
`;

export const VALIDATE_TOKEN = gql`
  query ValidateToken {
    validateToken {
      valid
      user {
        ...UserBasicFields
      }
    }
  }
  ${USER_BASIC_FRAGMENT}
`;